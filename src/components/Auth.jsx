import React, { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";
import {
  supabase,
  isConfigured,
  generateInviteCode,
} from "../lib/supabaseClient";
import {
  Sparkles,
  Check,
  LogOut,
  LogIn,
  UserPlus,
  UtensilsCrossed,
  ArrowRight,
  AlertCircle,
  QrCode,
  Camera,
  X,
  ScanLine,
  UserCheck,
} from "lucide-react";

export default function Auth({
  user,
  profile,
  onProfileUpdate,
  onDemoLogin,
  onCloseProfile,
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [copied, setCopied] = useState(false);

  // QR Scanner Modal State
  const [showScanner, setShowScanner] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const scannerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);

  // Clean up QR scanner on unmount or modal close
  useEffect(() => {
    if (!showScanner) {
      stopScanner();
    }
  }, [showScanner]);

  const startScanner = async () => {
    setShowScanner(true);
    setCameraError(null);

    // Wait for DOM element render
    setTimeout(async () => {
      try {
        if (!document.getElementById("qr-reader")) return;

        const html5Qrcode = new Html5Qrcode("qr-reader");
        html5QrcodeScannerRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            handleScanSuccess(decodedText);
            html5Qrcode.stop();
            setShowScanner(false);
          },
          (errorMessage) => {
            // Ignore frame parse errors
          },
        );
      } catch (err) {
        console.error("Camera QR error:", err);
        setCameraError(
          "Camera access unavailable or blocked. Use manual code below or test with instant simulate button.",
        );
      }
    }, 300);
  };

  const stopScanner = () => {
    if (html5QrcodeScannerRef.current) {
      try {
        html5QrcodeScannerRef.current.stop().catch(() => {});
      } catch (e) {}
      html5QrcodeScannerRef.current = null;
    }
  };

  // Process decoded QR payload
  const handleScanSuccess = async (rawCode) => {
    let cleanCode = rawCode.trim();
    if (cleanCode.includes("DINNER_HOUSEHOLD:")) {
      cleanCode = cleanCode.replace("DINNER_HOUSEHOLD:", "");
    }
    setInviteCodeInput(cleanCode);
    await processJoinHousehold(cleanCode);
  };

  // Handle Authentication (Login / Signup)
  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (!isConfigured) {
        setErrorMsg(
          "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) before creating an account.",
        );
        return;
      }

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName || email.split("@")[0] },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        if (!data.user) {
          throw new Error(
            "Supabase did not create an account. Please try again.",
          );
        }
        if (data.user.identities?.length === 0) {
          setErrorMsg(
            "An account with this email may already exist. Try signing in or reset your password.",
          );
          return;
        }
        setPassword("");
        setSuccessMsg(
          data.session
            ? "Account created successfully! Welcome to What's For Dinner."
            : "Account created! Check your email to confirm your address, then sign in.",
        );
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      setErrorMsg(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  // Create Household
  const handleCreateHousehold = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const code = generateInviteCode();
      if (!isConfigured) {
        onProfileUpdate({
          ...profile,
          household_id: "demo-household-123",
          invite_code: code,
          partner_name: "Partner (Simulated)",
        });
        setSuccessMsg(`Household created! QR Code generated.`);
        setLoading(false);
        return;
      }

      const { data: household, error: hErr } = await supabase
        .from("households")
        .insert([{ invite_code: code }])
        .select()
        .single();

      if (hErr) throw hErr;

      const { error: pErr } = await supabase
        .from("profiles")
        .update({ household_id: household.id })
        .eq("id", user.id);

      if (pErr) throw pErr;

      onProfileUpdate({
        ...profile,
        household_id: household.id,
        invite_code: code,
      });

      setSuccessMsg(`Household created! Partner can now scan your QR code.`);
    } catch (err) {
      setErrorMsg(err.message || "Failed to create household.");
    } finally {
      setLoading(false);
    }
  };

  // Process Household Join via Invite Code / Scanned QR
  const processJoinHousehold = async (codeToJoin) => {
    if (!codeToJoin) return;
    setLoading(true);
    setErrorMsg(null);
    const formattedCode = codeToJoin.trim().toUpperCase();

    try {
      if (!isConfigured) {
        onProfileUpdate({
          ...profile,
          household_id: "demo-household-123",
          invite_code: formattedCode,
          partner_name: "Alex (Partner Connected)",
        });
        setSuccessMsg(`Successfully linked accounts via QR Code! 🎉`);
        setLoading(false);
        return;
      }

      const { data: household, error: hErr } = await supabase
        .from("households")
        .select("id, invite_code")
        .eq("invite_code", formattedCode)
        .single();

      if (hErr || !household) {
        throw new Error(
          "Household QR code not found. Please re-scan partner's code.",
        );
      }

      const { error: pErr } = await supabase
        .from("profiles")
        .update({ household_id: household.id })
        .eq("id", user.id);

      if (pErr) throw pErr;

      onProfileUpdate({
        ...profile,
        household_id: household.id,
        invite_code: household.invite_code,
        partner_name: "Partner Connected",
      });

      setSuccessMsg("Successfully linked accounts via QR Code! 🎉");
    } catch (err) {
      setErrorMsg(err.message || "Could not join household.");
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignOut = async () => {
    if (isConfigured) {
      await supabase.auth.signOut();
    }
    window.location.reload();
  };

  // Invite code payload string for QR Code
  const qrValue = profile?.invite_code
    ? `DINNER_HOUSEHOLD:${profile.invite_code}`
    : "DINNER_HOUSEHOLD:DIN-9X2Y";

  // -------------------------------------------------------------
  // VIEW 1: NOT LOGGED IN
  // -------------------------------------------------------------
  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[85vh]">
        <div className="w-full max-w-md space-y-6">
          {/* App Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/25 mb-2 active-press">
              <UtensilsCrossed className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              What's For <span className="gradient-text-rose">Dinner?</span>
            </h1>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
              Scan partner's QR code & swipe on dinner ideas together! 📲
            </p>
          </div>

          {!isConfigured && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-amber-200 mb-0.5">
                  Demo Mode Active
                </span>
                Try instant demo mode below to experience QR scanning and full
                swiping!
              </div>
            </div>
          )}

          {/* Form Box */}
          <div className="glass-panel p-6 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="flex rounded-xl bg-slate-900/60 p-1 mb-6 border border-slate-800">
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  !isSignUp
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  isSignUp
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Create Account
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                {successMsg}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@couple.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 active-press transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    {isSignUp ? "Create Account" : "Sign In to Swipe"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
              <button
                type="button"
                onClick={() => onDemoLogin("couple@demo.app", "Partner 1")}
                className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-slate-700/60 flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Try Instant Demo Mode (QR ready)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: LOGGED IN BUT NO HOUSEHOLD (ONBOARDING VIA QR CODE)
  // -------------------------------------------------------------
  if (!profile?.household_id) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[80vh]">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-1">
              <QrCode className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Link Account with Partner
            </h2>
            <p className="text-sm text-slate-400">
              Scan your partner's QR code or generate a household to link
              accounts.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Option A: Scan Partner's QR Code */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">
                  Option A: Scan Partner's QR Code
                </h3>
                <p className="text-xs text-slate-400">
                  Point camera at your partner's Household QR code.
                </p>
              </div>
            </div>

            <button
              onClick={startScanner}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active-press transition-all"
            >
              <ScanLine className="w-4 h-4" />
              Open QR Code Scanner
            </button>
          </div>

          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <span className="relative px-3 bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-500">
              OR
            </span>
          </div>

          {/* Option B: Create Household & Show QR Code */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">
                  Option B: Create New Household
                </h3>
                <p className="text-xs text-slate-400">
                  Generates your QR Code for your partner to scan.
                </p>
              </div>
            </div>

            <button
              onClick={handleCreateHousehold}
              disabled={loading}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              Create Household QR Code
            </button>
          </div>
        </div>

        {/* QR Scanner Modal */}
        {showScanner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
            <div className="w-full max-w-sm glass-panel p-6 rounded-3xl space-y-4 relative text-center">
              <button
                onClick={() => setShowScanner(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                  <Camera className="w-5 h-5 text-rose-400" />
                  Scan Household QR Code
                </h3>
                <p className="text-xs text-slate-400">
                  Align partner's QR code inside camera box
                </p>
              </div>

              {/* Camera Reader Element */}
              <div className="relative w-full h-64 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <div id="qr-reader" className="w-full h-full" />
              </div>

              {cameraError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
                  {cameraError}
                </div>
              )}

              {/* Instant Simulate QR Scan Button */}
              <button
                onClick={() => handleScanSuccess("DINNER_HOUSEHOLD:DIN-9X2Y")}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Simulate QR Scan (Instant Demo)
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: LOGGED IN & LINKED (PROFILE & HOUSEHOLD QR CODE)
  // -------------------------------------------------------------
  return (
    <div className="p-4 max-w-md mx-auto space-y-5 min-h-[82vh] pb-36">
      {/* Top Bar with Back Button */}
      {onCloseProfile && (
        <div className="flex items-center justify-between pb-1">
          <button
            onClick={onCloseProfile}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 flex items-center gap-1.5"
          >
            ← Back to Swiping
          </button>
          <span className="text-xs font-bold text-white">
            Profile & Household
          </span>
        </div>
      )}

      {/* Profile Avatar Card */}
      <div className="glass-panel p-5 rounded-3xl space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-rose-500/25 border-2 border-white/20">
              {(profile.display_name || user.email)[0].toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">
                {profile.display_name || user.email}
              </h2>
              <p className="text-xs text-slate-400">{user.email}</p>
              <div className="inline-flex items-center gap-1 mt-1 text-[11px] text-emerald-400 font-semibold">
                <UserCheck className="w-3.5 h-3.5" />
                Partner Account Linked
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Household QR Code Card */}
      <div className="glass-panel p-6 rounded-3xl text-center space-y-4 border-rose-500/30">
        <div className="flex items-center justify-center gap-2 text-rose-400 font-bold text-xs">
          <QrCode className="w-4 h-4 text-amber-400" />
          YOUR HOUSEHOLD QR CODE
        </div>

        {/* Render QR Code */}
        <div className="p-4 bg-white rounded-3xl inline-block shadow-2xl border-4 border-slate-900">
          <QRCodeSVG
            value={qrValue}
            size={180}
            bgColor="#ffffff"
            fgColor="#0f172a"
            level="H"
            includeMargin={false}
          />
        </div>

        <div>
          <p className="text-xs text-slate-300 font-medium">
            Have your partner scan this QR code from their device to link
            accounts!
          </p>
          <span className="font-mono text-sm font-bold tracking-widest text-amber-400 block mt-1">
            {profile.invite_code || "DIN-9X2Y"}
          </span>
        </div>

        {/* Scan Partner's QR Button */}
        <button
          onClick={startScanner}
          className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold rounded-2xl text-xs shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 active-press transition-all"
        >
          <Camera className="w-4 h-4" />
          Scan Partner's QR Code
        </button>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
          <div className="w-full max-w-sm glass-panel p-6 rounded-3xl space-y-4 relative text-center">
            <button
              onClick={() => setShowScanner(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                <Camera className="w-5 h-5 text-rose-400" />
                Scan Household QR Code
              </h3>
              <p className="text-xs text-slate-400">
                Align partner's QR code inside camera box
              </p>
            </div>

            <div className="relative w-full h-64 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <div id="qr-reader" className="w-full h-full" />
            </div>

            {cameraError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
                {cameraError}
              </div>
            )}

            <button
              onClick={() => handleScanSuccess("DINNER_HOUSEHOLD:DIN-9X2Y")}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Simulate QR Scan (Instant Link)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import {
  Flame,
  BookOpen,
  Sparkles,
  UtensilsCrossed,
  Heart,
  Users,
  QrCode,
  Utensils,
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  user,
  profile,
  matchCount = 0,
  onOpenProfile,
}) {
  const avatarLetter = (profile?.display_name ||
    user?.email ||
    'U')[0].toUpperCase();

  return (
    <>
      {/* Mobile Top Header Banner */}
      <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between">
        {/* Left: Brand */}
        <div
          onClick={() => setActiveTab('swipe')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 active-press group-hover:scale-105 transition-all">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base tracking-tight leading-none">
              What's For <span className="gradient-text-rose">Dinner?</span>
            </h1>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Utensils className="w-2.5 h-2.5 text-rose-500 fill-rose-500 inline" />
              Meal Swiper
            </span>
          </div>
        </div>

        {/* Right: Round Profile Avatar Thumbnail Button */}
        <div className="flex items-center gap-2">
          {profile?.household_id && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-medium text-slate-300">
              <Users className="w-3 h-3 text-emerald-400" />
              <span className="text-amber-400 font-mono font-bold">
                {profile.invite_code || 'LINKED'}
              </span>
            </div>
          )}

          <button
            onClick={onOpenProfile}
            className={`relative p-0.5 rounded-full transition-all active-press ${
              activeTab === 'profile'
                ? 'ring-2 ring-rose-500 ring-offset-2 ring-offset-slate-950 scale-105'
                : 'hover:ring-2 hover:ring-rose-500/50 hover:ring-offset-2 hover:ring-offset-slate-950'
            }`}
            title="Open Profile & Household QR Code"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-black text-sm flex items-center justify-center shadow-md shadow-rose-500/20 overflow-hidden border border-white/20">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                avatarLetter
              )}
            </div>
            {/* Status Dot */}
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${profile?.household_id ? 'bg-emerald-400' : 'bg-amber-400'}`}
            />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Floating Navigation Bar (Removed Profile Button - now 3 main tabs) */}
      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-full max-w-xs px-2">
        <div className="glass-panel rounded-full p-1.5 flex items-center justify-around shadow-2xl border border-slate-700/60 backdrop-blur-xl">
          <button
            onClick={() => setActiveTab('swipe')}
            className={`relative flex flex-col items-center justify-center py-2 px-5 rounded-full transition-all ${
              activeTab === 'swipe'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/30 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <Flame className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Swipe</span>
          </button>

          <button
            onClick={() => setActiveTab('cookbook')}
            className={`relative flex flex-col items-center justify-center py-2 px-5 rounded-full transition-all ${
              activeTab === 'cookbook'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/30 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Cookbook</span>
          </button>

          <button
            onClick={() => setActiveTab('matches')}
            className={`relative flex flex-col items-center justify-center py-2 px-5 rounded-full transition-all ${
              activeTab === 'matches'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/30 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <div className="relative">
              <Sparkles className="w-5 h-5" />
              {matchCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black animate-pulse">
                  {matchCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">Matches</span>
          </button>
        </div>
      </nav>
    </>
  );
}

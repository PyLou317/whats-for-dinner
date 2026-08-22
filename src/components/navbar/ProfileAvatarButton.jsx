import React from 'react';

export default function ProfileAvatarButton({
  activeTab,
  user,
  profile,
  onOpenProfile,
}) {
  const avatarLetter = (profile?.display_name || user?.email || 'U')[0].toUpperCase();

  return (
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
          <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          avatarLetter
        )}
      </div>
      <span
        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
          profile?.household_id ? 'bg-emerald-400' : 'bg-amber-400'
        }`}
      />
    </button>
  );
}
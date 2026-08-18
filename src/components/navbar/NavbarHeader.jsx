import React from 'react';
import { Users } from 'lucide-react';
import Brand from './Brand';
import ProfileAvatarButton from './ProfileAvatarButton';

export default function NavbarHeader({
  activeTab,
  setActiveTab,
  user,
  profile,
  onOpenProfile,
}) {
  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between">
      <Brand onClick={() => setActiveTab('swipe')} />

      <div className="flex items-center gap-2">
        {profile?.household_id && (
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-medium text-slate-300">
            <Users className="w-3 h-3 text-emerald-400" />
            <span className="text-amber-400 font-mono font-bold">
              {profile.invite_code || 'LINKED'}
            </span>
          </div>
        )}

        <ProfileAvatarButton
          activeTab={activeTab}
          user={user}
          profile={profile}
          onOpenProfile={onOpenProfile}
        />
      </div>
    </header>
  );
}
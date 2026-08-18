import React from 'react';
import NavbarHeader from './NavbarHeader';
import BottomNav from './BottomNav';

export default function Navbar({
  activeTab,
  setActiveTab,
  user,
  profile,
  matchCount = 0,
  onOpenProfile,
}) {
  return (
    <>
      <NavbarHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        profile={profile}
        onOpenProfile={onOpenProfile}
      />
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        matchCount={matchCount}
      />
    </>
  );
}

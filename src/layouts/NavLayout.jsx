import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from '../components/navigation/TopNav';
import BottomNav from '../components/navigation/BottomNav';

export default function NavLayout() {
  return (
    <div className="min-h-dvh flex flex-col">
      <TopNav />
      <main className="flex-1 min-h-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
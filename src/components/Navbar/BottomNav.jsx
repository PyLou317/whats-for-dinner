import React from 'react';
import { Flame, BookOpen, Sparkles } from 'lucide-react';
import NavTabButton from './NavTabButton';

export default function BottomNav({ activeTab, setActiveTab, matchCount = 0 }) {
  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-full max-w-xs px-2">
      <div className="glass-panel rounded-full p-1.5 flex items-center justify-around shadow-2xl border border-slate-700/60 backdrop-blur-xl">
        <NavTabButton
          tabKey="swipe"
          label="Swipe"
          Icon={Flame}
          activeTab={activeTab}
          onClick={() => setActiveTab('swipe')}
        />

        <NavTabButton
          tabKey="cookbook"
          label="Cookbook"
          Icon={BookOpen}
          activeTab={activeTab}
          onClick={() => setActiveTab('cookbook')}
        />

        <NavTabButton
          tabKey="matches"
          label="Matches"
          Icon={Sparkles}
          activeTab={activeTab}
          onClick={() => setActiveTab('matches')}
          badge={matchCount > 0 ? matchCount : null}
        />
      </div>
    </nav>
  );
}

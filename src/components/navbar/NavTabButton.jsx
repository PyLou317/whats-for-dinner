import React from 'react';

export default function NavTabButton({
  tabKey,
  label,
  Icon,
  activeTab,
  onClick,
  badge,
}) {
  const isActive = activeTab === tabKey;

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center py-2 px-5 rounded-full transition-all ${
        isActive
          ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/30 font-bold scale-105'
          : 'text-slate-400 hover:text-slate-200 font-medium'
      }`}
    >
      <div className="relative">
        <Icon className="w-5 h-5" />
        {badge ? (
          <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black animate-pulse">
            {badge}
          </span>
        ) : null}
      </div>
      <span className="text-[10px] mt-0.5">{label}</span>
    </button>
  );
}

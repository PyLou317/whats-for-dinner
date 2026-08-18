import React from 'react';
import { UtensilsCrossed, Utensils } from 'lucide-react';

export default function Brand({ onClick }) {
  return (
    <div onClick={onClick} className="flex items-center gap-2 cursor-pointer group">
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
  );
}
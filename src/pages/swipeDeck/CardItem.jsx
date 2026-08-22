import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Clock, Info } from 'lucide-react';

export default function CardItem({
  recipe,
  isTop,
  index,
  totalCount,
  partnerDecision,
  onSwipe,
  onSelectDetail,
  registerSwipeTrigger,
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-20, 0, 20]);
  const opacity = useTransform(
    x,
    [-180, -100, 0, 100, 180],
    [0.2, 1, 1, 1, 0.2],
  );

  // Define dynamic opacity transforms for swipe feedback badges
  const likeBadgeOpacity = useTransform(x, [15, 90], [0, 1]);
  const passBadgeOpacity = useTransform(x, [-15, -90], [0, 1]);

  const [isDragging, setIsDragging] = useState(false);

  const handleSwipe = (decision) => {
    if (!recipe) return;

    const direction = decision === 'yes' ? 'right' : 'left';
    const offset = direction === 'right' ? 500 : -500;

    animate(x, offset, {
      type: 'spring',
      stiffness: 220,
      damping: 22,
      mass: 0.8,
    });

    onSwipe?.(recipe, decision, direction);
  };

  useEffect(() => {
    if (registerSwipeTrigger) {
      registerSwipeTrigger((decision = 'no') => handleSwipe(decision));
    }
  }, [registerSwipeTrigger, recipe?.id]);

  const handleDragEnd = (_, info) => {
    if (!isTop) return;
    setIsDragging(false);

    const threshold = 120;
    const velocityThreshold = 300;

    if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      handleSwipe('yes');
    } else if (
      info.offset.x < -threshold ||
      info.velocity.x < -velocityThreshold
    ) {
      handleSwipe('no');
    } else {
      animate(x, 0, {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      });
    }
  };

  return (
    <motion.div
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.18}
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : 1,
        zIndex: totalCount - index,
      }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      whileTap={isTop ? { scale: 0.98 } : undefined}
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{
        scale: 1 - index * 0.05,
        opacity: 1 - index * 0.15,
        y: index * 12,
      }}
      className="absolute inset-0 rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden bg-slate-900 flex flex-col justify-between select-none cursor-grab active:cursor-grabbing"
    >
      {/* Top Recipe Image */}
      <div className="relative h-64 w-full overflow-hidden bg-slate-900">
        <img
          src={
            recipe?.image_url ||
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
          }
          alt={recipe?.title || 'Recipe'}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-amber-400 text-xs font-bold border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {recipe?.prep_time || '20 mins'}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectDetail?.(recipe);
            }}
            className="p-2 rounded-full bg-slate-950/70 backdrop-blur-md text-white hover:text-rose-400 border border-white/20 pointer-events-auto transition-all"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Drag Status Overlay Badges */}
        {isTop && (
          <motion.div
            drag
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            style={{ x, rotate, opacity, zIndex: totalCount - index }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            whileTap={{ scale: 0.98 }}
            className="absolute inset-0 rounded-[2rem] border border-white/10 shadow-2xl"
          >
            <motion.div
              style={{ opacity: likeBadgeOpacity }}
              className="absolute top-8 left-6 rotate-[-15deg] border-4 border-emerald-400 text-emerald-400 px-4 py-1.5 rounded-2xl font-black text-2xl tracking-wider uppercase bg-emerald-950/80 backdrop-blur-sm pointer-events-none shadow-2xl"
            >
              YES! 💚
            </motion.div>
            <motion.div
              style={{ opacity: passBadgeOpacity }}
              className="absolute top-8 right-6 rotate-15 border-4 border-rose-500 text-rose-500 px-4 py-1.5 rounded-2xl font-black text-2xl tracking-wider uppercase bg-rose-950/80 backdrop-blur-sm pointer-events-none shadow-2xl"
            >
              PASS 💔
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Card Content Footer */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-slate-900/90">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
            {recipe?.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1">
            {recipe?.instructions ||
              'Delicious homecooked meal recipe ready to prepare.'}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {recipe?.tags?.map((t) => (
            <span
              key={t}
              className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700/60"
            >
              #{t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

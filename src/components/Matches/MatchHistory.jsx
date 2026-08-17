import React, { useState } from 'react';
import HeaderBanner from './HeaderBanner';
import EmptyState from './EmptyState';
import MatchesList from './MatchesList';
import MatchDetailModal from './MatchDetailModal';
import {
  Sparkles,
  Clock,
  Calendar,
  ChefHat,
  Heart,
  CheckCircle2,
  Utensils,
  X,
  BookOpen,
} from 'lucide-react';

export default function MatchHistory({ matches = [], onSelectRecipe }) {
  const [selectedMatch, setSelectedMatch] = useState(null);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full space-y-4 min-h-[82vh] pb-32">
      <HeaderBanner todayStr={todayStr} />

      {/* Matches List */}
      {matches.length > 0 ? (
        <MatchesList matches={matches} onSelectMatch={setSelectedMatch} />
      ) : (
        /* Empty State */
        <EmptyState />
      )}

      {/* Match Detail Modal */}
      {selectedMatch && (
        <MatchDetailModal
          selectedMatch={selectedMatch}
          setSelectedMatch={setSelectedMatch}
        />
      )}
    </div>
  );
}

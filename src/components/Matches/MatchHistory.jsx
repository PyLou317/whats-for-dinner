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

const MATCHES_STORAGE_KEY = 'wfd:matches';

const readStoredMatches = () => {
  try {
    const raw = localStorage.getItem(MATCHES_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export default function MatchHistory({
  matches = [],
  onSelectRecipe,
  onMatchCountChange,
  onUndoMatch,
}) {
  const [selectedMatch, setSelectedMatch] = useState(null);

  const handleUndoMatch = (matchId, matchItem) => {
    onUndoMatch?.(matchId, matchItem);

    setSelectedMatch((prev) => {
      if (!prev) return prev;
      if (matchItem?.id != null) return prev.id === matchItem.id ? null : prev;
      return prev === matchItem ? null : prev;
    });
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full space-y-4 min-h-[82vh] pb-32">
      <HeaderBanner todayStr={todayStr} />

      {matches.length > 0 ? (
        <MatchesList
          matches={matches}
          onSelectMatch={setSelectedMatch}
          onUndoMatch={handleUndoMatch}
        />
      ) : (
        <EmptyState />
      )}

      {selectedMatch && (
        <MatchDetailModal
          selectedMatch={selectedMatch}
          setSelectedMatch={setSelectedMatch}
        />
      )}
    </div>
  );
}

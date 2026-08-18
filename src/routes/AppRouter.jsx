import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import NavLayout from '../layouts/NavLayout';
import HomePage from '../pages/HomePage';
import OnboardingPage from '../pages/onboarding/OnboardingPage';

// Add existing screens/pages here as you migrate them:
import CookbookPage from '../pages/CookbookPage';
import MatchesPage from '../pages/MatchesPage';

export default function AppRouter() {
  return (
    <Routes>
      {/* No top/bottom nav here */}
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Nav shell routes */}
      <Route element={<NavLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/cookbook" element={<CookbookPage />} />
        <Route path="/matches" element={<MatchesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

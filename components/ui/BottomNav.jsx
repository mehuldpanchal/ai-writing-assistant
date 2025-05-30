import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaFeatherAlt, FaMagic } from "react-icons/fa";

export default function BottomNav() {
  const [credits, setCredits] = useState({
    remaining: 20, // Default credits
    resetTime: null,
    loading: false
  });

  const getUserId = () => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'user-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('userId', userId);
    }
    return userId;
  };

  const fetchCredits = async () => {
    try {
      const userId = getUserId();
      const headers = { 'X-User-ID': userId };
      
      // Try spelling-grammar endpoint first
      let res = await fetch('/api/spelling-grammar', { method: 'GET', headers });
      if (!res.ok) {
        // Fallback to writing-style endpoint if spelling-grammar fails
        res = await fetch('/api/writing-style', { method: 'GET', headers });
      }
      
      const data = await res.json();

      console.log('Fetched credits:', {
        remaining: data.creditsRemaining,
        resetTime: data.resetTime
      });
      setCredits({
        remaining: data.creditsRemaining,
        resetTime: data.resetTime,
        loading: false
      });
    } catch (error) {
      console.error('Failed to fetch credits:', error);
      setCredits(prev => ({ ...prev, loading: false }));
    }
  };

  // Manual credit refresh after operations
  const refreshCredits = () => {
    fetchCredits();
  };

  useEffect(() => {
    fetchCredits();
    const interval = setInterval(fetchCredits, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Export fetchCredits so it can be called from other components
  BottomNav.fetchCredits = fetchCredits;

  return (
    <nav className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl inline-flex justify-center items-center gap-3 sm:gap-6 px-4 py-2 sm:px-6 sm:py-2 border border-white/20">
      <Link href="/" passHref legacyBehavior>
        <a>
          <NavItem
            icon={FaFeatherAlt}
            label="Grammar & Writing Style"
            loading={credits.loading}
          />
        </a>
      </Link>
      <Link href="/smart-composer" passHref legacyBehavior>
        <a>
          <NavItem
            icon={FaMagic}
            label="Smart Composer"
            loading={credits.loading}
          />
        </a>
      </Link>
      <div className="flex flex-col items-center">
        <div className="text-lg sm:text-xl mb-0.5 font-bold text-blue-300">
          {credits.loading ? '...' : credits.remaining}
        </div>
        <span className="text-xs sm:text-sm font-medium">Credits</span>
        {credits.resetTime && (
          <div className="text-xs text-blue-300 mt-0.5">
            Resets: {new Date(credits.resetTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavItem({ icon: Icon, label, loading }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="flex flex-col items-center justify-center text-center text-white hover:text-blue-400 transition-colors focus:outline-none cursor-pointer relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip((v) => !v)}
      tabIndex={0}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
    >
      <Icon className="text-lg sm:text-xl mb-0.5" />
      <span className="text-xs sm:text-sm font-medium">{label}</span>
      {loading && (
        <span className="text-xs text-blue-300 mt-0.5">...</span>
      )}
      {showTooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 shadow z-50 whitespace-nowrap">
          {label}
        </div>
      )}
    </div>
  );
}
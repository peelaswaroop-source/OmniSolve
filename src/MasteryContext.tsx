import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserStats, MasteryTier, MasteryContextType } from './types';

const MasteryContext = createContext<MasteryContextType | undefined>(undefined);

const INITIAL_STATS: UserStats = {
  level: 1,
  xp: 0,
  skills: {
    logic: 20,
    resolution: 15,
    synthesis: 10,
    creativity: 25,
    speed: 30,
    accuracy: 18,
    depth: 12,
    intuition: 22,
  },
};

export const MasteryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('omnisolve_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });

  useEffect(() => {
    localStorage.setItem('omnisolve_stats', JSON.stringify(stats));
  }, [stats]);

  const addXp = (amount: number) => {
    setStats(prev => {
      const newXp = prev.xp + amount;
      const nextLevelXp = prev.level * 1000;
      if (newXp >= nextLevelXp) {
        return {
          ...prev,
          level: prev.level + 1,
          xp: newXp - nextLevelXp,
          skills: Object.fromEntries(
            Object.entries(prev.skills).map(([k, v]) => [k, Math.min(100, (v as number) + Math.floor(Math.random() * 5) + 1)])
          ) as any,
        };
      }
      return { ...prev, xp: newXp };
    });
  };

  const tier: MasteryTier = stats.level >= 8 ? 3 : stats.level >= 4 ? 2 : 1;

  return (
    <MasteryContext.Provider value={{ stats, tier, addXp }}>
      <div className={tier === 3 ? 'tier-3' : tier === 2 ? 'tier-2' : ''}>
        {children}
      </div>
    </MasteryContext.Provider>
  );
};

export const useMastery = () => {
  const context = useContext(MasteryContext);
  if (!context) throw new Error('useMastery must be used within MasteryProvider');
  return context;
};

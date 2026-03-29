import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { useMastery } from '@/src/MasteryContext';
import { Brain, Trophy, Star, TrendingUp } from 'lucide-react';

export const MasteryDashboard: React.FC = () => {
  const { stats, tier } = useMastery();

  const chartData = [
    { subject: 'Logic', A: stats.skills.logic, fullMark: 100 },
    { subject: 'Resolution', A: stats.skills.resolution, fullMark: 100 },
    { subject: 'Synthesis', A: stats.skills.synthesis, fullMark: 100 },
    { subject: 'Creativity', A: stats.skills.creativity, fullMark: 100 },
    { subject: 'Speed', A: stats.skills.speed, fullMark: 100 },
    { subject: 'Accuracy', A: stats.skills.accuracy, fullMark: 100 },
    { subject: 'Depth', A: stats.skills.depth, fullMark: 100 },
    { subject: 'Intuition', A: stats.skills.intuition, fullMark: 100 },
  ];

  const nextLevelXp = stats.level * 1000;
  const progress = (stats.xp / nextLevelXp) * 100;

  return (
    <div className="w-full h-full glass md:border-l flex flex-col p-6 space-y-8 overflow-y-auto">
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full brand-bg p-1 shadow-2xl">
            <div className="w-full h-full rounded-full bg-white dark:bg-black flex items-center justify-center">
              <span className="text-4xl font-bold brand-text">{stats.level}</span>
            </div>
          </div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-2 -right-2 bg-amber-500 text-white p-1.5 rounded-full shadow-lg"
          >
            <Trophy className="w-4 h-4" />
          </motion.div>
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-[-0.08em] uppercase font-logo brand-text">OmniSavant</h2>
          <p className="text-[10px] font-bold tracking-[0.2em] opacity-50 uppercase">Tier {tier} Resolution Engine</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-50">
          <span>Cognitive XP</span>
          <span>{stats.xp} / {nextLevelXp}</span>
        </div>
        <div className="h-2 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full brand-bg"
          />
        </div>
      </div>

      <div className="flex-1 min-h-[300px] relative">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 text-center mb-4">Radar Vector Analysis</p>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid stroke="currentColor" strokeOpacity={0.1} />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fontWeight: 700, opacity: 0.5 }} />
            <Radar
              name="Mastery"
              dataKey="A"
              stroke="#BF36FF"
              fill="#368DFF"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Star className="w-3 h-3" />} label="Streak" value="12 Days" />
        <StatCard icon={<TrendingUp className="w-3 h-3" />} label="Rank" value="Top 4%" />
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-white/5">
    <div className="flex items-center gap-2 opacity-50 mb-1">
      {icon}
      <span className="text-[8px] font-bold uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-sm font-bold">{value}</p>
  </div>
);

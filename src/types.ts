export type MasteryTier = 1 | 2 | 3;

export interface UserStats {
  level: number;
  xp: number;
  skills: {
    logic: number;
    resolution: number;
    synthesis: number;
    creativity: number;
    speed: number;
    accuracy: number;
    depth: number;
    intuition: number;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image' | 'summary';
  imageUrl?: string;
  generatedImageUrl?: string;
  sources?: Array<{ title: string; uri: string }>;
}

export interface MasteryContextType {
  stats: UserStats;
  tier: MasteryTier;
  addXp: (amount: number) => void;
}

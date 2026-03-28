import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Message } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { Brain, Lightbulb, ListOrdered, Zap, Target, ExternalLink, Loader2 } from 'lucide-react';
import { generateVisual } from '@/src/services/gemini';

interface AIChatProps {
  messages: Message[];
}

export const AIChat: React.FC<AIChatProps> = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8">
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
    </div>
  );
};

const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';
  const [visualUrl, setVisualUrl] = useState<string | null>(message.generatedImageUrl || null);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);

  const parseContent = (content: string) => {
    const parts = content.split(/(\[.*?\]:?)/g);
    const elements: React.ReactNode[] = [];
    let currentTag = '';

    parts.forEach((part, index) => {
      if (part.startsWith('[') && part.includes(']')) {
        currentTag = part.replace(':', '').trim();
      } else if (part.trim()) {
        const text = part.trim();
        switch (currentTag) {
          case '[RESOLUTION]':
            elements.push(
              <div key={index} className="bg-black/10 dark:bg-white/5 p-6 rounded-3xl border-l-4 border-purple-500 my-4 shadow-inner">
                <div className="flex items-center gap-2 mb-2 text-purple-500">
                  <Brain className="w-5 h-5" />
                  <span className="text-xs font-black tracking-widest uppercase">Resolution</span>
                </div>
                <p className="text-lg leading-relaxed font-medium">{text}</p>
              </div>
            );
            break;
          case '[ANALOGY]':
            elements.push(
              <div key={index} className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl my-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2 text-blue-400">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-xs font-bold tracking-widest uppercase">Analogy Bridge</span>
                </div>
                <p className="text-sm italic opacity-90">{text}</p>
              </div>
            );
            break;
          case '[STEP]':
            elements.push(
              <div key={index} className="flex gap-4 items-start my-2 group">
                <div className="w-8 h-8 rounded-full brand-bg flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <ListOrdered className="w-4 h-4" />
                </div>
                <p className="text-sm pt-1.5 opacity-90">{text}</p>
              </div>
            );
            break;
          case '[INSIGHT]':
            elements.push(
              <div key={index} className="bg-amber-500/5 border-l-2 border-amber-500 p-4 my-4 rounded-r-xl">
                <div className="flex items-center gap-2 mb-1 text-amber-500">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Deep Insight</span>
                </div>
                <p className="text-sm opacity-80">{text}</p>
              </div>
            );
            break;
          case '[CHALLENGE]':
            elements.push(
              <div key={index} className="bg-emerald-500/10 border border-dashed border-emerald-500/30 p-5 rounded-3xl my-6 text-center">
                <Target className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-emerald-500 mb-1 uppercase tracking-tighter">Mastery Challenge</p>
                <p className="text-base font-medium italic">"{text}"</p>
              </div>
            );
            break;
          case '[VISUAL]':
            if (!visualUrl && !isGeneratingVisual) {
              handleVisualGeneration(text);
            }
            break;
          default:
            elements.push(<p key={index} className="opacity-80 leading-relaxed my-2">{text}</p>);
        }
      }
    });

    return elements;
  };

  const handleVisualGeneration = async (prompt: string) => {
    setIsGeneratingVisual(true);
    try {
      const url = await generateVisual(prompt);
      setVisualUrl(url);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingVisual(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col max-w-3xl",
        isUser ? "ml-auto items-end" : "mr-auto items-start"
      )}
    >
      {isUser ? (
        <div className="space-y-2">
          {message.imageUrl && (
            <img src={message.imageUrl} alt="User upload" className="max-w-xs rounded-2xl border border-white/20 shadow-xl" />
          )}
          <div className="brand-bg text-white px-6 py-3 rounded-3xl rounded-tr-none shadow-xl">
            <p className="text-sm font-medium">{message.content}</p>
          </div>
        </div>
      ) : (
        <div className="w-full space-y-4">
          <div className="glass p-8 rounded-3xl rounded-tl-none shadow-2xl border-white/10">
            {parseContent(message.content)}
            
            {isGeneratingVisual && (
              <div className="w-full aspect-video glass rounded-2xl flex flex-col items-center justify-center gap-4 my-4">
                <Loader2 className="w-8 h-8 animate-spin opacity-50" />
                <p className="text-xs font-bold tracking-widest opacity-50">SYNTHESIZING VISUAL...</p>
              </div>
            )}
            
            {visualUrl && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="my-6">
                <img src={visualUrl} alt="AI Generated Visual" className="w-full rounded-2xl border border-white/10 shadow-2xl" />
                <p className="text-[10px] text-center mt-2 opacity-30 uppercase tracking-widest font-bold">Neural Synthesis Engine v2.5</p>
              </motion.div>
            )}

            {message.sources && message.sources.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/5">
                <p className="text-[10px] font-black tracking-widest uppercase opacity-30 mb-3">Grounding Sources</p>
                <div className="flex flex-wrap gap-2">
                  {message.sources.map((source, i) => (
                    <a
                      key={i}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-[10px] font-bold"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

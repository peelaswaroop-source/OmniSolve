/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { MasteryProvider, useMastery } from './MasteryContext';
import { InputCommandCenter } from './components/InputCommandCenter';
import { AIChat } from './components/AIChat';
import { MasteryDashboard } from './components/MasteryDashboard';
import { NeuralOrb } from './components/NeuralOrb';
import { Message } from './types';
import { finalizeResolution } from './services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Sparkles, Command, Menu, X } from 'lucide-react';
import { cn } from './lib/utils';

function OmniSolveApp() {
  const { stats, tier, addXp } = useMastery();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFinalize = async (text: string, image?: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      imageUrl: image,
    };

    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const geminiMessages = messages.concat(userMsg).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      if (image) {
        const lastMsg = geminiMessages[geminiMessages.length - 1];
        lastMsg.parts.push({
          inlineData: {
            data: image.split(',')[1],
            mimeType: "image/png",
          }
        } as any);
      }

      const result = await finalizeResolution(geminiMessages, stats.level);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.text,
        sources: result.sources,
      };

      setMessages(prev => [...prev, assistantMsg]);
      addXp(250);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden flex-col md:flex-row">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 glass border-b z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 brand-bg rounded-lg flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white animate-pulse" />
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-[-0.08em] uppercase font-logo">OmniSolve</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Tier {tier}</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 glass rounded-lg"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-b from-transparent to-black/5 dark:to-white/5">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 text-center space-y-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 md:w-32 md:h-32 brand-bg rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-12"
              >
                <Zap className="w-12 h-12 md:w-16 md:h-16 text-white -rotate-12 animate-pulse" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-3xl md:text-5xl font-black tracking-[-0.08em] uppercase font-logo">What can we solve together?</h2>
                <p className="max-w-xs md:max-w-md mx-auto opacity-50 text-xs md:text-sm font-medium leading-relaxed">
                  I'm here to help you understand and master any challenge. 
                  Share a photo or just start typing, and we'll find the answer together.
                </p>
              </div>
            </div>
          ) : (
            <AIChat messages={messages} />
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-8 pb-8 md:pb-12 bg-gradient-to-t from-white dark:from-black to-transparent z-20">
          <InputCommandCenter onFinalize={handleFinalize} isProcessing={isProcessing} />
        </div>

        <NeuralOrb />
      </main>

      {/* Sidebar - Responsive Overlay for Mobile */}
      <div className={cn(
        "fixed inset-0 z-40 md:relative md:inset-auto transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
      )}>
        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <div className="relative h-full w-80 ml-auto bg-white dark:bg-black md:bg-transparent">
          <MasteryDashboard />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <MasteryProvider>
      <OmniSolveApp />
    </MasteryProvider>
  );
}

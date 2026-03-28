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
import { Brain, Sparkles, Command } from 'lucide-react';

function OmniSolveApp() {
  const { stats, tier, addXp } = useMastery();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
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

      // If image exists, add it to the last message parts
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
      addXp(250); // Reward for interaction
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 glass border-b z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 brand-bg rounded-lg flex items-center justify-center shadow-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase">OmniSolve</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-help">
              <Command className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Neural Command Active</span>
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Mastery Tier {tier}</span>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-b from-transparent to-black/5 dark:to-white/5">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-32 h-32 brand-bg rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-12"
              >
                <Brain className="w-16 h-16 text-white -rotate-12" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tighter uppercase">Initiate Resolution</h2>
                <p className="max-w-md mx-auto opacity-50 text-sm font-medium leading-relaxed">
                  Welcome to OmniSolve. I am your Cognitive-Adaptive Resolution Engine. 
                  Upload an image or enter a query to begin the neural scan.
                </p>
              </div>
            </div>
          ) : (
            <AIChat messages={messages} />
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-8 pb-12 bg-gradient-to-t from-white dark:from-black to-transparent">
          <InputCommandCenter onFinalize={handleFinalize} isProcessing={isProcessing} />
        </div>

        <NeuralOrb />
      </main>

      {/* Sidebar */}
      <MasteryDashboard />
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

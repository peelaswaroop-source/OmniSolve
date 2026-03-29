import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, XCircle, Loader2 } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import { MODELS } from '@/src/services/gemini';
import { cn } from '@/src/lib/utils';

export const NeuralOrb: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const sessionRef = useRef<any>(null);

  const toggleLive = async () => {
    if (isActive) {
      sessionRef.current?.close();
      setIsActive(false);
      return;
    }

    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      // Note: Live API implementation requires complex audio handling.
      // For this demo, we'll simulate the UI state.
      // In a real app, we'd use navigator.mediaDevices.getUserMedia and PCM encoding.
      
      setTimeout(() => {
        setIsConnecting(false);
        setIsActive(true);
      }, 1500);
    } catch (error) {
      console.error(error);
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="relative">
        <AnimatePresence>
          {isActive && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.8, opacity: 0.3 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-full blur-2xl"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 2.5, opacity: 0.15 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                className="absolute inset-0 bg-gradient-to-bl from-pink-500 to-cyan-500 rounded-full blur-3xl"
              />
            </>
          )}
        </AnimatePresence>

        <button
          onClick={toggleLive}
          disabled={isConnecting}
          className={cn(
            "relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_0_50px_rgba(191,54,255,0.4)]",
            isActive 
              ? "bg-gradient-to-br from-[#BF36FF] via-[#368DFF] to-[#00FFD1] scale-110 border-4 border-white/20" 
              : "glass hover:scale-105 border-2 border-white/10"
          )}
        >
          {isConnecting ? (
            <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
          ) : isActive ? (
            <XCircle className="w-10 h-10 text-white" />
          ) : (
            <Brain className="w-10 h-10 brand-text" />
          )}
        </button>

        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
              <div className="glass px-4 py-2 rounded-full flex items-center gap-2 shadow-xl">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-purple-500">
                  I'm listening...
                </span>
              </div>
              <p className="text-[8px] font-bold uppercase tracking-tighter opacity-40 whitespace-nowrap bg-black/20 px-2 py-0.5 rounded">
                Real-time multi-modal audio tutoring active
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

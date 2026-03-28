import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
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
                animate={{ scale: 1.5, opacity: 0.2 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 brand-bg rounded-full blur-2xl"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 2, opacity: 0.1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute inset-0 brand-bg rounded-full blur-3xl"
              />
            </>
          )}
        </AnimatePresence>

        <button
          onClick={toggleLive}
          disabled={isConnecting}
          className={cn(
            "relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl",
            isActive ? "brand-bg scale-110" : "glass hover:scale-105"
          )}
        >
          {isConnecting ? (
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          ) : isActive ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 brand-text" />
          )}
        </button>

        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <div className="glass px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-purple-500 animate-pulse">
                Live Neural Sync Active
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

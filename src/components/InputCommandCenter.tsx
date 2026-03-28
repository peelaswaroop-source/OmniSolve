import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image as ImageIcon, Send, Mic, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { preliminaryScan } from '@/src/services/gemini';

interface InputCommandCenterProps {
  onFinalize: (text: string, image?: string) => void;
  isProcessing: boolean;
}

export const InputCommandCenter: React.FC<InputCommandCenterProps> = ({ onFinalize, isProcessing }) => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] },
    multiple: false,
    noClick: true,
  } as any);

  const handleScan = async () => {
    if (!input && !image) return;
    setIsScanning(true);
    try {
      const result = await preliminaryScan(input, image || undefined);
      setSummary(result || "Scan complete.");
    } catch (error) {
      console.error(error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFinalize = () => {
    onFinalize(input, image || undefined);
    setInput('');
    setImage(null);
    setSummary(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-2 md:p-4">
      <div 
        {...getRootProps()} 
        className={cn(
          "glass rounded-2xl md:rounded-3xl p-1 md:p-2 transition-all duration-300 shadow-2xl",
          isDragActive && "ring-2 ring-purple-500 scale-[1.02]"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2">
          <div className="flex-1 flex items-center gap-2 md:gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query or drop image..."
              className="w-full bg-transparent border-none outline-none text-base md:text-lg placeholder:opacity-50"
              onKeyDown={(e) => e.key === 'Enter' && !summary && handleScan()}
            />
          </div>
          
          <div className="flex items-center gap-1 md:gap-2">
            <button 
              onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
              className="p-1.5 md:p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
            >
              <ImageIcon className="w-4 h-4 md:w-5 md:h-5 opacity-70" />
            </button>
            <button className="p-1.5 md:p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
              <Mic className="w-4 h-4 md:w-5 md:h-5 opacity-70" />
            </button>
            <button
              onClick={summary ? handleFinalize : handleScan}
              disabled={isScanning || isProcessing || (!input && !image)}
              className="brand-bg text-white p-2 md:p-3 rounded-xl md:rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isScanning || isProcessing ? (
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
              ) : summary ? (
                <Send className="w-4 h-4 md:w-5 md:h-5" />
              ) : (
                <span className="text-[10px] md:text-sm font-bold px-1 md:px-2">SCAN</span>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {(image || summary) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/10 mt-2"
            >
              <div className="p-4 flex gap-4 items-start">
                {image && (
                  <div className="relative group">
                    <img src={image} alt="Upload" className="w-24 h-24 object-cover rounded-xl border border-white/20" />
                    <button 
                      onClick={() => setImage(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {summary && (
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-widest opacity-50 mb-1 font-bold">Neural Scan Summary</p>
                    <p className="text-sm italic opacity-90 leading-relaxed">"{summary}"</p>
                    <div className="mt-3 flex gap-2">
                      <button 
                        onClick={handleFinalize}
                        className="text-xs font-bold px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        FINALIZE RESOLUTION
                      </button>
                      <button 
                        onClick={() => setSummary(null)}
                        className="text-xs font-bold px-4 py-2 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
                      >
                        ENRICH CONTEXT
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

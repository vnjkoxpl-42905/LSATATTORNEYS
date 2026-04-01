import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { generateNarration } from '@/services/ttsService';

interface NarrationButtonProps {
  text: string;
}

export const MCRNarrationButton = ({ text }: NarrationButtonProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleNarration = async () => {
    setError(null);
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    setIsLoading(true);
    try {
      const audioUrl = await generateNarration(text);
      setIsLoading(false);

      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsPlaying(false);
        audioRef.current = audio;
        audio.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Narration generation error:', err);
      setError('Audio generation failed. Please try again later.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={toggleNarration}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors font-mono text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={isPlaying ? 'Stop narration' : 'Start narration'}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
        {isLoading ? 'GENERATING...' : isPlaying ? 'STOP' : 'LISTEN'}
      </button>
      {error && <p className="text-xs text-rose-600 font-mono">{error}</p>}
    </div>
  );
};

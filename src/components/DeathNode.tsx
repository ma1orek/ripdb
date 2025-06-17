import React, { useState } from 'react';
import { Calendar, User, Film } from 'lucide-react';
import { DeathEvent } from '../data/mockData';

interface DeathNodeProps {
  death: DeathEvent;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

export function DeathNode({ death, index, isActive, onClick }: DeathNodeProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).getFullYear();
  };

  return (
    <div className="flex flex-col items-center relative">
      {/* Timeline node */}
      <div 
        className={`
          relative w-20 h-20 rounded-full cursor-pointer liquid-animation
          ${isActive ? 'glass-strong neon-glow-strong scale-110' : 'glass neon-glow hover:scale-105'}
          ring-4 ring-primary/20 hover:ring-primary/40
        `}
        onClick={onClick}
        style={{ animationDelay: `${index * 0.2}s` }}
      >
        {/* Movie poster thumbnail */}
        <img
          src={death.posterUrl}
          alt={death.movieTitle}
          className={`w-full h-full rounded-full object-cover transition-opacity duration-300
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Loading placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Film className="w-8 h-8 text-primary animate-pulse" />
          </div>
        )}

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        
        {/* Active indicator */}
        {isActive && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full animate-pulse ring-4 ring-black" />
        )}
      </div>

      {/* Year label */}
      <div className="mt-3 text-center">
        <div className="text-sm font-medium text-primary">
          {formatDate(death.releaseDate)}
        </div>
        <div className="text-xs text-muted-foreground mt-1 max-w-20 truncate">
          {death.movieTitle}
        </div>
      </div>

      {/* Detail card (shown when active) */}
      {isActive && (
        <div className="absolute top-full mt-8 w-80 glass-strong rounded-xl p-6 z-10 fade-in-up shadow-2xl">
          <div className="space-y-4">
            {/* Movie title and year */}
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{death.movieTitle}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(death.releaseDate)} • Directed by {death.director}
              </p>
            </div>

            {/* Character info */}
            <div className="flex items-center gap-2 text-primary">
              <User className="w-4 h-4" />
              <span className="font-medium">{death.character}</span>
            </div>

            {/* Death description */}
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm text-destructive-foreground font-medium">
                Death: {death.deathDescription}
              </p>
            </div>

            {/* Plot summary */}
            <p className="text-sm text-white/80 leading-relaxed">
              {death.plotSummary}
            </p>
          </div>

          {/* Pointer arrow */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-inherit border-l border-t border-white/20 rotate-45" />
        </div>
      )}
    </div>
  );
}
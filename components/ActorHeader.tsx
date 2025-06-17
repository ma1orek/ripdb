import React from 'react';
import { Calendar, User } from 'lucide-react';
import { Actor } from '../data/mockData';

interface ActorHeaderProps {
  actor: Actor;
}

export function ActorHeader({ actor }: ActorHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="glass-strong rounded-2xl p-8 mb-8 fade-in-up">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Actor headshot */}
        <div className="relative">
          <img
            src={actor.headshot}
            alt={actor.name}
            className="w-48 h-48 md:w-56 md:h-56 rounded-2xl object-cover ring-4 ring-primary/30 shadow-2xl"
          />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* Actor details */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-primary bg-clip-text text-transparent">
              {actor.name}
            </h1>
            
            {/* Death counter */}
            <div className="inline-flex items-center gap-3 glass rounded-full px-6 py-3 neon-glow">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              <span className="text-xl font-medium">
                On-screen deaths: <span className="text-primary text-2xl font-bold">{actor.deathCount}</span>
              </span>
            </div>
          </div>

          {/* Bio and birth date */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar className="w-5 h-5" />
              <span>Born {formatDate(actor.birthDate)}</span>
            </div>
            
            <p className="text-lg leading-relaxed text-white/90 max-w-3xl">
              {actor.bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
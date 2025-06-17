import React from 'react';
import { ArrowLeft, Award, DollarSign, Calendar, MapPin } from 'lucide-react';
import { ActorHeader } from './ActorHeader';
import { NeuralDeathMap } from './NeuralDeathMap';
import { Actor } from '../data/mockData';

interface ActorPageProps {
  actor: Actor;
  onBack: () => void;
}

export function ActorPage({ actor, onBack }: ActorPageProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Enhanced navigation */}
      <div className="flex items-center justify-between fade-in-up">
        <button
          onClick={onBack}
          className="flex items-center gap-3 glass-panel rounded-full px-6 py-3 hover:glass-strong liquid-animation neon-glow hover:neon-glow-strong group"
        >
          <ArrowLeft className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
          <span className="text-white group-hover:text-primary transition-colors">Back to Search</span>
        </button>
        
        <div className="flex items-center gap-4">
          <div className="glass-panel rounded-full px-4 py-2">
            <span className="text-sm text-muted-foreground">Last updated: Today</span>
          </div>
        </div>
      </div>

      {/* Enhanced Actor header with stats */}
      <div className="glass-strong rounded-2xl p-8 fade-in-up">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Actor image with enhanced styling */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl opacity-30 group-hover:opacity-60 transition-opacity blur"></div>
            <img
              src={actor.headshot}
              alt={actor.name}
              className="relative w-56 h-56 lg:w-64 lg:h-64 rounded-2xl object-cover ring-4 ring-primary/30 shadow-2xl"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          {/* Actor details */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-5xl lg:text-7xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white via-primary to-purple-400 bg-clip-text text-transparent">
                  {actor.name}
                </span>
              </h1>
              
              {/* Enhanced death counter */}
              <div className="inline-flex items-center gap-4 glass-panel rounded-full px-8 py-4 neon-glow mb-6">
                <div className="relative">
                  <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-4 h-4 bg-primary rounded-full animate-ping opacity-50" />
                </div>
                <span className="text-2xl font-medium">
                  On-screen deaths: <span className="text-primary text-3xl font-bold">{actor.deathCount}</span>
                </span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-panel rounded-xl p-4 text-center">
                <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{formatDate(actor.birthDate).split(',')[1]}</div>
                <div className="text-sm text-muted-foreground">Born</div>
              </div>
              
              {actor.totalBoxOffice && (
                <div className="glass-panel rounded-xl p-4 text-center">
                  <DollarSign className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">{actor.totalBoxOffice}</div>
                  <div className="text-sm text-muted-foreground">Box Office</div>
                </div>
              )}
              
              {actor.awardsCount && (
                <div className="glass-panel rounded-xl p-4 text-center">
                  <Award className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">{actor.awardsCount}</div>
                  <div className="text-sm text-muted-foreground">Awards</div>
                </div>
              )}
              
              <div className="glass-panel rounded-xl p-4 text-center">
                <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{actor.deaths.length}</div>
                <div className="text-sm text-muted-foreground">Movies</div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-3">
              <h3 className="text-xl font-medium text-white">Biography</h3>
              <p className="text-lg leading-relaxed text-white/90 max-w-4xl">
                {actor.bio}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Neural death map replaces timeline */}
      <div className="fade-in-up" style={{ animationDelay: '0.3s' }}>
        <NeuralDeathMap deaths={actor.deaths} actorName={actor.name} />
      </div>

      {/* Death statistics */}
      <div className="grid md:grid-cols-3 gap-6 fade-in-up" style={{ animationDelay: '0.6s' }}>
        <div className="glass-panel rounded-xl p-6">
          <h4 className="font-medium text-white mb-4">Death Timeline</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">First Death</span>
              <span className="text-white">
                {new Date(Math.min(...actor.deaths.map(d => new Date(d.releaseDate).getTime()))).getFullYear()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Latest Death</span>
              <span className="text-white">
                {new Date(Math.max(...actor.deaths.map(d => new Date(d.releaseDate).getTime()))).getFullYear()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Career Span</span>
              <span className="text-white">
                {new Date(Math.max(...actor.deaths.map(d => new Date(d.releaseDate).getTime()))).getFullYear() - 
                 new Date(Math.min(...actor.deaths.map(d => new Date(d.releaseDate).getTime()))).getFullYear()} years
              </span>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6">
          <h4 className="font-medium text-white mb-4">Death Types</h4>
          <div className="space-y-2">
            {Object.entries(
              actor.deaths.reduce((acc, death) => {
                acc[death.deathType] = (acc[death.deathType] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([type, count]) => (
              <div key={type} className="flex justify-between text-sm">
                <span className="text-muted-foreground capitalize">{type}</span>
                <span className="text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6">
          <h4 className="font-medium text-white mb-4">Top Genres</h4>
          <div className="space-y-2">
            {Object.entries(
              actor.deaths.reduce((acc, death) => {
                const genre = death.genre.split(',')[0].trim();
                acc[genre] = (acc[genre] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).slice(0, 4).map(([genre, count]) => (
              <div key={genre} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{genre}</span>
                <span className="text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
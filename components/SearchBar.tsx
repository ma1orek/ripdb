import React, { useState, useEffect, useCallback } from 'react';
import { Search, Zap, TrendingUp, Loader2, Database } from 'lucide-react';
import { useStaticData } from '../hooks/useStaticData';

interface SearchResult {
  id: string;
  name: string;
  headshot: string;
  deathCount: number;
  recentDeath: string;
}

interface SearchBarProps {
  onActorSelect: (actorId: string) => void;
  placeholder?: string;
}

export function SearchBar({ onActorSelect, placeholder = "Search actors..." }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [randomActors, setRandomActors] = useState<SearchResult[]>([]);
  
  const { actors, searchActors, loading: dataLoading, getRandomActors } = useStaticData();

  // Load random actor suggestions
  useEffect(() => {
    const loadRandomActors = async () => {
      try {
        const actorNames = await getRandomActors(6);
        const suggestions: SearchResult[] = actorNames.map(name => {
          const actorId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const actor = actors[actorId];
          
          return {
            id: actorId,
            name,
            headshot: actor?.headshot || `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2, 9)}?w=100&h=100&fit=crop&crop=face`,
            deathCount: actor?.deathCount || 0,
            recentDeath: actor?.deaths[0]?.movieTitle || 'Unknown'
          };
        });
        
        setRandomActors(suggestions);
      } catch (error) {
        console.error('Error loading random actors:', error);
      }
    };

    if (Object.keys(actors).length > 0) {
      loadRandomActors();
    }
  }, [actors, getRandomActors]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length > 1) {
        setSearchLoading(true);
        try {
          const actorNames = await searchActors(searchQuery);
          const searchResults: SearchResult[] = actorNames.map(name => {
            const actorId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const actor = actors[actorId];
            
            return {
              id: actorId,
              name,
              headshot: actor?.headshot || `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2, 9)}?w=100&h=100&fit=crop&crop=face`,
              deathCount: actor?.deathCount || 0,
              recentDeath: actor?.deaths[0]?.movieTitle || 'Unknown'
            };
          });
          
          setResults(searchResults);
          setIsOpen(true);
          setShowSuggestions(false);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
        setShowSuggestions(true);
      }
    }, 300),
    [actors, searchActors]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleSelect = (actorId: string) => {
    setQuery('');
    setIsOpen(false);
    setShowSuggestions(false);
    onActorSelect(actorId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setShowSuggestions(true);
    }
  };

  // Get top actors for suggestions (fallback if random fails)
  const topActors = Object.values(actors)
    .sort((a, b) => b.deathCount - a.deathCount)
    .slice(0, 6)
    .map(actor => ({
      id: actor.id,
      name: actor.name,
      headshot: actor.headshot,
      deathCount: actor.deathCount,
      recentDeath: actor.deaths[0]?.movieTitle || 'Unknown'
    }));

  const suggestionActors = randomActors.length > 0 ? randomActors : topActors;
  const hasData = Object.keys(actors).length > 5; // More than just placeholder data

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Main search input */}
      <div className="relative glass-panel rounded-2xl p-6 neon-glow liquid-animation hover:neon-glow-strong">
        <div className="flex items-center gap-6">
          <div className="relative">
            {searchLoading ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <>
                <Search className="w-8 h-8 text-primary animate-pulse" />
                <div className="absolute inset-0 w-8 h-8 bg-primary/20 rounded-full animate-ping"></div>
              </>
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={dataLoading ? "Loading database..." : placeholder}
            disabled={dataLoading}
            className="flex-1 bg-transparent border-none outline-none text-2xl placeholder:text-muted-foreground disabled:opacity-50"
          />
          <div className="text-sm text-muted-foreground hidden md:block">
            {hasData && Object.keys(actors).length > 0 && (
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                <span>{Object.keys(actors).length} actors loaded</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suggestions when not searching */}
      {showSuggestions && !query && !dataLoading && suggestionActors.length > 0 && (
        <div className="mt-6 space-y-4 fade-in-up">
          <div className="text-center">
            <h3 className="text-xl font-medium text-white mb-2">
              {hasData ? 'Featured Death Champions' : 'Demo Actors'}
            </h3>
            <p className="text-muted-foreground">
              {hasData 
                ? 'From your complete static database'
                : 'Enhanced demo data with realistic death records'
              }
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {suggestionActors.slice(0, 3).map((actor, index) => (
              <div
                key={actor.id}
                onClick={() => handleSelect(actor.id)}
                className="glass-panel rounded-xl p-4 cursor-pointer liquid-animation hover:glass-strong hover:neon-glow group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={actor.headshot}
                    alt={actor.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white group-hover:text-primary transition-colors truncate">
                      {actor.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {actor.deathCount} deaths
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">{actor.deathCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Show more actors */}
          {suggestionActors.length > 3 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {suggestionActors.slice(3).map((actor, index) => (
                <div
                  key={actor.id}
                  onClick={() => handleSelect(actor.id)}
                  className="glass rounded-lg p-3 cursor-pointer liquid-animation hover:glass-strong text-center group"
                  style={{ animationDelay: `${(index + 3) * 0.1}s` }}
                >
                  <img
                    src={actor.headshot}
                    alt={actor.name}
                    className="w-8 h-8 rounded-full object-cover mx-auto mb-2 ring-1 ring-primary/30"
                  />
                  <div className="text-sm text-white group-hover:text-primary transition-colors truncate">
                    {actor.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {actor.deathCount} deaths
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search results dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-4 w-full glass-strong rounded-xl overflow-hidden fade-in-up z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-white/10 sticky top-0 bg-inherit">
            <h4 className="text-sm font-medium text-white">
              Search Results ({results.length})
            </h4>
          </div>
          
          {results.map((actor, index) => (
            <div
              key={actor.id}
              onClick={() => handleSelect(actor.id)}
              className="flex items-center gap-4 p-4 hover:bg-white/10 cursor-pointer liquid-animation border-b border-white/5 last:border-b-0"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <img
                src={actor.headshot}
                alt={actor.name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/30"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate">{actor.name}</h4>
                <p className="text-sm text-muted-foreground mb-1">
                  {actor.deathCount} on-screen deaths
                </p>
                <p className="text-xs text-primary truncate">
                  Latest: {actor.recentDeath}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-xl font-bold text-primary">
                  {actor.deathCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen && results.length === 0 && query.length > 1 && !searchLoading && (
        <div className="absolute top-full mt-4 w-full glass-strong rounded-xl p-6 text-center fade-in-up z-50">
          <p className="text-muted-foreground">
            No actors found matching "{query}"
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {hasData 
              ? 'Try a different search term or browse the suggestions above'
              : 'Try the demo actors above or load your complete database'
            }
          </p>
        </div>
      )}

      {/* Loading state */}
      {searchLoading && (
        <div className="absolute top-full mt-4 w-full glass-strong rounded-xl p-6 text-center fade-in-up z-50">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="text-muted-foreground">
              {hasData ? 'Searching your database...' : 'Searching...'}
            </span>
          </div>
        </div>
      )}

      {/* Database status indicator */}
      {!hasData && !dataLoading && (
        <div className="mt-4 text-center">
          <div className="glass rounded-full px-4 py-2 inline-flex items-center gap-2">
            <Database className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-400">
              Ready to load your complete database
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
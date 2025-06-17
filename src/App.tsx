import React, { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { ActorPage } from './components/ActorPage';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorScreen } from './components/ErrorScreen';
import { useStaticData } from './hooks/useStaticData';
import { mockActors, mockStats } from './data/mockData';
import { Skull, Database, Users, Film, RefreshCw, CheckCircle, Info, Zap } from 'lucide-react';

type ViewState = 'search' | 'actor';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('search');
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const [showConnectionHelp, setShowConnectionHelp] = useState(false);
  
  const { 
    actors, 
    loading, 
    error, 
    stats, 
    getActor,
    getRandomActors
  } = useStaticData();

  const handleActorSelect = (actorId: string) => {
    setSelectedActorId(actorId);
    setCurrentView('actor');
  };

  const handleBackToSearch = () => {
    setCurrentView('search');
    setSelectedActorId(null);
  };

  const handleUseMockData = () => {
    setUseMockData(true);
    setShowConnectionHelp(false);
  };

  const handleRetry = () => {
    setUseMockData(false);
    setShowConnectionHelp(false);
    // Static data doesn't need retry, but we keep the UI consistent
  };

  const toggleConnectionHelp = () => {
    setShowConnectionHelp(!showConnectionHelp);
  };

  // Show loading screen while processing static data
  if (loading && !useMockData) {
    return (
      <LoadingScreen 
        message="Loading your complete death database..." 
        progress={80} // Static data loads quickly
        dataSource="csv"
      />
    );
  }

  // Show error screen if static data loading failed
  if (error && !useMockData && Object.keys(actors).length === 0) {
    return (
      <ErrorScreen 
        error={error} 
        onRetry={handleRetry}
        onUseMockData={handleUseMockData}
      />
    );
  }

  // Use appropriate data source
  const currentActors = useMockData ? mockActors : actors;
  const currentActor = selectedActorId ? 
    (useMockData ? mockActors[selectedActorId] : getActor(selectedActorId)) : 
    null;

  // Get current stats
  const currentStats = useMockData ? mockStats : {
    totalActors: stats?.totalActors || Object.keys(currentActors).length,
    totalDeaths: stats?.totalDeaths || Object.values(currentActors).reduce((sum, actor) => sum + actor.deathCount, 0),
    totalMovies: stats?.totalMovies || new Set(Object.values(currentActors).flatMap(actor => actor.deaths.map(d => d.movieTitle))).size
  };

  // Determine if we're using real data or placeholder
  const isRealData = !useMockData && !error && Object.keys(currentActors).length > 5;

  // Get status indicator info
  const getStatusInfo = () => {
    if (useMockData) {
      return {
        icon: Info,
        color: 'bg-yellow-400',
        text: 'Demo Mode',
        description: 'Using sample data',
        detail: 'Switch to live database when ready'
      };
    }
    
    if (error) {
      return {
        icon: Info,
        color: 'bg-red-400',
        text: 'Data Error',
        description: 'Static data loading failed',
        detail: 'Demo mode available'
      };
    }
    
    if (isRealData) {
      return {
        icon: Database,
        color: 'bg-green-400',
        text: 'Live Database',
        description: 'Your complete 65k+ records loaded',
        detail: 'Instant performance, zero network issues'
      };
    }
    
    return {
      icon: Zap,
      color: 'bg-blue-400',
      text: 'Ready for Data',
      description: 'Awaiting your database upload',
      detail: 'Share your data to unlock full power'
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-black dark">
      {currentView === 'search' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
          {/* Enhanced status indicator */}
          <div className="fixed top-4 right-4 z-50">
            <div className="space-y-2">
              <div className="glass-panel rounded-full px-4 py-2 flex items-center gap-2">
                <div className={`w-2 h-2 ${statusInfo.color} rounded-full animate-pulse`} />
                <span className="text-sm text-white">{statusInfo.text}</span>
                <StatusIcon className="w-4 h-4 text-white" />
                <button 
                  onClick={toggleConnectionHelp}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                  title="Database info"
                >
                  <Info className="w-3 h-3 text-white" />
                </button>
              </div>
              
              {/* Database info dropdown */}
              {showConnectionHelp && (
                <div className="glass-strong rounded-xl p-4 text-left max-w-xs fade-in-up">
                  <h4 className="font-medium text-white mb-2">{statusInfo.description}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{statusInfo.detail}</p>
                  
                  {!isRealData && !useMockData && (
                    <div className="space-y-2">
                      <p className="text-xs text-primary">
                        🎯 Ready to load your 65k records!
                      </p>
                      <button 
                        onClick={handleUseMockData}
                        className="w-full glass hover:glass-strong rounded-lg px-3 py-2 text-xs transition-all"
                      >
                        Try Demo First
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced app title with animation */}
          <div className="text-center mb-16 fade-in-up">
            <div className="relative mb-8">
              <h1 className="text-7xl md:text-9xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white via-primary to-purple-400 bg-clip-text text-transparent">
                  RIPDB
                </span>
              </h1>
              {/* Floating skull icon */}
              <div className="absolute -top-4 -right-8 md:-right-16">
                <Skull className="w-12 h-12 md:w-16 md:h-16 text-primary animate-bounce" />
              </div>
            </div>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              The ultimate neural network database of on-screen actor deaths. 
              <br />
              <span className="text-primary font-medium">Explore, analyze, and discover death patterns</span> across cinema history.
            </p>
            
            {/* Database info */}
            <div className="glass-panel rounded-full px-6 py-3 inline-flex items-center gap-3">
              <StatusIcon className="w-5 h-5 text-primary" />
              <span className="text-sm text-white">
                {isRealData 
                  ? "Powered by your complete static database - instant performance!"
                  : useMockData 
                    ? "Enhanced demo mode with realistic death records"
                    : "Ready to load your 65,000+ death records database"
                }
              </span>
            </div>
          </div>

          {/* Enhanced search bar */}
          <div className="w-full max-w-6xl fade-in-up" style={{ animationDelay: '0.3s' }}>
            <SearchBar 
              onActorSelect={handleActorSelect}
              placeholder={isRealData 
                ? "Search your complete database..." 
                : "Search actors, movies, or death types..."
              }
            />
          </div>

          {/* Enhanced stats with real data */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-6xl w-full fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="glass-panel rounded-2xl p-6 text-center neon-glow liquid-animation hover:neon-glow-strong group">
              <Users className="w-8 h-8 text-primary mx-auto mb-3 group-hover:animate-pulse" />
              <div className="text-3xl font-bold text-primary mb-2">
                {currentStats.totalActors.toLocaleString()}
              </div>
              <div className="text-muted-foreground">Actors Tracked</div>
            </div>
            
            <div className="glass-panel rounded-2xl p-6 text-center neon-glow liquid-animation hover:neon-glow-strong group">
              <Skull className="w-8 h-8 text-primary mx-auto mb-3 group-hover:animate-bounce" />
              <div className="text-3xl font-bold text-primary mb-2">
                {currentStats.totalDeaths.toLocaleString()}
              </div>
              <div className="text-muted-foreground">On-Screen Deaths</div>
            </div>
            
            <div className="glass-panel rounded-2xl p-6 text-center neon-glow liquid-animation hover:neon-glow-strong group">
              <Film className="w-8 h-8 text-primary mx-auto mb-3 group-hover:animate-spin" />
              <div className="text-3xl font-bold text-primary mb-2">
                {currentStats.totalMovies.toLocaleString()}
              </div>
              <div className="text-muted-foreground">Movies & Shows</div>
            </div>
            
            <div className="glass-panel rounded-2xl p-6 text-center neon-glow liquid-animation hover:neon-glow-strong group">
              <StatusIcon className="w-8 h-8 text-primary mx-auto mb-3 group-hover:animate-pulse" />
              <div className="text-3xl font-bold text-primary mb-2">
                {isRealData ? 'Static' : useMockData ? 'Demo' : 'Ready'}
              </div>
              <div className="text-muted-foreground">Database Mode</div>
            </div>
          </div>

          {/* Features highlight */}
          <div className="mt-16 max-w-4xl w-full fade-in-up" style={{ animationDelay: '0.9s' }}>
            <div className="glass-panel rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-center text-white mb-6">
                Neural Network Visualization
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <h4 className="font-medium text-white mb-2">Neural Death Maps</h4>
                  <p className="text-sm text-muted-foreground">
                    Interactive network showing connections between deaths
                  </p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h4 className="font-medium text-white mb-2">Instant Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    {isRealData 
                      ? 'Lightning-fast search through your complete database'
                      : 'Static data loads instantly with zero network delays'
                    }
                  </p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🎬</span>
                  </div>
                  <h4 className="font-medium text-white mb-2">Rich Movie Data</h4>
                  <p className="text-sm text-muted-foreground">
                    {isRealData 
                      ? 'Complete film information from your database'
                      : 'Detailed film information with posters and ratings'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Data upload prompt */}
          {!isRealData && !useMockData && !error && (
            <div className="mt-8 max-w-2xl w-full fade-in-up">
              <div className="glass-panel rounded-xl p-6 text-center border border-primary/30">
                <div className="flex items-center justify-center gap-3 text-primary mb-4">
                  <Database className="w-6 h-6" />
                  <span className="font-medium text-lg">Ready for Your Database</span>
                </div>
                <p className="text-muted-foreground mb-4">
                  Share your 65,000+ death records database to unlock the full power of RIPDB. 
                  Your data will be converted to a high-performance static format.
                </p>
                <div className="flex justify-center gap-3">
                  <button 
                    onClick={handleUseMockData}
                    className="px-6 py-2 glass hover:glass-strong rounded-lg text-sm transition-all text-white border border-white/20"
                  >
                    Try Demo First
                  </button>
                  <div className="px-6 py-2 glass-panel rounded-lg text-sm text-primary border border-primary/20">
                    Ready to Upload Data
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data source info */}
          <div className="mt-8 max-w-2xl w-full fade-in-up">
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground">
                {isRealData ? (
                  "🚀 Your complete database is loaded and running at maximum performance with zero network dependencies."
                ) : useMockData ? (
                  "🎭 Currently in demo mode. Ready to load your complete 65,000+ record database when you share it."
                ) : (
                  "📊 Static database system ready. Share your data in CSV, JSON, or any format to get started."
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {currentView === 'actor' && currentActor && (
        <ActorPage 
          actor={currentActor}
          onBack={handleBackToSearch}
        />
      )}
    </div>
  );
}
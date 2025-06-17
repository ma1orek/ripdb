import React, { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { ActorPage } from './components/ActorPage';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorScreen } from './components/ErrorScreen';
import { useGoogleSheets } from './hooks/useGoogleSheets';
import { mockActors } from './data/mockData';
import { Skull, Database, Users, Film, RefreshCw, CheckCircle, Wifi, AlertTriangle } from 'lucide-react';

type ViewState = 'search' | 'actor';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('search');
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  
  const { 
    actors, 
    loading, 
    error, 
    loadingProgress,
    stats, 
    getActor, 
    refetch,
    dataSource 
  } = useGoogleSheets();

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
  };

  const handleRetry = () => {
    setUseMockData(false);
    refetch();
  };

  // Show loading screen while fetching data
  if (loading && !useMockData) {
    return (
      <LoadingScreen 
        message="Loading death database from Google Sheets..." 
        progress={loadingProgress}
        dataSource={dataSource}
      />
    );
  }

  // Show error screen if data loading failed and no actors loaded
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
  const currentStats = useMockData ? {
    totalActors: Object.keys(mockActors).length,
    totalDeaths: Object.values(mockActors).reduce((sum, actor) => sum + actor.deathCount, 0),
    totalMovies: Object.values(mockActors).reduce((sum, actor) => sum + actor.deaths.length, 0)
  } : {
    totalActors: stats?.totalActors || Object.keys(currentActors).length,
    totalDeaths: stats?.totalDeaths || Object.values(currentActors).reduce((sum, actor) => sum + actor.deathCount, 0),
    totalMovies: stats?.totalMovies || new Set(Object.values(currentActors).flatMap(actor => actor.deaths.map(d => d.movieTitle))).size
  };

  // Get status indicator info
  const getStatusInfo = () => {
    if (useMockData) {
      return {
        icon: AlertTriangle,
        color: 'bg-yellow-400',
        text: 'Demo Mode',
        description: 'Using sample data'
      };
    }
    
    switch (dataSource) {
      case 'api':
        return {
          icon: Wifi,
          color: 'bg-green-400',
          text: 'Live API',
          description: 'Google Sheets API connected'
        };
      case 'csv':
        return {
          icon: Database,
          color: 'bg-blue-400',
          text: 'Live CSV',
          description: 'Google Sheets CSV connected'
        };
      case 'mock':
        return {
          icon: AlertTriangle,
          color: 'bg-yellow-400',
          text: 'Demo Data',
          description: 'Using fallback data'
        };
      default:
        return {
          icon: CheckCircle,
          color: 'bg-green-400',
          text: 'Connected',
          description: 'Live data loaded'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-black dark">
      {currentView === 'search' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
          {/* Enhanced status indicator */}
          <div className="fixed top-4 right-4 z-50">
            <div className="glass-panel rounded-full px-4 py-2 flex items-center gap-2">
              <div className={`w-2 h-2 ${statusInfo.color} rounded-full animate-pulse`} />
              <span className="text-sm text-white">{statusInfo.text}</span>
              <StatusIcon className="w-4 h-4 text-white" />
              {(error || dataSource === 'mock') && !useMockData && (
                <button 
                  onClick={handleRetry}
                  className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
                  title="Try reconnecting to live data"
                >
                  <RefreshCw className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
            {/* Status tooltip */}
            <div className="mt-1 text-center">
              <span className="text-xs text-muted-foreground">{statusInfo.description}</span>
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
                {useMockData || dataSource === 'mock' 
                  ? "Running in demo mode with sample data" 
                  : `Powered by live Google Sheets database (${dataSource.toUpperCase()})`
                }
              </span>
            </div>
          </div>

          {/* Enhanced search bar */}
          <div className="w-full max-w-6xl fade-in-up" style={{ animationDelay: '0.3s' }}>
            <SearchBar 
              onActorSelect={handleActorSelect}
              placeholder="Search actors, movies, or death types..."
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
                {dataSource === 'mock' || useMockData ? 'Demo' : 'Live'}
              </div>
              <div className="text-muted-foreground">Database Status</div>
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
                  <h4 className="font-medium text-white mb-2">Real-time Analytics</h4>
                  <p className="text-sm text-muted-foreground">
                    {useMockData || dataSource === 'mock' 
                      ? 'Demo statistics and patterns' 
                      : 'Live statistics and death pattern analysis'
                    }
                  </p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🎬</span>
                  </div>
                  <h4 className="font-medium text-white mb-2">Rich Movie Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Detailed film information with posters and ratings
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Connection status notification */}
          {error && !useMockData && Object.keys(actors).length > 0 && (
            <div className="mt-8 max-w-2xl w-full fade-in-up">
              <div className="glass-panel rounded-xl p-4 border border-yellow-400/20">
                <div className="flex items-center gap-3 text-yellow-400 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Partial Connection</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Some data was loaded but there may be connection issues. 
                  <button 
                    onClick={handleRetry}
                    className="ml-2 text-primary hover:text-primary-foreground underline"
                  >
                    Try refreshing
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Data source info */}
          <div className="mt-8 max-w-2xl w-full fade-in-up">
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground">
                {useMockData || dataSource === 'mock' 
                  ? "Currently showing demo data. Real database contains 65,000+ death records."
                  : `Data loaded via ${dataSource === 'api' ? 'Google Sheets API' : 'CSV export'} from your live database.`
                }
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
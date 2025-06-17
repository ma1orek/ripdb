import React from 'react';
import { Database, Loader2, Skull, Activity, Wifi } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
  dataSource?: 'api' | 'csv' | 'mock';
}

export function LoadingScreen({ 
  message = "Loading death database...", 
  progress,
  dataSource 
}: LoadingScreenProps) {
  
  const getDataSourceInfo = () => {
    switch (dataSource) {
      case 'api':
        return { icon: Wifi, text: 'Google Sheets API', color: 'text-green-400' };
      case 'csv':
        return { icon: Database, text: 'CSV Export', color: 'text-blue-400' };
      case 'mock':
        return { icon: Activity, text: 'Demo Data', color: 'text-yellow-400' };
      default:
        return { icon: Database, text: 'Loading...', color: 'text-primary' };
    }
  };

  const sourceInfo = getDataSourceInfo();
  const SourceIcon = sourceInfo.icon;

  return (
    <div className="min-h-screen bg-black dark flex items-center justify-center p-6">
      <div className="text-center space-y-8 max-w-md">
        {/* Animated logo */}
        <div className="relative">
          <div className="text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-primary to-purple-400 bg-clip-text text-transparent">
              RIPDB
            </span>
          </div>
          
          {/* Floating animated icons */}
          <div className="absolute -top-4 -left-8 animate-bounce">
            <Skull className="w-8 h-8 text-primary" style={{ animationDelay: '0s' }} />
          </div>
          <div className="absolute -top-2 -right-8 animate-bounce">
            <SourceIcon className={`w-6 h-6 ${sourceInfo.color}`} style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="absolute -bottom-2 -left-6 animate-bounce">
            <Activity className="w-5 h-5 text-primary" style={{ animationDelay: '1s' }} />
          </div>
        </div>

        {/* Loading animation */}
        <div className="glass-panel rounded-2xl p-8 space-y-6">
          {/* Spinner */}
          <div className="flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
          
          {/* Status message */}
          <div className="space-y-2">
            <h3 className="text-xl font-medium text-white">{message}</h3>
            <div className="flex items-center justify-center gap-2">
              <SourceIcon className={`w-4 h-4 ${sourceInfo.color}`} />
              <p className={`text-sm ${sourceInfo.color}`}>
                Via {sourceInfo.text}
              </p>
            </div>
          </div>
          
          {/* Progress bar */}
          {progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Loading records</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary to-purple-400 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Loading stage messages */}
          <div className="text-xs text-muted-foreground space-y-1">
            {progress !== undefined && (
              <>
                {progress < 20 && (
                  <div className="animate-pulse">📡 Connecting to Google Sheets...</div>
                )}
                {progress >= 20 && progress < 50 && (
                  <div className="animate-pulse">📊 Fetching death records...</div>
                )}
                {progress >= 50 && progress < 90 && (
                  <div className="animate-pulse">🔄 Processing actor data...</div>
                )}
                {progress >= 90 && progress < 100 && (
                  <div className="animate-pulse">✨ Finalizing neural connections...</div>
                )}
                {progress >= 100 && (
                  <div className="text-green-400">✅ Ready to explore!</div>
                )}
              </>
            )}
            
            {progress === undefined && (
              <div className="animate-pulse">
                Processing 65,000+ death records...
              </div>
            )}
          </div>
        </div>

        {/* Neural network visualization preview */}
        <div className="glass rounded-xl p-4 opacity-50">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-0.5 bg-primary/50" />
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
            <div className="w-2 h-0.5 bg-purple-400/50" />
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Preparing neural death maps...</p>
        </div>

        {/* API Status */}
        <div className="glass rounded-xl p-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Connected to live database</span>
          </div>
        </div>
      </div>
    </div>
  );
}
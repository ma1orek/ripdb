import React from 'react';
import { AlertCircle, RefreshCw, Database, Wifi, ExternalLink, Shield, Key, Globe } from 'lucide-react';
import { Button } from './ui/button';

interface ErrorScreenProps {
  error: string;
  onRetry: () => void;
  onUseMockData?: () => void;
}

export function ErrorScreen({ error, onRetry, onUseMockData }: ErrorScreenProps) {
  const isPermissionError = error.includes('403') || error.includes('PERMISSION_DENIED') || error.includes('access denied');
  const isCORSError = error.includes('CORS') || error.includes('Failed to fetch') || error.includes('TypeError');
  const isAPIError = error.includes('API') || error.includes('key') || error.includes('401');
  const isDataError = error.includes('No data') || error.includes('Empty');

  const getErrorInfo = () => {
    if (isPermissionError) {
      return {
        title: "Permission Denied",
        description: "The Google Sheets API key doesn't have permission to access this spreadsheet.",
        icon: Shield,
        color: "text-red-400",
        suggestions: [
          "Make sure the Google Sheet is set to 'Anyone with the link can view'",
          "Check that the Sheets API is enabled in Google Cloud Console",
          "Verify the API key has the correct permissions",
          "Try opening the sheet in an incognito window to test public access"
        ]
      };
    }
    
    if (isCORSError) {
      return {
        title: "Network Access Blocked",
        description: "Browser security (CORS) is preventing access to Google Sheets.",
        icon: Globe,
        color: "text-orange-400",
        suggestions: [
          "This is common when running locally - CORS blocks direct sheet access",
          "The app will try alternative methods automatically",
          "For production, consider using a backend proxy",
          "Demo mode works perfectly while we resolve sheet access"
        ]
      };
    }
    
    if (isAPIError) {
      return {
        title: "API Configuration Error",
        description: "There's an issue with the Google Sheets API setup.",
        icon: Key,
        color: "text-yellow-400",
        suggestions: [
          "Verify the Google Sheets API key is correct",
          "Check that the Sheets API is enabled in Google Cloud Console",
          "Ensure the spreadsheet ID is correct",
          "Try regenerating the API key if needed"
        ]
      };
    }
    
    if (isDataError) {
      return {
        title: "Data Loading Error",
        description: "The spreadsheet appears to be empty or has an unexpected format.",
        icon: Database,
        color: "text-blue-400",
        suggestions: [
          "Check that the spreadsheet contains data",
          "Verify the column headers match expected format",
          "Ensure you're using the correct sheet tab (GID)",
          "Try accessing the sheet directly to verify it loads"
        ]
      };
    }
    
    return {
      title: "Connection Error",
      description: "Unable to connect to the Google Sheets database.",
      icon: Wifi,
      color: "text-primary",
      suggestions: [
        "Check your internet connection",
        "Try refreshing the page",
        "The sheet might be temporarily unavailable",
        "Demo mode is available as an alternative"
      ]
    };
  };

  const errorInfo = getErrorInfo();
  const ErrorIcon = errorInfo.icon;

  const openSheetInNewTab = () => {
    window.open('https://docs.google.com/spreadsheets/d/1gpsN-yRIKQ24q9vrTYoNJGsKRUkyQsBxWD6Y4VEdOmE/edit?gid=142347631#gid=142347631', '_blank');
  };

  const openGoogleCloudConsole = () => {
    window.open('https://console.cloud.google.com/apis/library/sheets.googleapis.com', '_blank');
  };

  return (
    <div className="min-h-screen bg-black dark flex items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center space-y-8">
        {/* Error icon and title */}
        <div className="space-y-4">
          <div className="relative inline-flex">
            <ErrorIcon className={`w-16 h-16 ${errorInfo.color}`} />
            <div className={`absolute inset-0 w-16 h-16 ${errorInfo.color.replace('text-', 'bg-')}/20 rounded-full animate-ping`} />
          </div>
          
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {errorInfo.title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {errorInfo.description}
            </p>
          </div>
        </div>

        {/* Error details */}
        <div className="glass-panel rounded-2xl p-6 space-y-4 text-left max-w-3xl mx-auto">
          <div className="flex items-center gap-3 text-destructive">
            <Database className="w-5 h-5" />
            <span className="font-medium">Technical Details</span>
          </div>
          
          <div className="bg-destructive/10 rounded-lg p-4 border border-destructive/20">
            <code className="text-sm text-destructive-foreground break-all">
              {error}
            </code>
          </div>
        </div>

        {/* Solutions grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Quick Solutions */}
          <div className="glass-panel rounded-2xl p-6 text-left">
            <h3 className="font-medium text-white mb-4 flex items-center gap-2">
              <ErrorIcon className={`w-5 h-5 ${errorInfo.color}`} />
              Quick Solutions
            </h3>
            
            <ul className="space-y-3">
              {errorInfo.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-3 text-muted-foreground">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">{index + 1}</span>
                  </div>
                  <span className="text-sm">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sheet Access Instructions */}
          <div className="glass-panel rounded-2xl p-6 text-left">
            <h3 className="font-medium text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              Sheet Access Setup
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">1. Share Settings</h4>
                <p className="text-xs text-muted-foreground">
                  Open your Google Sheet → Click "Share" → Set to "Anyone with the link can view"
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">2. API Access</h4>
                <p className="text-xs text-muted-foreground">
                  Enable Google Sheets API in Cloud Console and verify your API key permissions
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">3. Test Access</h4>
                <p className="text-xs text-muted-foreground">
                  Try opening your sheet in an incognito browser to verify public access
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onRetry}
            className="glass-panel hover:glass-strong neon-glow hover:neon-glow-strong"
            size="lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </Button>
          
          {onUseMockData && (
            <Button 
              onClick={onUseMockData}
              variant="outline"
              className="glass hover:glass-strong"
              size="lg"
            >
              <Database className="w-5 h-5 mr-2" />
              Use Demo Data
            </Button>
          )}
          
          <Button 
            onClick={openSheetInNewTab}
            variant="outline"
            className="glass hover:glass-strong"
            size="lg"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Open Sheet
          </Button>
          
          {isPermissionError && (
            <Button 
              onClick={openGoogleCloudConsole}
              variant="outline"
              className="glass hover:glass-strong"
              size="lg"
            >
              <Key className="w-5 h-5 mr-2" />
              API Console
            </Button>
          )}
        </div>

        {/* Status cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Sheet Status</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isPermissionError ? '❌ Access Denied' : '⚠️ Checking...'}
            </p>
          </div>
          
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">API Status</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isAPIError ? '❌ Configuration Error' : '✅ Key Available'}
            </p>
          </div>
          
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white">Network</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isCORSError ? '⚠️ CORS Blocked' : '✅ Connected'}
            </p>
          </div>
        </div>

        {/* Help text */}
        <div className="glass rounded-xl p-4 text-sm text-muted-foreground max-w-2xl mx-auto">
          <p>
            <strong>Need help?</strong> This is common when connecting to Google Sheets. 
            The demo mode contains realistic data and all features work perfectly while we resolve the connection.
            {' '}
            {isPermissionError && (
              <span className="text-primary">
                The main issue is sheet permissions - make sure it's publicly accessible.
              </span>
            )}
            {isCORSError && (
              <span className="text-primary">
                Browser security is blocking direct access - this is normal for local development.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
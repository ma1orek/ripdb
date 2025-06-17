import React from 'react';
import { AlertCircle, RefreshCw, Database, Wifi, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

interface ErrorScreenProps {
  error: string;
  onRetry: () => void;
  onUseMockData?: () => void;
}

export function ErrorScreen({ error, onRetry, onUseMockData }: ErrorScreenProps) {
  const isConnectionError = error.includes('fetch') || error.includes('network') || error.includes('CORS');
  const isAPIError = error.includes('API') || error.includes('key') || error.includes('401') || error.includes('403');
  const isDataError = error.includes('No data') || error.includes('Empty');

  const getErrorTitle = () => {
    if (isConnectionError) return "Connection Error";
    if (isAPIError) return "API Access Error";
    if (isDataError) return "Data Loading Error";
    return "Database Error";
  };

  const getErrorDescription = () => {
    if (isConnectionError) {
      return "Unable to connect to Google Sheets. This might be due to network issues or CORS restrictions.";
    }
    if (isAPIError) {
      return "There was an issue accessing the Google Sheets API. Please check your API configuration.";
    }
    if (isDataError) {
      return "The spreadsheet appears to be empty or the data format is unexpected.";
    }
    return "An unexpected error occurred while loading the death database.";
  };

  const getSuggestions = () => {
    if (isConnectionError) {
      return [
        "Check your internet connection",
        "Try refreshing the page",
        "Use mock data for development"
      ];
    }
    if (isAPIError) {
      return [
        "Verify the Google Sheets API key",
        "Check spreadsheet permissions",
        "Ensure the sheet is publicly accessible"
      ];
    }
    if (isDataError) {
      return [
        "Verify the spreadsheet contains data",
        "Check the column headers match expected format",
        "Ensure the sheet ID is correct"
      ];
    }
    return [
      "Try refreshing the page",
      "Check the console for more details",
      "Use mock data as fallback"
    ];
  };

  return (
    <div className="min-h-screen bg-black dark flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Error icon and title */}
        <div className="space-y-4">
          <div className="relative inline-flex">
            <AlertCircle className="w-16 h-16 text-destructive" />
            <div className="absolute inset-0 w-16 h-16 bg-destructive/20 rounded-full animate-ping" />
          </div>
          
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {getErrorTitle()}
            </h1>
            <p className="text-xl text-muted-foreground">
              {getErrorDescription()}
            </p>
          </div>
        </div>

        {/* Error details */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
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

        {/* Suggestions */}
        <div className="glass-panel rounded-2xl p-6 text-left">
          <h3 className="font-medium text-white mb-4 flex items-center gap-2">
            <Wifi className="w-5 h-5 text-primary" />
            Troubleshooting Steps
          </h3>
          
          <ul className="space-y-3">
            {getSuggestions().map((suggestion, index) => (
              <li key={index} className="flex items-start gap-3 text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">{index + 1}</span>
                </div>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
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
            onClick={() => window.open('https://docs.google.com/spreadsheets/d/1gpsN-yRIKQ24q9vrTYoNJGsKRUkyQsBxWD6Y4VEdOmE/edit', '_blank')}
            variant="outline"
            className="glass hover:glass-strong"
            size="lg"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            View Sheet
          </Button>
        </div>

        {/* Development note */}
        <div className="glass rounded-xl p-4 text-sm text-muted-foreground">
          <p>
            <strong>For developers:</strong> This app attempts to load data from Google Sheets. 
            If you're running locally, CORS restrictions may prevent direct access. 
            Consider using the CSV export method or setting up a proxy server.
          </p>
        </div>
      </div>
    </div>
  );
}
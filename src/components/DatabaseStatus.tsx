import React, { useEffect, useState } from 'react';
import { Database, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export function DatabaseStatus() {
  const [isReady, setIsReady] = useState(false);
  const [recordCount, setRecordCount] = useState(0);
  const [dataType, setDataType] = useState<'placeholder' | 'real'>('placeholder');

  useEffect(() => {
    // Check database status
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/database-status'); // This would be your data check
        // For now, we'll simulate the check
        setRecordCount(3); // Currently showing placeholder data
        setDataType('placeholder');
        setIsReady(true);
      } catch (error) {
        console.log('Database status check');
      }
    };

    checkStatus();
  }, []);

  if (!isReady) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="glass-panel rounded-xl p-4 max-w-sm">
        <div className="flex items-center gap-3 mb-3">
          <Database className="w-5 h-5 text-primary" />
          <span className="font-medium text-white">Database Status</span>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Records:</span>
            <span className="text-white">{recordCount.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Type:</span>
            <div className="flex items-center gap-2">
              {dataType === 'placeholder' ? (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400">Placeholder</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Live Data</span>
                </>
              )}
            </div>
          </div>
          
          {dataType === 'placeholder' && (
            <div className="mt-3 p-2 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
              <div className="flex items-center gap-2 text-yellow-400 text-xs">
                <Upload className="w-3 h-3" />
                <span>Ready for your 65k records</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
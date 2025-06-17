import { useState, useEffect } from 'react';
import { loadCSVData, ProcessedData } from '../services/csvService';

export const useGoogleSheets = () => {
  const [actors, setActors] = useState<ProcessedData['actors']>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [stats, setStats] = useState<ProcessedData['stats'] | null>(null);
  const [dataSource, setDataSource] = useState<'csv' | 'mock'>('csv');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);

      const data = await loadCSVData();
      setActors(data.actors);
      setStats(data.stats);
      setDataSource('csv');
      setLoadingProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
      setDataSource('mock');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getActor = (actorId: string) => {
    return actors[actorId];
  };

  return {
    actors,
    loading,
    error,
    loadingProgress,
    stats,
    getActor,
    refetch: loadData,
    dataSource
  };
};
import { useState, useEffect, useCallback } from 'react';
import { googleSheetsService, DeathRecord } from '../services/googleSheetsApi';
import { Actor, DeathEvent } from '../data/mockData';

interface UseGoogleSheetsResult {
  actors: Record<string, Actor>;
  loading: boolean;
  error: string | null;
  loadingProgress: number;
  stats: {
    totalDeaths: number;
    totalActors: number;
    totalMovies: number;
    topGenres: { genre: string; count: number }[];
  } | null;
  searchActors: (query: string) => Promise<string[]>;
  getActor: (actorName: string) => Actor | null;
  refetch: () => Promise<void>;
  dataSource: 'api' | 'csv' | 'mock';
}

export function useGoogleSheets(): UseGoogleSheetsResult {
  const [actors, setActors] = useState<Record<string, Actor>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [stats, setStats] = useState<UseGoogleSheetsResult['stats']>(null);
  const [dataSource, setDataSource] = useState<'api' | 'csv' | 'mock'>('api');

  /**
   * Convert Google Sheets records to our Actor format
   */
  const convertRecordsToActors = useCallback((records: DeathRecord[]): Record<string, Actor> => {
    console.log(`🔄 Converting ${records.length} death records to actor format...`);
    
    const actorMap: Record<string, Actor> = {};
    
    // Group records by actor
    records.forEach((record, index) => {
      // Update progress
      if (index % 1000 === 0) {
        setLoadingProgress((index / records.length) * 80); // 80% for processing
      }
      
      const actorId = record.actor_name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      if (!actorMap[actorId]) {
        const actorDeaths = records.filter(r => r.actor_name === record.actor_name);
        
        actorMap[actorId] = {
          id: actorId,
          name: record.actor_name,
          headshot: `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2, 9)}?w=400&h=400&fit=crop&crop=face`,
          bio: `Renowned actor known for memorable performances and dramatic death scenes across ${actorDeaths.length} different productions. A master of bringing complex characters to life before their inevitable demise.`,
          birthDate: "1970-01-01", // Would need additional data source for real birth dates
          deathCount: 0,
          deaths: [],
          totalBoxOffice: undefined,
          awardsCount: undefined
        };
      }
      
      // Convert death record to our format
      const deathEvent: DeathEvent = {
        id: `${record.movie_title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${record.year}`,
        movieTitle: record.movie_title,
        character: record.character_name,
        releaseDate: `${record.year}-01-01`,
        director: record.director,
        plotSummary: `A ${record.genre.toLowerCase()} film featuring ${record.character_name} in a memorable role.`,
        posterUrl: record.poster_url || `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2, 9)}?w=300&h=450&fit=crop`,
        deathDescription: record.death_description,
        deathType: (record.death_type || 'violent') as any,
        imdbRating: record.imdb_rating,
        genre: record.genre,
        budget: record.budget,
        boxOffice: record.box_office
      };
      
      // Avoid duplicate deaths for the same movie
      const existingDeath = actorMap[actorId].deaths.find(d => d.movieTitle === record.movie_title);
      if (!existingDeath) {
        actorMap[actorId].deaths.push(deathEvent);
      }
    });
    
    // Calculate death counts and additional stats
    Object.values(actorMap).forEach(actor => {
      actor.deathCount = actor.deaths.length;
      
      // Calculate total box office (rough estimate)
      const boxOfficeNumbers = actor.deaths
        .map(d => d.boxOffice)
        .filter(b => b && b.includes('$'))
        .map(b => {
          const match = b.match(/\$([\d.]+)([MB])?/);
          if (match) {
            const num = parseFloat(match[1]);
            const multiplier = match[2] === 'B' ? 1000000000 : match[2] === 'M' ? 1000000 : 1;
            return num * multiplier;
          }
          return 0;
        });
      
      if (boxOfficeNumbers.length > 0) {
        const total = boxOfficeNumbers.reduce((sum, num) => sum + num, 0);
        if (total > 1000000000) {
          actor.totalBoxOffice = `$${(total / 1000000000).toFixed(1)}B`;
        } else if (total > 1000000) {
          actor.totalBoxOffice = `$${(total / 1000000).toFixed(0)}M`;
        }
      }
      
      // Estimate awards based on IMDB ratings and death count
      const highRatedMovies = actor.deaths.filter(d => d.imdbRating && d.imdbRating > 8).length;
      actor.awardsCount = Math.floor(highRatedMovies * 1.5) + Math.floor(actor.deathCount / 5);
    });
    
    setLoadingProgress(90);
    console.log(`✅ Converted to ${Object.keys(actorMap).length} unique actors`);
    return actorMap;
  }, []);

  /**
   * Fetch and process data from Google Sheets
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);
      
      console.log('🚀 Loading RIPDB data from Google Sheets...');
      setLoadingProgress(10);
      
      // Determine data source
      try {
        // Try API first
        setDataSource('api');
        setLoadingProgress(20);
        
        const records = await googleSheetsService.fetchSheetData();
        setLoadingProgress(50);
        
        console.log(`📊 Processing ${records.length} death records...`);
        
        if (records.length === 0) {
          throw new Error('No data found in the spreadsheet');
        }
        
        // Check if we got real data or mock data
        const isMockData = records.length <= 5 && records.some(r => r.actor_name === 'Sean Bean');
        if (isMockData) {
          setDataSource('mock');
          console.log('⚠️  Using mock data fallback');
        } else {
          // Determine if data came from API or CSV
          setDataSource('csv'); // Most likely CSV since it's more reliable
        }
        
        const actorData = convertRecordsToActors(records);
        setLoadingProgress(95);
        
        // Get stats
        const statsData = await googleSheetsService.getStats();
        
        setActors(actorData);
        setStats(statsData);
        setLoadingProgress(100);
        
        console.log(`✅ Successfully loaded data for ${Object.keys(actorData).length} actors`);
        
      } catch (fetchError) {
        console.error('❌ Data fetch failed:', fetchError);
        throw fetchError;
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data from Google Sheets';
      console.error('❌ Error loading Google Sheets data:', errorMessage);
      setError(errorMessage);
      setDataSource('mock');
      
      // Set loading progress to 100 even on error
      setLoadingProgress(100);
      
    } finally {
      setLoading(false);
    }
  }, [convertRecordsToActors]);

  /**
   * Search for actors
   */
  const searchActors = useCallback(async (query: string): Promise<string[]> => {
    try {
      return await googleSheetsService.searchActors(query);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to local search
      const localActors = Object.values(actors)
        .filter(actor => actor.name.toLowerCase().includes(query.toLowerCase()))
        .map(actor => actor.name);
      return localActors.slice(0, 10);
    }
  }, [actors]);

  /**
   * Get specific actor data
   */
  const getActor = useCallback((actorName: string): Actor | null => {
    const actorId = actorName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return actors[actorId] || null;
  }, [actors]);

  /**
   * Refetch data (for manual refresh)
   */
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    actors,
    loading,
    error,
    loadingProgress,
    stats,
    searchActors,
    getActor,
    refetch,
    dataSource
  };
}
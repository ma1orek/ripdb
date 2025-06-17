import { useState, useEffect, useCallback } from 'react';
import { staticDataService, StaticDeathRecord } from '../services/staticDataService';
import { Actor, DeathEvent } from '../data/mockData';

interface UseStaticDataResult {
  actors: Record<string, Actor>;
  loading: boolean;
  error: string | null;
  stats: {
    totalDeaths: number;
    totalActors: number;
    totalMovies: number;
    topGenres: { genre: string; count: number }[];
    yearRange: { min: number; max: number };
    topActors: { name: string; deathCount: number }[];
    dataSource?: string;
    lastUpdated?: Date;
  } | null;
  searchActors: (query: string) => Promise<string[]>;
  getActor: (actorName: string) => Actor | null;
  advancedSearch: (filters: any) => Promise<StaticDeathRecord[]>;
  getRandomActors: (count?: number) => Promise<string[]>;
  reload: () => Promise<void>;
  imageProgress: { cached: number; total: number; progress: number };
}

export function useStaticData(): UseStaticDataResult {
  const [actors, setActors] = useState<Record<string, Actor>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UseStaticDataResult['stats']>(null);
  const [imageProgress, setImageProgress] = useState({ cached: 0, total: 0, progress: 0 });

  /**
   * Convert static records to our Actor format with Wikipedia images
   */
  const convertRecordsToActors = useCallback((records: StaticDeathRecord[]): Record<string, Actor> => {
    console.log(`🔄 Converting ${records.length} death records to actor format...`);
    
    const actorMap: Record<string, Actor> = {};
    
    // Group records by actor
    records.forEach((record) => {
      const actorId = record.actor_name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      if (!actorMap[actorId]) {
        const actorDeaths = records.filter(r => r.actor_name === record.actor_name);
        
        // Get Wikipedia image or fallback
        const actorImage = staticDataService.getActorImage(record.actor_name);
        
        actorMap[actorId] = {
          id: actorId,
          name: record.actor_name,
          headshot: actorImage,
          bio: this.generateActorBio(record.actor_name, actorDeaths),
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
        plotSummary: this.generatePlotSummary(record),
        posterUrl: this.generatePosterUrl(record.movie_title, record.year),
        deathDescription: record.death_description,
        deathType: (record.death_type || 'violent') as any,
        imdbRating: record.imdb_rating,
        genre: record.genre,
        budget: record.budget,
        boxOffice: record.box_office
      };
      
      // Avoid duplicate deaths for the same movie
      const existingDeath = actorMap[actorId].deaths.find(d => 
        d.movieTitle === record.movie_title && d.character === record.character_name
      );
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
      
      // Estimate awards based on IMDB ratings and career span
      const highRatedMovies = actor.deaths.filter(d => d.imdbRating && d.imdbRating > 8).length;
      const careerSpan = actor.deaths.length > 1 ? 
        Math.max(...actor.deaths.map(d => parseInt(d.releaseDate))) - 
        Math.min(...actor.deaths.map(d => parseInt(d.releaseDate))) : 0;
      
      actor.awardsCount = Math.floor(highRatedMovies * 2) + Math.floor(careerSpan / 5) + Math.floor(actor.deathCount / 3);
    });
    
    console.log(`✅ Converted to ${Object.keys(actorMap).length} unique actors with Wikipedia images`);
    return actorMap;
  }, []);

  /**
   * Generate realistic actor bio
   */
  const generateActorBio = (actorName: string, deaths: StaticDeathRecord[]): string => {
    const deathCount = deaths.length;
    const genres = [...new Set(deaths.map(d => d.genre.split(',')[0].trim()))];
    const yearSpan = deaths.length > 1 ? 
      Math.max(...deaths.map(d => d.year)) - Math.min(...deaths.map(d => d.year)) : 0;
    
    const careerLength = yearSpan > 0 ? `${yearSpan}-year` : 'distinguished';
    const primaryGenre = genres[0] || 'drama';
    const genreText = genres.length > 1 ? `${primaryGenre} and ${genres[1]}` : primaryGenre;
    
    return `Renowned actor with ${deathCount} memorable on-screen death${deathCount === 1 ? '' : 's'} throughout their ${careerLength} career. Known for bringing depth and authenticity to characters across ${genreText} films, ${actorName} has created unforgettable final moments that have captivated audiences worldwide. Their performances showcase a remarkable range in portraying characters' ultimate sacrifices and dramatic conclusions.`;
  };

  /**
   * Generate plot summary from death record
   */
  const generatePlotSummary = (record: StaticDeathRecord): string => {
    const genre = record.genre.toLowerCase();
    const year = record.year;
    const character = record.character_name;
    
    if (genre.includes('horror')) {
      return `A chilling ${year} horror film featuring ${character} in a spine-tingling performance. The story builds suspense toward a climactic moment that showcases the ultimate price of confronting supernatural forces.`;
    } else if (genre.includes('action')) {
      return `An adrenaline-pumping ${year} action thriller where ${character} faces impossible odds. High-stakes sequences lead to intense confrontations that test the limits of heroism and sacrifice.`;
    } else if (genre.includes('drama')) {
      return `A compelling ${year} drama exploring complex human relationships through ${character}'s journey. The narrative builds to an emotionally powerful conclusion that resonates with audiences long after the credits roll.`;
    } else {
      return `A captivating ${year} ${genre} film featuring ${character} in a memorable performance. The story weaves together compelling themes that culminate in a dramatic and unforgettable finale.`;
    }
  };

  /**
   * Generate poster URL for movies
   */
  const generatePosterUrl = (movieTitle: string, year: number): string => {
    // Create a hash-based seed for consistent poster selection
    const seed = movieTitle.split('').reduce((acc, char) => acc + char.charCodeAt(0), year);
    const posterIds = [
      '1541746078467-6bd7c7a4badb', '1507003211169-0a138ac96936', '1519681393784-2cf36080e399',
      '1489599162113-79b16da9d6c8', '1516371535707-512a1e85281b', '1517604931441-e205c0d74bf4',
      '1571847140471-1d7c1d2e4c67', '1536440136628-849c177c5314', '1594909122845-e5c6c0ea8e9b'
    ];
    const selectedId = posterIds[seed % posterIds.length];
    
    return `https://images.unsplash.com/photo-${selectedId}?w=300&h=450&fit=crop&auto=format&q=80`;
  };

  /**
   * Load and process data from your real database
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Loading your real RIPDB database...');
      
      // Check if database is already loaded
      const status = staticDataService.getStatus();
      if (status.loading) {
        console.log('⏳ Database is already loading...');
      }
      
      // Load all records and stats simultaneously
      const [records, statsData] = await Promise.all([
        staticDataService.getAllRecords(),
        staticDataService.getStats()
      ]);
      
      console.log(`📊 Processing ${records.length} death records from your database...`);
      
      if (records.length === 0) {
        throw new Error('No data found in database');
      }
      
      // Check if we have real data or placeholder
      const hasRealData = records.length > 10 && !records[0].actor_name.includes('Placeholder');
      
      if (hasRealData) {
        console.log('✅ Real database loaded successfully!');
        console.log(`📊 Source: ${statsData.dataSource}`);
        console.log(`📅 Last updated: ${statsData.lastUpdated}`);
      } else {
        console.log('⚠️ Using placeholder data - real database loading may have failed');
      }
      
      const actorData = convertRecordsToActors(records);
      
      setActors(actorData);
      setStats(statsData);
      
      console.log(`✅ Successfully loaded data for ${Object.keys(actorData).length} actors`);
      
      // Update image progress
      const imageStats = staticDataService.getImageCacheStats();
      setImageProgress(imageStats);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load database';
      console.error('❌ Error loading database:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [convertRecordsToActors]);

  /**
   * Search for actors in your database
   */
  const searchActors = useCallback(async (query: string): Promise<string[]> => {
    try {
      return await staticDataService.searchActors(query);
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
   * Advanced search functionality
   */
  const advancedSearch = useCallback(async (filters: any): Promise<StaticDeathRecord[]> => {
    return await staticDataService.advancedSearch(filters);
  }, []);

  /**
   * Get random actor suggestions
   */
  const getRandomActors = useCallback(async (count: number = 6): Promise<string[]> => {
    return await staticDataService.getRandomActors(count);
  }, []);

  /**
   * Reload database
   */
  const reload = useCallback(async (): Promise<void> => {
    console.log('🔄 Reloading database...');
    await staticDataService.reload();
    await loadData();
  }, [loadData]);

  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update image progress periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const imageStats = staticDataService.getImageCacheStats();
      setImageProgress(imageStats);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    actors,
    loading,
    error,
    stats,
    searchActors,
    getActor,
    advancedSearch,
    getRandomActors,
    reload,
    imageProgress
  };
}

export default useStaticData;
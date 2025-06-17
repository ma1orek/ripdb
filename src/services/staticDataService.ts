// Static Database Service for RIPDB - Now with your REAL 65k+ database!
import { csvDataFetcher, FetchedData } from './csvDataFetcher';
import { wikipediaImageService, WikipediaImageResult } from './wikipediaImageService';

export interface StaticDeathRecord {
  actor_name: string;
  movie_title: string;
  year: number;
  character_name: string;
  death_description: string;
  genre: string;
  director: string;
  imdb_rating?: number;
  poster_url?: string;
  death_type: string;
  budget?: string;
  box_office?: string;
  wikipedia_image?: string;
}

interface ActorImageCache {
  [actorName: string]: string;
}

class StaticDataService {
  private data: StaticDeathRecord[] = [];
  private processed: boolean = false;
  private loading: boolean = false;
  private error: string | null = null;
  private imageCache: ActorImageCache = {};
  private rawData: FetchedData | null = null;

  /**
   * Initialize service with your real 65k+ database!
   */
  async initialize(): Promise<void> {
    if (this.processed || this.loading) return;
    
    try {
      this.loading = true;
      this.error = null;
      
      console.log('🚀 RIPDB: Loading your 65k+ death records database...');
      console.log('📡 Fetching from: http://bliskioptyk.pl/combined.csv');
      
      // Fetch your CSV database
      const csvData = await csvDataFetcher.fetchRIPDBData();
      this.rawData = csvData;
      
      console.log(`📊 Raw data loaded: ${csvData.totalCount} records, ${csvData.columns.length} columns`);
      console.log('📋 Columns found:', csvData.columns);
      
      // Validate the data structure
      const validation = csvDataFetcher.validateCSVData(csvData);
      
      if (!validation.isValid) {
        console.error('❌ Data validation failed:', validation.errors);
        throw new Error(`Invalid data structure: ${validation.errors.join(', ')}`);
      }
      
      if (validation.warnings.length > 0) {
        console.warn('⚠️ Data warnings:', validation.warnings);
      }
      
      // Convert to RIPDB format
      console.log('🔄 Converting to RIPDB format...');
      this.data = this.convertToRIPDBFormat(csvData.records, csvData.columns);
      
      console.log(`✅ Database loaded: ${this.data.length} death records processed!`);
      
      // Start background image fetching
      this.fetchWikipediaImagesInBackground();
      
      this.processed = true;
      console.log('🎯 RIPDB is live with your real database!');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error loading database';
      console.error('❌ Failed to load database:', errorMessage);
      this.error = errorMessage;
      
      // Load placeholder data as fallback
      console.log('📦 Loading placeholder data as fallback...');
      this.data = this.getPlaceholderData();
      this.processed = true;
      
    } finally {
      this.loading = false;
    }
  }

  /**
   * Convert raw CSV data to RIPDB format with intelligent field mapping
   */
  private convertToRIPDBFormat(records: any[], columns: string[]): StaticDeathRecord[] {
    console.log('🔄 Converting records to RIPDB format...');
    
    // Create intelligent field mapping
    const fieldMap = this.createFieldMapping(columns);
    console.log('🗺️ Field mapping:', fieldMap);
    
    const convertedRecords: StaticDeathRecord[] = [];
    let skippedCount = 0;
    
    for (let i = 0; i < records.length; i++) {
      try {
        const record = records[i];
        const converted = this.convertRecord(record, fieldMap);
        
        if (converted) {
          convertedRecords.push(converted);
        } else {
          skippedCount++;
        }
      } catch (error) {
        skippedCount++;
        if (skippedCount <= 5) {
          console.warn(`⚠️ Failed to convert record ${i + 1}:`, error);
        }
      }
    }
    
    if (skippedCount > 0) {
      console.warn(`⚠️ Skipped ${skippedCount} invalid records`);
    }
    
    console.log(`✅ Successfully converted ${convertedRecords.length} records`);
    return convertedRecords;
  }

  /**
   * Create intelligent field mapping from CSV columns
   */
  private createFieldMapping(columns: string[]): Record<string, string> {
    const mapping: Record<string, string> = {};
    
    const fieldMappings = {
      actor_name: ['actor', 'name', 'actor_name', 'actorname', 'performer', 'star'],
      movie_title: ['movie', 'title', 'film', 'movie_title', 'movietitle', 'production'],
      year: ['year', 'release_year', 'releaseyear', 'date', 'released'],
      character_name: ['character', 'role', 'character_name', 'charactername'],
      death_description: ['death', 'death_scene', 'death_description', 'how_died', 'cause', 'description'],
      genre: ['genre', 'genres', 'category', 'type'],
      director: ['director', 'directed_by', 'filmmaker'],
      imdb_rating: ['imdb', 'rating', 'imdb_rating', 'score'],
      death_type: ['death_type', 'deathtype', 'method', 'manner'],
      budget: ['budget', 'cost', 'production_budget'],
      box_office: ['box_office', 'boxoffice', 'gross', 'earnings']
    };
    
    // Match columns to fields
    columns.forEach(column => {
      const normalizedColumn = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      for (const [targetField, possibleNames] of Object.entries(fieldMappings)) {
        if (possibleNames.some(name => normalizedColumn.includes(name))) {
          if (!mapping[targetField]) {
            mapping[targetField] = column;
          }
        }
      }
    });
    
    return mapping;
  }

  /**
   * Convert single record using field mapping
   */
  private convertRecord(record: any, fieldMap: Record<string, string>): StaticDeathRecord | null {
    try {
      // Extract required fields
      const actorName = this.getFieldValue(record, fieldMap.actor_name);
      const movieTitle = this.getFieldValue(record, fieldMap.movie_title);
      
      if (!actorName || !movieTitle) {
        return null; // Skip records without essential data
      }
      
      // Extract year with fallback
      let year = parseInt(this.getFieldValue(record, fieldMap.year) || '2000');
      if (isNaN(year) || year < 1900 || year > 2030) {
        year = 2000; // Default year for invalid dates
      }
      
      // Build the record
      const converted: StaticDeathRecord = {
        actor_name: actorName.trim(),
        movie_title: movieTitle.trim(),
        year,
        character_name: this.getFieldValue(record, fieldMap.character_name) || 'Character',
        death_description: this.getFieldValue(record, fieldMap.death_description) || 'Death scene',
        genre: this.getFieldValue(record, fieldMap.genre) || 'Drama',
        director: this.getFieldValue(record, fieldMap.director) || 'Unknown',
        death_type: this.getFieldValue(record, fieldMap.death_type) || 'violent',
        budget: this.getFieldValue(record, fieldMap.budget),
        box_office: this.getFieldValue(record, fieldMap.box_office)
      };
      
      // Parse IMDB rating
      const ratingStr = this.getFieldValue(record, fieldMap.imdb_rating);
      if (ratingStr) {
        const rating = parseFloat(ratingStr);
        if (!isNaN(rating) && rating >= 0 && rating <= 10) {
          converted.imdb_rating = rating;
        }
      }
      
      return converted;
      
    } catch (error) {
      console.warn('Record conversion failed:', error);
      return null;
    }
  }

  /**
   * Get field value with fallback handling
   */
  private getFieldValue(record: any, fieldName: string | undefined): string {
    if (!fieldName || !record) return '';
    
    const value = record[fieldName] || record[fieldName.toLowerCase()];
    return value ? value.toString().trim() : '';
  }

  /**
   * Fetch Wikipedia images in background
   */
  private async fetchWikipediaImagesInBackground(): Promise<void> {
    try {
      console.log('🖼️ Starting background Wikipedia image fetching...');
      
      // Get unique actor names
      const uniqueActors = [...new Set(this.data.map(r => r.actor_name))];
      console.log(`🎭 Found ${uniqueActors.length} unique actors for image fetching`);
      
      // Fetch images in batches to avoid overwhelming the API
      const batchSize = 10;
      let processed = 0;
      
      for (let i = 0; i < uniqueActors.length; i += batchSize) {
        const batch = uniqueActors.slice(i, i + batchSize);
        
        try {
          const imageResults = await wikipediaImageService.batchGetActorImages(batch);
          
          // Update cache
          imageResults.forEach((result, actorName) => {
            if (result) {
              this.imageCache[actorName] = result.url;
            } else {
              // Generate fallback image
              this.imageCache[actorName] = wikipediaImageService.generateFallbackImage(actorName);
            }
          });
          
          processed += batch.length;
          console.log(`📸 Processed ${processed}/${uniqueActors.length} actor images`);
          
          // Small delay between batches
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.warn('Batch image fetch failed:', error);
        }
      }
      
      console.log('✅ Background image fetching completed!');
      
    } catch (error) {
      console.warn('Background image fetching failed:', error);
    }
  }

  /**
   * Get placeholder data for fallback
   */
  private getPlaceholderData(): StaticDeathRecord[] {
    return [
      {
        actor_name: "⚠️ Database Loading Failed",
        movie_title: "Using Placeholder Data",
        year: 2024,
        character_name: "Error Handler",
        death_description: "Your CSV database could not be loaded. Please check the URL and CORS settings.",
        genre: "System Error",
        director: "RIPDB System",
        death_type: "technical",
        imdb_rating: 0.0
      },
      {
        actor_name: "🔄 Retry Available",
        movie_title: "Database Connection",
        year: 2024,
        character_name: "Retry System",
        death_description: "You can retry loading your database or use demo mode.",
        genre: "System Status",
        director: "RIPDB Team",
        death_type: "technical",
        imdb_rating: 0.0
      }
    ];
  }

  /**
   * Get actor image with Wikipedia integration
   */
  getActorImage(actorName: string): string {
    // Check cache first
    if (this.imageCache[actorName]) {
      return this.imageCache[actorName];
    }
    
    // Generate fallback while we fetch the real image
    const fallback = wikipediaImageService.generateFallbackImage(actorName);
    
    // Fetch Wikipedia image asynchronously
    wikipediaImageService.getActorImage(actorName).then(result => {
      if (result) {
        this.imageCache[actorName] = result.url;
      } else {
        this.imageCache[actorName] = fallback;
      }
    }).catch(error => {
      console.warn(`Failed to fetch Wikipedia image for ${actorName}:`, error);
      this.imageCache[actorName] = fallback;
    });
    
    return fallback;
  }

  /**
   * Get all death records
   */
  async getAllRecords(): Promise<StaticDeathRecord[]> {
    await this.initialize();
    return this.data;
  }

  /**
   * Search actors by name
   */
  async searchActors(query: string): Promise<string[]> {
    await this.initialize();
    const actors = [...new Set(this.data.map(record => record.actor_name))];
    
    return actors
      .filter(actor => actor.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);
  }

  /**
   * Get all deaths for a specific actor
   */
  async getActorDeaths(actorName: string): Promise<StaticDeathRecord[]> {
    await this.initialize();
    return this.data.filter(record => 
      record.actor_name.toLowerCase() === actorName.toLowerCase()
    );
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    totalDeaths: number;
    totalActors: number;
    totalMovies: number;
    topGenres: { genre: string; count: number }[];
    yearRange: { min: number; max: number };
    topActors: { name: string; deathCount: number }[];
    dataSource: string;
    lastUpdated: Date | null;
  }> {
    await this.initialize();
    
    const totalDeaths = this.data.length;
    const actors = new Set(this.data.map(r => r.actor_name));
    const movies = new Set(this.data.map(r => r.movie_title));
    const years = this.data.map(r => r.year).filter(y => y > 1900);
    
    // Count genres
    const genreCounts: Record<string, number> = {};
    this.data.forEach(record => {
      const mainGenre = record.genre.split(',')[0].trim();
      genreCounts[mainGenre] = (genreCounts[mainGenre] || 0) + 1;
    });
    
    const topGenres = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Count actor deaths
    const actorDeathCounts: Record<string, number> = {};
    this.data.forEach(record => {
      actorDeathCounts[record.actor_name] = (actorDeathCounts[record.actor_name] || 0) + 1;
    });

    const topActors = Object.entries(actorDeathCounts)
      .map(([name, deathCount]) => ({ name, deathCount }))
      .sort((a, b) => b.deathCount - a.deathCount)
      .slice(0, 10);
    
    return {
      totalDeaths,
      totalActors: actors.size,
      totalMovies: movies.size,
      topGenres,
      yearRange: {
        min: years.length > 0 ? Math.min(...years) : 1900,
        max: years.length > 0 ? Math.max(...years) : 2024
      },
      topActors,
      dataSource: this.rawData?.source || 'Unknown',
      lastUpdated: this.rawData?.fetchedAt || null
    };
  }

  /**
   * Get random actor suggestions
   */
  async getRandomActors(count: number = 6): Promise<string[]> {
    await this.initialize();
    const actors = [...new Set(this.data.map(record => record.actor_name))];
    
    // Shuffle and return requested count
    const shuffled = actors.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Advanced search with multiple filters
   */
  async advancedSearch(filters: {
    actor?: string;
    movie?: string;
    genre?: string;
    yearStart?: number;
    yearEnd?: number;
    deathType?: string;
    director?: string;
  }): Promise<StaticDeathRecord[]> {
    await this.initialize();
    
    return this.data.filter(record => {
      if (filters.actor && !record.actor_name.toLowerCase().includes(filters.actor.toLowerCase())) {
        return false;
      }
      if (filters.movie && !record.movie_title.toLowerCase().includes(filters.movie.toLowerCase())) {
        return false;
      }
      if (filters.genre && !record.genre.toLowerCase().includes(filters.genre.toLowerCase())) {
        return false;
      }
      if (filters.yearStart && record.year < filters.yearStart) {
        return false;
      }
      if (filters.yearEnd && record.year > filters.yearEnd) {
        return false;
      }
      if (filters.deathType && record.death_type.toLowerCase() !== filters.deathType.toLowerCase()) {
        return false;
      }
      if (filters.director && !record.director.toLowerCase().includes(filters.director.toLowerCase())) {
        return false;
      }
      return true;
    });
  }

  /**
   * Get loading status
   */
  getStatus(): {
    loading: boolean;
    processed: boolean;
    error: string | null;
    recordCount: number;
    hasRealData: boolean;
  } {
    return {
      loading: this.loading,
      processed: this.processed,
      error: this.error,
      recordCount: this.data.length,
      hasRealData: this.processed && !this.error && this.data.length > 10
    };
  }

  /**
   * Force reload database
   */
  async reload(): Promise<void> {
    this.processed = false;
    this.loading = false;
    this.error = null;
    this.data = [];
    this.imageCache = {};
    this.rawData = null;
    
    await this.initialize();
  }

  /**
   * Get image cache stats
   */
  getImageCacheStats(): { cached: number; total: number; progress: number } {
    const totalActors = new Set(this.data.map(r => r.actor_name)).size;
    const cachedImages = Object.keys(this.imageCache).length;
    
    return {
      cached: cachedImages,
      total: totalActors,
      progress: totalActors > 0 ? Math.round((cachedImages / totalActors) * 100) : 0
    };
  }
}

// Export singleton instance - NOW WITH YOUR REAL 65k+ DATABASE!
export const staticDataService = new StaticDataService();

// Initialize immediately
staticDataService.initialize().then(() => {
  console.log('🎯 RIPDB Static Database Service is LIVE with your real data!');
}).catch(error => {
  console.error('🚨 Database initialization failed:', error);
});

export default StaticDataService;
// Google Sheets API service for RIPDB
export interface GoogleSheetsConfig {
  spreadsheetId: string;
  apiKey?: string;
  range?: string;
  sheetName?: string;
  gid?: string;
}

export interface SheetRow {
  [key: string]: string | number;
}

// Column mapping for the death database
export interface DeathRecord {
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
}

class GoogleSheetsService {
  private config: GoogleSheetsConfig;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
  }

  /**
   * Fetch data from Google Sheets using the API
   */
  async fetchSheetData(): Promise<DeathRecord[]> {
    const cacheKey = 'sheet_data';
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      console.log('📊 Using cached Google Sheets data');
      return this.cache.get(cacheKey);
    }

    try {
      console.log('📡 Fetching data from Google Sheets...');
      console.log('🔑 Using API key:', this.config.apiKey ? 'Available' : 'Not provided');
      console.log('📋 Spreadsheet ID:', this.config.spreadsheetId);
      console.log('📄 Sheet GID:', this.config.gid);
      
      // Method 1: Google Sheets API (requires API key)
      if (this.config.apiKey) {
        try {
          return await this.fetchViaAPI();
        } catch (apiError) {
          console.warn('⚠️  API method failed, trying CSV fallback:', apiError);
          return await this.fetchViaCSV();
        }
      }
      
      // Method 2: CSV export (no API key needed)
      return await this.fetchViaCSV();
      
    } catch (error) {
      console.error('❌ Error fetching Google Sheets data:', error);
      
      // Return mock data as fallback
      console.log('🔄 Falling back to mock data');
      return this.generateMockData();
    }
  }

  /**
   * Fetch via Google Sheets API v4
   */
  private async fetchViaAPI(): Promise<DeathRecord[]> {
    // Determine the range - use sheet name if available, otherwise try to get from gid
    let range = this.config.range || 'A:Z';
    if (this.config.sheetName) {
      range = `${this.config.sheetName}!${range}`;
    } else if (this.config.gid) {
      // For GID, we need to first get sheet info or use the range directly
      range = `A:Z`; // Will use default sheet for now
    }
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${range}?key=${this.config.apiKey}`;
    
    console.log('🌐 API URL:', url.replace(this.config.apiKey!, 'API_KEY_HIDDEN'));
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('📛 API Response Error:', response.status, response.statusText, errorText);
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('📊 API Response received, processing...');
    
    const rows = data.values || [];
    
    if (rows.length === 0) {
      throw new Error('No data found in spreadsheet');
    }
    
    // First row should contain headers
    const headers = rows[0];
    const dataRows = rows.slice(1);
    
    console.log('📋 Headers found:', headers);
    console.log('📊 Data rows:', dataRows.length);
    
    const records = dataRows
      .map((row: any[], index: number) => {
        try {
          return this.mapRowToRecord(headers, row);
        } catch (error) {
          console.warn(`⚠️  Skipping row ${index + 2}:`, error);
          return null;
        }
      })
      .filter(record => record !== null) as DeathRecord[];
    
    // Cache the results
    this.cache.set('sheet_data', records);
    this.cacheExpiry.set('sheet_data', Date.now() + this.CACHE_DURATION);
    
    console.log(`✅ Loaded ${records.length} death records from Google Sheets API`);
    return records;
  }

  /**
   * Fetch via CSV export (more reliable, no API key needed)
   */
  private async fetchViaCSV(): Promise<DeathRecord[]> {
    // Convert Google Sheets URL to CSV export URL
    // Handle specific sheet GID if provided
    let csvUrl = `https://docs.google.com/spreadsheets/d/${this.config.spreadsheetId}/export?format=csv`;
    
    if (this.config.gid) {
      csvUrl += `&gid=${this.config.gid}`;
    }
    
    console.log('🌐 CSV URL:', csvUrl);
    
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('📛 CSV Response Error:', response.status, response.statusText);
      throw new Error(`CSV fetch error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const csvText = await response.text();
    console.log('📊 CSV data received, size:', csvText.length, 'characters');
    
    if (!csvText.trim()) {
      throw new Error('Empty CSV data received');
    }
    
    const records = this.parseCSV(csvText);
    
    // Cache the results
    this.cache.set('sheet_data', records);
    this.cacheExpiry.set('sheet_data', Date.now() + this.CACHE_DURATION);
    
    console.log(`✅ Loaded ${records.length} death records from CSV export`);
    return records;
  }

  /**
   * Parse CSV data into death records
   */
  private parseCSV(csvText: string): DeathRecord[] {
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('Empty CSV data');
    }
    
    const headers = this.parseCSVRow(lines[0]);
    const dataRows = lines.slice(1);
    
    console.log('📋 CSV Headers:', headers);
    console.log('📊 CSV Data rows:', dataRows.length);
    
    const records = dataRows
      .map((line, index) => {
        try {
          const row = this.parseCSVRow(line);
          return this.mapRowToRecord(headers, row);
        } catch (error) {
          console.warn(`⚠️  Skipping CSV row ${index + 2}:`, error);
          return null;
        }
      })
      .filter(record => record !== null && record.actor_name && record.movie_title) as DeathRecord[];

    return records;
  }

  /**
   * Parse a single CSV row, handling commas in quotes
   */
  private parseCSVRow(row: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, '')); // Remove surrounding quotes
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim().replace(/^"|"$/g, '')); // Remove surrounding quotes
    return result;
  }

  /**
   * Map spreadsheet row to death record with improved column detection
   */
  private mapRowToRecord(headers: string[], row: any[]): DeathRecord {
    const record: any = {};
    
    // Create a more flexible column mapping
    const columnMap: Record<string, string> = {
      // Actor name variations
      'actor': 'actor_name',
      'name': 'actor_name',
      'actor_name': 'actor_name',
      'actorname': 'actor_name',
      'performer': 'actor_name',
      
      // Movie title variations
      'movie': 'movie_title',
      'title': 'movie_title',
      'film': 'movie_title',
      'movie_title': 'movie_title',
      'movietitle': 'movie_title',
      'production': 'movie_title',
      
      // Year variations
      'year': 'year',
      'release_year': 'year',
      'releaseyear': 'year',
      'date': 'year',
      
      // Character variations
      'character': 'character_name',
      'role': 'character_name',
      'character_name': 'character_name',
      'charactername': 'character_name',
      
      // Death description variations
      'death': 'death_description',
      'death_scene': 'death_description',
      'death_description': 'death_description',
      'deathdescription': 'death_description',
      'how_died': 'death_description',
      'cause_of_death': 'death_description',
      
      // Genre variations
      'genre': 'genre',
      'genres': 'genre',
      'category': 'genre',
      
      // Director variations
      'director': 'director',
      'directed_by': 'director',
      'directedby': 'director',
      
      // Rating variations
      'imdb': 'imdb_rating',
      'rating': 'imdb_rating',
      'imdb_rating': 'imdb_rating',
      'imdbrating': 'imdb_rating',
      'score': 'imdb_rating',
      
      // Poster variations
      'poster': 'poster_url',
      'poster_url': 'poster_url',
      'posterurl': 'poster_url',
      'image': 'poster_url',
      
      // Death type variations
      'type': 'death_type',
      'death_type': 'death_type',
      'deathtype': 'death_type',
      'category': 'death_type',
      
      // Budget variations
      'budget': 'budget',
      'cost': 'budget',
      
      // Box office variations
      'box_office': 'box_office',
      'boxoffice': 'box_office',
      'gross': 'box_office',
      'earnings': 'box_office'
    };
    
    headers.forEach((header, index) => {
      const value = row[index] || '';
      const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
      
      const mappedKey = columnMap[normalizedHeader] || columnMap[header.toLowerCase()] || normalizedHeader;
      
      // Convert and clean up values
      if (mappedKey === 'year') {
        const yearValue = typeof value === 'string' ? value.match(/\d{4}/)?.[0] : value;
        record[mappedKey] = yearValue ? parseInt(yearValue) : 0;
      } else if (mappedKey === 'imdb_rating') {
        const rating = parseFloat(value);
        record[mappedKey] = !isNaN(rating) ? rating : undefined;
      } else {
        record[mappedKey] = typeof value === 'string' ? value.trim() : value;
      }
    });
    
    // Ensure required fields have values
    if (!record.actor_name || !record.movie_title) {
      throw new Error(`Missing required fields: actor_name="${record.actor_name}", movie_title="${record.movie_title}"`);
    }
    
    // Set defaults for optional fields
    record.genre = record.genre || 'Unknown';
    record.director = record.director || 'Unknown';
    record.death_description = record.death_description || 'Death scene';
    record.death_type = record.death_type || 'violent';
    record.character_name = record.character_name || 'Unknown Character';
    
    // Ensure year is valid
    if (!record.year || record.year < 1900 || record.year > new Date().getFullYear() + 5) {
      record.year = 2000; // Default year
    }
    
    return record as DeathRecord;
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  /**
   * Generate mock data as fallback
   */
  private generateMockData(): DeathRecord[] {
    return [
      {
        actor_name: "Sean Bean",
        movie_title: "GoldenEye",
        year: 1995,
        character_name: "Alec Trevelyan",
        death_description: "Falls from satellite dish after being shot",
        genre: "Action, Adventure, Thriller",
        director: "Martin Campbell",
        imdb_rating: 7.2,
        death_type: "violent",
        budget: "$60M",
        box_office: "$352.1M"
      },
      {
        actor_name: "Sean Bean",
        movie_title: "The Lord of the Rings: The Fellowship of the Ring",
        year: 2001,
        character_name: "Boromir",
        death_description: "Shot with arrows defending Merry and Pippin",
        genre: "Adventure, Drama, Fantasy",
        director: "Peter Jackson",
        imdb_rating: 8.8,
        death_type: "heroic",
        budget: "$93M",
        box_office: "$871.5M"
      },
      {
        actor_name: "John Hurt",
        movie_title: "Alien",
        year: 1979,
        character_name: "Kane",
        death_description: "Alien chestburster erupts from his chest",
        genre: "Horror, Sci-Fi",
        director: "Ridley Scott",
        imdb_rating: 8.4,
        death_type: "supernatural",
        budget: "$11M",
        box_office: "$104.9M"
      }
    ];
  }

  /**
   * Search actors by name
   */
  async searchActors(query: string): Promise<string[]> {
    const data = await this.fetchSheetData();
    const actors = [...new Set(data.map(record => record.actor_name))];
    
    return actors.filter(actor => 
      actor.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10); // Limit results
  }

  /**
   * Get all deaths for a specific actor
   */
  async getActorDeaths(actorName: string): Promise<DeathRecord[]> {
    const data = await this.fetchSheetData();
    return data.filter(record => 
      record.actor_name.toLowerCase() === actorName.toLowerCase()
    );
  }

  /**
   * Get statistics about the database
   */
  async getStats(): Promise<{
    totalDeaths: number;
    totalActors: number;
    totalMovies: number;
    topGenres: { genre: string; count: number }[];
  }> {
    const data = await this.fetchSheetData();
    
    const totalDeaths = data.length;
    const actors = new Set(data.map(r => r.actor_name));
    const movies = new Set(data.map(r => r.movie_title));
    
    // Count genres
    const genreCounts: Record<string, number> = {};
    data.forEach(record => {
      const mainGenre = record.genre.split(',')[0].trim();
      genreCounts[mainGenre] = (genreCounts[mainGenre] || 0) + 1;
    });
    
    const topGenres = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalDeaths,
      totalActors: actors.size,
      totalMovies: movies.size,
      topGenres
    };
  }
}

// Export singleton instance with your configuration
export const googleSheetsService = new GoogleSheetsService({
  spreadsheetId: '1gpsN-yRIKQ24q9vrTYoNJGsKRUkyQsBxWD6Y4VEdOmE',
  apiKey: 'AIzaSyAzNVWJJdxkeBWf3FRIv-zpSGd8OGXJ340',
  gid: '142347631', // Your specific sheet tab
  range: 'A:Z' // Will fetch all columns
});

export default GoogleSheetsService;
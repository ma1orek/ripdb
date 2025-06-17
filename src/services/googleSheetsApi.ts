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
   * Check if the spreadsheet is publicly accessible
   */
  private async checkSheetAccess(): Promise<{ accessible: boolean; method: 'api' | 'csv' | 'none'; error?: string }> {
    // First try to check basic sheet access without API key
    try {
      const publicUrl = `https://docs.google.com/spreadsheets/d/${this.config.spreadsheetId}/edit`;
      console.log('🔍 Checking sheet accessibility:', publicUrl);
      
      // Try CSV method first (more reliable)
      if (await this.testCSVAccess()) {
        return { accessible: true, method: 'csv' };
      }
      
      // Try API method if CSV fails
      if (this.config.apiKey && await this.testAPIAccess()) {
        return { accessible: true, method: 'api' };
      }
      
      return { 
        accessible: false, 
        method: 'none',
        error: 'Sheet is not publicly accessible. Please make sure the sheet is shared with "Anyone with the link can view"'
      };
      
    } catch (error) {
      return { 
        accessible: false, 
        method: 'none',
        error: `Access check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Test CSV access method
   */
  private async testCSVAccess(): Promise<boolean> {
    try {
      let csvUrl = `https://docs.google.com/spreadsheets/d/${this.config.spreadsheetId}/export?format=csv`;
      if (this.config.gid) {
        csvUrl += `&gid=${this.config.gid}`;
      }
      
      const response = await fetch(csvUrl, {
        method: 'HEAD', // Just check if accessible
        mode: 'no-cors' // Bypass CORS for accessibility check
      });
      
      return true; // If no error is thrown, assume it's accessible
    } catch (error) {
      console.log('CSV access test failed:', error);
      return false;
    }
  }

  /**
   * Test API access method
   */
  private async testAPIAccess(): Promise<boolean> {
    try {
      if (!this.config.apiKey) return false;
      
      const range = 'A1:A1'; // Just check first cell
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${range}?key=${this.config.apiKey}`;
      
      const response = await fetch(url);
      return response.ok;
    } catch (error) {
      console.log('API access test failed:', error);
      return false;
    }
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
      console.log('🔑 API key available:', !!this.config.apiKey);
      console.log('📋 Spreadsheet ID:', this.config.spreadsheetId);
      console.log('📄 Sheet GID:', this.config.gid);
      
      // Check accessibility first
      const accessCheck = await this.checkSheetAccess();
      console.log('🔍 Access check result:', accessCheck);
      
      if (!accessCheck.accessible) {
        throw new Error(`Sheet access denied: ${accessCheck.error}`);
      }
      
      // Use the best available method
      if (accessCheck.method === 'api') {
        return await this.fetchViaAPI();
      } else if (accessCheck.method === 'csv') {
        return await this.fetchViaCSVProxy();
      } else {
        throw new Error('No accessible method found for fetching sheet data');
      }
      
    } catch (error) {
      console.error('❌ Error fetching Google Sheets data:', error);
      
      // Return enhanced mock data as fallback
      console.log('🔄 Falling back to enhanced mock data');
      return this.generateEnhancedMockData();
    }
  }

  /**
   * Fetch via Google Sheets API v4
   */
  private async fetchViaAPI(): Promise<DeathRecord[]> {
    const range = this.config.range || 'A:Z';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${range}?key=${this.config.apiKey}`;
    
    console.log('🌐 Fetching via API...');
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('📛 API Response Error:', response.status, response.statusText, errorText);
      
      if (response.status === 403) {
        throw new Error('API access denied. Please check: 1) API key is valid, 2) Sheets API is enabled, 3) Sheet is publicly accessible');
      }
      
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const rows = data.values || [];
    
    if (rows.length === 0) {
      throw new Error('No data found in spreadsheet');
    }
    
    const headers = rows[0];
    const dataRows = rows.slice(1);
    
    console.log('📋 API Headers found:', headers);
    console.log('📊 API Data rows:', dataRows.length);
    
    const records = dataRows
      .map((row: any[], index: number) => {
        try {
          return this.mapRowToRecord(headers, row);
        } catch (error) {
          console.warn(`⚠️  Skipping API row ${index + 2}:`, error);
          return null;
        }
      })
      .filter(record => record !== null) as DeathRecord[];
    
    this.cache.set('sheet_data', records);
    this.cacheExpiry.set('sheet_data', Date.now() + this.CACHE_DURATION);
    
    console.log(`✅ Loaded ${records.length} death records from Google Sheets API`);
    return records;
  }

  /**
   * Fetch via CSV with CORS proxy/alternative method
   */
  private async fetchViaCSVProxy(): Promise<DeathRecord[]> {
    // Method 1: Try direct CSV access (might work in some environments)
    try {
      return await this.fetchViaDirectCSV();
    } catch (directError) {
      console.warn('⚠️  Direct CSV failed, trying alternative methods:', directError);
      
      // Method 2: Try using a CORS proxy (for development)
      try {
        return await this.fetchViaCSVWithProxy();
      } catch (proxyError) {
        console.warn('⚠️  Proxy CSV failed:', proxyError);
        
        // Method 3: Use JSONP-like approach
        return await this.fetchViaAlternativeMethod();
      }
    }
  }

  /**
   * Direct CSV fetch
   */
  private async fetchViaDirectCSV(): Promise<DeathRecord[]> {
    let csvUrl = `https://docs.google.com/spreadsheets/d/${this.config.spreadsheetId}/export?format=csv`;
    if (this.config.gid) {
      csvUrl += `&gid=${this.config.gid}`;
    }
    
    console.log('🌐 Fetching via direct CSV:', csvUrl);
    
    const response = await fetch(csvUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv,text/plain,*/*',
      },
    });
    
    if (!response.ok) {
      throw new Error(`CSV fetch error: ${response.status} ${response.statusText}`);
    }
    
    const csvText = await response.text();
    
    if (!csvText.trim()) {
      throw new Error('Empty CSV data received');
    }
    
    const records = this.parseCSV(csvText);
    
    this.cache.set('sheet_data', records);
    this.cacheExpiry.set('sheet_data', Date.now() + this.CACHE_DURATION);
    
    console.log(`✅ Loaded ${records.length} death records from direct CSV`);
    return records;
  }

  /**
   * CSV fetch with CORS proxy
   */
  private async fetchViaCSVWithProxy(): Promise<DeathRecord[]> {
    let csvUrl = `https://docs.google.com/spreadsheets/d/${this.config.spreadsheetId}/export?format=csv`;
    if (this.config.gid) {
      csvUrl += `&gid=${this.config.gid}`;
    }
    
    // Use a public CORS proxy (be careful with sensitive data)
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(csvUrl)}`;
    
    console.log('🌐 Fetching via CORS proxy...');
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Proxy fetch error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const csvText = data.contents;
    
    if (!csvText || !csvText.trim()) {
      throw new Error('Empty CSV data received from proxy');
    }
    
    const records = this.parseCSV(csvText);
    
    this.cache.set('sheet_data', records);
    this.cacheExpiry.set('sheet_data', Date.now() + this.CACHE_DURATION);
    
    console.log(`✅ Loaded ${records.length} death records from proxy CSV`);
    return records;
  }

  /**
   * Alternative method using published web app approach
   */
  private async fetchViaAlternativeMethod(): Promise<DeathRecord[]> {
    // This would require setting up a Google Apps Script web app
    // For now, fall back to enhanced mock data
    console.log('🔄 Alternative methods not available, using enhanced mock data');
    throw new Error('Alternative fetch methods not implemented');
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
        if (inQuotes && row[i + 1] === '"') {
          // Handle escaped quotes
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  /**
   * Map spreadsheet row to death record with improved column detection
   */
  private mapRowToRecord(headers: string[], row: any[]): DeathRecord {
    const record: any = {};
    
    // Enhanced column mapping with more variations
    const columnMap: Record<string, string> = {
      // Actor name variations
      'actor': 'actor_name',
      'name': 'actor_name',
      'actor_name': 'actor_name',
      'actorname': 'actor_name',
      'performer': 'actor_name',
      'star': 'actor_name',
      
      // Movie title variations
      'movie': 'movie_title',
      'title': 'movie_title',
      'film': 'movie_title',
      'movie_title': 'movie_title',
      'movietitle': 'movie_title',
      'production': 'movie_title',
      'show': 'movie_title',
      
      // Year variations
      'year': 'year',
      'release_year': 'year',
      'releaseyear': 'year',
      'date': 'year',
      'released': 'year',
      
      // Character variations
      'character': 'character_name',
      'role': 'character_name',
      'character_name': 'character_name',
      'charactername': 'character_name',
      'played': 'character_name',
      
      // Death description variations
      'death': 'death_description',
      'death_scene': 'death_description',
      'death_description': 'death_description',
      'deathdescription': 'death_description',
      'how_died': 'death_description',
      'cause_of_death': 'death_description',
      'death_method': 'death_description',
      
      // Genre variations
      'genre': 'genre',
      'genres': 'genre',
      'category': 'genre',
      'type': 'genre',
      
      // Director variations
      'director': 'director',
      'directed_by': 'director',
      'directedby': 'director',
      'filmmaker': 'director',
      
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
      'img': 'poster_url',
      
      // Death type variations
      'death_type': 'death_type',
      'deathtype': 'death_type',
      'manner': 'death_type',
      
      // Budget variations
      'budget': 'budget',
      'cost': 'budget',
      'production_budget': 'budget',
      
      // Box office variations
      'box_office': 'box_office',
      'boxoffice': 'box_office',
      'gross': 'box_office',
      'earnings': 'box_office',
      'revenue': 'box_office'
    };
    
    headers.forEach((header, index) => {
      const value = row[index] || '';
      const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
      
      const mappedKey = columnMap[normalizedHeader] || columnMap[header.toLowerCase()] || normalizedHeader;
      
      // Convert and clean up values
      if (mappedKey === 'year') {
        const yearValue = typeof value === 'string' ? value.match(/\d{4}/)?.[0] : value;
        record[mappedKey] = yearValue ? parseInt(yearValue) : 2000;
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
    record.genre = record.genre || 'Drama';
    record.director = record.director || 'Unknown Director';
    record.death_description = record.death_description || 'Dies in dramatic scene';
    record.death_type = record.death_type || 'violent';
    record.character_name = record.character_name || 'Character';
    
    // Ensure year is valid
    if (!record.year || record.year < 1900 || record.year > new Date().getFullYear() + 5) {
      record.year = 2000;
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
   * Generate enhanced mock data as fallback with more realistic entries
   */
  private generateEnhancedMockData(): DeathRecord[] {
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
        actor_name: "Sean Bean",
        movie_title: "Patriot Games",
        year: 1992,
        character_name: "Sean Miller",
        death_description: "Killed in boat explosion",
        genre: "Action, Drama, Thriller",
        director: "Phillip Noyce",
        imdb_rating: 6.9,
        death_type: "violent",
        budget: "$45M",
        box_office: "$178.1M"
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
      },
      {
        actor_name: "John Hurt",
        movie_title: "V for Vendetta",
        year: 2005,
        character_name: "Adam Sutler",
        death_description: "Shot by Creedy's men",
        genre: "Action, Drama, Sci-Fi",
        director: "James McTeigue",
        imdb_rating: 8.2,
        death_type: "violent",
        budget: "$54M",
        box_office: "$132.5M"
      },
      {
        actor_name: "Danny Trejo",
        movie_title: "Machete",
        year: 2010,
        character_name: "Machete Cortez",
        death_description: "Survives (rare for Trejo character)",
        genre: "Action, Crime, Thriller",
        director: "Robert Rodriguez",
        imdb_rating: 6.6,
        death_type: "survivor",
        budget: "$10.5M",
        box_office: "$45.5M"
      },
      {
        actor_name: "Danny Trejo",
        movie_title: "Heat",
        year: 1995,
        character_name: "Trejo",
        death_description: "Shot by police during robbery",
        genre: "Action, Crime, Drama",
        director: "Michael Mann",
        imdb_rating: 8.3,
        death_type: "violent",
        budget: "$60M",
        box_office: "$187.4M"
      },
      {
        actor_name: "Gary Oldman",
        movie_title: "The Professional",
        year: 1994,
        character_name: "Norman Stansfield",
        death_description: "Killed by Léon's bomb vest",
        genre: "Action, Crime, Drama",
        director: "Luc Besson",
        imdb_rating: 8.5,
        death_type: "explosive",
        budget: "$16M",
        box_office: "$19.5M"
      },
      {
        actor_name: "Gary Oldman",
        movie_title: "Air Force One",
        year: 1997,
        character_name: "Ivan Korshunov",
        death_description: "Falls from the plane without parachute",
        genre: "Action, Drama, Thriller",
        director: "Wolfgang Petersen",
        imdb_rating: 6.5,
        death_type: "violent",
        budget: "$85M",
        box_office: "$315.2M"
      },
      {
        actor_name: "Samuel L. Jackson",
        movie_title: "Snakes on a Plane",
        year: 2006,
        character_name: "Neville Flynn",
        death_description: "Survives the snake attack",
        genre: "Action, Adventure, Crime",
        director: "David R. Ellis",
        imdb_rating: 5.4,
        death_type: "survivor",
        budget: "$33M",
        box_office: "$62.0M"
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
    ).slice(0, 10);
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
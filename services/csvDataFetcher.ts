// CSV Data Fetcher for RIPDB - Load your 65k death records database
export interface CSVDataFetcherOptions {
  url: string;
  enableCORS?: boolean;
  maxRetries?: number;
  timeout?: number;
}

export interface FetchedData {
  records: any[];
  totalCount: number;
  columns: string[];
  source: string;
  fetchedAt: Date;
}

class CSVDataFetcher {
  private defaultOptions: CSVDataFetcherOptions = {
    url: '',
    enableCORS: true,
    maxRetries: 3,
    timeout: 30000
  };

  /**
   * Fetch CSV data from URL with CORS handling
   */
  async fetchCSVData(options: CSVDataFetcherOptions): Promise<FetchedData> {
    const config = { ...this.defaultOptions, ...options };
    
    console.log(`🔄 Fetching CSV data from: ${config.url}`);
    console.log(`⚙️ Config: retries=${config.maxRetries}, timeout=${config.timeout}ms`);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= config.maxRetries!; attempt++) {
      try {
        console.log(`📡 Attempt ${attempt}/${config.maxRetries} - Fetching data...`);
        
        const csvText = await this.fetchWithTimeout(config.url, config.timeout!);
        const parsed = this.parseCSV(csvText);
        
        console.log(`✅ Successfully fetched and parsed CSV data!`);
        console.log(`📊 Records: ${parsed.records.length}, Columns: ${parsed.columns.length}`);
        
        return {
          ...parsed,
          source: config.url,
          fetchedAt: new Date()
        };

      } catch (error) {
        lastError = error as Error;
        console.warn(`❌ Attempt ${attempt} failed:`, error);
        
        if (attempt < config.maxRetries!) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await this.sleep(delay);
        }
      }
    }

    throw new Error(`Failed to fetch CSV after ${config.maxRetries} attempts. Last error: ${lastError?.message}`);
  }

  /**
   * Fetch CSV data from your specific URL
   */
  async fetchRIPDBData(): Promise<FetchedData> {
    const url = 'http://bliskioptyk.pl/combined.csv';
    
    console.log('🎯 Fetching RIPDB database from your server...');
    
    try {
      // Try direct fetch first
      return await this.fetchCSVData({ url });
    } catch (error) {
      console.warn('Direct fetch failed, trying CORS proxy...', error);
      
      // Try with CORS proxy as fallback
      const proxyUrls = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://cors-anywhere.herokuapp.com/${url}`
      ];

      for (const proxyUrl of proxyUrls) {
        try {
          console.log(`🔄 Trying CORS proxy: ${proxyUrl}`);
          const response = await fetch(proxyUrl);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          let csvText: string;
          const contentType = response.headers.get('content-type') || '';
          
          if (contentType.includes('application/json')) {
            // Some proxies return JSON wrapper
            const json = await response.json();
            csvText = json.contents || json.data || json.response || '';
          } else {
            csvText = await response.text();
          }

          if (!csvText.trim()) {
            throw new Error('Empty CSV response');
          }

          const parsed = this.parseCSV(csvText);
          console.log(`✅ Successfully fetched via CORS proxy!`);
          
          return {
            ...parsed,
            source: url,
            fetchedAt: new Date()
          };

        } catch (proxyError) {
          console.warn(`CORS proxy failed:`, proxyError);
        }
      }
      
      throw new Error('All fetch methods failed. Please check CSV URL accessibility.');
    }
  }

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(url: string, timeout: number): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        mode: 'cors',
        headers: {
          'Accept': 'text/csv, text/plain, application/csv, */*',
          'User-Agent': 'RIPDB/1.0 (Death Database Fetcher)'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const csvText = await response.text();
      
      if (!csvText.trim()) {
        throw new Error('Empty CSV response');
      }

      return csvText;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      
      throw error;
    }
  }

  /**
   * Parse CSV text into structured data
   */
  private parseCSV(csvText: string): { records: any[]; columns: string[]; totalCount: number } {
    console.log('🔄 Parsing CSV data...');
    
    const lines = csvText.trim().split('\n');
    
    if (lines.length < 2) {
      throw new Error('Invalid CSV format - need headers and data rows');
    }

    // Parse headers
    const headers = this.parseCSVRow(lines[0]);
    console.log(`📋 Found ${headers.length} columns:`, headers);

    // Parse data rows
    const dataRows = lines.slice(1);
    const records: any[] = [];
    let skippedRows = 0;

    for (let i = 0; i < dataRows.length; i++) {
      try {
        const row = this.parseCSVRow(dataRows[i]);
        if (row.length > 0 && row.some(cell => cell.trim())) {
          const record = this.rowToObject(headers, row);
          records.push(record);
        }
      } catch (error) {
        skippedRows++;
        if (skippedRows <= 5) { // Only log first few errors
          console.warn(`⚠️ Skipping row ${i + 2}:`, error);
        }
      }
    }

    if (skippedRows > 5) {
      console.warn(`⚠️ Total skipped rows: ${skippedRows}`);
    }

    console.log(`✅ Successfully parsed ${records.length} records from ${dataRows.length} rows`);
    
    return {
      records,
      columns: headers,
      totalCount: records.length
    };
  }

  /**
   * Parse single CSV row handling quotes and escapes
   */
  private parseCSVRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < row.length) {
      const char = row[i];
      const nextChar = row[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }

    // Add final field
    result.push(current.trim());
    
    return result;
  }

  /**
   * Convert CSV row to object
   */
  private rowToObject(headers: string[], row: string[]): any {
    const obj: any = {};
    
    headers.forEach((header, index) => {
      const value = row[index] || '';
      const cleanHeader = header.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      // Basic type inference
      if (value.match(/^\d{4}$/)) {
        obj[cleanHeader] = parseInt(value);
      } else if (value.match(/^\d+(\.\d+)?$/)) {
        obj[cleanHeader] = parseFloat(value);
      } else {
        obj[cleanHeader] = value.trim();
      }
    });

    return obj;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate CSV data structure
   */
  validateCSVData(data: FetchedData): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    requiredFields: string[];
    optionalFields: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Required fields for RIPDB
    const requiredFields = ['actor', 'name', 'actor_name', 'movie', 'title', 'movie_title', 'film'];
    const optionalFields = ['year', 'character', 'death', 'genre', 'director', 'rating'];
    
    // Check if we have required data
    if (data.records.length === 0) {
      errors.push('No data records found');
    }
    
    if (data.columns.length === 0) {
      errors.push('No columns found');
    }
    
    // Check for required fields
    const availableFields = data.columns.map(col => col.toLowerCase());
    const hasActorField = requiredFields.some(field => 
      availableFields.some(col => col.includes(field))
    );
    
    if (!hasActorField) {
      errors.push('No actor name field found (expected: actor, name, actor_name)');
    }
    
    const hasMovieField = requiredFields.slice(3).some(field => 
      availableFields.some(col => col.includes(field))
    );
    
    if (!hasMovieField) {
      errors.push('No movie title field found (expected: movie, title, movie_title, film)');
    }
    
    // Check data quality
    if (data.records.length < 100) {
      warnings.push(`Only ${data.records.length} records found - expected 65k+`);
    }
    
    const sampleRecord = data.records[0];
    if (sampleRecord) {
      const emptyFields = Object.values(sampleRecord).filter(v => !v || v.toString().trim() === '').length;
      if (emptyFields > Object.keys(sampleRecord).length / 2) {
        warnings.push('Many empty fields detected in sample data');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      requiredFields: requiredFields.slice(0, 3),
      optionalFields
    };
  }
}

// Export singleton instance
export const csvDataFetcher = new CSVDataFetcher();
export default CSVDataFetcher;
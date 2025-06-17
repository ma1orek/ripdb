// Wikipedia Image Service for RIPDB - Fetch high-quality actor photos
export interface WikipediaImageResult {
  url: string;
  title: string;
  width: number;
  height: number;
  source: 'wikipedia';
}

class WikipediaImageService {
  private cache: Map<string, WikipediaImageResult | null> = new Map();
  private baseUrl = 'https://en.wikipedia.org/api/rest_v1';
  private fallbackBaseUrl = 'https://commons.wikimedia.org/api/rest_v1';

  /**
   * Get actor image from Wikipedia
   */
  async getActorImage(actorName: string): Promise<WikipediaImageResult | null> {
    try {
      // Check cache first
      if (this.cache.has(actorName)) {
        return this.cache.get(actorName) || null;
      }

      console.log(`🔍 Searching Wikipedia for: ${actorName}`);

      // Search for the actor's Wikipedia page
      const searchResult = await this.searchWikipedia(actorName);
      if (!searchResult) {
        this.cache.set(actorName, null);
        return null;
      }

      // Get the page image
      const imageResult = await this.getPageImage(searchResult.title);
      
      if (imageResult) {
        console.log(`✅ Found Wikipedia image for ${actorName}`);
        this.cache.set(actorName, imageResult);
        return imageResult;
      }

      this.cache.set(actorName, null);
      return null;

    } catch (error) {
      console.warn(`⚠️ Wikipedia image fetch failed for ${actorName}:`, error);
      this.cache.set(actorName, null);
      return null;
    }
  }

  /**
   * Search Wikipedia for actor page
   */
  private async searchWikipedia(actorName: string): Promise<{ title: string } | null> {
    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(actorName)}&origin=*`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();

      if (data.query?.search?.length > 0) {
        // Look for the best match (preferably an actor/actress page)
        const bestMatch = data.query.search.find((result: any) => 
          result.snippet.toLowerCase().includes('actor') || 
          result.snippet.toLowerCase().includes('actress') ||
          result.snippet.toLowerCase().includes('film') ||
          result.snippet.toLowerCase().includes('movie')
        ) || data.query.search[0];

        return { title: bestMatch.title };
      }

      return null;
    } catch (error) {
      console.warn('Wikipedia search failed:', error);
      return null;
    }
  }

  /**
   * Get main image from Wikipedia page
   */
  private async getPageImage(pageTitle: string): Promise<WikipediaImageResult | null> {
    try {
      // Try to get page image using multiple methods
      const methods = [
        () => this.getPageImageFromAPI(pageTitle),
        () => this.getPageImageFromThumbnail(pageTitle),
        () => this.getPageImageFromInfobox(pageTitle)
      ];

      for (const method of methods) {
        try {
          const result = await method();
          if (result) return result;
        } catch (error) {
          console.warn('Method failed, trying next:', error);
        }
      }

      return null;
    } catch (error) {
      console.warn('All image methods failed:', error);
      return null;
    }
  }

  /**
   * Get image using Wikipedia REST API
   */
  private async getPageImageFromAPI(pageTitle: string): Promise<WikipediaImageResult | null> {
    try {
      const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.thumbnail?.source) {
        return {
          url: data.thumbnail.source.replace(/\/\d+px-/, '/400px-'), // Get higher resolution
          title: data.title,
          width: data.thumbnail.width || 400,
          height: data.thumbnail.height || 400,
          source: 'wikipedia'
        };
      }

      return null;
    } catch (error) {
      throw new Error(`REST API failed: ${error}`);
    }
  }

  /**
   * Get image using Wikipedia thumbnail API
   */
  private async getPageImageFromThumbnail(pageTitle: string): Promise<WikipediaImageResult | null> {
    try {
      const thumbnailUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=thumbnail&pithumbsize=400&titles=${encodeURIComponent(pageTitle)}&origin=*`;
      
      const response = await fetch(thumbnailUrl);
      const data = await response.json();

      const pages = data.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];
        
        if (page.thumbnail?.source) {
          return {
            url: page.thumbnail.source,
            title: pageTitle,
            width: page.thumbnail.width || 400,
            height: page.thumbnail.height || 400,
            source: 'wikipedia'
          };
        }
      }

      return null;
    } catch (error) {
      throw new Error(`Thumbnail API failed: ${error}`);
    }
  }

  /**
   * Get image from page infobox
   */
  private async getPageImageFromInfobox(pageTitle: string): Promise<WikipediaImageResult | null> {
    try {
      const infoboxUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=images&titles=${encodeURIComponent(pageTitle)}&origin=*`;
      
      const response = await fetch(infoboxUrl);
      const data = await response.json();

      const pages = data.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];
        
        if (page.images?.length > 0) {
          // Look for the main image (usually the first non-icon image)
          for (const image of page.images) {
            const imageTitle = image.title;
            if (imageTitle && 
                !imageTitle.toLowerCase().includes('commons-logo') &&
                !imageTitle.toLowerCase().includes('edit-icon') &&
                (imageTitle.toLowerCase().includes('.jpg') || 
                 imageTitle.toLowerCase().includes('.jpeg') || 
                 imageTitle.toLowerCase().includes('.png'))) {
              
              // Get the actual image URL
              const imageUrl = await this.getImageUrl(imageTitle);
              if (imageUrl) {
                return {
                  url: imageUrl,
                  title: pageTitle,
                  width: 400,
                  height: 400,
                  source: 'wikipedia'
                };
              }
            }
          }
        }
      }

      return null;
    } catch (error) {
      throw new Error(`Infobox API failed: ${error}`);
    }
  }

  /**
   * Get direct image URL from image title
   */
  private async getImageUrl(imageTitle: string): Promise<string | null> {
    try {
      const imageInfoUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&iiurlwidth=400&titles=${encodeURIComponent(imageTitle)}&origin=*`;
      
      const response = await fetch(imageInfoUrl);
      const data = await response.json();

      const pages = data.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];
        
        return page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url || null;
      }

      return null;
    } catch (error) {
      console.warn('Image URL fetch failed:', error);
      return null;
    }
  }

  /**
   * Batch fetch images for multiple actors
   */
  async batchGetActorImages(actorNames: string[]): Promise<Map<string, WikipediaImageResult | null>> {
    console.log(`🔄 Batch fetching Wikipedia images for ${actorNames.length} actors...`);
    
    const results = new Map<string, WikipediaImageResult | null>();
    const promises = actorNames.map(async (name) => {
      try {
        const image = await this.getActorImage(name);
        results.set(name, image);
      } catch (error) {
        console.warn(`Failed to fetch image for ${name}:`, error);
        results.set(name, null);
      }
    });

    await Promise.all(promises);
    
    const successCount = Array.from(results.values()).filter(img => img !== null).length;
    console.log(`✅ Successfully fetched ${successCount}/${actorNames.length} Wikipedia images`);
    
    return results;
  }

  /**
   * Generate fallback image URL using a deterministic pattern
   */
  generateFallbackImage(actorName: string): string {
    // Create a consistent hash-based fallback
    const hash = this.simpleHash(actorName);
    const photoId = Math.abs(hash) % 1000 + 1500000000000; // Range of photo IDs
    return `https://images.unsplash.com/photo-${photoId}?w=400&h=400&fit=crop&crop=face&auto=format&q=80`;
  }

  /**
   * Simple hash function for consistent fallbacks
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Wikipedia image cache cleared');
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; hits: number; misses: number } {
    return {
      size: this.cache.size,
      hits: Array.from(this.cache.values()).filter(v => v !== null).length,
      misses: Array.from(this.cache.values()).filter(v => v === null).length
    };
  }
}

// Export singleton instance
export const wikipediaImageService = new WikipediaImageService();
export default WikipediaImageService;
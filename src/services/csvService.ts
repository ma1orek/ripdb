import Papa from 'papaparse';

export interface DeathRecord {
  actor_name: string;
  movie_title: string;
  character_name: string;
  year: string;
  director: string;
  genre: string;
  death_description: string;
  death_type: string;
  imdb_rating: string;
  budget: string;
  box_office: string;
}

export interface Actor {
  id: string;
  name: string;
  headshot: string;
  bio: string;
  birthDate: string;
  deathCount: number;
  deaths: DeathEvent[];
  totalBoxOffice?: string;
  awardsCount?: number;
}

export interface DeathEvent {
  id: string;
  movieTitle: string;
  character: string;
  releaseDate: string;
  director: string;
  plotSummary: string;
  posterUrl: string;
  deathDescription: string;
  deathType: string;
  imdbRating?: number;
  genre: string;
  budget?: string;
  boxOffice?: string;
}

export interface Stats {
  totalDeaths: number;
  totalActors: number;
  totalMovies: number;
  topGenres: { genre: string; count: number }[];
}

export interface ProcessedData {
  actors: Record<string, Actor>;
  stats: Stats;
}

const getWikipediaImage = async (query: string, type: 'actor' | 'movie'): Promise<string> => {
  try {
    const searchQuery = encodeURIComponent(query);
    const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&format=json&origin=*`);
    const data = await response.json();
    
    if (data.query.search.length > 0) {
      const pageId = data.query.search[0].pageid;
      const imageResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=query&pageids=${pageId}&prop=pageimages&format=json&pithumbsize=300&origin=*`);
      const imageData = await imageResponse.json();
      
      const page = imageData.query.pages[pageId];
      if (page.thumbnail) {
        return page.thumbnail.source;
      }
    }
  } catch (error) {
    console.error('Error fetching Wikipedia image:', error);
  }
  
  // Fallback to a placeholder image
  return `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2, 9)}?w=400&h=400&fit=crop&crop=face`;
};

export const loadCSVData = async (): Promise<ProcessedData> => {
  try {
    const response = await fetch('/Cinemorgue.csv');
    const csvText = await response.text();
    
    const { data } = Papa.parse<DeathRecord>(csvText, {
      header: true,
      skipEmptyLines: true
    });
    
    const actors: Record<string, Actor> = {};
    const genreCounts: Record<string, number> = {};
    
    // Process each record
    for (const record of data) {
      const actorId = record.actor_name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      // Initialize actor if not exists
      if (!actors[actorId]) {
        const actorDeaths = data.filter((r: DeathRecord) => r.actor_name === record.actor_name);
        
        actors[actorId] = {
          id: actorId,
          name: record.actor_name,
          headshot: await getWikipediaImage(record.actor_name, 'actor'),
          bio: `Renowned actor known for memorable performances and dramatic death scenes across ${actorDeaths.length} different productions.`,
          birthDate: "1970-01-01", // Would need additional data source for real birth dates
          deathCount: 0,
          deaths: [],
          totalBoxOffice: undefined,
          awardsCount: undefined
        };
      }
      
      // Create death event
      const deathEvent: DeathEvent = {
        id: `${record.movie_title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${record.year}`,
        movieTitle: record.movie_title,
        character: record.character_name,
        releaseDate: `${record.year}-01-01`,
        director: record.director,
        plotSummary: `A ${record.genre.toLowerCase()} film featuring ${record.character_name} in a memorable role.`,
        posterUrl: await getWikipediaImage(record.movie_title, 'movie'),
        deathDescription: record.death_description,
        deathType: record.death_type || 'violent',
        imdbRating: record.imdb_rating ? parseFloat(record.imdb_rating) : undefined,
        genre: record.genre,
        budget: record.budget,
        boxOffice: record.box_office
      };
      
      // Avoid duplicate deaths for the same movie
      const existingDeath = actors[actorId].deaths.find(d => d.movieTitle === record.movie_title);
      if (!existingDeath) {
        actors[actorId].deaths.push(deathEvent);
      }
      
      // Count genres
      genreCounts[record.genre] = (genreCounts[record.genre] || 0) + 1;
    }
    
    // Calculate stats
    const stats: Stats = {
      totalDeaths: data.length,
      totalActors: Object.keys(actors).length,
      totalMovies: new Set(data.map((r: DeathRecord) => r.movie_title)).size,
      topGenres: Object.entries(genreCounts)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    };
    
    // Calculate additional actor stats
    Object.values(actors).forEach(actor => {
      actor.deathCount = actor.deaths.length;
      
      // Calculate total box office
      const boxOfficeNumbers = actor.deaths
        .map(d => d.boxOffice)
        .filter((b): b is string => b !== undefined && b.includes('$'))
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
    
    return { actors, stats };
  } catch (error) {
    console.error('Error loading CSV data:', error);
    throw error;
  }
}; 
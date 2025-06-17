export interface DeathEvent {
  id: string;
  movieTitle: string;
  character: string;
  releaseDate: string;
  director: string;
  plotSummary: string;
  posterUrl: string;
  deathDescription: string;
  deathType: 'violent' | 'heroic' | 'tragic' | 'comedic' | 'supernatural';
  timestamp?: string;
  imdbRating?: number;
  genre: string;
  budget?: string;
  boxOffice?: string;
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

// Enhanced mock data with multiple actors
export const mockActors: Record<string, Actor> = {
  'sean-bean': {
    id: "sean-bean",
    name: "Sean Bean",
    headshot: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    bio: "English actor known for his distinctive Yorkshire accent and his legendary tendency to play characters who meet tragic ends on screen. A master of dramatic death scenes.",
    birthDate: "1959-04-17",
    deathCount: 25,
    totalBoxOffice: "$4.2B",
    awardsCount: 12,
    deaths: [
      {
        id: "goldeneye-1995",
        movieTitle: "GoldenEye",
        character: "Alec Trevelyan / 006",
        releaseDate: "1995-11-17",
        director: "Martin Campbell",
        plotSummary: "James Bond teams up with a lone survivor of a destroyed Russian research center to stop the use of a deadly satellite weapon against London.",
        posterUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=450&fit=crop",
        deathDescription: "Falls from satellite dish after being shot by Bond",
        deathType: "violent",
        imdbRating: 7.2,
        genre: "Action, Adventure, Thriller",
        budget: "$60M",
        boxOffice: "$352.1M"
      },
      {
        id: "lotr-fellowship-2001",
        movieTitle: "The Lord of the Rings: The Fellowship of the Ring",
        character: "Boromir",
        releaseDate: "2001-12-19",
        director: "Peter Jackson",
        plotSummary: "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.",
        posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop",
        deathDescription: "Shot with multiple arrows while defending Merry and Pippin from Uruk-hai",
        deathType: "heroic",
        imdbRating: 8.8,
        genre: "Adventure, Drama, Fantasy",
        budget: "$93M",
        boxOffice: "$871.5M"
      },
      {
        id: "game-of-thrones-2011",
        movieTitle: "Game of Thrones",
        character: "Ned Stark",
        releaseDate: "2011-04-17",
        director: "David Benioff, D.B. Weiss",
        plotSummary: "Nine noble families fight for control over the mythical lands of Westeros, while an ancient enemy returns after being dormant for millennia.",
        posterUrl: "https://images.unsplash.com/photo-1462275646874-78d0027c7f8b?w=300&h=450&fit=crop",
        deathDescription: "Beheaded by executioner on King Joffrey's orders",
        deathType: "tragic",
        imdbRating: 9.2,
        genre: "Action, Adventure, Drama",
        budget: "TV Series",
        boxOffice: "N/A"
      },
      {
        id: "patriot-games-1992",
        movieTitle: "Patriot Games",
        character: "Sean Miller",
        releaseDate: "1992-06-05",
        director: "Phillip Noyce",
        plotSummary: "When CIA analyst Jack Ryan interferes with an IRA assassination, he becomes a target himself and must protect his family from revenge.",
        posterUrl: "https://images.unsplash.com/photo-1486095754230-db8b5b60bb9c?w=300&h=450&fit=crop",
        deathDescription: "Impaled on boat anchor during final fight with Jack Ryan",
        deathType: "violent",
        imdbRating: 6.5,
        genre: "Action, Crime, Drama",
        budget: "$45M",
        boxOffice: "$178.1M"
      }
    ]
  },
  'john-hurt': {
    id: "john-hurt",
    name: "John Hurt",
    headshot: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    bio: "Legendary British actor known for his distinctive voice and memorable death scenes across decades of cinema, from horror classics to epic dramas.",
    birthDate: "1940-01-22",
    deathCount: 18,
    totalBoxOffice: "$3.8B",
    awardsCount: 15,
    deaths: [
      {
        id: "alien-1979",
        movieTitle: "Alien",
        character: "Kane",
        releaseDate: "1979-05-25",
        director: "Ridley Scott",
        plotSummary: "After a space merchant vessel receives an unknown transmission as a distress call, one of the crew is attacked by a mysterious life form.",
        posterUrl: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=300&h=450&fit=crop",
        deathDescription: "Alien chestburster erupts from his chest during dinner",
        deathType: "supernatural",
        imdbRating: 8.4,
        genre: "Horror, Sci-Fi",
        budget: "$11M",
        boxOffice: "$104.9M"
      },
      {
        id: "v-for-vendetta-2005",
        movieTitle: "V for Vendetta",
        character: "High Chancellor Sutler",
        releaseDate: "2005-12-11",
        director: "James McTeigue",
        plotSummary: "In a future British tyranny, a shadowy freedom fighter plots to overthrow it with the help of a young woman.",
        posterUrl: "https://images.unsplash.com/photo-1489599088243-6d631c6a5ad4?w=300&h=450&fit=crop",
        deathDescription: "Shot by his own men during revolution",
        deathType: "violent",
        imdbRating: 8.2,
        genre: "Action, Drama, Sci-Fi",
        budget: "$54M",
        boxOffice: "$132.5M"
      }
    ]
  },
  'danny-trejo': {
    id: "danny-trejo",
    name: "Danny Trejo",
    headshot: "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=400&fit=crop&crop=face",
    bio: "Iconic character actor known for playing tough guys and villains, with an impressive collection of memorable death scenes across action films.",
    birthDate: "1944-05-16",
    deathCount: 22,
    totalBoxOffice: "$2.1B",
    awardsCount: 8,
    deaths: [
      {
        id: "machete-2010",
        movieTitle: "Machete",
        character: "Machete Cortez",
        releaseDate: "2010-09-03",
        director: "Robert Rodriguez",
        plotSummary: "After being set-up and betrayed by the man who hired him to assassinate a Texas Senator, an ex-Federale launches a brutal rampage of revenge.",
        posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop",
        deathDescription: "Survives multiple attempts but dies in sequel",
        deathType: "violent",
        imdbRating: 6.6,
        genre: "Action, Crime, Thriller",
        budget: "$10.5M",
        boxOffice: "$44.1M"
      }
    ]
  },
  'christopher-lee': {
    id: "christopher-lee",
    name: "Christopher Lee",
    headshot: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face",
    bio: "Legendary British actor famous for his portrayals of villains and monsters, particularly Count Dracula, with numerous iconic death scenes.",
    birthDate: "1922-05-27",
    deathCount: 19,
    totalBoxOffice: "$5.2B",
    awardsCount: 24,
    deaths: [
      {
        id: "lotr-two-towers-2002",
        movieTitle: "The Lord of the Rings: The Two Towers",
        character: "Saruman the White",
        releaseDate: "2002-12-18",
        director: "Peter Jackson",
        plotSummary: "While Frodo and Sam edge closer to Mordor with the help of the shifty Gollum, the divided fellowship makes a stand against Sauron's new ally, Saruman.",
        posterUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop",
        deathDescription: "Stabbed by Grima Wormtongue, then falls from Orthanc tower",
        deathType: "tragic",
        imdbRating: 8.7,
        genre: "Adventure, Drama, Fantasy",
        budget: "$94M",
        boxOffice: "$926M"
      }
    ]
  }
};

// Enhanced search results for autocomplete
export const mockSearchResults = [
  {
    id: "sean-bean",
    name: "Sean Bean",
    headshot: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    deathCount: 25,
    recentDeath: "Game of Thrones (2011)"
  },
  {
    id: "john-hurt",
    name: "John Hurt", 
    headshot: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    deathCount: 18,
    recentDeath: "V for Vendetta (2005)"
  },
  {
    id: "christopher-lee",
    name: "Christopher Lee",
    headshot: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face", 
    deathCount: 19,
    recentDeath: "The Hobbit (2014)"
  },
  {
    id: "danny-trejo",
    name: "Danny Trejo",
    headshot: "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=100&h=100&fit=crop&crop=face",
    deathCount: 22,
    recentDeath: "Machete Kills (2013)"
  },
  {
    id: "gary-oldman",
    name: "Gary Oldman",
    headshot: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face",
    deathCount: 15,
    recentDeath: "The Dark Knight (2008)"
  },
  {
    id: "alan-rickman",
    name: "Alan Rickman",
    headshot: "https://images.unsplash.com/photo-1493106819501-66d381c466f1?w=100&h=100&fit=crop&crop=face",
    deathCount: 12,
    recentDeath: "Harry Potter (2011)"
  }
];

// For Google Sheets integration structure
export interface GoogleSheetsDeathRecord {
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
}

// Function to convert Google Sheets data to our format
export function convertGoogleSheetsData(records: GoogleSheetsDeathRecord[]): Record<string, Actor> {
  const actors: Record<string, Actor> = {};
  
  records.forEach(record => {
    const actorId = record.actor_name.toLowerCase().replace(/\s+/g, '-');
    
    if (!actors[actorId]) {
      actors[actorId] = {
        id: actorId,
        name: record.actor_name,
        headshot: `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2, 9)}?w=400&h=400&fit=crop&crop=face`,
        bio: `Actor known for memorable performances and death scenes.`,
        birthDate: "1970-01-01", // Would need additional data
        deathCount: 0,
        deaths: []
      };
    }
    
    actors[actorId].deaths.push({
      id: `${record.movie_title.toLowerCase().replace(/\s+/g, '-')}-${record.year}`,
      movieTitle: record.movie_title,
      character: record.character_name,
      releaseDate: `${record.year}-01-01`,
      director: record.director,
      plotSummary: `A ${record.genre.toLowerCase()} film featuring ${record.character_name}.`,
      posterUrl: record.poster_url || `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2, 9)}?w=300&h=450&fit=crop`,
      deathDescription: record.death_description,
      deathType: record.death_type as any,
      imdbRating: record.imdb_rating,
      genre: record.genre
    });
    
    actors[actorId].deathCount = actors[actorId].deaths.length;
  });
  
  return actors;
}
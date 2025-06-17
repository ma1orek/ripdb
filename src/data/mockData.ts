// Mock data for RIPDB - Enhanced with more realistic entries
export interface DeathEvent {
  id: string;
  movieTitle: string;
  character: string;
  releaseDate: string;
  director: string;
  plotSummary: string;
  posterUrl: string;
  deathDescription: string;
  deathType: 'violent' | 'heroic' | 'tragic' | 'comedic' | 'supernatural' | 'explosive' | 'survivor';
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

// Enhanced mock data with more actors and realistic death records
export const mockActors: Record<string, Actor> = {
  'sean-bean': {
    id: 'sean-bean',
    name: 'Sean Bean',
    headshot: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    bio: 'Sean Bean is an English actor known for his distinctive Sheffield accent and his tendency to die on screen. With over 30 on-screen deaths, he has become a cultural phenomenon and internet meme.',
    birthDate: '1959-04-17',
    deathCount: 8,
    totalBoxOffice: '$2.3B',
    awardsCount: 12,
    deaths: [
      {
        id: 'goldeneye-1995',
        movieTitle: 'GoldenEye',
        character: 'Alec Trevelyan',
        releaseDate: '1995-11-17',
        director: 'Martin Campbell',
        plotSummary: 'A former MI6 agent turned rogue seeks revenge against Britain using a stolen satellite weapon system.',
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop',
        deathDescription: 'Falls from the Arecibo satellite dish after being shot by James Bond',
        deathType: 'violent',
        imdbRating: 7.2,
        genre: 'Action, Adventure, Thriller',
        budget: '$60M',
        boxOffice: '$352.1M'
      },
      {
        id: 'lotr-fellowship-2001',
        movieTitle: 'The Lord of the Rings: The Fellowship of the Ring',
        character: 'Boromir',
        releaseDate: '2001-12-19',
        director: 'Peter Jackson',
        plotSummary: 'A fellowship is formed to destroy the One Ring and defeat the Dark Lord Sauron.',
        posterUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop',
        deathDescription: 'Shot with multiple arrows by Uruk-hai while defending Merry and Pippin',
        deathType: 'heroic',
        imdbRating: 8.8,
        genre: 'Adventure, Drama, Fantasy',
        budget: '$93M',
        boxOffice: '$871.5M'
      },
      {
        id: 'patriot-games-1992',
        movieTitle: 'Patriot Games',
        character: 'Sean Miller',
        releaseDate: '1992-06-05',
        director: 'Phillip Noyce',
        plotSummary: 'An ex-CIA analyst is stalked by a vengeful IRA terrorist after foiling an assassination attempt.',
        posterUrl: 'https://images.unsplash.com/photo-1489599162406-83c2e0e0bfb9?w=300&h=450&fit=crop',
        deathDescription: 'Killed in a boat explosion during the final confrontation',
        deathType: 'explosive',
        imdbRating: 6.9,
        genre: 'Action, Drama, Thriller',
        budget: '$45M',
        boxOffice: '$178.1M'
      },
      {
        id: 'equilibrium-2002',
        movieTitle: 'Equilibrium',
        character: 'Partridge',
        releaseDate: '2002-12-06',
        director: 'Kurt Wimmer',
        plotSummary: 'In a dystopian future, a cleric who enforces the law against emotion begins to feel.',
        posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop',
        deathDescription: 'Shot by his partner Preston after being discovered reading poetry',
        deathType: 'tragic',
        imdbRating: 7.3,
        genre: 'Action, Drama, Sci-Fi',
        budget: '$20M',
        boxOffice: '$5.3M'
      },
      {
        id: 'national-treasure-2004',
        movieTitle: 'National Treasure',
        character: 'Ian Howe',
        releaseDate: '2004-11-19',
        director: 'Jon Turteltaub',
        plotSummary: 'A historian races to find the legendary Templar Treasure before a team of mercenaries.',
        posterUrl: 'https://images.unsplash.com/photo-1551731409-43eb3e517a1a?w=300&h=450&fit=crop',
        deathDescription: 'Trapped underground as the treasure chamber floods',
        deathType: 'tragic',
        imdbRating: 6.9,
        genre: 'Action, Adventure, Mystery',
        budget: '$100M',
        boxOffice: '$347.5M'
      },
      {
        id: 'the-island-2005',
        movieTitle: 'The Island',
        character: 'Bernard Merrick',
        releaseDate: '2005-07-22',
        director: 'Michael Bay',
        plotSummary: 'Clones discover they are harvested for organs and attempt to escape their facility.',
        posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop',
        deathDescription: 'Crushed by falling debris during the facility collapse',
        deathType: 'violent',
        imdbRating: 6.8,
        genre: 'Action, Sci-Fi, Thriller',
        budget: '$126M',
        boxOffice: '$162.9M'
      },
      {
        id: 'troy-2004',
        movieTitle: 'Troy',
        character: 'Odysseus',
        releaseDate: '2004-05-14',
        director: 'Wolfgang Petersen',
        plotSummary: 'An adaptation of Homer\'s epic about the Trojan War.',
        posterUrl: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=300&h=450&fit=crop',
        deathDescription: 'Actually survives - rare Sean Bean survival!',
        deathType: 'survivor',
        imdbRating: 7.3,
        genre: 'Action, Drama, Romance',
        budget: '$175M',
        boxOffice: '$497.4M'
      },
      {
        id: 'silent-hill-2006',
        movieTitle: 'Silent Hill',
        character: 'Christopher Da Silva',
        releaseDate: '2006-04-21',
        director: 'Christophe Gans',
        plotSummary: 'A mother searches for her adopted daughter in the mysterious town of Silent Hill.',
        posterUrl: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=300&h=450&fit=crop',
        deathDescription: 'Remains trapped in the alternate dimension',
        deathType: 'supernatural',
        imdbRating: 6.5,
        genre: 'Horror, Mystery, Thriller',
        budget: '$50M',
        box_office: '$97.6M'
      }
    ]
  },
  'john-hurt': {
    id: 'john-hurt',
    name: 'John Hurt',
    headshot: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    bio: 'Sir John Hurt was an English actor known for his distinctive voice and memorable death scenes. His chestburster scene in Alien is one of cinema\'s most iconic death moments.',
    birthDate: '1940-01-22',
    deathCount: 6,
    totalBoxOffice: '$1.8B',
    awardsCount: 18,
    deaths: [
      {
        id: 'alien-1979',
        movieTitle: 'Alien',
        character: 'Kane',
        releaseDate: '1979-05-25',
        director: 'Ridley Scott',
        plotSummary: 'The crew of a commercial space tug encounters a deadly alien organism.',
        posterUrl: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=300&h=450&fit=crop',
        deathDescription: 'An alien chestburster violently erupts from his chest during dinner',
        deathType: 'supernatural',
        imdbRating: 8.4,
        genre: 'Horror, Sci-Fi',
        budget: '$11M',
        boxOffice: '$104.9M'
      },
      {
        id: 'v-for-vendetta-2005',
        movieTitle: 'V for Vendetta',
        character: 'Chancellor Sutler',
        releaseDate: '2005-12-11',
        director: 'James McTeigue',
        plotSummary: 'A masked vigilante fights against a totalitarian regime in a dystopian Britain.',
        posterUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=300&h=450&fit=crop',
        deathDescription: 'Shot by Creedy after being overthrown by his own regime',
        deathType: 'violent',
        imdbRating: 8.2,
        genre: 'Action, Drama, Sci-Fi',
        budget: '$54M',
        boxOffice: '$132.5M'
      },
      {
        id: '1984-1984',
        movieTitle: '1984',
        character: 'Winston Smith',
        releaseDate: '1984-10-10',
        director: 'Michael Radford',
        plotSummary: 'In a totalitarian future, a man struggles to preserve his humanity.',
        posterUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=450&fit=crop',
        deathDescription: 'Psychologically destroyed by Room 101 torture (spiritual death)',
        deathType: 'tragic',
        imdbRating: 7.1,
        genre: 'Drama, Romance, Sci-Fi',
        budget: '$3M',
        boxOffice: '$8.4M'
      },
      {
        id: 'a-man-for-all-seasons-1966',
        movieTitle: 'A Man for All Seasons',
        character: 'Richard Rich',
        releaseDate: '1966-12-12',
        director: 'Fred Zinnemann',
        plotSummary: 'The story of Thomas More and his conflict with King Henry VIII.',
        posterUrl: 'https://images.unsplash.com/photo-1594736797933-d0b71de9c883?w=300&h=450&fit=crop',
        deathDescription: 'Survives but loses his moral integrity - a different kind of death',
        deathType: 'tragic',
        imdbRating: 7.7,
        genre: 'Biography, Drama, History',
        budget: '$2M',
        boxOffice: '$28.4M'
      },
      {
        id: 'the-elephant-man-1980',
        movieTitle: 'The Elephant Man',
        character: 'John Merrick',
        releaseDate: '1980-10-03',
        director: 'David Lynch',
        plotSummary: 'The true story of the severely deformed Joseph Merrick.',
        posterUrl: 'https://images.unsplash.com/photo-1489599162406-83c2e0e0bfb9?w=300&h=450&fit=crop',
        deathDescription: 'Dies peacefully in his sleep from a dislocated neck',
        deathType: 'tragic',
        imdbRating: 8.1,
        genre: 'Biography, Drama',
        budget: '$5M',
        boxOffice: '$26M'
      },
      {
        id: 'harry-potter-sorcerers-stone-2001',
        movieTitle: 'Harry Potter and the Philosopher\'s Stone',
        character: 'Mr. Ollivander',
        releaseDate: '2001-11-16',
        director: 'Chris Columbus',
        plotSummary: 'A young wizard begins his magical education at Hogwarts.',
        posterUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop',
        deathDescription: 'Survives the series (rare survival for John Hurt!)',
        deathType: 'survivor',
        imdbRating: 7.6,
        genre: 'Adventure, Family, Fantasy',
        budget: '$125M',
        boxOffice: '$974.8M'
      }
    ]
  },
  'danny-trejo': {
    id: 'danny-trejo',
    name: 'Danny Trejo',
    headshot: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    bio: 'Danny Trejo is an American actor known for his distinctive tough-guy appearance. Ironically, despite playing numerous villains, he often dies dramatically on screen.',
    birthDate: '1944-05-16',
    deathCount: 12,
    totalBoxOffice: '$895M',
    awardsCount: 7,
    deaths: [
      {
        id: 'heat-1995',
        movieTitle: 'Heat',
        character: 'Trejo',
        releaseDate: '1995-12-15',
        director: 'Michael Mann',
        plotSummary: 'A group of professional bank robbers clash with an obsessive LAPD detective.',
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop',
        deathDescription: 'Shot by police during the failed armored car robbery',
        deathType: 'violent',
        imdbRating: 8.3,
        genre: 'Action, Crime, Drama',
        budget: '$60M',
        boxOffice: '$187.4M'
      },
      {
        id: 'con-air-1997',
        movieTitle: 'Con Air',
        character: 'Johnny 23',
        releaseDate: '1997-06-06',
        director: 'Simon West',
        plotSummary: 'Newly paroled ex-con gets caught up in a prisoner transport hijacking.',
        posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop',
        deathDescription: 'Killed in the plane crash during the final chase sequence',
        deathType: 'explosive',
        imdbRating: 6.9,
        genre: 'Action, Crime, Thriller',
        budget: '$75M',
        boxOffice: '$224.0M'
      },
      {
        id: 'desperado-1995',
        movieTitle: 'Desperado',
        character: 'Navajas',
        releaseDate: '1995-08-25',
        director: 'Robert Rodriguez',
        plotSummary: 'A gunslinger seeks revenge against the crime lord who killed his lover.',
        posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop',
        deathDescription: 'Shot during the bar shootout with El Mariachi',
        deathType: 'violent',
        imdbRating: 7.1,
        genre: 'Action, Crime, Thriller',
        budget: '$7M',
        boxOffice: '$25.9M'
      },
      {
        id: 'machete-2010',
        movieTitle: 'Machete',
        character: 'Machete Cortez',
        releaseDate: '2010-09-03',
        director: 'Robert Rodriguez',
        plotSummary: 'An ex-Federale seeks revenge against those who betrayed him.',
        posterUrl: 'https://images.unsplash.com/photo-1551731409-43eb3e517a1a?w=300&h=450&fit=crop',
        deathDescription: 'Actually survives and gets the girl - rare Trejo victory!',
        deathType: 'survivor',
        imdbRating: 6.6,
        genre: 'Action, Crime, Thriller',
        budget: '$10.5M',
        boxOffice: '$45.5M'
      },
      {
        id: 'breaking-bad-s4',
        movieTitle: 'Breaking Bad (TV Series)',
        character: 'Tortuga',
        releaseDate: '2009-03-08',
        director: 'Vince Gilligan',
        plotSummary: 'A chemistry teacher turned meth manufacturer navigates the drug trade.',
        posterUrl: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=300&h=450&fit=crop',
        deathDescription: 'Beheaded by cartel, head placed on explosive turtle',
        deathType: 'violent',
        imdbRating: 9.5,
        genre: 'Crime, Drama, Thriller',
        budget: 'TV Series',
        boxOffice: 'TV Series'
      }
    ]
  },
  'gary-oldman': {
    id: 'gary-oldman',
    name: 'Gary Oldman',
    headshot: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    bio: 'Gary Oldman is an English actor known for his versatility and intense method acting. He\'s portrayed memorable villains who often meet dramatic ends.',
    birthDate: '1958-03-21',
    deathCount: 7,
    totalBoxOffice: '$1.9B',
    awardsCount: 15,
    deaths: [
      {
        id: 'leon-the-professional-1994',
        movieTitle: 'The Professional',
        character: 'Norman Stansfield',
        releaseDate: '1994-09-14',
        director: 'Luc Besson',
        plotSummary: 'A professional assassin reluctantly takes in a young girl after her family is murdered.',
        posterUrl: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=300&h=450&fit=crop',
        deathDescription: 'Killed by Léon\'s bomb vest in the apartment building',
        deathType: 'explosive',
        imdbRating: 8.5,
        genre: 'Action, Crime, Drama',
        budget: '$16M',
        boxOffice: '$19.5M'
      },
      {
        id: 'air-force-one-1997',
        movieTitle: 'Air Force One',
        character: 'Ivan Korshunov',
        releaseDate: '1997-07-25',
        director: 'Wolfgang Petersen',
        plotSummary: 'Communist radicals hijack Air Force One with the President and his family aboard.',
        posterUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=300&h=450&fit=crop',
        deathDescription: 'Falls from Air Force One without a parachute after being kicked out',
        deathType: 'violent',
        imdbRating: 6.5,
        genre: 'Action, Drama, Thriller',
        budget: '$85M',
        boxOffice: '$315.2M'
      },
      {
        id: 'true-romance-1993',
        movieTitle: 'True Romance',
        character: 'Drexl Spivey',
        releaseDate: '1993-09-10',
        director: 'Tony Scott',
        plotSummary: 'A young couple steals a suitcase of mob money and flees to Los Angeles.',
        posterUrl: 'https://images.unsplash.com/photo-1489599162406-83c2e0e0bfb9?w=300&h=450&fit=crop',
        deathDescription: 'Shot by Clarence during the confrontation over Alabama',
        deathType: 'violent',
        imdbRating: 7.9,
        genre: 'Action, Crime, Romance',
        budget: '$12.5M',
        boxOffice: '$12.3M'
      },
      {
        id: 'batman-begins-2005',
        movieTitle: 'Batman Begins',
        character: 'James Gordon',
        releaseDate: '2005-06-15',
        director: 'Christopher Nolan',
        plotSummary: 'After witnessing his parents\' death, Bruce Wayne trains to fight injustice as Batman.',
        posterUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=450&fit=crop',
        deathDescription: 'Survives - rare Gary Oldman survival as a good guy!',
        deathType: 'survivor',
        imdbRating: 8.2,
        genre: 'Action, Adventure, Crime',
        budget: '$150M',
        boxOffice: '$374.2M'
      }
    ]
  },
  'samuel-l-jackson': {
    id: 'samuel-l-jackson',
    name: 'Samuel L. Jackson',
    headshot: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    bio: 'Samuel L. Jackson is an American actor with over 150 film credits. Known for his distinctive voice and memorable death scenes, particularly in Quentin Tarantino films.',
    birthDate: '1948-12-21',
    deathCount: 9,
    totalBoxOffice: '$4.7B',
    awardsCount: 23,
    deaths: [
      {
        id: 'pulp-fiction-1994',
        movieTitle: 'Pulp Fiction',
        character: 'Jules Winnfield',
        releaseDate: '1994-10-14',
        director: 'Quentin Tarantino',
        plotSummary: 'The lives of two mob hitmen, a boxer, and others intertwine in Los Angeles.',
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop',
        deathDescription: 'Actually retires from crime (survives the film)',
        deathType: 'survivor',
        imdbRating: 8.9,
        genre: 'Crime, Drama',
        budget: '$8.5M',
        boxOffice: '$214.2M'
      },
      {
        id: 'snakes-on-a-plane-2006',
        movieTitle: 'Snakes on a Plane',
        character: 'Neville Flynn',
        releaseDate: '2006-08-18',
        director: 'David R. Ellis',
        plotSummary: 'An FBI agent must protect a witness from assassins and venomous snakes on a plane.',
        posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop',
        deathDescription: 'Survives the snake attack and lands the plane safely',
        deathType: 'survivor',
        imdbRating: 5.4,
        genre: 'Action, Adventure, Crime',
        budget: '$33M',
        boxOffice: '$62.0M'
      },
      {
        id: 'deep-blue-sea-1999',
        movieTitle: 'Deep Blue Sea',
        character: 'Russell Franklin',
        releaseDate: '1999-07-26',
        director: 'Renny Harlin',
        plotSummary: 'Scientists at an underwater facility are stalked by genetically enhanced sharks.',
        posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop',
        deathDescription: 'Grabbed and eaten by a super-intelligent shark mid-speech',
        deathType: 'violent',
        imdbRating: 5.9,
        genre: 'Action, Horror, Sci-Fi',
        budget: '$60M',
        boxOffice: '$164.6M'
      },
      {
        id: 'jackie-brown-1997',
        movieTitle: 'Jackie Brown',
        character: 'Ordell Robbie',
        releaseDate: '1997-12-25',
        director: 'Quentin Tarantino',
        plotSummary: 'A flight attendant with a criminal past is caught smuggling money.',
        posterUrl: 'https://images.unsplash.com/photo-1551731409-43eb3e517a1a?w=300&h=450&fit=crop',
        deathDescription: 'Shot by Jackie Brown in self-defense',
        deathType: 'violent',
        imdbRating: 7.5,
        genre: 'Crime, Drama, Thriller',
        budget: '$12M',
        boxOffice: '$74.7M'
      }
    ]
  }
};

// Additional utility data
export const mockStats = {
  totalActors: Object.keys(mockActors).length,
  totalDeaths: Object.values(mockActors).reduce((sum, actor) => sum + actor.deathCount, 0),
  totalMovies: new Set(Object.values(mockActors).flatMap(actor => actor.deaths.map(d => d.movieTitle))).size,
  topGenres: [
    { genre: 'Action', count: 28 },
    { genre: 'Drama', count: 21 },
    { genre: 'Thriller', count: 15 },
    { genre: 'Crime', count: 12 },
    { genre: 'Sci-Fi', count: 8 }
  ]
};

export default mockActors;
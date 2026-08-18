/**
 * ASTRA OS — Public APIs Master Catalog & Discovery Engine
 * Derived from public-apis index
 */

export const PUBLIC_API_CATEGORIES = [
  'All',
  'Artificial Intelligence & ML',
  'Science & Astronomy',
  'Development & Programming',
  'Finance & Currency',
  'Geocoding & Maps',
  'Weather & Environment',
  'Security & Privacy',
  'Data & Open Intelligence',
  'Entertainment & Media',
  'Transportation & Logistics'
];

export const PUBLIC_APIS_DATABASE = [
  // 1. Artificial Intelligence & Machine Learning
  {
    name: 'Hugging Face Inference',
    description: 'Run inference on thousands of open-source AI and transformer models',
    auth: 'apiKey',
    https: true,
    cors: true,
    category: 'Artificial Intelligence & ML',
    url: 'https://huggingface.co/docs/api-inference/index'
  },
  {
    name: 'OpenAI Public API',
    description: 'GPT-4o, DALL-E 3, Whisper, and Embeddings API',
    auth: 'apiKey',
    https: true,
    cors: true,
    category: 'Artificial Intelligence & ML',
    url: 'https://platform.openai.com/docs'
  },
  {
    name: 'Replicate',
    description: 'Run open-source machine learning models in the cloud with an API',
    auth: 'apiKey',
    https: true,
    cors: true,
    category: 'Artificial Intelligence & ML',
    url: 'https://replicate.com/docs'
  },
  {
    name: 'Cohere AI',
    description: 'NLP models for text generation, embeddings, and classification',
    auth: 'apiKey',
    https: true,
    cors: true,
    category: 'Artificial Intelligence & ML',
    url: 'https://docs.cohere.com'
  },
  {
    name: 'Wit.ai',
    description: 'Natural Language Processing for IoT and smart voice devices',
    auth: 'apiKey',
    https: true,
    cors: true,
    category: 'Artificial Intelligence & ML',
    url: 'https://wit.ai'
  },

  // 2. Science & Astronomy
  {
    name: 'NASA Open APIs',
    description: 'NASA imagery, Mars Rover photos, Astronomy Picture of the Day (APOD), and Asteroid data',
    auth: 'apiKey',
    https: true,
    cors: true,
    category: 'Science & Astronomy',
    url: 'https://api.nasa.gov'
  },
  {
    name: 'SpaceX API',
    description: 'REST API for launch data, rockets, capsules, and orbital telemetry',
    auth: 'No',
    https: true,
    cors: true,
    category: 'Science & Astronomy',
    url: 'https://github.com/r-spacex/SpaceX-API'
  },
  {
    name: 'USGS Earthquake Hazards',
    description: 'Real-time global seismic and earthquake monitoring data feeds',
    auth: 'No',
    https: true,
    cors: true,
    category: 'Science & Astronomy',
    url: 'https://earthquake.usgs.gov/fdsnws/event/1/'
  },
  {
    name: 'Open Science Framework',
    description: 'Open access scholarly scientific research and datasets',
    auth: 'OAuth',
    https: true,
    cors: true,
    category: 'Science & Astronomy',
    url: 'https://developer.osf.io'
  },

  // 3. Development & Programming
  {
    name: 'GitHub REST & GraphQL API',
    description: 'Repositories, issues, automated pull requests, commits, and workflows',
    auth: 'OAuth',
    https: true,
    cors: true,
    category: 'Development & Programming',
    url: 'https://docs.github.com/rest'
  },
  {
    name: 'GitLab API',
    description: 'Complete DevOps lifecycle and repository management API',
    auth: 'OAuth',
    https: true,
    cors: true,
    category: 'Development & Programming',
    url: 'https://docs.gitlab.com/ee/api/'
  },
  {
    name: 'StackExchange / StackOverflow',
    description: 'Programming Q&A queries, tags, and technical knowledge extraction',
    auth: 'OAuth',
    https: true,
    cors: true,
    category: 'Development & Programming',
    url: 'https://api.stackexchange.com'
  },
  {
    name: 'JSONPlaceholder',
    description: 'Free fake REST API for prototyping and frontend testing',
    auth: 'No',
    https: true,
    cors: true,
    category: 'Development & Programming',
    url: 'https://jsonplaceholder.typicode.com'
  },
  {
    name: 'Postman Echo',
    description: 'REST API endpoint for testing HTTP headers, payloads, and auth',
    auth: 'No',
    https: true,
    cors: true,
    category: 'Development & Programming',
    url: 'https://postman-echo.com'
  },

  // 4. Finance & Currency
  {
    name: 'CoinGecko API',
    description: 'Cryptocurrency market capitalization, ticker prices, volume, and history',
    auth: 'No',
    https: true,
    cors: true,
    category: 'Finance & Currency',
    url: 'https://www.coingecko.com/en/api'
  },
  {
    name: 'ExchangeRate-API',
    description: 'Reliable real-time and historical foreign exchange rates',
    auth: 'apiKey',
    https: true,
    cors: true,
    category: 'Finance & Currency',
    url: 'https://www.exchangerate-api.com'
  },
  {
    name: 'Alpha Vantage',
    description: 'Real-time and historical stock market, forex, and cryptocurrency APIs',
    auth: 'apiKey',
    https: true,
    cors: true,
    category: 'Finance & Currency',
    url: 'https://www.alphavantage.co'
  },
  {
    name: 'Stripe API',
    description: 'Online payment processing, subscriptions, and financial infrastructure',
    auth: 'apiKey',
    https: true,
    cors: false,
    category: 'Finance & Currency',
    url: 'https://stripe.com/docs/api'
  },

  // 5. Geocoding & Maps
  {
    name: 'OpenStreetMap Nominatim',
    description: 'Free global geocoding, reverse geocoding, and map address lookup',
    auth: 'No',
    https: true,
    cors: true,
    category: 'Geocoding & Maps',
    url: 'https://nominatim.openstreetmap.org'
  },
  {
    name: 'IP-API',
    description: 'Free IP geolocation and network ASN resolver (JSON/XML)',
    auth: 'No',
    https: true,
    cors: true,
    category: 'Geocoding & Maps',
    url: 'https://ip-api.com'
  },
  {
    name: 'REST Countries',
    description: 'Comprehensive country information (borders, currencies, flags, population)',
    auth: 'No',
    https: true,
    cors: true,
    category: 'Geocoding & Maps',
    url: 'https://restcountries.com'
  },
  {
    name: 'Mapbox API',
    description: 'Custom vector map tiles, spatial navigation, and routing',
    auth: 'apiKey',
    https: true,
    cors: true,
    category: 'Geocoding & Maps',
    url: 'https://docs.mapbox.com/api'
  },

  // 6. Weather & Environment
  {
    name: 'Open-Meteo',
    description: 'Free weather forecast API for non-commercial & commercial use, zero key required',
    auth: 'No',
    https: true,
    cors: true,
    category: 'Weather & Environment',
    url: 'https://open-meteo.com'
  },
  {
    name: 'OpenWeatherMap',
    description: 'Current weather, forecasts, nowcasts, and historical climate observations',
    auth: 'apiKey',
    https: true,
    cors: true,
    category: 'Weather & Environment',
    url: 'https://openweathermap.org/api'
  },
  {
    name: 'AirVisual / IQAir',
    description: 'Global air quality index (AQI) and pollution metrics',
    auth: 'apiKey',
    https: true,
    cors: true,
    category: 'Weather & Environment',
    url: 'https://www.iqair.com/air-pollution-data-api'
  },

  // 7. Security & Privacy
  {
    name: 'Have I Been Pwned',
    description: 'Check if an email or password has been compromised in a public data breach',
    auth: 'apiKey',
    https: true,
    cors: true,
    category: 'Security & Privacy',
    url: 'https://haveibeenpwned.com/API/v3'
  },
  {
    name: 'VirusTotal API',
    description: 'Analyze suspicious files, URLs, domains, and IP addresses for malware',
    auth: 'apiKey',
    https: true,
    cors: false,
    category: 'Security & Privacy',
    url: 'https://developers.virustotal.com'
  },
  {
    name: 'Shodan API',
    description: 'Search engine for Internet-connected devices, ports, and vulnerabilities',
    auth: 'apiKey',
    https: true,
    cors: true,
    category: 'Security & Privacy',
    url: 'https://developer.shodan.io'
  },

  // 8. Data & Open Intelligence
  {
    name: 'Wikipedia / MediaWiki API',
    description: 'Full-text encyclopedia articles, metadata, search, and page summaries',
    auth: 'No',
    https: true,
    cors: true,
    category: 'Data & Open Intelligence',
    url: 'https://en.wikipedia.org/w/api.php'
  },
  {
    name: 'Wikidata Query Service (SPARQL)',
    description: 'Structured knowledge base containing millions of linked entities',
    auth: 'No',
    https: true,
    cors: true,
    category: 'Data & Open Intelligence',
    url: 'https://query.wikidata.org'
  },
  {
    name: 'Internet Archive Open API',
    description: 'Access millions of archived books, movies, audio recordings, and web pages',
    auth: 'No',
    https: true,
    cors: true,
    category: 'Data & Open Intelligence',
    url: 'https://archive.org/help/aboutsearch.htm'
  },

  // 9. Entertainment & Media
  {
    name: 'Spotify Web API',
    description: 'Music catalog search, track metadata, user playlists, and audio playback',
    auth: 'OAuth',
    https: true,
    cors: true,
    category: 'Entertainment & Media',
    url: 'https://developer.spotify.com/documentation/web-api'
  },
  {
    name: 'YouTube Data API v3',
    description: 'Search videos, fetch channel statistics, playlists, and captions',
    auth: 'apiKey',
    https: true,
    cors: true,
    category: 'Entertainment & Media',
    url: 'https://developers.google.com/youtube/v3'
  },
  {
    name: 'TMDB (The Movie Database)',
    description: 'Movies, TV shows, cast filmographies, posters, and trailers',
    auth: 'apiKey',
    https: true,
    cors: true,
    category: 'Entertainment & Media',
    url: 'https://developer.themoviedb.org/docs'
  },
  {
    name: 'Unsplash API',
    description: 'Over 3 million high-resolution public royalty-free photographs',
    auth: 'apiKey',
    https: true,
    cors: true,
    category: 'Entertainment & Media',
    url: 'https://unsplash.com/developers'
  }
];

export class PublicApisCatalog {
  static listAll(filterQuery = '', category = 'All') {
    let list = PUBLIC_APIS_DATABASE;
    if (category && category !== 'All') {
      list = list.filter(item => item.category === category);
    }
    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      list = list.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return {
      total: list.length,
      categories: PUBLIC_API_CATEGORIES,
      apis: list
    };
  }

  static getCategories() {
    return PUBLIC_API_CATEGORIES;
  }
}

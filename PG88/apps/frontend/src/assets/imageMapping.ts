// Image URL Mapping - Local Assets vs CDN
// This file maps CDN URLs to local assets

export const imageAssets = {
  // Banner images (Hero carousel)
  banners: {
    '403796ae-539d-4e50-9692-7328c8650bea': '/assets/banners/ad-403796ae-539d-4e50-9692-7328c8650bea.webp',
    'e7d1e36c-f082-4c27-bdc4-fc94543a39d3': '/assets/banners/ad-e7d1e36c-f082-4c27-bdc4-fc94543a39d3.webp',
    'b729fb9e-b61b-4ad2-ac9d-c9339bfaeb84': '/assets/banners/ad-b729fb9e-b61b-4ad2-ac9d-c9339bfaeb84.webp',
  },

  // Hot game images
  games: {
    '98e20603-39bd-49a8-88fd-f138f4190827': '/assets/games/game-98e20603-39bd-49a8-88fd-f138f4190827.webp',
    '1a987bf2-47de-469f-ab31-dcaac1fde5cd': '/assets/games/game-1a987bf2-47de-469f-ab31-dcaac1fde5cd.webp',
    'ee141b3e-1d2f-48d1-8291-b11ce34b5a6f': '/assets/games/game-ee141b3e-1d2f-48d1-8291-b11ce34b5a6f.webp',
    '14e31f9b-adb7-4742-8887-15d25cc7b4da': '/assets/games/game-14e31f9b-adb7-4742-8887-15d25cc7b4da.webp',
    '354813aa-ae44-4969-955d-dadab65aa749': '/assets/games/game-354813aa-ae44-4969-955d-dadab65aa749.webp',
    '4b4c89d9-0bd9-452e-a664-1067d2d41580': '/assets/games/game-4b4c89d9-0bd9-452e-a664-1067d2d41580.webp',
    '13fc3271-0abc-46c8-8acb-9c2bb4567880': '/assets/games/game-13fc3271-0abc-46c8-8acb-9c2bb4567880.webp',
    '9bebda63-8407-4b51-82be-5bcaeadc9e65': '/assets/games/game-9bebda63-8407-4b51-82be-5bcaeadc9e65.webp',
    'c8c34042-4fe7-4468-86b3-0ba31639567c': '/assets/games/game-c8c34042-4fe7-4468-86b3-0ba31639567c.png',
    '7828aa4a-b86d-4ed0-98c3-dd99b81201f1': '/assets/games/game-7828aa4a-b86d-4ed0-98c3-dd99b81201f1.webp',
  },

  // Category images (placeholder - using hardcoded URLs in HomePage for now)
  categories: {
    'cate-egame': '/assets/categories/cate-egame.png',
    'cate-chess': '/assets/categories/cate-chess.png',
    'cate-mpg': '/assets/categories/cate-mpg.png',
    'cate-animal': '/assets/categories/cate-animal.png',
    'cate-lottery': '/assets/categories/cate-lottery.png',
  },

  // Live casino images
  live: {
    'ag': '/assets/casino/girl-ag.png',
    'allbet': '/assets/casino/girl-allbet.png',
    'bbin': '/assets/casino/girl-bbin.png',
    'dg': '/assets/casino/girl-dg.png',
    'evo': '/assets/casino/girl-evo.png',
    'mg': '/assets/casino/girl-mg.png',
    'pp': '/assets/casino/girl-pp.png',
  },

  // Logo
  logo: '/assets/logos/logo-pg88.png',

  // Promotions
  promotions: {
    main: '/assets/promotions/promo-e78eebc5-84cf-44bc-b4be-f8d755966dd8.gif',
  },
};

// CDN URL patterns to local path mapper
export const mapCdnToLocal = (cdnUrl: string): string => {
  // Extract UUID from CDN URL
  const uuidMatch = cdnUrl.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/);

  if (uuidMatch) {
    const uuid = uuidMatch[1];

    // Check if it's a game image
    if (cdnUrl.includes('gamePopular')) {
      return imageAssets.games[uuid] || cdnUrl;
    }

    // Check if it's a banner
    if (cdnUrl.includes('ads')) {
      return imageAssets.banners[uuid] || cdnUrl;
    }

    // Check if it's a promotion
    if (cdnUrl.includes('promos')) {
      return imageAssets.promotions.main;
    }
  }

  // Return original URL if no mapping found
  return cdnUrl;
};

// List of fallback image URLs (in case local files are missing)
export const fallbackImages = {
  banners: [
    '/assets/banners/ad-403796ae-539d-4e50-9692-7328c8650bea.webp',
    '/assets/banners/ad-e7d1e36c-f082-4c27-bdc4-fc94543a39d3.webp',
    '/assets/banners/ad-b729fb9e-b61b-4ad2-ac9d-c9339bfaeb84.webp',
  ]
};

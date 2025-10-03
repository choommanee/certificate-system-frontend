// Google Fonts Service for Certificate Designer
export interface GoogleFont {
  family: string;
  category: string;
  variants: string[];
  subsets: string[];
}

export const POPULAR_GOOGLE_FONTS: GoogleFont[] = [
  // Thai Fonts
  { family: 'Sarabun', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800'], subsets: ['thai', 'latin'] },
  { family: 'Prompt', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['thai', 'latin'] },
  { family: 'Kanit', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['thai', 'latin'] },
  { family: 'Mitr', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700'], subsets: ['thai', 'latin'] },
  { family: 'Chakra Petch', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'], subsets: ['thai', 'latin'] },
  { family: 'Pridi', category: 'serif', variants: ['200', '300', '400', '500', '600', '700'], subsets: ['thai', 'latin'] },
  { family: 'Taviraj', category: 'serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['thai', 'latin'] },
  
  // Popular English Fonts
  { family: 'Inter', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
  { family: 'Roboto', category: 'sans-serif', variants: ['100', '300', '400', '500', '700', '900'], subsets: ['latin'] },
  { family: 'Open Sans', category: 'sans-serif', variants: ['300', '400', '500', '600', '700', '800'], subsets: ['latin'] },
  { family: 'Lato', category: 'sans-serif', variants: ['100', '300', '400', '700', '900'], subsets: ['latin'] },
  { family: 'Montserrat', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
  { family: 'Poppins', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
  { family: 'Source Sans Pro', category: 'sans-serif', variants: ['200', '300', '400', '600', '700', '900'], subsets: ['latin'] },
  { family: 'Nunito', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
  
  // Serif Fonts
  { family: 'Playfair Display', category: 'serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
  { family: 'Merriweather', category: 'serif', variants: ['300', '400', '700', '900'], subsets: ['latin'] },
  { family: 'Lora', category: 'serif', variants: ['400', '500', '600', '700'], subsets: ['latin'] },
  { family: 'Crimson Text', category: 'serif', variants: ['400', '600', '700'], subsets: ['latin'] },
  { family: 'Libre Baskerville', category: 'serif', variants: ['400', '700'], subsets: ['latin'] },
  
  // Display/Decorative Fonts
  { family: 'Dancing Script', category: 'handwriting', variants: ['400', '500', '600', '700'], subsets: ['latin'] },
  { family: 'Pacifico', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
  { family: 'Lobster', category: 'display', variants: ['400'], subsets: ['latin'] },
  { family: 'Righteous', category: 'display', variants: ['400'], subsets: ['latin'] },
  { family: 'Fredoka One', category: 'display', variants: ['400'], subsets: ['latin'] },
  
  // Monospace Fonts
  { family: 'Fira Code', category: 'monospace', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'] },
  { family: 'JetBrains Mono', category: 'monospace', variants: ['100', '200', '300', '400', '500', '600', '700', '800'], subsets: ['latin'] },
  { family: 'Source Code Pro', category: 'monospace', variants: ['200', '300', '400', '500', '600', '700', '900'], subsets: ['latin'] }
];

class FontService {
  private loadedFonts = new Set<string>();

  // Load Google Font dynamically
  async loadGoogleFont(fontFamily: string, variants: string[] = ['400']): Promise<void> {
    const fontKey = `${fontFamily}-${variants.join(',')}`;
    
    if (this.loadedFonts.has(fontKey)) {
      return; // Font already loaded
    }

    try {
      // First check if font is already available (loaded via HTML link)
      if ('fonts' in document && document.fonts.check(`16px "${fontFamily}"`)) {
        this.loadedFonts.add(fontKey);
        console.log(`Font already available: ${fontFamily}`);
        return;
      }

      return new Promise<void>((resolve) => {
        let resolved = false;
        
        // Create Google Fonts URL
        const variantString = variants.map(v => `${v}`).join(',');
        const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@${variantString}&display=swap`;
        
        // Check if link already exists
        const existingLink = document.querySelector(`link[href*="${fontFamily.replace(/\s+/g, '+')}"]`);
        if (existingLink) {
          this.loadedFonts.add(fontKey);
          console.log(`Font link already exists: ${fontFamily}`);
          resolve();
          return;
        }
        
        // Create and append link element
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontUrl;
        document.head.appendChild(link);
        
        link.onload = () => {
          if (!resolved) {
            resolved = true;
            this.loadedFonts.add(fontKey);
            console.log(`Font loaded successfully: ${fontFamily}`);
            resolve();
          }
        };
        
        link.onerror = () => {
          if (!resolved) {
            resolved = true;
            console.warn(`Failed to load font: ${fontFamily}, using fallback`);
            // Mark as loaded to prevent retry loops
            this.loadedFonts.add(fontKey);
            resolve(); // Don't reject, just use fallback
          }
        };
        
        // Shorter timeout since fonts should be preloaded
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            console.warn(`Font loading timeout: ${fontFamily}, using fallback`);
            // Mark as loaded to prevent retry loops
            this.loadedFonts.add(fontKey);
            resolve(); // Don't reject, just use fallback
          }
        }, 5000); // Reduced to 5 seconds since fonts are preloaded
      });
      
    } catch (error) {
      console.warn('Error loading Google Font:', error);
      // Mark as loaded to prevent retry loops
      this.loadedFonts.add(fontKey);
      // Don't throw error, just use fallback fonts
    }
  }

  // Load multiple fonts
  async loadMultipleFonts(fonts: { family: string; variants?: string[] }[]): Promise<void> {
    const loadPromises = fonts.map(font => 
      this.loadGoogleFont(font.family, font.variants || ['400'])
    );
    
    await Promise.all(loadPromises);
  }

  // Get font categories
  getFontsByCategory(): Record<string, GoogleFont[]> {
    return POPULAR_GOOGLE_FONTS.reduce((acc, font) => {
      if (!acc[font.category]) {
        acc[font.category] = [];
      }
      acc[font.category].push(font);
      return acc;
    }, {} as Record<string, GoogleFont[]>);
  }

  // Search fonts
  searchFonts(query: string): GoogleFont[] {
    const searchTerm = query.toLowerCase();
    return POPULAR_GOOGLE_FONTS.filter(font =>
      font.family.toLowerCase().includes(searchTerm) ||
      font.category.toLowerCase().includes(searchTerm)
    );
  }

  // Get Thai fonts
  getThaiCompatibleFonts(): GoogleFont[] {
    return POPULAR_GOOGLE_FONTS.filter(font =>
      font.subsets.includes('thai') || font.subsets.includes('latin')
    );
  }

  // Check if font is loaded
  isFontLoaded(fontFamily: string): boolean {
    return Array.from(this.loadedFonts).some(key => key.startsWith(fontFamily));
  }

  // Preload popular fonts
  async preloadPopularFonts(): Promise<void> {
    const popularFonts = [
      { family: 'Sarabun', variants: ['300', '400', '500', '600', '700'] },
      { family: 'Inter', variants: ['300', '400', '500', '600', '700'] },
      { family: 'Prompt', variants: ['300', '400', '500', '600', '700'] },
      { family: 'Kanit', variants: ['300', '400', '500', '600', '700'] },
      { family: 'Roboto', variants: ['300', '400', '500', '700'] },
      { family: 'Open Sans', variants: ['300', '400', '600', '700'] }
    ];

    try {
      // Load fonts in parallel but don't fail if some fonts fail
      const loadPromises = popularFonts.map(async (font) => {
        try {
          await this.loadGoogleFont(font.family, font.variants);
        } catch (error) {
          console.warn(`Failed to load font ${font.family}:`, error);
        }
      });
      
      await Promise.allSettled(loadPromises);
      console.log('Font preloading completed (some fonts may have failed)');
    } catch (error) {
      console.warn('Error preloading fonts:', error);
    }
  }
}

export default new FontService();

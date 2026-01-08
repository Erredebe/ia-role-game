import { Injectable, signal, Renderer2, RendererFactory2 } from '@angular/core';

export type ThemeType = 'fantasy' | 'realistic' | 'contemporary' | 'sci-fi' | 'post-apocalyptic';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  currentTheme = signal<ThemeType>('fantasy');

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  setTheme(themeId: string) {
    const validTheme = this.sanitizeTheme(themeId);
    
    // Remove all previous theme classes
    const themes: ThemeType[] = ['fantasy', 'realistic', 'contemporary', 'sci-fi', 'post-apocalyptic'];
    themes.forEach(t => {
      this.renderer.removeClass(document.body, `theme-${t}`);
    });

    // Add new theme class
    this.renderer.addClass(document.body, `theme-${validTheme}`);
    this.currentTheme.set(validTheme);
  }

  private sanitizeTheme(themeId: string): ThemeType {
    const themes: ThemeType[] = ['fantasy', 'realistic', 'contemporary', 'sci-fi', 'post-apocalyptic'];
    if (themes.includes(themeId as ThemeType)) {
      return themeId as ThemeType;
    }
    return 'fantasy';
  }
}

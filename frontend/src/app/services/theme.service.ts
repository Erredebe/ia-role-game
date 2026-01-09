import { Injectable, signal, Renderer2, RendererFactory2 } from '@angular/core';

export type ThemeType = 'fantasy' | 'realistic' | 'contemporary' | 'sci-fi' | 'post-apocalyptic';

const THEMES: ThemeType[] = ['fantasy', 'realistic', 'contemporary', 'sci-fi', 'post-apocalyptic'];

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
    const validTheme = this.coerceTheme(themeId);
    this.clearThemeClasses();
    this.renderer.addClass(document.body, `theme-${validTheme}`);
    this.currentTheme.set(validTheme);
  }

  private clearThemeClasses() {
    THEMES.forEach(theme => {
      this.renderer.removeClass(document.body, `theme-${theme}`);
    });
  }

  private coerceTheme(themeId: string): ThemeType {
    if (THEMES.includes(themeId as ThemeType)) {
      return themeId as ThemeType;
    }
    return 'fantasy';
  }
}

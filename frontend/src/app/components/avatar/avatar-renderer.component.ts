import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AvatarService } from '../../services/avatar.service';
import { AvatarConfig } from '../../interfaces/avatar';

@Component({
  selector: 'app-avatar-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="avatar-renderer" [innerHTML]="safeSvg"></div>`,
  styleUrl: './avatar-renderer.component.css'
})
export class AvatarRendererComponent implements OnChanges {
  @Input() config?: AvatarConfig;

  safeSvg: SafeHtml = '';

  constructor(
    private avatarService: AvatarService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnChanges(): void {
    const config = this.config ?? { seed: 'avatar' };
    const svg = this.avatarService.renderAvatarSvg(config);
    this.safeSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}

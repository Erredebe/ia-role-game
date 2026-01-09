import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../../interfaces/game';

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-panel.component.html'
})
export class ChatPanelComponent {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  @Input() displayHistory: ChatMessage[] = [];
  @Input() suggestedActions: string[] = [];
  @Input() loading: boolean = false;
  @Input() userInput: string = '';

  @Output() userInputChange = new EventEmitter<string>();
  @Output() sendAction = new EventEmitter<string | undefined>();

  scrollToBottom() {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}

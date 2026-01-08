import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';

interface CharacterClass {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseHp: number;
  baseMana: number;
}

@Component({
  selector: 'app-character-creation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './character-creation.component.html',
  styleUrl: './character-creation.component.css'
})
export class CharacterCreationComponent {
  name: string = '';
  selectedClassId: string = 'warrior';
  
  classes: CharacterClass[] = [
    { id: 'warrior', name: 'Guerrero', description: 'Maestro de las armas y la armadura pesada.', icon: '⚔️', baseHp: 120, baseMana: 20 },
    { id: 'mage', name: 'Mago', description: 'Erudito de las artes arcanas y hechizos poderosos.', icon: '🔮', baseHp: 80, baseMana: 100 },
    { id: 'archer', name: 'Arquero', description: 'Experto en combate a distancia y agilidad.', icon: '🏹', baseHp: 100, baseMana: 40 },
    { id: 'rogue', name: 'Pícaro', description: 'Sombrío y letal, experto en sigilo y dagas.', icon: '🗡️', baseHp: 90, baseMana: 30 }
  ];

  stats = {
    strength: 10,
    dexterity: 10,
    intelligence: 10,
    luck: 10
  };

  isRolling: boolean = false;

  constructor(private gameService: GameService, public router: Router) {}

  get currentClass() {
    return this.classes.find(c => c.id === this.selectedClassId)!;
  }

  get avatarUrl() {
    const seed = `${this.selectedClassId}-${this.name || 'avatar'}`;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  }

  rollStats() {
    if (this.isRolling) return;
    this.isRolling = true;
    
    const startTime = Date.now();
    const duration = 800;
    
    const interval = setInterval(() => {
      this.stats = {
        strength: Math.floor(Math.random() * 16) + 3,
        dexterity: Math.floor(Math.random() * 16) + 3,
        intelligence: Math.floor(Math.random() * 16) + 3,
        luck: Math.floor(Math.random() * 16) + 3
      };

      if (Date.now() - startTime > duration) {
        clearInterval(interval);
        this.stats = {
          strength: this.roll3d6(),
          dexterity: this.roll3d6(),
          intelligence: this.roll3d6(),
          luck: this.roll3d6()
        };
        this.isRolling = false;
      }
    }, 50);
  }

  private roll3d6(): number {
    return Math.floor(Math.random() * 6) + 1 + 
           Math.floor(Math.random() * 6) + 1 + 
           Math.floor(Math.random() * 6) + 1;
  }

  async finishCreation() {
    if (!this.name) {
      alert('¡Por favor, elige un nombre!');
      return;
    }

    const character = {
      name: this.name,
      class: this.currentClass.name,
      hp: this.currentClass.baseHp,
      maxHp: this.currentClass.baseHp,
      mana: this.currentClass.baseMana,
      maxMana: this.currentClass.baseMana,
      stats: this.stats,
      inventory: this.getInitialInventory()
    };

    const response = await this.gameService.createNewGame(character);
    if (response) {
      this.router.navigate(['/game', response.id]);
    }
  }

  private getInitialInventory(): string[] {
    switch (this.selectedClassId) {
      case 'warrior': return ['Espada ancha', 'Escudo de madera'];
      case 'mage': return ['Bastón rúnico', 'Poción de maná'];
      case 'archer': return ['Arco largo', 'Carcaj de flechas'];
      case 'rogue': return ['Dagas gemelas', 'Bomba de humo'];
      default: return ['Cuerda'];
    }
  }
}

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

interface EnvironmentOption {
  id: string;
  name: string;
  description: string;
  icon: string;
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
  selectedEnvironmentId: string = 'fantasy';
  avatarSeed: string = this.generateAvatarSeed();
  backstory: string = '';
  currentStep: number = 1;
  totalSteps: number = 2;

  classes: CharacterClass[] = [
    { id: 'warrior', name: 'Guerrero', description: 'Maestro de las armas y la armadura pesada.', icon: 'W', baseHp: 120, baseMana: 20 },
    { id: 'mage', name: 'Mago', description: 'Erudito de las artes arcanas y hechizos poderosos.', icon: 'M', baseHp: 80, baseMana: 100 },
    { id: 'archer', name: 'Arquero', description: 'Experto en combate a distancia y agilidad.', icon: 'A', baseHp: 100, baseMana: 40 },
    { id: 'rogue', name: 'Picaro', description: 'Sombrio y letal, experto en sigilo y dagas.', icon: 'R', baseHp: 90, baseMana: 30 }
  ];

  environments: EnvironmentOption[] = [
    { id: 'fantasy', name: 'Fantasia', description: 'Reinos magicos, criaturas miticas y hechizos antiguos.', icon: 'F' },
    { id: 'realistic', name: 'Realista', description: 'Sin magia, decisiones humanas y consecuencias reales.', icon: 'R' },
    { id: 'contemporary', name: 'Contemporaneo', description: 'Ciudades actuales, tecnologia moderna y conflictos urbanos.', icon: 'C' },
    { id: 'sci-fi', name: 'Ciencia Ficcion', description: 'Naves, IA y fronteras del espacio profundo.', icon: 'SF' },
    { id: 'post-apocalyptic', name: 'Postapocaliptico', description: 'Ruinas, supervivencia y facciones emergentes.', icon: 'PA' }
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

  get currentEnvironment() {
    return this.environments.find(env => env.id === this.selectedEnvironmentId)!;
  }

  get avatarUrl() {
    const seed = this.avatarSeed || this.name || 'avatar';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  }

  nextStep() {
    if (this.currentStep === 1 && !this.name.trim()) {
      alert('Por favor, elige un nombre!');
      return;
    }
    this.currentStep = Math.min(this.currentStep + 1, this.totalSteps);
  }

  previousStep() {
    this.currentStep = Math.max(this.currentStep - 1, 1);
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
    if (!this.name.trim()) {
      alert('Por favor, elige un nombre!');
      return;
    }

    const trimmedBackstory = this.backstory.trim();
    const character = {
      name: this.name,
      class: this.currentClass.name,
      hp: this.currentClass.baseHp,
      maxHp: this.currentClass.baseHp,
      mana: this.currentClass.baseMana,
      maxMana: this.currentClass.baseMana,
      avatarSeed: this.avatarSeed,
      backstory: trimmedBackstory ? trimmedBackstory : undefined,
      stats: this.stats,
      inventory: this.getInitialInventory()
    };

    const environment = this.currentEnvironment;
    const response = await this.gameService.createNewGame(character, environment);
    if (response) {
      this.router.navigate(['/game', response.id]);
    }
  }

  private getInitialInventory(): string[] {
    switch (this.selectedClassId) {
      case 'warrior': return ['Espada ancha', 'Escudo de madera'];
      case 'mage': return ['Baston runico', 'Pocion de mana'];
      case 'archer': return ['Arco largo', 'Carcaj de flechas'];
      case 'rogue': return ['Dagas gemelas', 'Bomba de humo'];
      default: return ['Cuerda'];
    }
  }

  randomizeAvatarSeed() {
    this.avatarSeed = this.generateAvatarSeed();
  }

  private generateAvatarSeed(): string {
    return Math.random().toString(36).slice(2, 10);
  }
}

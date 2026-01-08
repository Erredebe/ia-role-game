import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { ThemeService } from '../../services/theme.service';
import { Item, Equipment } from '../../interfaces/game';

interface CharacterClass {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseHp: number;
  baseMana: number;
  allowedEnvironments: string[];
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
export class CharacterCreationComponent implements OnInit {
  name: string = '';
  selectedClassId: string = '';
  selectedEnvironmentId: string = 'fantasy';
  customRules: string = '';
  avatarSeed: string = this.generateAvatarSeed();
  backstory: string = '';
  
  currentStep: number = 1;
  totalSteps: number = 3;

  classes: CharacterClass[] = [
    { 
      id: 'warrior', name: 'Guerrero', description: 'Maestro de las armas y la armadura pesada.', icon: '🛡️', baseHp: 120, baseMana: 20,
      allowedEnvironments: ['fantasy', 'realistic', 'post-apocalyptic', 'sci-fi']
    },
    { 
      id: 'mage', name: 'Mago', description: 'Erudito de las artes arcanas y hechizos poderosos.', icon: '🪄', baseHp: 80, baseMana: 100,
      allowedEnvironments: ['fantasy']
    },
    { 
      id: 'archer', name: 'Arquero', description: 'Experto en combate a distancia y agilidad.', icon: '🏹', baseHp: 100, baseMana: 40,
      allowedEnvironments: ['fantasy', 'realistic', 'post-apocalyptic']
    },
    { 
      id: 'rogue', name: 'Picaro', description: 'Sombrio y letal, experto en sigilo y dagas.', icon: '🗡️', baseHp: 90, baseMana: 30,
      allowedEnvironments: ['fantasy', 'realistic', 'contemporary', 'post-apocalyptic']
    },
    {
      id: 'hacker', name: 'Hacker', description: 'Experto en sistemas y guerra digita.', icon: '💻', baseHp: 85, baseMana: 60,
      allowedEnvironments: ['contemporary', 'sci-fi']
    },
    {
      id: 'pilot', name: 'Piloto', description: 'Maestro de vehiculos y naves.', icon: '✈️', baseHp: 100, baseMana: 30,
      allowedEnvironments: ['contemporary', 'sci-fi', 'post-apocalyptic']
    },
    {
      id: 'soldier', name: 'Soldado', description: 'Entrenado en tacticas militares modernas.', icon: '🪖', baseHp: 110, baseMana: 20,
      allowedEnvironments: ['realistic', 'contemporary', 'sci-fi', 'post-apocalyptic'] 
    }
  ];

  environments: EnvironmentOption[] = [
    { id: 'fantasy', name: 'Fantasia', description: 'Reinos magicos, criaturas miticas y hechizos antiguos.', icon: '🏰' },
    { id: 'realistic', name: 'Realista', description: 'Sin magia, decisiones humanas y consecuencias reales.', icon: '⚖️' },
    { id: 'contemporary', name: 'Contemporaneo', description: 'Ciudades actuales, tecnologia moderna y conflictos urbanos.', icon: '🏙️' },
    { id: 'sci-fi', name: 'Ciencia Ficcion', description: 'Naves, IA y fronteras del espacio profundo.', icon: '🚀' },
    { id: 'post-apocalyptic', name: 'Postapocaliptico', description: 'Ruinas, supervivencia y facciones emergentes.', icon: '☢️' }
  ];

  stats = {
    strength: 10,
    dexterity: 10,
    intelligence: 10,
    luck: 10
  };

  isRolling: boolean = false;

  constructor(
    private gameService: GameService, 
    public themeService: ThemeService,
    public router: Router
  ) {}

  ngOnInit() {
    this.themeService.setTheme(this.selectedEnvironmentId);
    this.updateAvailableClasses();
  }

  updateAvailableClasses() {
    // Check if current selected class is valid for new environment
    if (this.selectedClassId) {
      const cls = this.classes.find(c => c.id === this.selectedClassId);
      if (cls && !cls.allowedEnvironments.includes(this.selectedEnvironmentId)) {
        this.selectedClassId = '';
      }
    }
  }

  get availableClasses() {
    return this.classes.filter(c => c.allowedEnvironments.includes(this.selectedEnvironmentId));
  }

  get currentClass() {
    return this.classes.find(c => c.id === this.selectedClassId);
  }

  get currentEnvironment() {
    return this.environments.find(env => env.id === this.selectedEnvironmentId)!;
  }

  selectEnvironment(envId: string) {
    this.selectedEnvironmentId = envId;
    this.themeService.setTheme(envId);
    this.updateAvailableClasses();
  }

  get avatarUrl() {
    const seed = this.avatarSeed || this.name || 'avatar';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  }

  nextStep() {
    if (this.currentStep === 1) {
       // Validate Env selection (always selected by default)
    }
    if (this.currentStep === 2 && (!this.name.trim() || !this.selectedClassId)) {
      alert('Por favor, elige un nombre y una clase!');
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
    
    if (!this.currentClass) return;

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
      inventory: this.getInitialInventory(),
      equipment: {} // Empty equipment for now
    };

    const environment = {
      ...this.currentEnvironment,
      customRules: this.customRules
    };

    const response = await this.gameService.createNewGame(character, environment);
    if (response) {
      this.router.navigate(['/game', response.id]);
    }
  }

  get initialInventory(): Item[] {
    return this.getInitialInventory();
  }

  public getInitialInventory(): Item[] {
    const items: Item[] = [];
    const makeItem = (id: string, name: string, type: 'weapon'|'armor'|'accessory'|'consumable'|'misc', desc: string, stats?: any): Item => ({
      id, name, type, description: desc, stats
    });

    switch (this.selectedClassId) {
      case 'warrior': 
        items.push(makeItem('sword_1', 'Espada de Hierro', 'weapon', 'Una espada confiable.', { strength: 1 }));
        items.push(makeItem('shield_1', 'Escudo de Madera', 'armor', 'Protege contra ataques basicos.'));
        break;
      case 'mage': 
        items.push(makeItem('staff_1', 'Baston de Aprendiz', 'weapon', 'Canaliza magia basica.', { intelligence: 1 }));
        items.push(makeItem('potion_mana', 'Pocion de Mana', 'consumable', 'Restaura mana.'));
        break;
      case 'archer': 
        items.push(makeItem('bow_1', 'Arco de Caza', 'weapon', 'Bueno para distancias medias.', { dexterity: 1 }));
        items.push(makeItem('arrows', 'Carcaj', 'misc', 'Contiene flechas.'));
        break;
      case 'rogue': 
        items.push(makeItem('dagger_1', 'Daga Oxidada', 'weapon', 'Rapida y ligera.', { dexterity: 1 }));
        items.push(makeItem('bomb_smoke', 'Bomba de Humo', 'consumable', 'Para huidas rapidas.'));
        break;
      case 'hacker':
        items.push(makeItem('deck_1', 'CyberDeck Mk1', 'weapon', 'Herramienta de intrusion basica.', { intelligence: 2 }));
        items.push(makeItem('stim_1', 'NeuroStim', 'consumable', 'Mejora la concentracion.'));
        break;
      case 'pilot':
        items.push(makeItem('wrench', 'Llave Inglesa', 'weapon', 'Sirve para arreglar y golpear.', { strength: 1 }));
        items.push(makeItem('jacket_flight', 'Chaqueta de Vuelo', 'armor', 'Estilosa y resistente.'));
        break;
      case 'soldier':
        items.push(makeItem('rifle_1', 'Rifle de Asalto', 'weapon', 'Estandar militar.', { dexterity: 1 }));
        items.push(makeItem('vest_1', 'Chaleco Kevlar', 'armor', 'Proteccion balistica.'));
        break;
      default: 
        if (this.selectedClassId) {
             items.push(makeItem('rock', 'Piedra', 'misc', 'Una piedra comun.'));
        }
    }
    return items;
  }

  randomizeAvatarSeed() {
    this.avatarSeed = this.generateAvatarSeed();
  }

  private generateAvatarSeed(): string {
    return Math.random().toString(36).slice(2, 10);
  }
}

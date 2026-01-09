import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { ThemeService } from '../../services/theme.service';
import { Item } from '../../interfaces/game';
import { AvatarConfig } from '../../interfaces/avatar';
import { CharacterClass, EnvironmentOption } from './character-creation.types';
import { EnvironmentStepComponent } from './steps/environment-step/environment-step.component';
import { ClassStepComponent } from './steps/class-step/class-step.component';
import { SummaryStepComponent } from './steps/summary-step/summary-step.component';

const DEFAULT_STATS = {
  strength: 10,
  dexterity: 10,
  intelligence: 10,
  luck: 10
};

const ROLL_DURATION_MS = 800;
const ROLL_INTERVAL_MS = 50;

const makeItem = (
  id: string,
  name: string,
  type: 'weapon'|'armor'|'accessory'|'consumable'|'misc',
  description: string,
  stats?: any
): Item => ({
  id,
  name,
  type,
  description,
  stats
});

@Component({
  selector: 'app-character-creation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EnvironmentStepComponent,
    ClassStepComponent,
    SummaryStepComponent
  ],
  templateUrl: './character-creation.component.html',
  styleUrl: './character-creation.component.css',
  encapsulation: ViewEncapsulation.None
})
export class CharacterCreationComponent implements OnInit {
  name: string = '';
  selectedClassId: string = '';
  selectedEnvironmentId: string = 'fantasy';
  customRules: string = '';
  avatarSeed: string = this.generateAvatarSeed();
  backstory: string = '';
  
  currentStep: number = 1;
  readonly totalSteps: number = 3;
  isCreating: boolean = false;

  readonly classes: CharacterClass[] = [
    { 
      id: 'warrior', name: 'Guerrero', description: 'Frente de batalla y defensor del grupo.', icon: '⚔️', baseHp: 120, baseMana: 20,
      allowedEnvironments: ['fantasy', 'post-apocalyptic']
    },
    { 
      id: 'mage', name: 'Mago', description: 'Erudito de artes arcanas y hechizos poderosos.', icon: '🔮', baseHp: 80, baseMana: 110,
      allowedEnvironments: ['fantasy']
    },
    { 
      id: 'archer', name: 'Arquero', description: 'Especialista en combate a distancia y rastreo.', icon: '🏹', baseHp: 100, baseMana: 40,
      allowedEnvironments: ['fantasy', 'post-apocalyptic']
    },
    { 
      id: 'rogue', name: 'Picaro', description: 'Sigilo, engaño y golpes precisos.', icon: '🗡️', baseHp: 95, baseMana: 30,
      allowedEnvironments: ['fantasy', 'contemporary', 'post-apocalyptic']
    },
    {
      id: 'soldier', name: 'Soldado', description: 'Entrenado en tacticas militares y combate directo.', icon: '🪖', baseHp: 115, baseMana: 20,
      allowedEnvironments: ['realistic', 'contemporary', 'sci-fi', 'post-apocalyptic'] 
    },
    {
      id: 'hacker', name: 'Hacker', description: 'Experto en intrusion, sistemas y guerra digital.', icon: '💻', baseHp: 85, baseMana: 70,
      allowedEnvironments: ['contemporary', 'sci-fi']
    },
    {
      id: 'pilot', name: 'Piloto', description: 'As del volante y la navegacion en entornos hostiles.', icon: '✈️', baseHp: 100, baseMana: 35,
      allowedEnvironments: ['contemporary', 'sci-fi', 'post-apocalyptic']
    },
    {
      id: 'investigator', name: 'Investigador', description: 'Analista de pistas, crimen y conspiraciones.', icon: '🕵️', baseHp: 95, baseMana: 40,
      allowedEnvironments: ['realistic', 'contemporary']
    },
    {
      id: 'medic', name: 'Medico', description: 'Soporte vital y tratamiento en campo.', icon: '🩺', baseHp: 90, baseMana: 60,
      allowedEnvironments: ['realistic', 'sci-fi', 'post-apocalyptic']
    },
    {
      id: 'mechanic', name: 'Mecanico', description: 'Reparaciones rapidas y dominio de dispositivos.', icon: '🛠️', baseHp: 105, baseMana: 30,
      allowedEnvironments: ['contemporary', 'sci-fi', 'post-apocalyptic']
    }
  ];

  readonly environments: EnvironmentOption[] = [
    { 
      id: 'fantasy',
      name: 'Fantasia',
      description: 'Reinos magicos, criaturas miticas y hechizos antiguos.',
      icon: '🐉',
      prompt: 'Alta fantasia epica: magia real, deidades, criaturas miticas y politica feudal. Evita tecnologia moderna.',
      classArchetypes: ['Guerrero', 'Mago', 'Arquero', 'Picaro', 'Clerigo', 'Druida'],
      objectArchetypes: ['espadas', 'arcos', 'armaduras', 'pergaminos', 'pociones', 'reliquias']
    },
    { 
      id: 'realistic',
      name: 'Realista',
      description: 'Sin magia, decisiones humanas y consecuencias reales.',
      icon: '🧭',
      prompt: 'Realismo estricto: no hay magia ni tecnologia imposible. Consecuencias fisicas creibles.',
      classArchetypes: ['Soldado', 'Investigador', 'Medico', 'Explorador', 'Guardia'],
      objectArchetypes: ['armas convencionales', 'botiquines', 'documentos', 'radios', 'linternas']
    },
    { 
      id: 'contemporary',
      name: 'Contemporaneo',
      description: 'Ciudades actuales, tecnologia moderna y conflictos urbanos.',
      icon: '🏙️',
      prompt: 'Mundo actual urbano: tecnologia moderna, crimen organizado y corporaciones. Sin magia.',
      classArchetypes: ['Hacker', 'Investigador', 'Piloto', 'Agente', 'Mecanico'],
      objectArchetypes: ['smartphones', 'laptops', 'tarjetas de acceso', 'drones', 'vehiculos']
    },
    { 
      id: 'sci-fi',
      name: 'Ciencia Ficcion',
      description: 'Naves, IA y fronteras del espacio profundo.',
      icon: '🚀',
      prompt: 'Futuro avanzado: IA, viajes espaciales, implantes y megacorporaciones. Tecnologia domina.',
      classArchetypes: ['Piloto', 'Hacker', 'Soldado espacial', 'Ingeniero', 'Medico'],
      objectArchetypes: ['rifles de plasma', 'implantes', 'nanobots', 'modulos de nave', 'data chips']
    },
    { 
      id: 'post-apocalyptic',
      name: 'Postapocaliptico',
      description: 'Ruinas, supervivencia y facciones emergentes.',
      icon: '☢️',
      prompt: 'Mundo devastado: recursos escasos, facciones rivales y tecnologia reciclada.',
      classArchetypes: ['Superviviente', 'Saqueador', 'Mecanico', 'Tirador', 'Medico de campo'],
      objectArchetypes: ['chatarra', 'filtros de agua', 'municion', 'comida enlatada', 'radios rotas']
    }
  ];

  stats = { ...DEFAULT_STATS };

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

  get avatarConfig(): AvatarConfig {
    return {
      seed: this.avatarSeed || this.name || 'avatar',
      name: this.name || undefined,
      classId: this.selectedClassId || undefined,
      environmentId: this.selectedEnvironmentId || undefined
    };
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
    const duration = ROLL_DURATION_MS;

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
    }, ROLL_INTERVAL_MS);
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
    if (this.isCreating) return;
    this.isCreating = true;

    const trimmedBackstory = this.backstory.trim();
    const character = {
      name: this.name,
      class: this.currentClass.name,
      hp: this.currentClass.baseHp,
      maxHp: this.currentClass.baseHp,
      mana: this.currentClass.baseMana,
      maxMana: this.currentClass.baseMana,
      avatarConfig: this.avatarConfig,
      backstory: trimmedBackstory ? trimmedBackstory : undefined,
      stats: this.stats,
      inventory: this.getInitialInventory(),
      equipment: {} // Empty equipment for now
    };

    const environment = {
      ...this.currentEnvironment,
      customRules: this.customRules
    };

    try {
      const response = await this.gameService.createNewGame(character, environment);
      if (response) {
        this.router.navigate(['/game', response.id]);
      }
    } finally {
      this.isCreating = false;
    }
  }

  get initialInventory(): Item[] {
    return this.getInitialInventory();
  }

  public getInitialInventory(): Item[] {
    const items: Item[] = [];
    const env = this.selectedEnvironmentId;
    switch (this.selectedClassId) {
      case 'warrior': 
        if (env === 'post-apocalyptic') {
          items.push(makeItem('scrap_blade', 'Hoja de Chatarra', 'weapon', 'Forjada con restos de metal.', { strength: 1 }));
          items.push(makeItem('scrap_armor', 'Armadura Improvisada', 'armor', 'Placas viejas y cuero endurecido.'));
        } else {
          items.push(makeItem('sword_1', 'Espada de Hierro', 'weapon', 'Una espada confiable.', { strength: 1 }));
          items.push(makeItem('shield_1', 'Escudo de Madera', 'armor', 'Protege contra ataques basicos.'));
        }
        break;
      case 'mage': 
        items.push(makeItem('staff_1', 'Baston de Aprendiz', 'weapon', 'Canaliza magia basica.', { intelligence: 1 }));
        items.push(makeItem('potion_mana', 'Pocion de Mana', 'consumable', 'Restaura mana.'));
        break;
      case 'archer': 
        if (env === 'post-apocalyptic') {
          items.push(makeItem('crossbow_1', 'Ballesta de Chatarra', 'weapon', 'Disparo silencioso y resistente.', { dexterity: 1 }));
          items.push(makeItem('bolts', 'Virotes', 'misc', 'Municion para ballesta.'));
        } else {
          items.push(makeItem('bow_1', 'Arco de Caza', 'weapon', 'Bueno para distancias medias.', { dexterity: 1 }));
          items.push(makeItem('arrows', 'Carcaj', 'misc', 'Contiene flechas.'));
        }
        break;
      case 'rogue': 
        if (env === 'contemporary') {
          items.push(makeItem('tactical_knife', 'Cuchillo Tactico', 'weapon', 'Compacto y silencioso.', { dexterity: 1 }));
          items.push(makeItem('lockpicks', 'Ganzuas', 'misc', 'Para accesos rapidos.'));
        } else if (env === 'post-apocalyptic') {
          items.push(makeItem('rust_knife', 'Cuchillo Oxidado', 'weapon', 'Ligero pero efectivo.', { dexterity: 1 }));
          items.push(makeItem('smoke_bomb', 'Bomba de Humo', 'consumable', 'Cubre la retirada.'));
        } else {
          items.push(makeItem('dagger_1', 'Daga Oxidada', 'weapon', 'Rapida y ligera.', { dexterity: 1 }));
          items.push(makeItem('bomb_smoke', 'Bomba de Humo', 'consumable', 'Para huidas rapidas.'));
        }
        break;
      case 'soldier':
        if (env === 'sci-fi') {
          items.push(makeItem('plasma_rifle', 'Rifle de Plasma', 'weapon', 'Estandar de infanteria espacial.', { dexterity: 1 }));
          items.push(makeItem('tactical_visor', 'Visor Tactico', 'accessory', 'Mejora punteria y lectura del terreno.', { intelligence: 1 }));
        } else if (env === 'post-apocalyptic') {
          items.push(makeItem('scrap_rifle', 'Rifle Remendado', 'weapon', 'Arma fiable entre ruinas.', { dexterity: 1 }));
          items.push(makeItem('scrap_vest', 'Chaleco de Placas', 'armor', 'Proteccion improvisada.'));
        } else {
          items.push(makeItem('rifle_1', 'Rifle de Asalto', 'weapon', 'Estandar militar.', { dexterity: 1 }));
          items.push(makeItem('vest_1', 'Chaleco Kevlar', 'armor', 'Proteccion balistica.'));
        }
        break;
      case 'hacker':
        if (env === 'sci-fi') {
          items.push(makeItem('quantum_deck', 'Quantum Deck', 'weapon', 'Terminal de intrusion avanzada.', { intelligence: 2 }));
          items.push(makeItem('neural_patch', 'Parche Neural', 'consumable', 'Enfoca la mente y la memoria.'));
        } else {
          items.push(makeItem('deck_1', 'CyberDeck Mk1', 'weapon', 'Herramienta de intrusion basica.', { intelligence: 2 }));
          items.push(makeItem('signal_jammer', 'Inhibidor de Senal', 'consumable', 'Corta comunicaciones cercanas.'));
        }
        break;
      case 'pilot':
        if (env === 'sci-fi') {
          items.push(makeItem('nav_chip', 'Chip de Navegacion', 'accessory', 'Traza rutas seguras.', { intelligence: 1 }));
          items.push(makeItem('plasma_wrench', 'Llave Plasma', 'weapon', 'Herramienta y arma de emergencia.', { strength: 1 }));
        } else if (env === 'post-apocalyptic') {
          items.push(makeItem('flare_gun', 'Pistola de Bengalas', 'weapon', 'Disuade amenazas a distancia.', { dexterity: 1 }));
          items.push(makeItem('road_kit', 'Kit de Ruta', 'misc', 'Herramientas y repuestos basicos.'));
        } else {
          items.push(makeItem('wrench', 'Llave Inglesa', 'weapon', 'Sirve para arreglar y golpear.', { strength: 1 }));
          items.push(makeItem('jacket_flight', 'Chaqueta de Vuelo', 'armor', 'Estilosa y resistente.'));
        }
        break;
      case 'investigator':
        if (env === 'contemporary') {
          items.push(makeItem('access_card', 'Tarjeta de Acceso', 'accessory', 'Permite entrar a zonas restringidas.'));
          items.push(makeItem('cam_phone', 'Telefono con Camara', 'misc', 'Recopila pruebas y notas.'));
        } else {
          items.push(makeItem('badge', 'Credencial Oficial', 'accessory', 'Abre puertas y conversaciones.'));
          items.push(makeItem('notebook', 'Cuaderno de Campo', 'misc', 'Registra pistas clave.'));
        }
        break;
      case 'medic':
        if (env === 'sci-fi') {
          items.push(makeItem('nano_medkit', 'Nano Kit Medico', 'consumable', 'Cura heridas con precision.'));
          items.push(makeItem('bio_scanner', 'Bio Scanner', 'accessory', 'Diagnostico inmediato.', { intelligence: 1 }));
        } else if (env === 'post-apocalyptic') {
          items.push(makeItem('field_medkit', 'Botiquin de Campana', 'consumable', 'Atiende emergencias en ruta.'));
          items.push(makeItem('water_filter', 'Filtro de Agua', 'misc', 'Purifica recursos escasos.'));
        } else {
          items.push(makeItem('medkit', 'Botiquin', 'consumable', 'Restaura salud basica.'));
          items.push(makeItem('bandages', 'Vendajes', 'consumable', 'Cubre heridas y cortes.'));
        }
        break;
      case 'mechanic':
        if (env === 'sci-fi') {
          items.push(makeItem('repair_drone', 'Drone de Reparacion', 'accessory', 'Asiste en arreglos complejos.', { intelligence: 1 }));
          items.push(makeItem('plasma_cutter', 'Cortador Plasma', 'weapon', 'Abre puertas o combate.', { strength: 1 }));
        } else if (env === 'post-apocalyptic') {
          items.push(makeItem('scrap_tools', 'Herramientas de Chatarra', 'weapon', 'Resistentes y multiuso.', { strength: 1 }));
          items.push(makeItem('reinforced_jacket', 'Chaqueta Reforzada', 'armor', 'Proteccion contra escombros.'));
        } else {
          items.push(makeItem('tool_belt', 'Cinturon de Herramientas', 'accessory', 'Acceso rapido a piezas.'));
          items.push(makeItem('wrench_2', 'Llave Ajustable', 'weapon', 'Buena para reparar o golpear.', { strength: 1 }));
        }
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

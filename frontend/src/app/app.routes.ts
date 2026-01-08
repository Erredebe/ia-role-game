import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { CharacterCreationComponent } from './components/character-creation/character-creation.component';
import { GameComponent } from './components/game/game.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'create', component: CharacterCreationComponent },
  { path: 'game/:id', component: GameComponent },
  { path: '**', redirectTo: '' }
];

import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { CharacterCreationComponent } from './components/character-creation/character-creation.component';
import { GameComponent } from './components/game/game.component';
import { AvatarBuilderComponent } from './components/avatar-builder/avatar-builder.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'avatar-builder', component: AvatarBuilderComponent },
  { path: 'create', component: CharacterCreationComponent },
  { path: 'game/:id', component: GameComponent },
  { path: '**', redirectTo: '' }
];

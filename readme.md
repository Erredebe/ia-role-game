# IA Role Game

Interactive narrative RPG powered by a local language model. The backend acts as the dungeon master and the frontend renders a live character sheet with inventory, equipment, and suggested actions.

## Features

- Narrative generated from player actions and summary memory
- Live character sheet (HP, mana, stats, inventory, equipment)
- Deterministic equip/unequip actions with inventory sync
- Modern UI with theme presets per environment
- Clear separation between backend and frontend

## Tech Stack

- Backend: Node.js, Express, TypeScript, Axios
- Frontend: Angular (Signals), TypeScript, CSS
- AI: LM Studio (OpenAI-compatible local server)

## Requirements

- Node.js + npm
- LM Studio running a local model (default: http://localhost:1234/v1)

## Setup

Install dependencies in each workspace:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

Run both apps:

```bash
npm run dev
```

Endpoints:
- Frontend: http://localhost:4200
- Backend: http://localhost:3000
- Health: http://localhost:3000/health

## Configuration

Optional environment variables:
- `LM_STUDIO_URL` (default: http://localhost:1234/v1)
- `LM_STUDIO_MODEL` (default: dolphin3.0-llama3.1-8b)
- `PORT` (default: 3000)

## Data Flow

1. Player sends action from the UI.
2. Backend calls LM Studio with story history + summary.
3. AI returns JSON updates (narrative + state changes).
4. Backend applies changes with `applyStateUpdate` and saves the session.
5. Frontend updates signals and localStorage.

## Inventory and Equipment Rules

- Equipped items must not remain in inventory.
- Unequip moves the item back to inventory.
- AI updates must send the full inventory list when inventory changes.

## API Summary

- `GET /api/game/list` list saved games (in memory)
- `POST /api/game/new` create a new game
- `POST /api/game/restore` restore a saved game state
- `GET /api/game/:id/state` fetch current state
- `POST /api/game/:id/action` send player or system actions

## Storage Notes

Backend storage is in-memory and resets on restart. The frontend mirrors saves in localStorage.

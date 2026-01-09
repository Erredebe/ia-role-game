# IA Role Game - Agent Notes

## Project Overview

Narrative RPG where the backend acts as a dungeon master through a local LLM. The frontend shows the story, character sheet, inventory, and equipment, with system actions for equip/unequip.

## Quick Commands

```bash
npm run dev
```

Subprojects:
- Backend: `cd backend && npm run dev`
- Frontend: `cd frontend && npm start`

## Architecture

- Backend: Express API + LM Studio adapter + in-memory storage.
- Frontend: Angular Signals for state, localStorage for client persistence.

## Critical Invariants

- Equipped items must not remain in inventory.
- Unequip moves the item back to inventory.
- When AI updates inventory, it must send the full list.

## Key Files

- `backend/src/controllers/game.controller.ts` API flow and session lifecycle.
- `backend/src/services/lmstudio.service.ts` AI prompt and response parsing.
- `backend/src/utils/state.helper.ts` inventory/equipment reconciliation.
- `frontend/src/app/services/game.service.ts` API calls + localStorage sync.
- `frontend/src/app/components/game/game.component.ts` UI actions and stat totals.

## Storage Notes

Backend state resets on restart. Frontend caches saves in localStorage.

# Frontend

Angular client for IA Role Game. It renders the narrative, character sheet, inventory, and equipment panel.

## Setup

```bash
npm install
npm start
```

The frontend expects the backend at `http://localhost:3000`.

## Notes

- Themes change by environment selection.
- Game state is cached in localStorage via `GameService`.

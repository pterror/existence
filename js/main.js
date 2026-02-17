// main.js — module entry point
// Creates the game context and starts the game.

import { createGameContext } from './context.js';

const ctx = createGameContext();

document.addEventListener('DOMContentLoaded', () => ctx.game.init());

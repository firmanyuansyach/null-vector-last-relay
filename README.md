# null-vector-last-relay

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/firmanyuansyach/null-vector-last-relay/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/firmanyuansyach/null-vector-last-relay/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

**NULL VECTOR: The Last Relay** is a dense top-down arcade defense game about keeping a signal core alive through eight escalating breach waves. Switch between Arc and Flux modes, build a capacitor, dash through threats, collect salvage, slot modules, and break two bosses.

## Run it

```sh
node serve.mjs
```

Open `http://localhost:8081/` in a desktop browser. The game runs offline with no build step or external assets.

## Controls

| Input | Action |
| --- | --- |
| WASD or arrow keys | Move |
| Aim with the pointer and hold left mouse | Fire arc bolts |
| Q | Toggle Arc and Flux modes |
| E | Release a full-capacitor nova |
| F | Spend 10 scrap to repair 18 core integrity |
| Space | Dash |
| P or Escape | Pause / resume |
| M | Mute / unmute sound |
| 1, 2, or 3 | Choose a module between waves |
| R | Restart after a run |

## The run

Keep the Relay Core above zero while breaking eight waves. Hostiles converge on the core; pylons fire at the pilot, while breach bosses telegraph wide projectile patterns. Flux Mode pulls salvage, absorbs nearby shots, and builds the capacitor for a nova. Shattered hostiles drop scrap and extend the score chain. The pilot starts with a Hot Coil and Gravity Lens; seven intermissions let you slot seven more modules from a 12-module pool. The fourth and eighth waves bring distinct bosses.

The HUD tracks the wave, score, chain, core integrity, hull, capacitor, incoming mix, boss health, modules, rig readout, and controls. Art and sound are generated locally by canvas and Web Audio.

## License

MIT. See `LICENSE`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=abdhv0q7&utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>


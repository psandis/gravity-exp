# GravityExp

[![npm](https://img.shields.io/npm/v/gravityexp?style=flat-square)](https://www.npmjs.com/package/gravityexp)

[Live Demo](https://psandis.github.io/gravity-exp/) | [GitHub](https://github.com/psandis/gravity-exp)

GravityExp is a real-time Solar System gravity exploration app built in 3D. It renders all planets from Mercury to Pluto with real NASA surface textures, the International Space Station as a 3D GLB model, live orbital mechanics based on J2000 astronomical data, and an interactive camera that lets you fly to any body and orbit it freely.

## What It Does

- renders all planets from Mercury to Pluto with real NASA surface textures
- International Space Station rendered as a scaled 3D GLB model orbiting Earth
- starts each planet at today's actual sky position using J2000 orbital mechanics
- simulated clock: 1 real second equals 1 Earth day at 1x speed, adjustable up to 20x
- click any body to fly in and orbit it freely with the POI camera
- fast-body snap for the ISS: camera moves instantly instead of transitioning
- Quick Jump dropdown in the HUD to fly to any body instantly
- draggable HUD panel showing gravity, mass, temperature, orbital period, day length, and weight for a 70 kg person
- inline DISPLAY settings to toggle orbit rings, sim clock, and adjust orbit opacity and brightness
- draggable Wikipedia panel for every body, loaded from the Wikipedia REST API
- hover tooltip following the cursor, not broken by zoom or camera movement

## Requirements

- Node 22+

For development: pnpm

## Install

[gravityexp on npm](https://www.npmjs.com/package/gravityexp)

Clone and run from source:

```bash
git clone https://github.com/psandis/gravity-exp.git
cd gravity-exp
pnpm install
pnpm dev
```

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Controls

| Input | Action |
|-------|--------|
| Scroll | Zoom in and out |
| Drag | Orbit the scene |
| Click body | Fly to it and orbit freely |
| Click empty space | Return to overview |
| Speed slider | Pause or accelerate simulation (0 to 20x) |
| DISPLAY toggle | Expand inline settings in the HUD panel |
| Quick Jump | Select any body from the dropdown to fly to it |

## Tech Stack

- **React** 19
- **Vite** 8
- **React Three Fiber** 9
- **Three.js** 0.184
- **@react-three/drei** 10
- **pnpm**

## Project Structure

```
gravityexp/
├── .github/
│   └── workflows/
│       └── deploy.yml     GitHub Pages deployment
├── public/
│   ├── models/            3D GLB models (ISS)
│   └── textures/          NASA surface textures for all bodies
├── src/
│   ├── components/
│   │   ├── CelestialBody.jsx
│   │   ├── Controls.jsx
│   │   ├── HUD.jsx
│   │   ├── InfoPanel.jsx
│   │   ├── OrbitRing.jsx
│   │   ├── Scene.jsx
│   │   ├── SimClock.jsx
│   │   └── Tooltip.jsx
│   ├── data/
│   │   ├── config.json    Scene and behavior values
│   │   ├── planets.json   Astronomical and physical data for all bodies
│   │   └── theme.json     All colors, fonts, and spacing
│   ├── utils/
│   │   └── orbital.js     J2000 orbital mechanics and date formatting
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── pnpm-lock.yaml
├── vite.config.js
├── LICENSE
└── README.md
```

## Development

```bash
git clone https://github.com/psandis/gravity-exp.git
cd gravity-exp
pnpm install
pnpm dev
pnpm build
pnpm preview
```

## Testing

No tests yet.

## How It Works

### Orbital Mechanics
Each planet has a `meanLongitudeJ2000` and `dailyMotionDeg` in `planets.json`. On load, `initialAngleForDate()` computes the planet's current angle from days elapsed since the J2000 epoch (1 January 2000, 12:00 TT). Each frame, angles advance by `radiansPerSimDay * simDaysDelta`, where `simDaysDelta = delta * speedMultiplier`.

### POI Camera
When a body is selected, the camera transitions toward a target position offset from it. The offset distance is set per body via `scenePoiCamOffset` in `planets.json`, with a global minimum from `poiMinCamOffset` in `config.json`. Once close enough, `poiReady` is set and the camera shifts by the body's frame-to-frame delta, preserving free orbit via OrbitControls. Fast-orbiting bodies like the ISS skip the transition and snap the camera immediately.

### Satellite System
Earth satellites are driven by the `moons` array on the Earth entry in `planets.json`. Adding a new satellite requires only a new entry in that array and a matching body definition: no component changes needed. Each satellite's orbit ring is rendered relative to Earth's position.

### Config-Driven Architecture
No values are hardcoded in components. `src/data/config.json` controls all scene and behavior constants. `src/data/theme.json` controls all colors, fonts, and spacing.

## License

MIT - see [LICENSE](LICENSE).

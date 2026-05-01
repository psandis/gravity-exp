# GravityExp

[![npm](https://img.shields.io/npm/v/gravityexp?style=flat-square)](https://www.npmjs.com/package/gravityexp)

[Live Demo](https://psandis.github.io/gravity-exp/) | [GitHub](https://github.com/psandis/gravity-exp)

GravityExp is a real-time Solar System gravity exploration app built in 3D. It renders all planets from Mercury to Pluto with real NASA surface textures, live orbital mechanics based on J2000 astronomical data, and an interactive camera that lets you fly to any body and orbit it freely.

## Live Features

- **All Planets + Moon** - Sun through Pluto including Earth's Moon, each with real NASA surface textures
- **J2000 Orbital Mechanics** - Planets start at today's actual sky positions, computed from J2000 mean longitude and daily motion data
- **Simulated Clock** - 1 real second equals 1 Earth day at 1x speed, adjustable up to 20x with a speed slider
- **POI Camera** - Click any body to fly in and orbit it freely. Click empty space to return to the overview
- **HUD Panel** - Draggable panel showing position, surface gravity, mass, temperature, orbital period, day length, and a weight calculation for a 70 kg person
- **DISPLAY Settings** - Inline collapsible section in the HUD to toggle orbit rings, selection ring, and sim clock, and adjust orbit opacity and scene brightness
- **Wikipedia Panel** - Draggable, collapsible info panel for every body, loaded from the Wikipedia REST API
- **Hover Tooltip** - DOM-space tooltip following the cursor, not broken by zoom or camera movement

## Controls

- **Scroll** - Zoom in and out
- **Drag** - Orbit the scene
- **Click body** - Fly to it and orbit freely
- **Click empty space** - Return to overview
- **Speed slider** - Pause or accelerate simulation (0 to 20x)
- **DISPLAY toggle** - Expand inline settings in the HUD panel

## Tech Stack

- **React** 18
- **Vite** 5
- **React Three Fiber** 8
- **Three.js** 0.165
- **@react-three/drei** 9
- **pnpm**

## Project Structure

```
gravityexp/
├── public/
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
├── vite.config.js
├── LICENSE
└── README.md
```

## Getting Started

```bash
pnpm install
pnpm dev
```

## How It Works

### Orbital Mechanics
Each planet has a `meanLongitudeJ2000` and `dailyMotionDeg` in `planets.json`. On load, `initialAngleForDate()` computes the planet's current angle from days elapsed since the J2000 epoch (1 January 2000, 12:00 TT). Each frame, angles advance by `radiansPerSimDay * simDaysDelta`, where `simDaysDelta = delta * speedMultiplier`.

### POI Camera
When a planet is selected, the camera lerps toward a target position offset from the planet. Once close enough, `poiReady` is set and the camera shifts by the planet's frame-to-frame delta instead of lerping, preserving free orbit via OrbitControls.

### Config-Driven Architecture
No values are hardcoded in components. `src/data/config.json` controls all scene and behavior constants. `src/data/theme.json` controls all colors, fonts, and spacing.

## License

MIT - see [LICENSE](LICENSE).

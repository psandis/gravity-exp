import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import HUD from './components/HUD'
import Controls from './components/Controls'
import InfoPanel from './components/InfoPanel'
import SimClock from './components/SimClock'
import Tooltip from './components/Tooltip'
import { formatSimDate } from './utils/orbital'
import cfg from './data/config.json'

export default function App() {
  const [selected, setSelected] = useState(null)
  const [positions, setPositions] = useState({})
  const [speedMultiplier, setSpeedMultiplier] = useState(cfg.scene.defaultSpeedMultiplier)
  const [viewMode, setViewMode] = useState('overview')
  const [simDate, setSimDate] = useState(new Date())
  const [tooltip, setTooltip] = useState(null)

  // Display panel state
  const [showOrbits, setShowOrbits] = useState(cfg.ui.showOrbitRings)
  const [showSelection, setShowSelection] = useState(true)
  const [showSimClock, setShowSimClock] = useState(cfg.ui.showSimClock)
  const [orbitOpacity, setOrbitOpacity] = useState(cfg.ui.orbitRingOpacity)
  const [ambientBrightness, setAmbientBrightness] = useState(cfg.scene.ambientLightIntensity)

  const handleSelect = useCallback((data) => {
    setSelected(data)
    setViewMode('poi')
  }, [])

  const handlePositionUpdate = useCallback((pos) => {
    setPositions(pos)
  }, [])

  const handleSimDateUpdate = useCallback((date) => {
    setSimDate(date)
  }, [])

  const handleExitPOI = useCallback(() => {
    setSelected(null)
    setViewMode('overview')
  }, [])

  const handleHover = useCallback((data, x, y) => {
    setTooltip({ data, x, y })
  }, [])

  const handleHoverEnd = useCallback(() => {
    setTooltip(null)
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#000' }}>
      <Canvas
        camera={{ position: cfg.scene.cameraStartPosition, fov: cfg.scene.cameraFov, near: 0.1, far: 2000 }}
        gl={{ antialias: true, toneMapping: 0 }}
        onPointerMissed={() => { setSelected(null); setViewMode('overview') }}
      >
        <Scene
          speedMultiplier={speedMultiplier}
          selected={selected}
          onSelect={handleSelect}
          onPositionUpdate={handlePositionUpdate}
          onSimDateUpdate={handleSimDateUpdate}
          onHover={handleHover}
          onHoverEnd={handleHoverEnd}
          viewMode={viewMode}
          showOrbits={showOrbits}
          showSelection={showSelection}
          orbitOpacity={orbitOpacity}
          ambientBrightness={ambientBrightness}
          cfg={cfg.scene}
        />
      </Canvas>

      {showSimClock && (
        <SimClock simDate={formatSimDate(simDate)} speedMultiplier={speedMultiplier} />
      )}

      {cfg.ui.showHUD && (
        <HUD
          selected={selected}
          positions={positions}
          speedMultiplier={speedMultiplier}
          viewMode={viewMode}
          showOrbits={showOrbits} onToggleOrbits={() => setShowOrbits(v => !v)}
          showSelection={showSelection} onToggleSelection={() => setShowSelection(v => !v)}
          showSimClock={showSimClock} onToggleSimClock={() => setShowSimClock(v => !v)}
          orbitOpacity={orbitOpacity} onOrbitOpacityChange={setOrbitOpacity}
          ambientBrightness={ambientBrightness} onAmbientBrightnessChange={setAmbientBrightness}
        />
      )}

      <Controls
        speedMultiplier={speedMultiplier}
        onSpeedChange={setSpeedMultiplier}
        maxSpeed={cfg.scene.maxSpeedMultiplier}
        viewMode={viewMode}
        onExitPOI={handleExitPOI}
        selected={selected}
      />

{cfg.ui.showInfoPanel && selected && <InfoPanel selected={selected} />}

      {tooltip && <Tooltip data={tooltip.data} x={tooltip.x} y={tooltip.y} />}
    </div>
  )
}

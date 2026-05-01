import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import planetsData from '../data/planets.json'
import CelestialBody from './CelestialBody'
import OrbitRing from './OrbitRing'
import { orbitalPosition, initialAngleForDate, radiansPerSimDay, addDays } from '../utils/orbital'

const PLANET_KEYS = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']
const START_DATE = new Date()

// Compute initial angles at module load time so they're ready before first frame
const INITIAL_ANGLES = Object.fromEntries(
  [...PLANET_KEYS, 'moon'].map(key => [
    key,
    initialAngleForDate(planetsData[key] ?? planetsData.moon, START_DATE)
  ])
)

export default function Scene({ speedMultiplier, selected, onSelect, onPositionUpdate, onSimDateUpdate, viewMode, onHover, onHoverEnd, showOrbits, showSelection, orbitOpacity, ambientBrightness, cfg }) {
  const anglesRef = useRef({ ...INITIAL_ANGLES })
  const positionsRef = useRef({})
  const simDaysRef = useRef(0)
  const lastDateUpdateRef = useRef(0)
  const controlsRef = useRef()
  const { camera } = useThree()

  const overviewTarget = useRef(new THREE.Vector3(0, 0, 0))
  const overviewPos = useRef(new THREE.Vector3(0, 40, 80))
  const returningToOverview = useRef(false)
  const prevPlanetPos = useRef(new THREE.Vector3())
  const poiReady = useRef(false)

  useEffect(() => {
    if (viewMode === 'overview') {
      returningToOverview.current = true
      poiReady.current = false
    }
    if (viewMode === 'poi') {
      poiReady.current = false
    }
  }, [viewMode, selected])

  useFrame((_, delta) => {
    // delta is real seconds; at 1x: 1 real second = 1 sim day
    const simDaysDelta = delta * speedMultiplier
    simDaysRef.current += simDaysDelta

    const newPositions = {}

    // Update planet angles (radians per sim day * sim days elapsed)
    PLANET_KEYS.forEach(key => {
      const data = planetsData[key]
      anglesRef.current[key] += radiansPerSimDay(data) * simDaysDelta
      const pos = orbitalPosition(anglesRef.current[key], data.sceneOrbitRadius)
      positionsRef.current[key] = { ...pos, name: data.name }
      newPositions[data.name] = pos
    })

    // Moon orbits Earth
    const earthPos = positionsRef.current['earth']
    if (earthPos) {
      anglesRef.current['moon'] += radiansPerSimDay(planetsData.moon) * simDaysDelta
      const moonLocal = orbitalPosition(anglesRef.current['moon'], planetsData.moon.sceneOrbitRadius)
      const moonWorld = {
        x: earthPos.x + moonLocal.x,
        y: 0,
        z: earthPos.z + moonLocal.z,
      }
      positionsRef.current['moon'] = { ...moonWorld, name: 'Moon' }
      newPositions['Moon'] = moonWorld
    }

    positionsRef.current['sun'] = { x: 0, y: 0, z: 0 }
    newPositions['Sun'] = { x: 0, y: 0, z: 0 }

    if (viewMode === 'poi' && selected && controlsRef.current) {
      returningToOverview.current = false
      const key = selected.name === 'Moon' ? 'moon' : selected.name.toLowerCase()
      const pos = positionsRef.current[key]
      if (pos) {
        const newPos = new THREE.Vector3(pos.x, pos.y, pos.z)
        if (!poiReady.current) {
          // Initial fly-in transition
          const r = selected.sceneRadius
          const targetCamPos = new THREE.Vector3(pos.x + r * 4, pos.y + r * 2, pos.z + r * 4)
          controlsRef.current.target.lerp(newPos, cfg?.poiTargetTransitionSpeed ?? 0.08)
          camera.position.lerp(targetCamPos, cfg?.poiCameraTransitionSpeed ?? 0.05)
          controlsRef.current.update()
          if (camera.position.distanceTo(targetCamPos) < 1.0) {
            poiReady.current = true
            prevPlanetPos.current.copy(newPos)
          }
        } else {
          // Tracking: shift camera and target by planet's movement, user rotates freely
          const delta3 = newPos.clone().sub(prevPlanetPos.current)
          camera.position.add(delta3)
          controlsRef.current.target.add(delta3)
          prevPlanetPos.current.copy(newPos)
          controlsRef.current.update()
        }
      }
    } else if (returningToOverview.current && controlsRef.current) {
      controlsRef.current.target.lerp(overviewTarget.current, cfg?.overviewReturnSpeed ?? 0.06)
      camera.position.lerp(overviewPos.current, cfg?.overviewReturnSpeed ?? 0.06)
      controlsRef.current.update()
      const distToTarget = camera.position.distanceTo(overviewPos.current)
      if (distToTarget < 0.5) returningToOverview.current = false
    }

    onPositionUpdate(newPositions)

    // Throttle sim date updates to ~once per second
    lastDateUpdateRef.current += delta
    if (lastDateUpdateRef.current >= 0.25) {
      lastDateUpdateRef.current = 0
      onSimDateUpdate(addDays(START_DATE, simDaysRef.current))
    }
  })

  const getPlanetPos = (key) => {
    const p = positionsRef.current[key]
    return p ? [p.x, 0, p.z] : [planetsData[key].sceneOrbitRadius, 0, 0]
  }

  const getMoonPos = () => {
    const p = positionsRef.current['moon']
    const e = positionsRef.current['earth']
    if (p) return [p.x, 0, p.z]
    if (e) return [e.x + planetsData.moon.sceneOrbitRadius, 0, e.z]
    return [planetsData.earth.sceneOrbitRadius + planetsData.moon.sceneOrbitRadius, 0, 0]
  }

  return (
    <>
      <OrbitControls ref={controlsRef} enableDamping dampingFactor={cfg?.orbitDampingFactor ?? 0.05} minDistance={cfg?.orbitMinDistance ?? 2} maxDistance={cfg?.orbitMaxDistance ?? 200} />
      <Stars radius={cfg?.starRadius ?? 300} depth={cfg?.starDepth ?? 60} count={cfg?.starCount ?? 6000} factor={cfg?.starFactor ?? 4} fade />
      <ambientLight intensity={ambientBrightness ?? cfg?.ambientLightIntensity ?? 0.5} />
      <hemisphereLight groundColor="#000000" color="#334466" intensity={cfg?.hemisphereLightIntensity ?? 0.3} />
      <pointLight position={[0, 0, 0]} intensity={cfg?.sunLightIntensity ?? 6} distance={cfg?.sunLightDistance ?? 500} decay={cfg?.sunLightDecay ?? 0.5} color="#FFF5E0" />

      <CelestialBody
        data={planetsData.sun}
        position={[0, 0, 0]}
        onClick={onSelect}
        isSelected={selected?.name === 'Sun'}
        showSelection={showSelection}
        speedMultiplier={speedMultiplier}
        onHover={onHover}
        onHoverEnd={onHoverEnd}
      />

      {PLANET_KEYS.map(key => (
        <group key={key}>
          {showOrbits && <OrbitRing radius={planetsData[key].sceneOrbitRadius} opacity={orbitOpacity} />}
          <CelestialBody
            data={planetsData[key]}
            position={getPlanetPos(key)}
            onClick={onSelect}
            isSelected={selected?.name === planetsData[key].name}
            showSelection={showSelection}
            speedMultiplier={speedMultiplier}
            onHover={onHover}
            onHoverEnd={onHoverEnd}
          />
        </group>
      ))}

      <CelestialBody
        data={planetsData.moon}
        position={getMoonPos()}
        onClick={onSelect}
        isSelected={selected?.name === 'Moon'}
        showSelection={showSelection}
        speedMultiplier={speedMultiplier}
        onHover={onHover}
        onHoverEnd={onHoverEnd}
      />
    </>
  )
}

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import planetsData from '../data/planets.json'
import CelestialBody from './CelestialBody'
import OrbitRing from './OrbitRing'
import { orbitalPosition, initialAngleForDate, radiansPerSimDay, addDays } from '../utils/orbital'

const PLANET_KEYS = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']
const EARTH_SATELLITES = planetsData.earth.moons || ['moon']
const START_DATE = new Date()

const INITIAL_ANGLES = Object.fromEntries(
  [...PLANET_KEYS, ...EARTH_SATELLITES].map(key => [
    key,
    initialAngleForDate(planetsData[key], START_DATE)
  ])
)

const findBodyKey = (name) =>
  Object.keys(planetsData).find(k => planetsData[k].name === name) || name.toLowerCase()

export default function Scene({ speedMultiplier, selected, onSelect, onPositionUpdate, onSimDateUpdate, viewMode, onHover, onHoverEnd, showOrbits, orbitOpacity, ambientBrightness, cfg }) {
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
    const simDaysDelta = delta * speedMultiplier
    simDaysRef.current += simDaysDelta

    const newPositions = {}

    const sceneRadPerDay = (data) =>
      ((data.sceneDailyMotionDeg ?? data.dailyMotionDeg) * Math.PI / 180)

    PLANET_KEYS.forEach(key => {
      const data = planetsData[key]
      anglesRef.current[key] += sceneRadPerDay(data) * simDaysDelta
      const pos = orbitalPosition(anglesRef.current[key], data.sceneOrbitRadius)
      positionsRef.current[key] = { ...pos, name: data.name }
      newPositions[data.name] = pos
    })

    const earthPos = positionsRef.current['earth']
    if (earthPos) {
      EARTH_SATELLITES.forEach(key => {
        const data = planetsData[key]
        anglesRef.current[key] += sceneRadPerDay(data) * simDaysDelta
        const localPos = orbitalPosition(anglesRef.current[key], data.sceneOrbitRadius)
        const worldPos = { x: earthPos.x + localPos.x, y: 0, z: earthPos.z + localPos.z }
        positionsRef.current[key] = { ...worldPos, name: data.name }
        newPositions[data.name] = worldPos
      })
    }

    positionsRef.current['sun'] = { x: 0, y: 0, z: 0 }
    newPositions['Sun'] = { x: 0, y: 0, z: 0 }

    if (viewMode === 'poi' && selected && controlsRef.current) {
      returningToOverview.current = false
      const key = findBodyKey(selected.name)
      const pos = positionsRef.current[key]
      if (pos) {
        const newPos = new THREE.Vector3(pos.x, pos.y, pos.z)
        if (!poiReady.current) {
          const r = selected.sceneRadius
          const camOffset = selected.scenePoiCamOffset ?? Math.max(r * 4, cfg?.poiMinCamOffset ?? 2.5)
          const parentKey = selected.parent
          const parentPos = parentKey ? positionsRef.current[parentKey] : null
          const refX = parentPos ? pos.x - parentPos.x : pos.x
          const refZ = parentPos ? pos.z - parentPos.z : pos.z
          const len = Math.sqrt(refX * refX + refZ * refZ)
          const dirX = len > 0 ? refX / len : 1
          const dirZ = len > 0 ? refZ / len : 0
          const targetCamPos = new THREE.Vector3(pos.x + dirX * camOffset, pos.y + camOffset * 0.5, pos.z + dirZ * camOffset)
          const fastBody = selected.orbitalPeriodDays > 0 && selected.orbitalPeriodDays < 1
          if (fastBody) {
            camera.position.copy(targetCamPos)
            controlsRef.current.target.copy(newPos)
            controlsRef.current.update()
            poiReady.current = true
            prevPlanetPos.current.copy(newPos)
          } else {
            controlsRef.current.target.lerp(newPos, cfg?.poiTargetTransitionSpeed ?? 0.08)
            camera.position.lerp(targetCamPos, cfg?.poiCameraTransitionSpeed ?? 0.05)
            controlsRef.current.update()
            if (camera.position.distanceTo(targetCamPos) < 1.0) {
              poiReady.current = true
              prevPlanetPos.current.copy(newPos)
            }
          }
        } else {
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
      if (camera.position.distanceTo(overviewPos.current) < 0.5) returningToOverview.current = false
    }

    onPositionUpdate(newPositions)

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

  const getSatellitePos = (key) => {
    const p = positionsRef.current[key]
    const e = positionsRef.current['earth']
    if (p) return [p.x, 0, p.z]
    if (e) return [e.x + planetsData[key].sceneOrbitRadius, 0, e.z]
    return [planetsData.earth.sceneOrbitRadius + planetsData[key].sceneOrbitRadius, 0, 0]
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
            onHover={onHover}
            onHoverEnd={onHoverEnd}
          />
        </group>
      ))}

      {EARTH_SATELLITES.map(key => (
        <group key={key}>
          {showOrbits && (
            <group position={getPlanetPos('earth')}>
              <OrbitRing radius={planetsData[key].sceneOrbitRadius} opacity={orbitOpacity} />
            </group>
          )}
          <CelestialBody
            data={planetsData[key]}
            position={getSatellitePos(key)}
            onClick={onSelect}
            onHover={onHover}
            onHoverEnd={onHoverEnd}
          />
        </group>
      ))}
    </>
  )
}

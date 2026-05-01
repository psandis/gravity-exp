import { useRef, useState, Suspense, Component } from 'react'
import { useTexture, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import cfg from '../data/config.json'

const ROTATION_RATE = (2 * Math.PI) / cfg.scene.earthVisualRotationSeconds

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: false } }
  static getDerivedStateFromError() { return { error: true } }
  render() { return this.state.error ? this.props.fallback : this.props.children }
}

function SaturnRings({ radius }) {
  return (
    <mesh rotation={[Math.PI / 2.2, 0, 0]}>
      <ringGeometry args={[radius * 1.3, radius * 2.2, 64]} />
      <meshBasicMaterial color="#C8B560" side={THREE.DoubleSide} opacity={0.6} transparent />
    </mesh>
  )
}

function TexturedSphere({ data, isSun }) {
  const texture = useTexture(data.texture)
  return (
    <meshStandardMaterial
      map={texture}
      roughness={isSun ? 1 : 0.8}
      metalness={0}
      emissive={isSun ? new THREE.Color('#FDB813') : new THREE.Color('#000000')}
      emissiveIntensity={isSun ? 0.6 : 0}
    />
  )
}

function FallbackMaterial({ data, isSun }) {
  return (
    <meshStandardMaterial
      color={data.color}
      roughness={0.8}
      metalness={0}
      emissive={isSun ? new THREE.Color(data.color) : new THREE.Color('#000000')}
      emissiveIntensity={isSun ? 0.5 : 0}
    />
  )
}

function ModelBody({ data }) {
  const { scene } = useGLTF(data.model)
  const groupRef = useRef()
  const ready = useRef(false)

  useFrame(() => {
    if (ready.current || !groupRef.current) return
    const box = new THREE.Box3().setFromObject(groupRef.current)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    if (maxDim === 0) return
    const s = (data.sceneRadius * 2) / maxDim
    const center = new THREE.Vector3()
    box.getCenter(center)
    groupRef.current.scale.setScalar(s)
    groupRef.current.position.set(-center.x * s, -center.y * s, -center.z * s)
    groupRef.current.visible = true
    ready.current = true
  })

  return (
    <group ref={groupRef} visible={false}>
      <primitive object={scene} />
    </group>
  )
}

export default function CelestialBody({ data, position, onClick, onHover, onHoverEnd }) {
  const groupRef = useRef()
  const isSun = data.type === 'star'
  const hasModel = !!data.model

  useFrame((_, delta) => {
    if (groupRef.current && data.visualRotation !== false) {
      groupRef.current.rotation.y += ROTATION_RATE * delta
    }
  })

  const handleClick = (e) => { e.stopPropagation(); onClick(data) }
  const handleOver = (e) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
    onHover(data, e.clientX, e.clientY)
  }
  const handleMove = (e) => { onHover(data, e.clientX, e.clientY) }
  const handleOut = () => {
    document.body.style.cursor = 'auto'
    onHoverEnd()
  }

  return (
    <group position={position}>
      <group ref={groupRef}>
        {hasModel ? (
          <>
            <mesh
              onClick={handleClick}
              onPointerOver={handleOver}
              onPointerMove={handleMove}
              onPointerOut={handleOut}
            >
              <sphereGeometry args={[data.sceneRadius, 16, 16]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            <ErrorBoundary fallback={
              <mesh>
                <sphereGeometry args={[data.sceneRadius, 16, 16]} />
                <FallbackMaterial data={data} isSun={false} />
              </mesh>
            }>
              <Suspense fallback={
                <mesh>
                  <sphereGeometry args={[data.sceneRadius, 16, 16]} />
                  <meshStandardMaterial color={data.color} metalness={0.6} roughness={0.3} />
                </mesh>
              }>
                <ModelBody data={data} />
              </Suspense>
            </ErrorBoundary>
          </>
        ) : (
          <mesh
            onClick={handleClick}
            onPointerOver={handleOver}
            onPointerMove={handleMove}
            onPointerOut={handleOut}
          >
            <sphereGeometry args={[data.sceneRadius, 48, 48]} />
            {data.texture ? (
              <ErrorBoundary fallback={<FallbackMaterial data={data} isSun={isSun} />}>
                <Suspense fallback={<FallbackMaterial data={data} isSun={isSun} />}>
                  <TexturedSphere data={data} isSun={isSun} />
                </Suspense>
              </ErrorBoundary>
            ) : (
              <FallbackMaterial data={data} isSun={isSun} />
            )}
          </mesh>
        )}
      </group>

      {data.hasRings && <SaturnRings radius={data.sceneRadius} />}
    </group>
  )
}

useGLTF.preload('/models/ISS_stationary.glb')

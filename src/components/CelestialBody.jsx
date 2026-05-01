import { useRef, useState, Suspense, Component } from 'react'
import { useTexture } from '@react-three/drei'
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

export default function CelestialBody({ data, position, onClick, isSelected, showSelection, onHover, onHoverEnd }) {
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)
  const isSun = data.type === 'star'

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += ROTATION_RATE * delta
    }
  })

  const handleClick = (e) => { e.stopPropagation(); onClick(data) }
  const handleOver = (e) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
    setHovered(true)
    onHover(data, e.clientX, e.clientY)
  }
  const handleMove = (e) => { onHover(data, e.clientX, e.clientY) }
  const handleOut = () => {
    document.body.style.cursor = 'auto'
    setHovered(false)
    onHoverEnd()
  }

  return (
    <group position={position}>
      <group ref={groupRef}>
        <mesh
          onClick={handleClick}
          onPointerOver={handleOver}
          onPointerMove={handleMove}
          onPointerOut={handleOut}
        >
          <sphereGeometry args={[data.sceneRadius, 48, 48]} />
          <ErrorBoundary fallback={<FallbackMaterial data={data} isSun={isSun} />}>
            <Suspense fallback={<FallbackMaterial data={data} isSun={isSun} />}>
              <TexturedSphere data={data} isSun={isSun} />
            </Suspense>
          </ErrorBoundary>
        </mesh>
      </group>

      {data.hasRings && <SaturnRings radius={data.sceneRadius} />}

      {isSelected && showSelection !== false && (
        <mesh>
          <sphereGeometry args={[data.sceneRadius * 1.08, 32, 32]} />
          <meshBasicMaterial color="#ffffff" wireframe opacity={0.15} transparent />
        </mesh>
      )}
    </group>
  )
}

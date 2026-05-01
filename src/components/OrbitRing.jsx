import { useMemo } from 'react'
import * as THREE from 'three'
import cfg from '../data/config.json'

export default function OrbitRing({ radius, opacity }) {
  const points = useMemo(() => {
    const pts = []
    const segments = cfg.scene.orbitRingSegments
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius))
    }
    return pts
  }, [radius])

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          count={points.length}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#ffffff" opacity={opacity ?? cfg.ui.orbitRingOpacity} transparent />
    </line>
  )
}

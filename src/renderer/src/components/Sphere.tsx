import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

const CustomParticleSphere = ({ count = 5000 }) => {
  const mesh = useRef<THREE.Points>(null)

  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3) // x, y, z for each point

    for (let i = 0; i < count; i++) {
      // We use a helper to spread them evenly
      const x = Math.random() * 2 - 1
      const y = Math.random() * 2 - 1
      const z = Math.random() * 2 - 1

      // Normalize to force them onto the sphere surface (radius = 2)
      const vector = new THREE.Vector3(x, y, z)
      vector.normalize().multiplyScalar(2) // Radius is 2

      temp[i * 3] = vector.x
      temp[i * 3 + 1] = vector.y
      temp[i * 3 + 2] = vector.z
    }
    return temp
  }, [count])

  // 2. Animate the Cloud
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.15 // Smooth Spin
      mesh.current.rotation.z += delta * 0.05 // Slight Tilt Spin

      // Optional: Pulse Effect (Breathing)
      const breath = 1 + Math.sin(state.clock.elapsedTime) * 0.05
      mesh.current.scale.set(breath, breath, breath)
    }
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          name="position"
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
          args={[particles, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#00F0FF"
        size={0.014}
        transparent={true}
        opacity={0.8}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

const Sphere = () => {
  return (
    <Canvas camera={{ position: [0, 0, 4.5] }}>
      <ambientLight intensity={0.5} />
      <CustomParticleSphere />
      <OrbitControls enableZoom={false} />
    </Canvas>
  )
}

export default Sphere

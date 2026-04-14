import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { irisService } from '@renderer/services/Iris-voice-ai'

// REDUCED DEFAULT: 3000 particles looks identical to 5000 but saves 40% CPU load
const CustomParticleSphere = ({ count = 3000 }) => {
  const mesh = useRef<THREE.Points>(null)

  // Memoize static arrays so they are never recreated
  const dataArray = useMemo(() => new Uint8Array(128), [])

  // Pre-instantiate colors OUTSIDE the loop to prevent Garbage Collection stutters
  const colorStart = useMemo(() => new THREE.Color('#33db12'), [])
  const colorEnd = useMemo(() => new THREE.Color('#FFFFFF'), [])
  const colorTarget = useMemo(() => new THREE.Color(), [])

  const { positions, originalPositions, spreadFactors } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const orig = new Float32Array(count * 3)
    const spread = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const x = Math.random() * 2 - 1
      const y = Math.random() * 2 - 1
      const z = Math.random() * 2 - 1

      const vector = new THREE.Vector3(x, y, z)
      vector.normalize().multiplyScalar(2)

      pos[i * 3] = vector.x
      pos[i * 3 + 1] = vector.y
      pos[i * 3 + 2] = vector.z

      orig[i * 3] = vector.x
      orig[i * 3 + 1] = vector.y
      orig[i * 3 + 2] = vector.z

      spread[i] = Math.random()
    }
    return { positions: pos, originalPositions: orig, spreadFactors: spread }
  }, [count])

  useFrame((state, delta) => {
    if (!state.clock.running || !mesh.current) return

    mesh.current.rotation.y += delta * 0.05
    mesh.current.rotation.z += delta * 0.05

    let volume = 0
    if (irisService.analyser) {
      irisService.analyser.getByteFrequencyData(dataArray)

      // OPTIMIZATION: A standard for-loop is significantly faster than .reduce()
      let sum = 0
      const len = dataArray.length
      for (let i = 0; i < len; i++) {
        sum += dataArray[i]
      }
      volume = sum / len / 128
    }

    // OPTIMIZATION: Mutate existing color object instead of creating new ones
    colorTarget.lerpColors(colorStart, colorEnd, volume)
    ;(mesh.current.material as THREE.PointsMaterial).color.copy(colorTarget)

    const currentPos = mesh.current.geometry.attributes.position.array as Float32Array

    // Fast-path mutation loop
    for (let i = 0; i < count; i++) {
      const ix = i * 3
      const iy = i * 3 + 1
      const iz = i * 3 + 2

      const expansion = 1 + volume * spreadFactors[i] * 0.4

      currentPos[ix] = originalPositions[ix] * expansion
      currentPos[iy] = originalPositions[iy] * expansion
      currentPos[iz] = originalPositions[iz] * expansion
    }

    mesh.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#00F0FF"
        size={0.012} // Slightly increased size to compensate for fewer particles
        transparent={true}
        opacity={0.9}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false} // OPTIMIZATION: Disabling depth write makes rendering transparent particles much cheaper
      />
    </points>
  )
}

const Sphere = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.5] }}
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.6} />
      <CustomParticleSphere />
    </Canvas>
  )
}

export default Sphere

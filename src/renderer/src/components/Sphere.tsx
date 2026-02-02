import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { irisService } from '@renderer/services/Iris-voice-ai'

const CustomParticleSphere = ({ count = 5000 }) => {
  const mesh = useRef<THREE.Points>(null)
  
  // Audio Analysis Data
  const dataArray = useMemo(() => new Uint8Array(128), []);

  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const x = Math.random() * 2 - 1
      const y = Math.random() * 2 - 1
      const z = Math.random() * 2 - 1
      const vector = new THREE.Vector3(x, y, z)
      vector.normalize().multiplyScalar(2)
      temp[i * 3] = vector.x
      temp[i * 3 + 1] = vector.y
      temp[i * 3 + 2] = vector.z
    }
    return temp
  }, [count])

  useFrame((state, delta) => {
    if(!state.clock.running) return;
    if (mesh.current) {
      // 1. Basic Rotation
      mesh.current.rotation.y += delta * 0.15 
      mesh.current.rotation.z += delta * 0.05 

      // 2. 🎵 GET VOLUME FROM AI SERVICE 🎵
      let volume = 0;
      if (irisService.analyser) {
          irisService.analyser.getByteFrequencyData(dataArray);
          // Calculate average loudness
          const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
          volume = avg / 128; // Normalize 0-1
      }

      // 3. REACT TO VOICE
      // Base scale 1 + Volume Pulse * Intensity
      const targetScale = 1 + (volume * 0.3); 
      
      // Smooth interpolation (Lerp) so it doesn't jitter
      mesh.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.2);
      
      // Change Color on Talk: Blue -> Bright White/Cyan
      const color = new THREE.Color("#33db12").lerp(new THREE.Color("#FFFFFF"), volume);
      (mesh.current.material as THREE.PointsMaterial).color = color;
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
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#00F0FF"
        size={0.018} // Slightly thicker for visibility
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
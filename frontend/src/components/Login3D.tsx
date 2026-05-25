import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Icosahedron, Octahedron, Dodecahedron } from '@react-three/drei';
import * as THREE from 'three';

const FloatingShape = ({ position, shape, color, scale, speed }: {
  position: [number, number, number]; shape: string; color: string; scale: number; speed: number;
}) => {
  const ref = useRef<THREE.Group>(null);
  const [rot] = useState(() => ({ x: (Math.random() - 0.5) * speed * 0.3, y: (Math.random() - 0.5) * speed * 0.3 }));

  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.x += dt * rot.x;
      ref.current.rotation.y += dt * rot.y;
    }
  });

  const mat = <meshStandardMaterial color={color} wireframe transparent opacity={0.35} />;

  return (
    <Float speed={speed * 0.6} rotationIntensity={speed * 0.3} floatIntensity={speed * 0.2} position={position}>
      <group ref={ref}>
        {shape === 'icosa' && <Icosahedron args={[scale, 0]}>{mat}</Icosahedron>}
        {shape === 'octa' && <Octahedron args={[scale, 0]}>{mat}</Octahedron>}
        {shape === 'dodeca' && <Dodecahedron args={[scale, 0]}>{mat}</Dodecahedron>}
      </group>
    </Float>
  );
};

const Scene = ({ isMobile, variant }: { isMobile: boolean; variant: 'dark' | 'light' }) => {
  const shapes = ['icosa', 'octa', 'dodeca'];
  const colors = variant === 'dark'
    ? ['#a5b4fc', '#c4b5fd', '#93c5fd', '#a7f3d0', '#fde68a']
    : ['#c7d2fe', '#ddd6fe', '#bae6fd', '#a7f3d0', '#e2e8f0'];

  const [data] = useState(() => {
    const count = isMobile ? 6 : 12;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      position: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20, Math.random() * -12 - 3] as [number, number, number],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      scale: Math.random() * 0.35 + 0.15,
      speed: Math.random() * 0.4 + 0.1,
    }));
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-10, -5, 5]} intensity={0.4} color={variant === 'dark' ? '#6366f1' : '#4f46e5'} />
      {data.map(d => <FloatingShape key={d.id} {...d} />)}
    </>
  );
};

export const Login3D = ({ isMobile, variant = 'dark' }: { isMobile: boolean; variant?: 'dark' | 'light' }) => (
  <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
    <Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 0, 10], fov: 50 }}>
      <Scene isMobile={isMobile} variant={variant} />
    </Canvas>
  </div>
);

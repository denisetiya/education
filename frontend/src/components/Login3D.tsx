import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Float, Icosahedron, Octahedron, Dodecahedron, Trail } from '@react-three/drei';
import * as THREE from 'three';

// -----------------------------------------------------------------------------
// Component: FloatingGeometry
// -----------------------------------------------------------------------------
const FloatingGeometry = ({ position, shape, color, scale, speed }: { position: [number, number, number], shape: string, color: string, scale: number, speed: number }) => {
    const meshRef = useRef<THREE.Group>(null);
    
    // Random rotation speed
    const [rotSpeed] = useState(() => ({
        x: (Math.random() - 0.5) * speed,
        y: (Math.random() - 0.5) * speed
    }));

    useFrame((_state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * rotSpeed.x;
            meshRef.current.rotation.y += delta * rotSpeed.y;
        }
    });

    return (
        <Float speed={speed} rotationIntensity={speed} floatIntensity={speed / 2} position={position}>
            <group ref={meshRef}>
                {shape === 'icosa' && <Icosahedron args={[scale, 0]}><meshStandardMaterial color={color} wireframe transparent opacity={0.7} /></Icosahedron>}
                {shape === 'octa' && <Octahedron args={[scale, 0]}><meshStandardMaterial color={color} wireframe transparent opacity={0.7} /></Octahedron>}
                {shape === 'dodeca' && <Dodecahedron args={[scale, 0]}><meshStandardMaterial color={color} wireframe transparent opacity={0.7} /></Dodecahedron>}

            </group>
        </Float>
    );
};

// ... (FloatingGeometry remains the same)

// ... (FloatingGeometry remains same)

// -----------------------------------------------------------------------------
// Component: ShootingStar (Refined)
// -----------------------------------------------------------------------------
const ShootingStar = () => {
    const ref = useRef<THREE.Group>(null);
    const trailRef = useRef<THREE.Mesh>(null);
    
    // Logic state
    const state = useRef<{ active: boolean; timer: number; startX: number; startY: number; speed: number; }>({
        active: false,
        timer: 0,
        startX: 0,
        startY: 0,
        speed: 0
    });
    
    // Initialize random values on mount only
    useEffect(() => {
        state.current.timer = Math.random() * 5 + 3;
    }, []);

    const resetStar = () => {
        const startX = (Math.random() - 0.5) * 40; 
        const startY = Math.random() * 5 + 10;
        
        state.current.startX = startX;
        state.current.startY = startY;
        state.current.speed = Math.random() * 5 + 5; 
        
        if (ref.current) {
            ref.current.position.set(startX, startY, -10); 
        }
    };

    useFrame((_rootState, delta) => {
        const s = state.current;
        if (!s.active) {
            s.timer -= delta;
            if (s.timer <= 0) {
                s.active = true;
                resetStar();
            }
        } else {
            if (ref.current) {
                ref.current.position.x -= delta * s.speed * 0.5;
                ref.current.position.y -= delta * s.speed * 0.5;
                if (ref.current.position.y < -15) {
                    s.active = false;
                    s.timer = Math.random() * 8 + 4;
                }
            }
        }
    });

    return (
        <group ref={ref} position={[100, 100, 100]}>
            <Trail width={3} length={6} color={new THREE.Color("#a5b4fc")} attenuation={(t) => t * t}>
                <mesh ref={trailRef}>
                    <sphereGeometry args={[0.08]} />
                    <meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={0.6} />
                </mesh>
            </Trail>
        </group>
    );
};


// -----------------------------------------------------------------------------
// Component: DriftingCrystal (Replaces DriftingPlanet)
// -----------------------------------------------------------------------------
const DriftingCrystal = () => {
    const ref = useRef<THREE.Group>(null);
    
    // Setup state
    const state = useRef<{ active: boolean; timer: number; direction: number; speed: number; }>({
        active: false,
        timer: 0,
        direction: 1,
        speed: 0.2
    });

    useEffect(() => {
        state.current.timer = Math.random() * 5; // Start quicker
        state.current.direction = Math.random() > 0.5 ? 1 : -1;
    }, []);

    const resetCrystal = () => {
        const side = Math.random() > 0.5 ? 1 : -1;
        state.current.direction = -side; 
        state.current.speed = Math.random() * 0.2 + 0.1; // Very slow drift
        
        if (ref.current) {
            // Start off-screen Y randomized
            ref.current.position.set(20 * side, (Math.random() - 0.5) * 12, -8);
            
            // Random Rotation
            ref.current.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

            // Random Scale
            const scale = Math.random() * 0.5 + 0.8;
            ref.current.scale.set(scale, scale, scale);
        }
    };

    useFrame((_state, delta) => {
        const s = state.current;
        if (!s.active) {
            s.timer -= delta;
            if (s.timer <= 0) {
                s.active = true;
                resetCrystal();
            }
        } else {
            if (ref.current) {
                ref.current.position.x += delta * s.speed * s.direction;
                
                // Complex slow rotation
                ref.current.rotation.x += delta * 0.1;
                ref.current.rotation.y += delta * 0.15;
                
                if (Math.abs(ref.current.position.x) > 25) {
                    s.active = false;
                    s.timer = Math.random() * 10 + 5; 
                }
            }
        }
    });

    return (
        <group ref={ref} position={[100, 100, 100]}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                {/* Main Crystal Shape */}
                <Octahedron args={[1.5, 0]}>
                    <meshStandardMaterial 
                        color="#a5b4fc" 
                        roughness={0.1} 
                        metalness={0.1} 
                        transparent 
                        opacity={0.8}
                        flatShading
                    />
                </Octahedron>
                
                {/* Inner Core */}
                <Octahedron args={[0.8, 0]}>
                     <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.7} />
                </Octahedron>

                {/* Orbiting Shards */}
                <group rotation={[0, 0, Math.PI / 4]}>
                    <Icosahedron args={[0.3, 0]} position={[2, 0, 0]}>
                         <meshStandardMaterial color="#c7d2fe" flatShading />
                    </Icosahedron>
                </group>
                <group rotation={[Math.PI / 3, 0, 0]}>
                    <Icosahedron args={[0.2, 0]} position={[0, 1.8, 0]}>
                         <meshStandardMaterial color="#e0e7ff" flatShading />
                    </Icosahedron>
                </group>
            </Float>
        </group>
    );
}

// -----------------------------------------------------------------------------
// Component: Scene
// -----------------------------------------------------------------------------
const generateGeometryData = (count: number) => {
    const shapes = ['icosa', 'octa', 'dodeca'];
    const colors = ['#afb5ecff', '#eecfdeff', '#bccee9ff', '#bdeddeff', '#e2d4b9ff'];

    return new Array(count).fill(0).map((_, i) => ({
        id: i,
        position: [
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 25,
            (Math.random() * -15) - 2
        ] as [number, number, number],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        scale: Math.random() * 0.4 + 0.2,
        speed: Math.random() * 0.5 + 0.1
    }));
};

const Scene = ({ isMobile }: { isMobile: boolean }) => {
    // Generate random geometries on mount
    const [geometryData] = useState(() => {
        const count = isMobile ? 8 : 15;
        return generateGeometryData(count);
    });

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} />
            
            {/* Enhanced Lighting */}
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
            <pointLight position={[-15, -10, -5]} intensity={1} color="#4f46e5" />
            <pointLight position={[0, 5, 0]} intensity={0.5} color="#ec4899" />

            {/* Scattered Floating Geometries */}
            {geometryData.map((data) => (
                <FloatingGeometry 
                    key={data.id}
                    position={data.position}
                    shape={data.shape}
                    color={data.color}
                    scale={data.scale}
                    speed={data.speed}
                />
            ))}

            {/* Aesthetic Drifting Crystals */}
            <DriftingCrystal />
            <DriftingCrystal />

            {/* Shooting Stars */}
            <ShootingStar />
            <ShootingStar />
            <ShootingStar />
        </>
    );
};

// -----------------------------------------------------------------------------
// Main Export
// -----------------------------------------------------------------------------
export const Login3D = ({ isMobile }: { isMobile: boolean }) => {
    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
            <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
                <Scene isMobile={isMobile} />
            </Canvas>
        </div>
    );
};

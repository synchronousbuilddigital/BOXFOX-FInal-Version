"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, Move, CheckCircle2 } from 'lucide-react';

// We wrap the Three.js part in a separate component that ONLY runs on the client
// and uses a more defensive import strategy.
export default function Visualizer3D({ dimensions, sizeConfirmed, setSizeConfirmed }) {
    const [ThreeComponents, setThreeComponents] = useState(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Deferred loading of Three.js to avoid SSR/Turbopack module evaluation conflicts
        Promise.all([
            import('@react-three/fiber'),
            import('@react-three/drei'),
            import('three')
        ]).then(([fiber, drei, three]) => {
            setThreeComponents({ ...fiber, ...drei, THREE: three });
        }).catch(err => console.error("ThreeJS load error:", err));
    }, []);

    if (!isClient || !ThreeComponents) {
        return (
            <div className="relative h-[24rem] bg-[#020617] rounded-[2rem] border border-white/5 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="animate-spin text-emerald-500/40" size={32} />
                    <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">Waking up ThreeJS Engine...</span>
                </div>
            </div>
        );
    }

    const { Canvas, Html, OrbitControls, PerspectiveCamera, Environment, ContactShadows, THREE } = ThreeComponents;

    // Scalar for view
    const { l, w, h } = dimensions;
    const scale = 0.5;
    const width = l * scale;
    const height = h * scale;
    const depth = w * scale;

    return (
        <div className="relative h-[24rem] bg-[#020617] rounded-[2rem] border border-white/5 overflow-hidden group">
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={45} />
                <OrbitControls enablePan={false} enableZoom={true} minDistance={3} maxDistance={10} />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />

                <group>
                    {/* Box Body */}
                    <mesh>
                        <boxGeometry args={[width, height, depth]} />
                        <meshStandardMaterial
                            color="#10b981"
                            transparent
                            opacity={0.15}
                            metalness={0.8}
                            roughness={0.2}
                        />
                        <lineSegments>
                            <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
                            <lineBasicMaterial color="#10b981" linewidth={2} />
                        </lineSegments>
                    </mesh>

                    {/* Floating Lid */}
                    <mesh position={[0, !sizeConfirmed ? height / 2 + 1.5 : height / 2 + 0.05, 0]}>
                        <boxGeometry args={[width, 0.02, depth]} />
                        <meshStandardMaterial color="#10b981" transparent opacity={0.4} />
                        <lineSegments>
                            <edgesGeometry args={[new THREE.BoxGeometry(width, 0.02, depth)]} />
                            <lineBasicMaterial color="#34d399" linewidth={4} />
                        </lineSegments>

                        <Html position={[0, 0.1, 0]} center>
                            <div className="bg-emerald-500 text-black px-2 py-0.5 rounded text-[10px] font-black whitespace-nowrap shadow-lg">
                                {l}" LENGTH
                            </div>
                        </Html>
                    </mesh>

                    {/* Width Label */}
                    <Html position={[width / 2 + 0.3, 0, 0]} center>
                        <div className="bg-emerald-900/80 text-emerald-400 px-2 py-0.5 rounded text-[8px] font-bold border border-emerald-500/30 whitespace-nowrap">
                            {w}" WIDTH
                        </div>
                    </Html>

                    {/* Height Label */}
                    <Html position={[-width / 2 - 0.5, 0, depth / 2]} center>
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-[1px] h-12 bg-emerald-500/30 relative">
                                <div className="absolute top-0 -left-1 w-2 h-[1px] bg-emerald-500" />
                                <div className="absolute bottom-0 -left-1 w-2 h-[1px] bg-emerald-500" />
                            </div>
                            <div className="bg-black/60 text-emerald-400 px-2 py-0.5 rounded text-[8px] font-bold border border-emerald-500/30 whitespace-nowrap">
                                H: {h}"
                            </div>
                        </div>
                    </Html>
                </group>

                <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={24} far={4.5} />
                <Environment preset="city" />
            </Canvas>

            <div className="absolute top-6 left-6 flex items-center gap-2 pointer-events-none">
                <div className="px-3 py-1 bg-black/80 border border-emerald-500/20 rounded-full flex items-center gap-2">
                    <RotateCw size={10} className="text-emerald-500 animate-spin" style={{ animationDuration: '3s' }} />
                    <span className="text-[8px] font-black tracking-widest text-emerald-400 uppercase">Interactive ThreeJS Lab</span>
                </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">
                    <Move size={12} /> Drag to inspect
                </div>
                <button
                    onClick={() => setSizeConfirmed(!sizeConfirmed)}
                    className="pointer-events-auto bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-2"
                >
                    {sizeConfirmed ? <><CheckCircle2 size={14} /> Locked</> : "Verify Dimensions"}
                </button>
            </div>
        </div>
    );
}

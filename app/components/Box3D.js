"use client";
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function Box3D({ type = "pizza", size = { w: 12, h: 1.5, d: 12 }, color = null, customText = "", logoImage = null }) {
    const mountRef = useRef(null);
    const sceneInfo = useRef({});

    // 0 = closed, 1 = fully open
    const [openness, setOpenness] = useState(0.5);

    useEffect(() => {
        // Init Scene Once
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#f9fafb");

        const camera = new THREE.PerspectiveCamera(35, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
        camera.position.set(5, 4, 5);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        mountRef.current.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.position.set(10, 10, 10);
        spotLight.castShadow = true;
        scene.add(spotLight);
        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(-10, -10, -10);
        scene.add(pointLight);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI / 1.5;

        // Create Group
        const boxGroup = new THREE.Group();
        scene.add(boxGroup);

        const material = new THREE.MeshStandardMaterial({
            color: "#f3f4f6",
            roughness: 0.6,
            metalness: 0.1
        });
        const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.15, transparent: true });

        // Factory to create box parts
        const createPart = (w, h, d, px, py, pz) => {
            const geo = new THREE.BoxGeometry(w, h, d);
            const mesh = new THREE.Mesh(geo, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.position.set(px, py, pz);

            const edgesGeo = new THREE.EdgesGeometry(geo);
            const edges = new THREE.LineSegments(edgesGeo, edgesMaterial);
            mesh.add(edges);

            return { mesh, geo, edges, edgesGeo };
        };

        const parts = {};

        sceneInfo.current = {
            scene, camera, renderer, controls,
            boxGroup, material, edgesMaterial, createPart, parts
        };

        let frameId;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            if (sceneInfo.current.boxGroup) {
                sceneInfo.current.boxGroup.rotation.y += 0.002;
            }
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!mountRef.current) return;
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameId);
            if (mountRef.current && renderer.domElement) mountRef.current.removeChild(renderer.domElement);
            material.dispose();
            edgesMaterial.dispose();
            Object.values(sceneInfo.current.parts).forEach(p => {
                if (p.geo) p.geo.dispose();
                if (p.edgesGeo) p.edgesGeo.dispose();
            });
        };
    }, []); // RUN ONCE

    // Handle structural updates and colors
    useEffect(() => {
        if (!sceneInfo.current.boxGroup) return;

        const { boxGroup, material, createPart, parts } = sceneInfo.current;
        const MathScale = 0.2;

        let targetW = size.w;
        let targetH = size.h;
        let targetD = size.d;

        if (type === 'pizza') { targetH = Math.min(targetH, 2); }
        if (type === 'bakery') { targetH = Math.max(targetH, 4); }
        if (type === 'carrybag') { targetH = Math.max(targetH, 8); targetD = Math.min(targetD, 4); }
        if (type === 'sweet') { targetW = targetW * 0.8; targetD = targetD * 0.8; }

        const w = targetW * MathScale;
        const h = targetH * MathScale;
        const d = targetD * MathScale;
        const t = 0.02; // thickness

        Object.values(parts).forEach(p => {
            if (p.mesh.parent) p.mesh.parent.remove(p.mesh);
            p.geo.dispose();
            p.edgesGeo.dispose();
        });

        if (sceneInfo.current.pivots) {
            Object.values(sceneInfo.current.pivots).forEach(pivot => {
                if (pivot.parent) pivot.parent.remove(pivot);
            });
        }
        const pivots = {};
        sceneInfo.current.pivots = pivots;

        const isBag = type === 'carrybag';

        if (isBag) {
            parts.block = createPart(w, h, d, 0, 0, 0);
            boxGroup.add(parts.block.mesh);
        } else {
            parts.base = createPart(w, t, d, 0, 0, 0);
            boxGroup.add(parts.base.mesh);

            pivots.back = new THREE.Group();
            pivots.back.position.set(0, t / 2, -d / 2);
            boxGroup.add(pivots.back);
            parts.back = createPart(w, h, t, 0, h / 2, -t / 2);
            pivots.back.add(parts.back.mesh);

            pivots.lid = new THREE.Group();
            pivots.lid.position.set(0, h, -t / 2);
            pivots.back.add(pivots.lid);
            parts.lid = createPart(w, t, d, 0, t / 2, d / 2);
            pivots.lid.add(parts.lid.mesh);

            pivots.lidFlap = new THREE.Group();
            pivots.lidFlap.position.set(0, t / 2, d);
            pivots.lid.add(pivots.lidFlap);
            const flapH = Math.min(h * 0.8, 2 * MathScale);
            parts.lidFlap = createPart(w - 2 * t, flapH, t, 0, -flapH / 2, t / 2);
            pivots.lidFlap.add(parts.lidFlap.mesh);

            pivots.left = new THREE.Group();
            pivots.left.position.set(-w / 2, t / 2, 0);
            boxGroup.add(pivots.left);
            parts.left = createPart(t, h, d - 2 * t, -t / 2, h / 2, 0);
            pivots.left.add(parts.left.mesh);

            pivots.right = new THREE.Group();
            pivots.right.position.set(w / 2, t / 2, 0);
            boxGroup.add(pivots.right);
            parts.right = createPart(t, h, d - 2 * t, t / 2, h / 2, 0);
            pivots.right.add(parts.right.mesh);

            pivots.front = new THREE.Group();
            pivots.front.position.set(0, t / 2, d / 2);
            boxGroup.add(pivots.front);
            parts.front = createPart(w - 2 * t, h, t, 0, h / 2, t / 2);
            pivots.front.add(parts.front.mesh);
        }

        const fallbackColors = {
            pizza: "#f3f4f6", rigid: "#1a1a1a", corrugated: "#d2b48c", bakery: "#ffffff", sweet: "#ffc0cb"
        };
        const targetColor = color ? color : (fallbackColors[type] || "#f3f4f6");
        material.color.set(targetColor);

        if (customText || logoImage) {
            const canvas = document.createElement('canvas');
            canvas.width = 1024;
            canvas.height = 1024;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = targetColor;
            ctx.fillRect(0, 0, 1024, 1024);

            if (customText) {
                ctx.fillStyle = ['#ffffff', '#f3f4f6'].includes(targetColor.toLowerCase()) ? '#000000' : '#ffffff';
                ctx.font = 'bold 120px "Inter", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(customText, 512, 512 + (logoImage ? 200 : 0));
            }
            if (logoImage) {
                const img = new Image();
                img.src = logoImage;
                img.onload = () => {
                    ctx.drawImage(img, 256, 150, 512, 512);
                    material.map = new THREE.CanvasTexture(canvas);
                    material.needsUpdate = true;
                }
            } else {
                material.map = new THREE.CanvasTexture(canvas);
                material.needsUpdate = true;
            }
        } else {
            material.map = null;
            material.needsUpdate = true;
        }

    }, [size.w, size.h, size.d, type, color, customText, logoImage]);

    // Handle Open/Close Animation State explicitly
    useEffect(() => {
        const pivots = sceneInfo.current.pivots;
        if (!pivots) return;

        const targetBackRad = -(Math.PI / 2) * openness;
        const targetLidRad = -(Math.PI / 2) * (1 - openness);
        const targetLidFlapRad = -(Math.PI / 2) * (1 - openness);
        const targetLeftRad = (Math.PI / 2) * openness;
        const targetRightRad = -(Math.PI / 2) * openness;
        const targetFrontRad = (Math.PI / 2) * openness;

        let frame;
        const tick = () => {
            let changed = false;

            if (pivots.back && Math.abs(pivots.back.rotation.x - targetBackRad) > 0.001) {
                pivots.back.rotation.x += (targetBackRad - pivots.back.rotation.x) * 0.1;
                changed = true;
            }
            if (pivots.lid && Math.abs(pivots.lid.rotation.x - targetLidRad) > 0.001) {
                pivots.lid.rotation.x += (targetLidRad - pivots.lid.rotation.x) * 0.1;
                changed = true;
            }
            if (pivots.lidFlap && Math.abs(pivots.lidFlap.rotation.x - targetLidFlapRad) > 0.001) {
                pivots.lidFlap.rotation.x += (targetLidFlapRad - pivots.lidFlap.rotation.x) * 0.1;
                changed = true;
            }
            if (pivots.left && Math.abs(pivots.left.rotation.z - targetLeftRad) > 0.001) {
                pivots.left.rotation.z += (targetLeftRad - pivots.left.rotation.z) * 0.1;
                changed = true;
            }
            if (pivots.right && Math.abs(pivots.right.rotation.z - targetRightRad) > 0.001) {
                pivots.right.rotation.z += (targetRightRad - pivots.right.rotation.z) * 0.1;
                changed = true;
            }
            if (pivots.front && Math.abs(pivots.front.rotation.x - targetFrontRad) > 0.001) {
                pivots.front.rotation.x += (targetFrontRad - pivots.front.rotation.x) * 0.1;
                changed = true;
            }

            if (changed) {
                frame = requestAnimationFrame(tick);
            }
        };
        tick();

        return () => cancelAnimationFrame(frame);
    }, [openness]);

    return (
        <div className="w-full h-full min-h-[400px] bg-gray-50 rounded-[2rem] overflow-hidden relative">
            <div className="absolute top-6 left-6 z-10">
                <span className="px-3 py-1 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 shadow-sm">
                    {type.toUpperCase()} BOX STRUCTURE
                </span>
            </div>

            <div ref={mountRef} className="w-full h-full" />

            <div className="absolute bottom-6 w-full px-10 z-10 flex flex-col items-center gap-2">

                {/* Scroll Slider Controls for Open/Close Mechanism */}
                {type !== 'carrybag' && (
                    <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-gray-200 shadow-xl flex items-center gap-4 w-full max-w-sm pointer-events-auto">
                        <span className="text-[10px] font-black uppercase text-gray-400 shrink-0">Closed</span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={openness}
                            onChange={(e) => setOpenness(parseFloat(e.target.value))}
                            className="w-full accent-emerald-500"
                        />
                        <span className="text-[10px] font-black uppercase text-emerald-500 shrink-0">Open</span>
                    </div>
                )}

                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                    Drag structure to rotate view
                </span>
            </div>
        </div>
    );
}

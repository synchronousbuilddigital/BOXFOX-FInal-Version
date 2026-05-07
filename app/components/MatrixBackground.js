"use client";
import React, { useEffect, useRef } from "react";

const MatrixBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const characters = "PACKAGINGBOXFOXBAKERYLUXURYFRESHNESS";
        const charArray = characters.split("");
        const fontSize = 14;
        const columns = width / fontSize;

        const drops = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }

        const gridSize = 60;
        let frame = 0;

        const draw = () => {
            frame++;
            // Fade effect: use a very light white fade
            ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
            ctx.fillRect(0, 0, width, height);

            // Draw Subtle Box Grid
            ctx.lineWidth = 1;
            for (let x = 0; x <= width; x += gridSize) {
                for (let y = 0; y <= height; y += gridSize) {
                    // Subtly pulse some squares
                    const pulse = Math.sin(frame * 0.02 + (x + y) * 0.005) * 0.5 + 0.5;
                    if (pulse > 0.8) {
                        ctx.fillStyle = `rgba(16, 185, 129, ${(pulse - 0.8) * 0.2})`;
                        ctx.fillRect(x, y, gridSize, gridSize);
                        ctx.strokeStyle = `rgba(16, 185, 129, ${(pulse - 0.8) * 0.5})`;
                        ctx.strokeRect(x, y, gridSize, gridSize);
                    } else {
                        ctx.strokeStyle = "rgba(16, 185, 129, 0.04)";
                        ctx.strokeRect(x, y, gridSize, gridSize);
                    }
                }
            }
        };

        const interval = setInterval(draw, 33);

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            const newColumns = width / fontSize;
            for (let i = drops.length; i < newColumns; i++) {
                drops[i] = 1;
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-50"
        />
    );
};

export default MatrixBackground;

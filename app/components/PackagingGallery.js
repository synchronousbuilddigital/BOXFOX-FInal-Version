"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const images = [
    "/categories/cat_macaron.png",
    "/categories/cat_pastry.png",
    "/categories/cat_chocolate_box.png",
    "/categories/cat_brownie.png",
    "/categories/cat_bento.png",
    "/categories/cat_gifting.png",
    "/categories/cat_cupcake.png",
    "/categories/cat_cake.png",
];

export default function PackagingGallery() {
    return (
        <section className="py-2 sm:py-3 bg-white overflow-hidden w-full relative">
            <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 40, ease: "linear", repeat: Infinity }}
                className="flex w-max gap-3 sm:gap-4 pb-2 pt-2 px-4 sm:px-6 lg:px-12"
            >
                {[...images, ...images].map((src, i) => (
                    <div
                        key={i}
                        className="w-[120px] sm:w-[140px] md:w-[160px] h-[80px] sm:h-[100px] md:h-[120px] shrink-0 relative rounded-[0.75rem] sm:rounded-[1rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm group"
                    >

                        <Image
                            src={src}
                            alt="Packaging"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            sizes="(max-width: 1024px) 80vw, 33vw"
                        />
                    </div>
                ))}
            </motion.div>
        </section>
    );
}

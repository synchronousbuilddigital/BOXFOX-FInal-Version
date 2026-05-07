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
        <section className="py-6 sm:py-8 bg-white overflow-hidden w-full relative">
            <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 40, ease: "linear", repeat: Infinity }}
                className="flex w-max gap-4 sm:gap-6 pb-6 pt-4 px-4 sm:px-6 lg:px-12"
            >
                {[...images, ...images].map((src, i) => (
                    <div
                        key={i}
                        className="w-[160px] sm:w-[200px] md:w-[240px] h-[200px] sm:h-[240px] md:h-[300px] shrink-0 relative rounded-[1rem] sm:rounded-[1.5rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-md group"
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

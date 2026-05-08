"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const images = [
    "/categories/cat_macaron.png",
    "/categories/cat_pastry.png",
    "/categories/cat_chocolate_box.png",
    "/categories/cat_brownie.png",
    "/categories/cat_bento.png",
    "/categories/cat_gifting.png",
    "/categories/cat_cupcake.png",
    "/categories/cat_cake.png",
    "/categories/cat_hamper.png",
    "/categories/cat_loaf.png",
    "/categories/cat_platter.png",
    "/categories/cat_loaf_branded.png",
    "/categories/cat_platter_branded.png",
];

export default function PackagingGallery() {
    return (
        <section className="py-2 sm:py-4 bg-white overflow-hidden w-full relative border-y border-gray-50">
            <Link href="/shop" className="block cursor-pointer">
                <motion.div
                    animate={{ x: ["-50%", "0%"] }}
                    transition={{ duration: 30, ease: "linear", repeat: Infinity }}
                    className="flex w-max gap-3 sm:gap-4 pb-2 pt-2 px-4"
                >
                    {[...images, ...images].map((src, i) => (
                        <div
                            key={i}
                            className="w-[140px] sm:w-[180px] md:w-[220px] h-[100px] sm:h-[130px] md:h-[160px] shrink-0 relative rounded-[0.75rem] sm:rounded-[1rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm group"
                        >
                            <Image
                                src={src}
                                alt="Packaging"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                sizes="(max-width: 1024px) 80vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                        </div>
                    ))}
                </motion.div>
            </Link>
        </section>
    );
}


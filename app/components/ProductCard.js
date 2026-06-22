"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, ArrowUpRight, Plus } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { unitPriceFromThreePoints } from '@/lib/boxfoxPricing';
import { calculateDynamicPrice } from '@/lib/boxEngine';
import { useToast } from "@/app/context/ToastContext";

let wishlistIdsCache = null;
let wishlistIdsPromise = null;

function normalizeId(value) {
  if (value === null || value === undefined) return null;
  return String(value);
}

function buildWishlistIdSet(wishlistItems = []) {
  const idSet = new Set();
  for (const item of wishlistItems) {
    const mongoId = normalizeId(item?._id);
    const wpId = normalizeId(item?.wpId ?? item?.id);
    if (mongoId) idSet.add(mongoId);
    if (wpId) idSet.add(wpId);
  }
  return idSet;
}

async function getWishlistIdSet() {
  if (wishlistIdsCache) return wishlistIdsCache;
  if (!wishlistIdsPromise) {
    wishlistIdsPromise = fetch('/api/wishlist')
      .then(async (res) => {
        if (!res.ok) return new Set();
        const data = await res.json();
        const idSet = buildWishlistIdSet(data?.wishlist || []);
        wishlistIdsCache = idSet;
        return idSet;
      })
      .catch(() => new Set())
      .finally(() => {
        wishlistIdsPromise = null;
      });
  }
  return wishlistIdsPromise;
}

export default function ProductCard({ product, imageOnly = false, priority = false, isSmall = false }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const {
    _id,
    id,
    name,
    img,
    price,
    originalPrice,
    discount,
    outOfStock,
    hasVariants,
    badge,
    pacdoraId,
    images,
    allowWishlist = true,
    minOrderQuantity,
  } = product;

  const [isAdding, setIsAdding] = useState(false);

  const productId = _id || id;
  const routeId = _id || id;
  const productMongoId = normalizeId(_id);
  const productWpId = normalizeId(id);
  const hoverImage = images && images.length > 1 ? images[1] : null;

  useEffect(() => {
    let isMounted = true;

    const syncWishlistStatus = async () => {
      const idSet = await getWishlistIdSet();
      if (!isMounted) return;
      setIsWishlisted(
        Boolean(
          (productMongoId && idSet.has(productMongoId)) ||
          (productWpId && idSet.has(productWpId))
        )
      );
    };

    syncWishlistStatus();

    return () => {
      isMounted = false;
    };
  }, [productMongoId, productWpId]);

  if (imageOnly) {
    return (
      <Link
        href={`/products/${routeId}`}
        className={`group relative block aspect-4/5 overflow-hidden rounded-4xl bg-white shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2 mx-auto w-full ${isSmall ? 'p-2 max-w-[220px] sm:max-w-[260px]' : 'p-4 max-w-[300px] sm:max-w-[340px]'}`}
        aria-label={name}
      >
        <Image
          src={img || "/BOXFOX-1.png"}
          alt={name}
          width={400}
          height={500}
          unoptimized={true}
          className={`w-full h-full object-contain transition-all duration-700 group-hover:scale-103 ${hoverImage ? 'group-hover:opacity-0' : ''}`}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
          priority={priority}
        />
        {hoverImage && (
          <Image
            src={hoverImage}
            alt={`${name} hover`}
            width={400}
            height={500}
            unoptimized={true}
            className="w-full h-full object-contain transition-all duration-700 group-hover:scale-103 absolute inset-0 opacity-0 group-hover:opacity-100 p-4"
            priority={priority}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-gray-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-x-0 bottom-0 p-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-end justify-between">
          <div className="max-w-[70%]">
            <h4 className="text-white font-black text-sm leading-tight line-clamp-2 uppercase tracking-tight">{name}</h4>
          </div>
          <div className="w-10 h-10 rounded-full bg-white text-gray-950 flex items-center justify-center shadow-lg">
            <ArrowUpRight size={18} />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/products/${routeId}`} className={`group flex flex-col h-full relative mx-auto w-full ${isSmall ? 'max-w-[220px] sm:max-w-[260px]' : 'max-w-[300px] sm:max-w-[340px]'}`}>
      <div className={`relative aspect-4/5 overflow-hidden rounded-2xl sm:rounded-4xl bg-gray-50 border border-gray-950/8 shadow-sm transition-all group-hover:shadow-2xl group-hover:shadow-emerald-500/10 group-hover:border-gray-950/20 ${isSmall ? 'mb-2 sm:mb-3 p-1.5 sm:p-3' : 'mb-4 sm:mb-5 p-2 sm:p-5'}`}>
        <Image
          src={img || "/BOXFOX-1.png"}
          alt={name || 'Product image'}
          width={500}
          height={500}
          unoptimized={true}
          className={`w-full h-full object-contain transition-all duration-700 group-hover:scale-103 ${hoverImage ? 'group-hover:opacity-0' : ''}`}
          priority={priority}
        />
        {hoverImage && (
          <Image
            src={hoverImage}
            alt={`${name || 'Product'} hover`}
            width={500}
            height={500}
            unoptimized={true}
            className="w-full h-full object-contain transition-all duration-700 group-hover:scale-103 absolute inset-0 opacity-0 group-hover:opacity-100 p-2 sm:p-5"
            priority={priority}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-gray-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="absolute top-2 left-2 sm:top-6 sm:left-6 flex flex-col gap-1 sm:gap-2 pointer-events-none">
          {discount && !outOfStock && (
            <span className="bg-emerald-500 text-white text-[7px] sm:text-[9px] font-black px-2 sm:px-4 py-1 sm:py-2 rounded-full shadow-lg uppercase tracking-widest whitespace-nowrap">
              -{discount}
            </span>
          )}
          {badge && (
            <span className="bg-gray-950/90 backdrop-blur-md text-white text-[7px] sm:text-[9px] font-black px-2 sm:px-4 py-1 sm:py-2 rounded-full shadow-lg uppercase tracking-widest whitespace-nowrap">
              {badge}
            </span>
          )}
        </div>

        {allowWishlist !== false && (
          <button
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (wishlistBusy) return;
              setWishlistBusy(true);
              try {
                const res = await fetch('/api/wishlist', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ productId: productId })
                });
                if (res.status === 401) {
                  window.location.href = '/login';
                  return;
                }
                const data = await res.json();
                if (res.ok) {
                  const nextWishlisted = data?.action === 'added';
                  setIsWishlisted(nextWishlisted);

                  const idSet = wishlistIdsCache || new Set();
                  if (nextWishlisted) {
                    if (productMongoId) idSet.add(productMongoId);
                    if (productWpId) idSet.add(productWpId);
                  } else {
                    if (productMongoId) idSet.delete(productMongoId);
                    if (productWpId) idSet.delete(productWpId);
                  }
                  wishlistIdsCache = idSet;

                  showToast(data.message || (nextWishlisted ? "Added to wishlist" : "Removed from wishlist"));
                } else {
                  showToast(data.error || "Failed to update wishlist", "error");
                }
              } catch (err) {
                console.error(err);
                showToast("Connection error", "error");
              } finally {
                setWishlistBusy(false);
              }
            }}
            className={`absolute top-2 right-2 sm:top-4 sm:right-4 p-2 sm:p-2.5 rounded-full transition-all shadow-md z-10 ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400 hover:bg-red-50 hover:text-red-500'} ${wishlistBusy ? 'opacity-60' : ''}`}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} className="sm:w-4.5 sm:h-4.5" />
          </button>
        )}
      </div>

      <div className="flex flex-col grow px-1.5 pb-2">
        <h3 className={`font-black text-gray-950 leading-[1.1] tracking-tighter uppercase line-clamp-2 group-hover:text-emerald-500 transition-colors ${isSmall ? 'text-[10px] sm:text-[13px]' : 'text-[12px] sm:text-lg'}`}>
          {name}
        </h3>
        {(() => {
          // 1. Try structured dimensions first
          const hasStructured = product.dimensions && (product.dimensions.length > 0 || product.dimensions.width > 0 || product.dimensions.height > 0);
          if (hasStructured) {
            return (
              <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                {product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height} {product.dimensions.unit || 'in'}
              </p>
            );
          }

          // 2. Try parsing from name (e.g., "Carry Bag - 268x268x203 mm")
          const nameMatch = product.name?.match(/(\d+(?:\.\d+)?)\s*[x*]\s*(\d+(?:\.\d+)?)\s*[x*]\s*(\d+(?:\.\d+)?)\s*(mm|inch|in|cm)?/i);
          if (nameMatch) {
            return (
              <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                {nameMatch[1]} x {nameMatch[2]} x {nameMatch[3]} {nameMatch[4] || 'mm'}
              </p>
            );
          }

          return null;
        })()}

        <div className="flex flex-wrap items-center justify-between mt-auto pt-2 gap-1.5 sm:gap-2">
          <div className="flex flex-col justify-center min-w-0">
            <span className={`font-black text-gray-950 tracking-tighter leading-none ${isSmall ? 'text-xs sm:text-base' : 'text-sm sm:text-xl'}`}>
              {(() => {
                // Try tiered pricing first (New Logic: 1, 10, 50, 100, 500, 1000)
                if (product.priceAt1 || product.priceAt10 || product.priceAt50 || product.priceAt100 || product.priceAt500 || product.priceAt1000) {
                  const qty = product.minOrderQuantity || 10;
                  const computed = calculateDynamicPrice(
                    qty,
                    product.priceAt1,
                    product.priceAt10,
                    product.priceAt50,
                    product.priceAt100,
                    product.priceAt500,
                    product.priceAt1000
                  );
                  if (computed && computed > 0) return `₹${Math.round(computed).toLocaleString('en-IN')}`;
                }
                // Try minPrice
                if (product.minPrice && !isNaN(product.minPrice) && product.minPrice > 0) {
                  return `₹${Math.round(Number(product.minPrice)).toLocaleString('en-IN')}`;
                }
                // Try base price
                if (price && !isNaN(price) && price > 0) {
                  return `₹${Math.round(Number(price)).toLocaleString('en-IN')}`;
                }
                // Fallback
                return 'Price on Request';
              })()}
            </span>
            {originalPrice && !isNaN(originalPrice) && (
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-300 line-through mt-0.5">
                ₹{Math.round(Number(originalPrice)).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className={`flex items-center justify-center gap-1 bg-gray-50 text-gray-500 rounded-full font-black uppercase tracking-widest group-hover:bg-gray-100 group-hover:text-gray-900 transition-all shadow-sm border border-gray-150 shrink-0 ${isSmall ? 'px-2 py-1.5 text-[7px] sm:text-[9px]' : 'px-2.5 sm:px-4 py-2 sm:py-2.5 text-[8px] sm:text-[10px]'}`}>
            <span className="hidden xs:inline">Details</span>
            <span className="xs:hidden">View</span>
            <ArrowUpRight size={isSmall ? 9 : 11} className="opacity-50" />
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isAdding) return;
              setIsAdding(true);
              setTimeout(() => {
                addToCart(product, minOrderQuantity || 10);
                setIsAdding(false);
              }, 400);
            }}
            disabled={isAdding}
            className={`flex items-center justify-center gap-1 bg-emerald-600 text-white rounded-full font-black uppercase tracking-widest hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 shrink-0 ${isAdding ? 'opacity-70 cursor-not-allowed' : ''} ${isSmall ? 'px-2.5 py-1.5 text-[7px] sm:text-[9px]' : 'px-3 sm:px-5 py-2 sm:py-2.5 text-[8px] sm:text-[10px]'}`}
          >
            {isAdding ? (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="hidden xs:inline">Adding</span>
              </span>
            ) : (
              <>
                <Plus size={11} className="sm:w-3.5 sm:h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}

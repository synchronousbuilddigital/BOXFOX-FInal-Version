"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { calculateBoxPrice, unitPriceFromSixPoints } from '@/lib/boxfoxPricing';
import { BOX_SPECIFICATIONS } from '@/lib/box-specifications';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        const savedCart = localStorage.getItem('boxfox_cart');
        if (savedCart) setCart(JSON.parse(savedCart));
    }, []);

    useEffect(() => {
        localStorage.setItem('boxfox_cart', JSON.stringify(cart));
    }, [cart]);

    const calculateItemPricing = (product, quantity) => {
        // 1. Custom design box logic (THE LAB)
        // Highest priority: If it's a custom design, use manufacturing specs ONLY.
        if (product.customDesign) {
            const pricingParams = {
                spec: product.customDesign.specData || { ups: 1, machine: 2029, sheetW: 20, sheetH: 29 },
                qty: Math.max(10, quantity),
                gsm: parseInt(product.customDesign.selectedGSM) || 280,
                material: product.customDesign.selectedMaterial || 'SBS',
                brand: product.customDesign.selectedBrand || 'Normal',
                colours: product.customDesign.selectedPrinting || 'Four Colour',
                lamination: product.customDesign.selectedFinish || 'Plain',
                markupType: product.customDesign.selectedMarkup || 'Retail',
                dieCutting: product.customDesign.dieCutting !== false
            };
            const res = calculateBoxPrice(pricingParams);
            return {
                unitPrice: res.finalPerUnit,
                oneTimeCharge: res.dieToolingCharge || 0,
                breakdown: res // Store full breakdown for B2B transparency
            };
        }

        // 2. Explicit Tiered Pricing (For standard Shop products)
        if (product.priceAt1 || product.priceAt10 || product.priceAt50 || product.priceAt100 || product.priceAt500 || product.priceAt1000) {
            const unitPrice = unitPriceFromSixPoints({
                priceAt1: product.priceAt1,
                priceAt10: product.priceAt10,
                priceAt50: product.priceAt50,
                priceAt100: product.priceAt100,
                priceAt500: product.priceAt500,
                priceAt1000: product.priceAt1000
            }, quantity);
            
            return {
                unitPrice: unitPrice,
                oneTimeCharge: 0,
                breakdown: { finalPerUnit: unitPrice, finalTotal: unitPrice * quantity }
            };
        }

        // 3. Regular products - try to match manufacturing spec
        const unit = product.dimensions?.unit || 'in';
        const dimensions = {
            l: product.dimensions?.length || 1,
            w: product.dimensions?.width || 1,
            h: product.dimensions?.height || 1
        };

        const selectedSpec = BOX_SPECIFICATIONS.find(s =>
            s.l === dimensions.l &&
            s.w === dimensions.w &&
            s.h === dimensions.h &&
            s.unit === unit
        );

        if (selectedSpec) {
            const pricingResult = calculateBoxPrice({
                spec: selectedSpec,
                qty: quantity,
                gsm: 280,
                material: 'SBS',
                brand: 'Normal',
                colours: 'Four Colour',
                lamination: 'Plain',
                markupType: 'Retail',
                dieCutting: true
            });

            return {
                unitPrice: pricingResult.finalPerUnit,
                oneTimeCharge: 0,
                breakdown: pricingResult
            };
        }

        // 4. Fallback to static prices
        const staticPrice = Number(product.minPrice || product.price || 0);
        return {
            unitPrice: staticPrice,
            oneTimeCharge: 0,
            breakdown: { finalPerUnit: staticPrice, finalTotal: staticPrice * quantity }
        };
    };

    const addToCart = (product, quantity) => {
        let isUpdate = false;
        // Use consistent ID (prefer MongoDB _id, then WP id)
        const baseId = product._id || product.id || product.wpId;
        const colorSuffix = product.selectedColor ? `-${product.selectedColor}` : '';
        const cartItemId = `${baseId}${colorSuffix}`;
        
        setCart(prev => {
            const existing = prev.find(item => item.id === cartItemId);
            const minQty = Math.max(10, product.minOrderQuantity || 10);
            const finalQty = Math.max(minQty, quantity);

            if (existing) {
                isUpdate = true;
                const newQuantity = existing.quantity + Math.max(0, quantity);
                const pricing = calculateItemPricing(existing, newQuantity);
                return prev.map(item => item.id === cartItemId
                    ? {
                        ...item,
                        quantity: newQuantity,
                        price: pricing.unitPrice,
                        oneTimeCharge: pricing.oneTimeCharge,
                        breakdown: pricing.breakdown
                    }
                    : item
                );
            }
            
            const pricing = calculateItemPricing(product, finalQty);
            return [...prev, {
                ...product,
                id: cartItemId, // Ensure it has a unique cart item id
                productId: baseId, // Retain raw product database ID
                quantity: finalQty,
                price: pricing.unitPrice,
                oneTimeCharge: pricing.oneTimeCharge,
                breakdown: pricing.breakdown
            }];
        });

        showToast(isUpdate ? `Updated ${product.name} quantity` : `Added ${product.name} to basket`);
        setIsCartOpen(true);
    };


    const updateQuantity = (id, quantity) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const minQty = 10;
                const validQuantity = Math.max(minQty, Math.floor(quantity));
                const pricing = calculateItemPricing(item, validQuantity);
                return {
                    ...item,
                    quantity: validQuantity,
                    price: pricing.unitPrice,
                    oneTimeCharge: pricing.oneTimeCharge,
                    breakdown: pricing.breakdown
                };
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        const itemToRemove = cart.find(i => i.id === id);
        setCart(prev => prev.filter(item => item.id !== id));
        if (itemToRemove) {
            showToast(`Removed ${itemToRemove.name} from basket`, "info");
        }
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((sum, item) => {
        const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
        return sum + (price * item.quantity);
    }, 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            isCartOpen,
            setIsCartOpen,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);

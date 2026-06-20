"use client";
import React, { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  ArrowLeft,
  Box,
  Sparkles,
  Ruler,
  RefreshCw,
  Download,
  Minus,
  Plus,
  Move,
  Search,
  ChevronDown,
  CheckCircle2,
  RotateCw,
  Maximize2,
  Zap,
  Upload,
  Type,
  Image as ImageIcon,
  Layout,
  Trash2,
  Palette,
  Layers,
  Scissors,
  Shield,
  Check,
  X,
  Smartphone,
  Tablet,
  Monitor,
  Save,
  Share2,
  Link2,
  Copy,
  Star,
  Lock,
  MousePointer2,
  RotateCcw,
  Maximize,
  Grid3x3,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import AuthModal from "@/app/components/AuthModal";
import { useCart } from "@/app/context/CartContext";
import { useToast } from "@/app/context/ToastContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import gsap from "gsap";
import Link from "next/link";
import Script from "next/script";
import Cropper from 'react-easy-crop';
import { downloadDieLine } from "@/lib/dieline-generator";
import { BOX_SPECIFICATIONS, findClosestSpec } from "@/lib/box-specifications";

import { calculateBoxPrice, getBrandsForMaterial, getDefaultBrand, MATERIAL_RATES, LAM_RATES, COLOUR_FACTORS, MARKUP_TYPES, GSM_OPTIONS as ENGINE_GSM_OPTIONS } from "@/lib/boxfoxPricing";

function CustomizeLabContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { user, loading: authLoading, checkUser } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [guestGenerationsLeft, setGuestGenerationsLeft] = useState(5);
  const isGuest = !user;


  const DEFAULT_PRODUCT_ID = "1771670990303";

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(10);
  const [viewMode, setViewMode] = useState("2D");

  // Customization States
  const [dimensions, setDimensions] = useState({ l: 12, w: 8, h: 4 });
  const [isGenerating, setIsGenerating] = useState(false);

  // Custom formula states
  const [selectedGSM, setSelectedGSM] = useState("280");
  const [selectedMaterial, setSelectedMaterial] = useState("SBS");
  const [selectedBrand, setSelectedBrand] = useState("ITC");
  const [selectedFinish, setSelectedFinish] = useState("Plain");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [selectedPrintType, setSelectedPrintType] = useState("Four Colour");
  const [selectedMarkup, setSelectedMarkup] = useState("Retail");
  const [dieCutting, setDieCutting] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [unit, setUnit] = useState("in"); // "in" or "mm"

  const [labConfig, setLabConfig] = useState({ hierarchies: [], specifications: [] });
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [estimatedSpec, setEstimatedSpec] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/lab/config');
        const data = await res.json();

        if (data && !data.error && data.hierarchies?.length > 0) {
          setLabConfig(data);
          const cats = data.hierarchies.map(h => h.category);
          setCategories(cats);

          // Only force if current category is not valid and not "All"
          if (selectedCategory !== "All" && !cats.includes(selectedCategory)) {
            setSelectedCategory(cats[0] || "Food");
          }
        } else {
          console.error("Lab configuration hierarchies are empty.");
          throw new Error("Empty Lab Hierarchies");
        }
      } catch (err) {
        console.error("Failed to fetch lab config:", err);
        // Fallback on total failure
        const fallbackData = {
          hierarchies: [{ category: "Standard", subCategories: ["Custom"] }],
          specifications: [{ spec: "Custom Box | 12x8x4", category: "Standard", subCategory: "Custom", l: 12, w: 8, h: 4, unit: "in", isActive: true }]
        };
        setLabConfig(fallbackData);
        setCategories(["Standard"]);
        if (selectedCategory === "All") setSelectedCategory("Standard");
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    let subs = [];
    if (selectedCategory === "All") {
      subs = labConfig.hierarchies.flatMap(h => h.subCategories);
      // Unique and sorted
      subs = [...new Set(subs)].sort();
    } else {
      const hierarchy = labConfig.hierarchies.find(h => h.category === selectedCategory);
      subs = hierarchy ? hierarchy.subCategories : [];
    }

    setSubCategories(subs);

    // If current sub-category is not in new list and not "All", reset it
    if (selectedSubCategory !== "All" && !subs.includes(selectedSubCategory)) {
      setSelectedSubCategory("All");
    }
  }, [selectedCategory, labConfig]);

  // Initial default size selection to ensure "Add to Basket" is visible on first load
  useEffect(() => {
    if (labConfig.specifications.length > 0 && selectedSubCategory && !selectedSpec) {
      const refSpec = labConfig.specifications.find(s =>
        (selectedCategory === "All" || s.category === selectedCategory) &&
        (selectedSubCategory === "All" || s.subCategory === selectedSubCategory) &&
        (s.unit || "mm") === unit
      ) || labConfig.specifications.find(s =>
        (selectedCategory === "All" || s.category === selectedCategory) &&
        (selectedSubCategory === "All" || s.subCategory === selectedSubCategory)
      );

      if (refSpec) {
        setSelectedSpec(refSpec);
        setDimensions({ l: refSpec.l, w: refSpec.w, h: refSpec.h });
        setUnit(refSpec.unit || "mm");
      }
    }
  }, [labConfig.specifications, selectedCategory, selectedSubCategory, unit, dimensions, selectedSpec]);

  const standardSpec = useMemo(() => {
    if (!labConfig?.specifications?.length) return null;

    const exact = labConfig.specifications.find(s =>
      (selectedCategory === "All" || s.category === selectedCategory) &&
      (selectedSubCategory === "All" || s.subCategory === selectedSubCategory) &&
      (s.unit || "mm") === unit
    );

    if (exact) return exact;

    return labConfig.specifications.find(s =>
      (selectedCategory === "All" || s.category === selectedCategory) &&
      (selectedSubCategory === "All" || s.subCategory === selectedSubCategory)
    ) || null;
  }, [labConfig.specifications, selectedCategory, selectedSubCategory, unit]);

  const convertSpecDimensions = (spec, targetUnit) => {
    if (!spec) return null;
    const sourceUnit = (spec.unit || 'mm').toLowerCase();
    const destUnit = (targetUnit || 'mm').toLowerCase();
    const toMm = (value) => sourceUnit === 'in' ? value * 25.4 : value;
    const toTarget = (valueMm) => destUnit === 'in' ? parseFloat((valueMm / 25.4).toFixed(1)) : parseFloat(valueMm.toFixed(0));
    const lMm = toMm(parseFloat(spec.l) || 0);
    const wMm = toMm(parseFloat(spec.w) || 0);
    const hMm = toMm(parseFloat(spec.h) || 0);
    return {
      l: toTarget(lMm),
      w: toTarget(wMm),
      h: toTarget(hMm),
    };
  };

  const calibratedDimensions = useMemo(() => convertSpecDimensions(standardSpec, unit), [standardSpec, unit]);

  useEffect(() => {
    if (selectedSpec === 'custom_contact' || !standardSpec || !calibratedDimensions) return;
    setSelectedSpec(standardSpec);
    setDimensions(calibratedDimensions);
  }, [standardSpec, calibratedDimensions, selectedSpec]);

  const FINISH_OPTIONS = Object.keys(LAM_RATES);
  const PRINT_OPTIONS = Object.keys(COLOUR_FACTORS);
  const GSM_OPTIONS = ENGINE_GSM_OPTIONS.map(g => `${g} GSM`);
  const MATERIAL_OPTIONS = Object.keys(MATERIAL_RATES);
  const BRAND_OPTIONS = getBrandsForMaterial(selectedMaterial);

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [shareLink, setShareLink] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [logoPrompt, setLogoPrompt] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isPromptEnhanced, setIsPromptEnhanced] = useState(false);
  const [customText, setCustomText] = useState("");
  const [designName, setDesignName] = useState("Untitled Design");
  const [activeDesignId, setActiveDesignId] = useState(null);

  // Handle Deep Linking from Product Catalog
  useEffect(() => {
    const cat = searchParams.get('category');
    const subCat = searchParams.get('subCategory');
    const l = searchParams.get('l');
    const w = searchParams.get('w');
    const h = searchParams.get('h');
    const u = searchParams.get('unit');
    const autoQuote = searchParams.get('autoQuote');
    const mat = searchParams.get('material');
    const finish = searchParams.get('finish');
    const gsm = searchParams.get('gsm');

    if (cat && cat !== "All") setSelectedCategory(cat);
    if (subCat && subCat !== "All") setSelectedSubCategory(subCat);
    if (l && w && h) {
      setDimensions({
        l: parseFloat(l) || 12,
        w: parseFloat(w) || 8,
        h: parseFloat(h) || 4
      });
      setSelectedSpec('custom_contact'); // Switch to custom mode for precise matching
    }
    if (u) setUnit(u);
    if (mat) setSelectedMaterial(mat);
    if (finish) setSelectedFinish(finish);
    if (gsm) setSelectedGSM(gsm);

    // Set higher default quantity for enterprise customization
    setQuantity(500);

    // Auto-scroll to quote if requested
    if (autoQuote === 'true') {
      setTimeout(() => {
        const quoteEl = document.getElementById('live-quote');
        if (quoteEl) {
          quoteEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 1000);
    }
  }, [searchParams]);

  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    if (user) return;

    let cancelled = false;

    const loadGuestGenerations = async () => {
      try {
        const res = await fetch('/api/customize/limit', { cache: 'no-store' });
        const data = await res.json();

        if (!cancelled && res.ok && typeof data.remaining === 'number') {
          setGuestGenerationsLeft(data.remaining);
        }
      } catch (err) {
        if (!cancelled) {
          setGuestGenerationsLeft(5);
        }
      }
    };

    loadGuestGenerations();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // AI Forge: Smart Prompt Builder
  const [selectedChips, setSelectedChips] = useState([]);
  const [activeChipCategory, setActiveChipCategory] = useState("style");
  const [showSmartPreview, setShowSmartPreview] = useState(false);

  // Text-on-Box options
  const [textOnBox, setTextOnBox] = useState(false);
  const [boxTextColor, setBoxTextColor] = useState("#FFFFFF");
  const [boxTextStyle, setBoxTextStyle] = useState("bold");
  const [boxTextSettings, setBoxTextSettings] = useState({ x: 50, y: 50, size: 20 });

  // Neural Multi-Asset Pool (Max 3)
  const [assetPool, setAssetPool] = useState([]);
  const [savedPatterns, setSavedPatterns] = useState([]);
  const [activeAssetIndex, setActiveAssetIndex] = useState(0);

  // Brand Vault State
  const [brandVault, setBrandVault] = useState({ logos: [], colors: [], fonts: [] });

  // Sync brand vault from server
  useEffect(() => {
    if (user) {
      fetch('/api/user/brand-vault')
        .then(res => res.json())
        .then(data => {
          if (data.brandVault) setBrandVault(data.brandVault);
        })
        .catch(err => console.error("Vault Sync Error:", err));
    }
  }, [user]);

  const saveToVault = async (type, value, name) => {
    try {
      const res = await fetch('/api/user/brand-vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value, name })
      });
      const data = await res.json();
      if (data.success) {
        setBrandVault(data.brandVault);
        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} secured in vault!`);
      } else if (res.status === 401) {
        setShowAuthModal(true);
      }
    } catch (e) {
      console.error("Vault Save Error:", e);
      showToast("Failed to save to vault", "error");
    }
  };

  const deleteFromVault = async (type, value) => {
    try {
      const res = await fetch(`/api/user/brand-vault?type=${type}&value=${encodeURIComponent(value)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setBrandVault(data.brandVault);
        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} removed from vault.`);
      } else if (res.status === 401) {
        setShowAuthModal(true);
      }
    } catch (e) { console.error(e); }
  };

  // Sync saved patterns from user object
  useEffect(() => {
    if (user?.aiPatterns) {
      // Sort by newest first and limit to recent 12 for the UI
      const patterns = [...user.aiPatterns].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setSavedPatterns(patterns);
    }
  }, [user]);
  const [boxTextures, setBoxTextures] = useState({
    front: null,
    back: null,
    top: null,
    bottom: null,
    left: null,
    right: null,
  });
  const [boxColors, setBoxColors] = useState({
    front: "#059669",
    back: "#059669",
    top: "#059669",
    bottom: "#059669",
    left: "#059669",
    right: "#059669",
  });
  const [textureSettings, setTextureSettings] = useState({
    front: { scale: 100, x: 50, y: 50, rotate: 0 },
    back: { scale: 100, x: 50, y: 50, rotate: 0 },
    top: { scale: 100, x: 50, y: 50, rotate: 0 },
    bottom: { scale: 100, x: 50, y: 50, rotate: 0 },
    left: { scale: 100, x: 50, y: 50, rotate: 0 },
    right: { scale: 100, x: 50, y: 50, rotate: 0 },
  });
  const [selectedFace, setSelectedFace] = useState(null);
  const [activeColor, setActiveColor] = useState("#059669");
  const [customMode, setCustomMode] = useState("texture"); // 'texture', 'color', or 'logo'
  const [boxMode, setBoxMode] = useState("mailers"); // B2B Box types

  // Logo States
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [boxLogos, setBoxLogos] = useState({
    front: null,
    back: null,
    top: null,
    bottom: null,
    left: null,
    right: null,
  });
  const [logoSettings, setLogoSettings] = useState({
    front: { scale: 1, x: 50, y: 50, rotate: 0 },
    back: { scale: 1, x: 50, y: 50, rotate: 0 },
    left: { scale: 1, x: 50, y: 50, rotate: 0 },
    right: { scale: 1, x: 50, y: 50, rotate: 0 },
    top: { scale: 1, x: 50, y: 50, rotate: 0 },
    bottom: { scale: 1, x: 50, y: 50, rotate: 0 },
  });

  const [labConfigs, setLabConfigs] = useState(null);

  useEffect(() => {
    // Fetch Lab configurations (pricing constants)
    fetch('/api/admin/lab/config')
      .then(res => res.json())
      .then(data => setLabConfigs(data))
      .catch(err => console.error("Failed to load lab configs, using defaults", err));
  }, []);

  // Rolling Price State for GSAP
  const priceRef = useRef(null);
  const unitPriceRef = useRef(null);
  const [displayPrice, setDisplayPrice] = useState(0);
  const [displayUnitPrice, setDisplayUnitPrice] = useState(0);

  // Rotation State
  const [rotate, setRotate] = useState({ x: -20, y: 45 });
  const isDragging = useRef(false);
  const prevTouch = useRef(null);

  // Crop States
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropRotation, setCropRotation] = useState(0);
  const isSpatialPanning = useRef(false);
  const lastSpatialMouse = useRef({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  useEffect(() => {
    // Detect mobile/small screen for 3D Experience notification
    if (window.innerWidth < 1024) {
      setShowMobileWarning(true);
    }
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const rotRad = (rotation * Math.PI) / 180;

    // Calculate bounding box for rotated image
    const { width: bWidth, height: bHeight } = {
      width: Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height),
      height: Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height)
    };

    canvas.width = bWidth;
    canvas.height = bHeight;

    ctx.translate(bWidth / 2, bHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.width / 2, -image.height / 2);
    ctx.drawImage(image, 0, 0);

    const data = ctx.getImageData(
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height
    );

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.putImageData(data, 0, 0);

    return canvas.toDataURL('image/jpeg');
  }

  useEffect(() => {
    // Sync dimensions from URL if present
    const l = searchParams.get('length');
    const w = searchParams.get('width');
    const h = searchParams.get('height');
    const u = searchParams.get('unit');
    const urlId = searchParams.get('id');

    if (l || w || h) {
      setDimensions({
        l: parseFloat(l) || dimensions.l,
        w: parseFloat(w) || dimensions.w,
        h: parseFloat(h) || dimensions.h
      });
    }

    if (u) {
      setUnit(u.toLowerCase() === 'mm' ? 'mm' : 'in');
    }

    const prevName = searchParams.get('name');
    const designId = searchParams.get('designId');
    if (prevName) setDesignName(prevName);
    if (designId) setActiveDesignId(designId);

    const loadProduct = async () => {
      setLoading(true);
      try {
        let targetId = urlId || DEFAULT_PRODUCT_ID;

        // Phase 1: Try fetching the specific ID
        let res = await fetch(`/api/products/${targetId}`);
        let data = await res.json();

        // Phase 2: If fail, fetch the first available product as fallback
        if (data.error || !data) {
          console.warn("Target product not found, fetching fallback...");
          const allRes = await fetch('/api/products?all=true&admin=true');
          const allData = await allRes.json();
          if (Array.isArray(allData) && allData.length > 0) {
            // Find the first active product if possible
            const fallbackProduct = allData.find(p => p.isActive) || allData[0];
            const fallbackId = fallbackProduct.id || fallbackProduct._id;

            // Fetch the specific fallback product with admin=true to ensure we get it even if inactive
            res = await fetch(`/api/products/${fallbackId}?admin=true`);
            data = await res.json();
          } else {
            throw new Error("No products found in system");
          }
        }

        if (data && !data.error) {
          setProduct(data);
          setQuantity(data.minOrderQuantity || 10);

          // Sync dimensions if not already set by URL params
          if (!l && !w && !h && data.dimensions) {
            setDimensions({
              l: data.dimensions.length || 12,
              w: data.dimensions.width || 8,
              h: data.dimensions.height || 4
            });
            if (data.dimensions.unit) {
              setUnit(data.dimensions.unit.toLowerCase() === 'mm' ? 'mm' : 'in');
            }
          }
        } else {
          console.error("Customize Lab: No products available in system");
        }

        // Restore reorder design from sessionStorage if present
        const isReorder = searchParams.get('reorder');
        if (isReorder === 'true') {
          try {
            const savedDesign = sessionStorage.getItem('boxfox_reorder');
            if (savedDesign) {
              const cd = JSON.parse(savedDesign);
              // Restore textures
              if (cd.textures) {
                setBoxTextures(cd.textures);
                // Add unique textures to asset pool
                const uniqueTextures = [...new Set(Object.values(cd.textures).filter(Boolean))];
                setAssetPool(uniqueTextures.slice(0, 3));
                if (uniqueTextures.length > 0) setActiveAssetIndex(0);
              }
              // Restore colors
              if (cd.colors) setBoxColors(cd.colors);
              // Restore texture settings
              if (cd.textureSettings) setTextureSettings(cd.textureSettings);
              // Restore text
              if (cd.text) {
                setCustomText(cd.text);
                setTextOnBox(true);
              }
              if (cd.textStyle) setBoxTextStyle(cd.textStyle);
              if (cd.textColor) setBoxTextColor(cd.textColor);
              if (cd.textSettings) setBoxTextSettings(cd.textSettings);
              // Clean up so it doesn't restore again on page refresh
              sessionStorage.removeItem('boxfox_reorder');
              console.log("Customize Lab: Reorder design restored successfully");
            }
          } catch (e) {
            console.error("Failed to restore reorder design:", e);
          }
        }
      } catch (err) {
        console.error("Customize Lab: Initialization Error", err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [searchParams]);

  const handleFileUpload = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : (e.dataTransfer ? Array.from(e.dataTransfer.files) : []);
    const availableSlots = 10 - assetPool.length; // Increased limit to 10 for "advance" feel
    const filesToProcess = files.slice(0, availableSlots);

    if (filesToProcess.length > 0) {
      setIsGenerating(true);
      filesToProcess.forEach((file, index) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageSrc = reader.result;

          setAssetPool((prev) => {
            const updated = [...prev, imageSrc];
            if (index === 0) setActiveAssetIndex(updated.length - 1);
            return updated;
          });

          // "Advance" Auto-Mapping Logic
          if (selectedFace) {
            setBoxTextures(prev => ({ ...prev, [selectedFace]: imageSrc }));
            showToast(`Asset applied to ${selectedFace}!`, "success");
          } else if (assetPool.length === 0 && index === 0) {
            // Fallback for first upload ever
            setBoxTextures(prev => ({ ...prev, front: imageSrc }));
            showToast("Asset applied to front!", "success");
          }

          if (index === filesToProcess.length - 1) {
            setIsGenerating(false);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Direct Spatial Interaction Logic
  const handleFaceSpatialDown = (e, face) => {
    if (selectedFace !== face || !boxTextures[face]) return;
    isSpatialPanning.current = true;
    lastSpatialMouse.current = { x: e.clientX, y: e.clientY };
    e.stopPropagation();
  };

  const handleFaceSpatialMove = (e, face) => {
    if (!isSpatialPanning.current || selectedFace !== face) return;

    const dx = (e.clientX - lastSpatialMouse.current.x) * 0.2;
    const dy = (e.clientY - lastSpatialMouse.current.y) * 0.2;

    if (customMode === "logo" || (boxLogos[face] && !boxTextures[face])) {
      setLogoSettings(prev => ({
        ...prev,
        [face]: {
          ...prev[face],
          x: prev[face].x + dx,
          y: prev[face].y + dy
        }
      }));
    } else {
      setTextureSettings(prev => ({
        ...prev,
        [face]: {
          ...prev[face],
          x: prev[face].x + dx,
          y: prev[face].y + dy
        }
      }));
    }

    lastSpatialMouse.current = { x: e.clientX, y: e.clientY };
    e.stopPropagation();
  };

  const handleFaceSpatialScroll = (e, face) => {
    if (selectedFace !== face || !boxTextures[face]) return;
    e.stopPropagation();

    const delta = e.deltaY > 0 ? -5 : 5;
    if (customMode === "logo" || (boxLogos[face] && !boxTextures[face])) {
      setLogoSettings(prev => ({
        ...prev,
        [face]: {
          ...prev[face],
          scale: Math.min(400, Math.max(1, (prev[face].scale || 30) + delta))
        }
      }));
    } else {
      setTextureSettings(prev => ({
        ...prev,
        [face]: {
          ...prev[face],
          scale: Math.min(400, Math.max(10, prev[face].scale + delta))
        }
      }));
    }
  };

  const stopSpatialPanning = () => {
    isSpatialPanning.current = false;
  };

  useEffect(() => {
    window.addEventListener("mouseup", stopSpatialPanning);
    return () => window.removeEventListener("mouseup", stopSpatialPanning);
  }, []);

  const handleCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const finalizeCrop = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels, cropRotation);

      // Update the asset in the pool at the active index (which was just added in handleFileUpload)
      setAssetPool((prev) => {
        const updated = [...prev];
        updated[activeAssetIndex] = croppedImage;
        return updated;
      });

      // Update all faces currently using the original with the cropped version
      setBoxTextures((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach(face => {
          if (updated[face] === imageToCrop) {
            updated[face] = croppedImage;
          }
        });
        return updated;
      });

      // Update logos as well
      setBoxLogos((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach(face => {
          if (updated[face] === imageToCrop) {
            updated[face] = croppedImage;
          }
        });
        return updated;
      });

      setShowCropModal(false);
      setImageToCrop(null);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFaceMapping = (face) => {
    if (customMode === "texture") {
      const currentAsset = assetPool[activeAssetIndex];
      if (!currentAsset) return;
      setBoxTextures((prev) => ({
        ...prev,
        [face]: prev[face] === currentAsset ? null : currentAsset,
      }));
    } else {
      setBoxColors((prev) => ({
        ...prev,
        [face]: activeColor,
      }));
    }
  };

  useEffect(() => {
    const l = parseFloat(dimensions.l) || 0;
    const w = parseFloat(dimensions.w) || 0;
    const h = parseFloat(dimensions.h) || 0;

    const match = labConfig.specifications.find(s =>
      s.l === l &&
      s.w === w &&
      s.h === h &&
      (s.unit || 'mm') === unit
    );

    if (match) {
      setEstimatedSpec(match);
    } else {
      const closest = findClosestSpec(l, w, h, selectedCategory, unit);
      setEstimatedSpec(closest);
    }
  }, [dimensions, unit, labConfig.specifications, selectedCategory]);

  // Auto-reset dimensions and other specs when subcategory (Product) changes
  useEffect(() => {
    if (!selectedSubCategory || !labConfig.specifications.length) return;

    // Find a reference spec for this new product to set default dimensions
    const refSpec = labConfig.specifications.find(s =>
      s.category === selectedCategory &&
      s.subCategory === selectedSubCategory
    );

    if (refSpec) {
      setDimensions({ l: refSpec.l, w: refSpec.w, h: refSpec.h });
      setUnit(refSpec.unit || 'mm');
      setSelectedSpec(refSpec);
    }
  }, [selectedSubCategory, selectedCategory, labConfig.specifications]);

  const applyToAllFaces = () => {
    if (customMode === "texture") {
      const currentAsset = assetPool[activeAssetIndex];
      if (!currentAsset) return;
      setBoxTextures({
        front: currentAsset,
        back: currentAsset,
        top: currentAsset,
        bottom: currentAsset,
        left: currentAsset,
        right: currentAsset,
      });
    } else {
      setBoxColors({
        front: activeColor,
        back: activeColor,
        top: activeColor,
        bottom: activeColor,
        left: activeColor,
        right: activeColor,
      });
    }
  };

  const clearAllFaces = () => {
    setBoxTextures({
      front: null,
      back: null,
      top: null,
      bottom: null,
      left: null,
      right: null,
    });
    setBoxColors({
      front: "#059669",
      back: "#059669",
      top: "#059669",
      bottom: "#059669",
      left: "#059669",
      right: "#059669",
    });
  };

  const smartApplyAI = (imageSrc) => {
    setAssetPool((prev) => {
      // Add to pool if not already present
      if (!prev.includes(imageSrc)) {
        const updated = [...prev, imageSrc].slice(-3);
        setActiveAssetIndex(updated.length - 1);
        return updated;
      }
      return prev;
    });

    // Automatically apply to all faces for immediate feedback, 
    // but the user can now override specific faces using the mapping UI
    setBoxTextures({
      front: imageSrc,
      back: imageSrc,
      top: imageSrc,
      bottom: imageSrc,
      left: imageSrc,
      right: imageSrc,
    });
  };

  const generateAILogo = async (logoPrompt) => {
    if (!logoPrompt.trim()) return;
    setIsGeneratingLogo(true);
    try {
      const res = await fetch('/api/generate-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: logoPrompt,
          style: selectedChips.join(', '),
          color: activeColor
        })
      });
      const data = await res.json();
      if (data.url) {
        setBoxLogos(prev => ({ ...prev, [selectedFace || 'top']: data.url }));
        showToast("AI Logo Generated and Applied!");
      } else {
        showToast(data.error || "Logo generation failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred during AI logo generation", "error");
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  const generateAITexture = async () => {
    if (!aiPrompt && selectedChips.length === 0) return;
    setIsGenerating(true);
    try {
      const finalPrompt = buildSmartPrompt();
      const res = await fetch('/api/customize/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIdea: aiPrompt.trim(),
          styles: selectedChips.filter(c => chipCategories.style.includes(c)),
          industries: selectedChips.filter(c => chipCategories.industry.includes(c)),
          boxMode,
          customText: customText.trim(),
          boxColors: boxColors,
        })
      });
      const startData = await res.json();
      if (!res.ok) {
        if (startData.limitReached) setShowPremiumModal(true);
        else showToast(startData.message || startData.error || "Generation failed", "error");
        setIsGenerating(false);
        return;
      }
      const taskId = startData.data.task_id;
      if (!user && typeof startData.guestGenerationsLeft === 'number') {
        setGuestGenerationsLeft(startData.guestGenerationsLeft);
      }
      if (checkUser) checkUser();
      let completed = false;
      let attempts = 0;
      while (!completed && attempts < 100) {
        await new Promise(r => setTimeout(r, 3000));
        const statusRes = await fetch(`/api/customize/status/${taskId}`, { cache: 'no-store' });
        const statusData = await statusRes.json();
        if (!statusRes.ok) { attempts++; continue; }
        const currentStatus = statusData?.data?.status;
        if (currentStatus === 'COMPLETED') {
          const data = statusData?.data;
          let imageUrl = (Array.isArray(data?.generated) && data.generated[0]) || (Array.isArray(data?.result) && data.result[0]) || data?.result?.items?.[0]?.url || (typeof data?.result === 'string' ? data.result : null);
          if (imageUrl) {
            smartApplyAI(imageUrl);
            try {
              await fetch('/api/user/save-pattern', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: imageUrl, prompt: aiPrompt || "AI Generated Design" })
              });
            } catch (e) { }
            if (checkUser) checkUser();
            completed = true;
            break;
          }
        } else if (currentStatus === 'FAILED') {
          throw new Error(statusData?.data?.message || "Generation process failed");
        }
        attempts++;
      }
    } catch (err) {
      showToast("Forge error: " + err.message, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // Chip categories for smart prompt builder
  const chipCategories = {
    style: [
      "Luxury Premium",
      "Eco & Sustainable",
      "Bold & Playful",
      "Minimal & Clean",
      "Festive & Celebratory",
      "Professional Corporate",
      "Rustic Artisan",
      "Modern High-End",
      "Vintage Classic",
      "Ultra Sleek",
    ],
    industry: [
      "Retail Shopping",
      "Food & Bakery",
      "Cosmetics & Beauty",
      "Corporate Gifting",
      "Apparel & Fashion",
      "Jewelry & Luxury",
      "E-Commerce Mailer",
      "Subscription Box",
      "Artisan & Craft",
      "Health & Wellness",
    ],
  };

  const toggleChip = (chip) =>
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip],
    );

  const enhancePrompt = async () => {
    if (!aiPrompt.trim()) return;
    setIsEnhancing(true);
    // Note: AI Enhance is temporarily offline while migrating to the new engine.
    // We'll keep the logic as a fallback for the user's raw prompt.
    setTimeout(() => {
      setIsEnhancing(false);
      setIsPromptEnhanced(true);
    }, 1000);
  };

  const buildSmartPrompt = () => {
    // If the prompt was AI-enhanced, use it directly as a base
    let basePrompt = aiPrompt.trim();

    const themeMap = {
      mailers: "e-commerce and logistics theme",
      confectionary: "artisan confectionery and bakery motif",
      pizza: "gourmet Italian culinary aesthetic",
      luxury: "bespoke luxury branding",
    };

    const targetTheme = themeMap[boxMode] || "professional product branding";

    // Core technical quality strings for Flux Dev - Focusing on FLAT GRAPHICS ONLY
    const qualityBoosters = "pure flat 2D graphic pattern, seamless surface texture, edge-to-edge wallpaper style, hi-res vector art aesthetic, no 3D objects, no shadows, no perspective, no physical box, isolated graphic";

    // Style-specific modifiers - Abstract and Texture focused
    const styleModifiers = {
      "Luxury Premium": "gold foil embossed motifs, matte black velvet texture, sophisticated repeating geometric patterns, royal aesthetic layout",
      "Eco & Sustainable": "recycled craft paper fiber texture, organic earth-toned leaf patterns, plant-based ink aesthetic, minimalist botanical line art motifs",
      "Bold & Playful": "vibrant pop-art patterns, high contrast color blocks, energetic geometric repeating shapes, modern typography art layout",
      "Minimal & Clean": "bauhaus style graphics, swiss design symmetry, ample negative space, clean grid-based texture, monochromatic surface",
      "Festive & Celebratory": "sparkling metallic pattern motifs, celebratory decorative elements, warm glow accents, intricate festive line work",
      "Professional Corporate": "clean corporate branding grid, blue and silver geometric motifs, organizational surface symmetry",
      "Modern High-End": "glassmorphism texture layers, futuristic circuit patterns, sleek carbon fiber weave aesthetic, ultra-modern UI-style graphic",
    };

    let selectedStyleDetail = "";
    selectedChips.forEach(chip => {
      if (styleModifiers[chip]) selectedStyleDetail += styleModifiers[chip] + ", ";
    });

    const promptParts = [
      `A seamless flat 2D surface texture pattern`,
      targetTheme,
      basePrompt ? `featuring ${basePrompt}` : "with professional graphic motifs",
      selectedStyleDetail,
      "purely 2D flat design, (ABSOLUTELY NO 3D BOX, NO PHYSICAL OBJECTS)",
      qualityBoosters,
      "color-accurate full-frame graphic"
    ].filter(Boolean);

    return promptParts.join(", ");
  };

  const textStyleMap = {
    bold: "font-black tracking-widest text-center uppercase",
    script: "font-serif italic tracking-wide text-center",
    minimal: "font-light tracking-[0.5em] uppercase text-center",
    classic: "font-serif tracking-normal text-center",
    modern: "font-extralight tracking-[0.2em] text-center",
  };

  const maxVal = Math.max(dimensions.l, dimensions.w, dimensions.h);
  const factor = 320 / maxVal;
  const L = dimensions.l * factor;
  const W = dimensions.w * factor;
  const H = dimensions.h * factor;

  const getInches = (val) => unit === "mm" ? val / 25.4 : val;
  const fromInches = (val) => unit === "mm" ? val * 25.4 : val;

  const dimInInches = {
    l: getInches(dimensions.l),
    w: getInches(dimensions.w),
    h: getInches(dimensions.h)
  };

  const currentSA = 2 * (dimInInches.l * dimInInches.w + dimInInches.w * dimInInches.h + dimInInches.h * dimInInches.l);

  const gsmNum = parseInt(String(selectedGSM).replace(/[^0-9]/g, '')) || 280;

  // Calculate accurate price using the real engine
  const pricingResult = (() => {
    if (!product || !quantity || quantity <= 0) return null;
    try {
      const pricingSpec = {
        ...((selectedSpec && typeof selectedSpec === 'object')
          ? selectedSpec
          : (selectedSpec === 'custom_contact'
            ? (estimatedSpec || standardSpec || { ups: 1, machine: 2029, sheetW: 20, sheetH: 29 })
            : (standardSpec || estimatedSpec || { ups: 1, machine: 2029, sheetW: 20, sheetH: 29 }))
        ),
        l: dimensions.l,
        w: dimensions.w,
        h: dimensions.h,
        unit: unit,
        category: selectedCategory
      };

      return calculateBoxPrice({
        spec: pricingSpec,
        qty: Math.max(10, parseInt(quantity) || 10),
        gsm: gsmNum,
        material: selectedMaterial,
        brand: selectedBrand,
        customRate: 75,
        colours: selectedPrintType,
        lamination: selectedFinish,
        addon: 'Plain',
        dieCutting: dieCutting,
        markupType: selectedMarkup,
        sides: 'One',
      }, labConfigs);
    } catch (e) {
      console.error('Pricing engine error:', e);
      return null;
    }
  })();

  const calculatedUnitPrice = pricingResult
    ? pricingResult.finalPerUnit.toFixed(2)
    : "0.00";

  // Force minimum 500 if quantity is set lower
  useEffect(() => {
    if (quantity < 10) setQuantity(10);
  }, [quantity]);

  // Rolling Number Animation for Price Tag
  useEffect(() => {
    if (pricingResult) {
      gsap.to({ val: displayPrice }, {
        val: pricingResult.grandTotal,
        duration: 0.5,
        ease: "power2.out",
        onUpdate: function () {
          setDisplayPrice(this.targets()[0].val);
        }
      });
      gsap.to({ val: displayUnitPrice }, {
        val: pricingResult.finalPerUnit,
        duration: 0.5,
        ease: "power2.out",
        onUpdate: function () {
          setDisplayUnitPrice(this.targets()[0].val);
        }
      });
    }
  }, [pricingResult?.grandTotal, pricingResult?.finalPerUnit]);

  // Design Validation Logic
  const validateDesign = async () => {
    const issues = [];

    // 1. Resolution Check (DPI)
    const checkResolution = (url, face) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          // If the image is smaller than 800px on any side, it might be low quality for a box
          if (img.naturalWidth < 800 || img.naturalHeight < 800) {
            issues.push({ type: 'warning', message: `Low resolution image on ${face} face. May appear blurry.` });
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = url;
      });
    };

    // 2. Bleed Zone Check (Logo too close to edge)
    const checkBleed = (settings, face) => {
      const margin = 10; // 10% from edge is safe zone
      if (settings.x < margin || settings.x > (100 - margin) || settings.y < margin || settings.y > (100 - margin)) {
        issues.push({ type: 'warning', message: `Logo on ${face} is too close to the cutting edge (Bleed Zone).` });
      }
    };

    // Run Checks
    const textures = Object.entries(boxTextures).filter(([_, url]) => url);
    await Promise.all(textures.map(([face, url]) => checkResolution(url, face)));

    Object.entries(boxLogos).forEach(([face, url]) => {
      if (url) checkBleed(logoSettings[face], face);
    });

    if (issues.length > 0) {
      // Show first issue as toast, return false to indicate check failed (or just warned)
      issues.forEach(issue => showToast(issue.message, "warning"));
      // For now, we just warn but allow adding to cart. In a strict mode, we'd return false.
    }
    return true;
  };

  // Auto-Sync background worker (Live Auto Share)
  useEffect(() => {
    // Only invoke background auto-saves if we have explicitly established an active share link/design ID.
    if (!shareLink && !activeDesignId) return;

    const autoSyncTimer = setTimeout(async () => {
      try {
        const designData = {
          name: designName || `${user?.name || 'My'} Design - ${dimensions.l}×${dimensions.w}×${dimensions.h}`,
          customDesign: {
            textures: boxTextures,
            colors: boxColors,
            textureSettings,
            text: customText,
            textStyle: boxTextStyle,
            textColor: boxTextColor,
            textSettings: boxTextSettings,
            dimensions,
            unit,
            selectedGSM,
            selectedMaterial
          },
          productId: product?.id,
          isPublic: true,
        };

        await fetch('/api/designs', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...designData, designId: activeDesignId })
        });

      } catch (err) {
        console.warn("Background auto-save failed quietly: ", err);
      }
    }, 1200); // 1.2s Debounce

    return () => clearTimeout(autoSyncTimer);
  }, [
    dimensions, unit,
    selectedGSM, selectedMaterial,
    boxColors, customText, boxTextStyle, boxTextColor, boxTextSettings, textureSettings,
    shareLink, activeDesignId
  ]);

  // Reusable loading UI matching the premium Brand Loader
  const LoadingScreen = () => (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center overflow-hidden relative">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, filter: "blur(15px)" }}
        animate={{ scale: [0.8, 1.1, 1.0], opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex items-center justify-center"
      >
        <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-emerald-500/10 border border-emerald-50/50 p-16">
          <img src="/BOXFOX-1.png" alt="BOXFOX" className="w-64 object-contain" />
          <motion.div
            initial={{ x: "-150%", skewX: -25 }}
            animate={{ x: "150%" }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent pointer-events-none"
          />
        </div>
        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-3xl -z-10 animate-pulse"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)" }}
        />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-12 text-[10px] font-black tracking-[0.4em] uppercase text-emerald-500"
      >
        Initializing Forge
      </motion.p>
    </div>
  );

  if (loading || authLoading) return <LoadingScreen />;

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-3xl bg-red-50 flex items-center justify-center mb-6 border border-red-100">
          <Box size={40} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-950 uppercase tracking-tighter mb-2">Systems_Offline</h2>
        <p className="text-sm text-gray-500 max-w-md mb-8">
          The Lab could not synchronize with the product database. Please ensure the system is active or try a different product.
        </p>
        <button
          onClick={() => window.location.href = '/shop'}
          className="px-8 py-4 bg-gray-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-emerald-500 transition-all active:scale-95 shadow-xl"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  if (isGenerating) return <LoadingScreen />;

  const renderFaceTexture = (face) => {
    if (!boxTextures[face]) return null;
    const settings = textureSettings[face] || { scale: 100, x: 50, y: 50, rotate: 0 };
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${boxTextures[face]})`,
          backgroundSize: `${settings.scale}%`,
          backgroundPosition: `${settings.x}% ${settings.y}%`,
          backgroundRepeat: "no-repeat",
          transform: `rotate(${settings.rotate}deg)`,
          transition: isSpatialPanning.current ? "none" : "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 10
        }}
      />
    );
  };

  const renderFaceLogo = (face) => {
    if (!boxLogos[face]) return null;
    const settings = logoSettings[face] || { scale: 30, x: 50, y: 50, rotate: 0 };
    return (
      <div
        className="absolute pointer-events-none drop-shadow-xl"
        style={{
          left: `${settings.x}%`,
          top: `${settings.y}%`,
          width: `${settings.scale}%`,
          transform: `translate(-50%, -50%) rotate(${settings.rotate}deg) translateZ(1px)`,
          zIndex: 20
        }}
      >
        <img src={boxLogos[face]} alt={`${face} logo`} className="w-full h-auto object-contain" />
      </div>
    );
  };

  const faceStyle = (face) => {
    const isActive = selectedFace === face;
    return {
      backgroundColor: boxColors[face] || "rgba(16, 185, 129, 0.05)",
      transition: isSpatialPanning.current ? "none" : "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      transformStyle: "preserve-3d",
      boxShadow: isActive ? "inset 0 0 0 4px #10b981, 0 0 40px rgba(16, 185, 129, 0.2)" : "none",
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-white text-gray-950 selection:bg-emerald-500 selection:text-white font-sans"
    >
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      {isGuest && (
        <div className="pt-24 sm:pt-28 overflow-hidden">
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full min-h-[56px] rounded-none border-y border-emerald-200 bg-emerald-50/90 backdrop-blur-sm shadow-lg shadow-emerald-500/5 overflow-hidden text-left group"
          >
            <motion.div
              className="flex w-max items-center gap-4 px-4 py-2 sm:px-6 sm:py-3 whitespace-nowrap"
              animate={{ x: ['-50%', '0%'] }}
              transition={{ duration: 18, ease: "linear", repeat: Infinity }}
            >
              {Array.from({ length: 3 }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase tracking-[0.35em] text-emerald-600">Guest Mode</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.28em] text-gray-950">
                    Login to unlock the full Customize Studio
                  </p>
                  <span className="text-[8px] sm:text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em]">
                    Saved designs · sharing · brand vault · full account access
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-950 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-[0.25em]">
                    Sign In For Full Access
                  </span>
                </div>
              ))}
            </motion.div>
          </button>
        </div>
      )}
      {/* AI Generate overlay removed for direct lab flow */}
      <div className="pt-24 sm:pt-28 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
        {/* 3D SPATIAL CANVAS (LEFT) */}
        <div className="lg:col-span-7 lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] flex flex-col space-y-4 md:space-y-6 overflow-y-auto no-scrollbar pb-6">
          <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gray-50 border border-gray-100 rounded-2xl sm:rounded-[2rem] shadow-sm shrink-0">
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
              <div className="relative shrink-0">
                <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                  <Box size={16} className="text-emerald-500" />
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <input
                  type="text"
                  placeholder={product?.name || "Untitled Design"}
                  value={designName}
                  onChange={(e) => setDesignName(e.target.value)}
                  className="bg-transparent border-none outline-none text-[9px] sm:text-[11px] md:text-sm font-black uppercase tracking-[0.15em] sm:tracking-[0.3em] text-emerald-600 italic leading-none w-full focus:ring-0"
                />
                <h1 className="text-[7px] sm:text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  Product_Type: {product?.categories?.[1] || "Standard"} Lab Edition
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Save Draft */}
              <button
                disabled={isSavingDraft}
                onClick={async () => {
                  if (isSavingDraft) return;

                  const savedNamePrompt = window.prompt("Please enter a name to save your design as:", designName || product?.name || "Untitled Design");
                  if (savedNamePrompt === null) {
                    return; // user cancelled the save
                  }

                  setDesignName(savedNamePrompt);

                  setIsSavingDraft(true);
                  try {
                    const uploadedTextures = { ...boxTextures };
                    for (let face of Object.keys(uploadedTextures)) {
                      const t = uploadedTextures[face];
                      if (t && t.startsWith('data:image')) {
                        try {
                          const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: t }) });
                          const data = await res.json();
                          if (data.url) uploadedTextures[face] = data.url;
                        } catch (err) { console.error(err); }
                      }
                    }
                    const designData = {
                      name: savedNamePrompt || `${user?.name || 'My'} Design - ${dimensions.l}×${dimensions.w}×${dimensions.h}`,
                      customDesign: { textures: uploadedTextures, colors: boxColors, textureSettings, text: customText, textStyle: boxTextStyle, textColor: boxTextColor, textSettings: boxTextSettings, dimensions, unit, selectedGSM, selectedMaterial },
                      productId: product?.id,
                    };
                    const method = activeDesignId ? 'PATCH' : 'POST';
                    const payload = activeDesignId ? { ...designData, designId: activeDesignId } : designData;
                    const res = await fetch('/api/designs', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                    const result = await res.json();
                    if (res.ok && result.success) {
                      if (!activeDesignId && result.design?._id) setActiveDesignId(result.design._id);
                      setDraftSaved(true);
                      showToast("Design saved successfully!");
                      setTimeout(() => setDraftSaved(false), 3000);
                    } else {
                      const errorMsg = result.error || 'Failed to save design';
                      showToast(errorMsg, "error");
                      if (res.status === 401) setShowAuthModal(true);
                    }
                  } catch (e) {
                    console.error('Save Design Error:', e);
                    showToast('An unexpected error occurred while saving.', "error");
                  } finally {
                    setIsSavingDraft(false);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-sm ${draftSaved ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-600'
                  }`}
              >
                {isSavingDraft ? <RefreshCw size={12} className="animate-spin" /> : draftSaved ? <Check size={12} /> : <Save size={12} />}
                <span className="hidden sm:inline">{isSavingDraft ? 'Saving' : draftSaved ? 'Saved!' : 'Save'}</span>
              </button>
              {/* Share Design */}
              <button
                disabled={isSharing}
                onClick={async () => {
                  if (isSharing) return;
                  setIsSharing(true);
                  try {
                    const uploadedTextures = { ...boxTextures };
                    for (let face of Object.keys(uploadedTextures)) {
                      const t = uploadedTextures[face];
                      if (t && t.startsWith('data:image')) {
                        try {
                          const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: t }) });
                          const data = await res.json();
                          if (data.url) uploadedTextures[face] = data.url;
                        } catch (err) { console.error(err); }
                      }
                    }
                    const designData = {
                      name: designName || `${user?.name || 'My'} Design - ${dimensions.l}×${dimensions.w}×${dimensions.h}`,
                      customDesign: { textures: uploadedTextures, colors: boxColors, textureSettings, text: customText, textStyle: boxTextStyle, textColor: boxTextColor, textSettings: boxTextSettings, dimensions, unit, selectedGSM, selectedMaterial },
                      productId: product?.id,
                      isPublic: true,
                    };
                    const method = activeDesignId ? 'PATCH' : 'POST';
                    const payload = activeDesignId ? { ...designData, designId: activeDesignId } : designData;
                    const res = await fetch('/api/designs', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                    const result = await res.json();

                    if (res.ok && result.success && (result.design?.shareId)) {
                      if (!activeDesignId && result.design?._id) setActiveDesignId(result.design._id);
                      const link = `${window.location.origin}/design/${result.design.shareId}`;
                      setShareLink(link);
                      try {
                        await navigator.clipboard.writeText(link);
                      } catch (err) {
                        console.warn("Clipboard auto-copy failed, user can copy manually from toast.");
                      }
                      setShareToast(true);
                      setTimeout(() => setShareToast(false), 6000);
                    } else {
                      const errorMsg = result.error || 'Failed to generate share link';
                      showToast(errorMsg, "error");
                      if (res.status === 401) setShowAuthModal(true);
                    }
                  } catch (e) {
                    console.error('Share Design Error:', e);
                    showToast('An unexpected error occurred while sharing.', "error");
                  } finally {
                    setIsSharing(false);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 text-[9px] font-black uppercase tracking-widest hover:border-blue-400 hover:text-blue-600 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
              >
                {isSharing ? <RefreshCw size={12} className="animate-spin" /> : <Share2 size={12} />}
                <span className="hidden sm:inline">{isSharing ? 'Sharing' : 'Share'}</span>
              </button>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </div>
          </div>

          <div
            className="relative h-[42vh] sm:h-[52vh] md:h-[60vh] lg:flex-1 lg:h-auto shrink-0 min-h-[350px] lg:min-h-[500px] bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 rounded-2xl sm:rounded-[3rem] md:rounded-[4rem] lg:rounded-[5rem] border border-gray-200 shadow-xl overflow-hidden group touch-none"
            onMouseDown={() => {
              isDragging.current = true;
            }}
            onMouseMove={(e) => {
              if (isDragging.current)
                setRotate((r) => ({
                  x: r.x - e.movementY * 0.4,
                  y: r.y + e.movementX * 0.4,
                }));
            }}
            onMouseUp={() => {
              isDragging.current = false;
            }}
            onMouseLeave={() => {
              isDragging.current = false;
            }}
            onTouchStart={(e) => {
              isDragging.current = true;
              prevTouch.current = e.touches[0];
            }}
            onTouchMove={(e) => {
              if (isDragging.current && e.touches[0]) {
                const touch = e.touches[0];
                const movementX =
                  touch.clientX - (prevTouch.current?.clientX || touch.clientX);
                const movementY =
                  touch.clientY - (prevTouch.current?.clientY || touch.clientY);
                setRotate((r) => ({
                  x: r.x - movementY * 0.5,
                  y: r.y + movementX * 0.5,
                }));
                prevTouch.current = touch;
              }
            }}
            onTouchEnd={() => {
              isDragging.current = false;
              prevTouch.current = null;
            }}
          >
            {/* Blueprint Grid Overlay */}
            <div
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(#059669 1px, transparent 1px), linear-gradient(90deg, #059669 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            {/* 3D Blueprint Engine */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ perspective: "3000px" }}
            >
              <motion.div
                animate={{ rotateX: rotate.x, rotateY: rotate.y }}
                transition={{ type: "spring", damping: 30, stiffness: 100 }}
                style={{
                  transformStyle: "preserve-3d",
                  width: L,
                  height: H,
                  position: "relative",
                }}
              >
                {/* Faces */}
                <div
                  style={{
                    ...faceStyle("front"),
                    width: L,
                    height: H,
                    transform: `translateZ(${W / 2}px)`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (customMode === "logo") setSelectedFace(selectedFace === "front" ? null : "front");
                    else if (boxTextures.front) setSelectedFace(selectedFace === "front" ? null : "front");
                    else toggleFaceMapping("front");
                  }}
                  onMouseDown={(e) => handleFaceSpatialDown(e, "front")}
                  onMouseMove={(e) => handleFaceSpatialMove(e, "front")}
                  onWheel={(e) => handleFaceSpatialScroll(e, "front")}
                  onDoubleClick={() => setTextureSettings(prev => ({ ...prev, front: { scale: 100, x: 50, y: 50 } }))}
                  className="absolute border border-gray-200 flex items-center justify-center overflow-hidden bg-white/50 group"
                >
                  {!boxTextures.front && (
                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.6em]">
                      Front_Panel
                    </div>
                  )}
                  {renderFaceTexture("front")}
                  {renderFaceLogo("front")}
                </div>
                <div
                  style={{
                    ...faceStyle("back"),
                    width: L,
                    height: H,
                    transform: `rotateY(180deg) translateZ(${W / 2}px)`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (customMode === "logo") setSelectedFace(selectedFace === "back" ? null : "back");
                    else if (boxTextures.back) setSelectedFace(selectedFace === "back" ? null : "back");
                    else toggleFaceMapping("back");
                  }}
                  onMouseDown={(e) => handleFaceSpatialDown(e, "back")}
                  onMouseMove={(e) => handleFaceSpatialMove(e, "back")}
                  onWheel={(e) => handleFaceSpatialScroll(e, "back")}
                  onDoubleClick={() => setTextureSettings(prev => ({ ...prev, back: { scale: 100, x: 50, y: 50 } }))}
                  className="absolute border border-gray-200 flex items-center justify-center overflow-hidden bg-white/50 group"
                >
                  {!boxTextures.back && (
                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.6em]">
                      Rear
                    </div>
                  )}
                  {renderFaceTexture("back")}
                  {renderFaceLogo("back")}
                </div>
                <div
                  style={{
                    ...faceStyle("right"),
                    width: W,
                    height: H,
                    transform: `rotateY(90deg) translateZ(${L / 2}px)`,
                    left: (L - W) / 2,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (customMode === "logo") setSelectedFace(selectedFace === "right" ? null : "right");
                    else if (boxTextures.right) setSelectedFace(selectedFace === "right" ? null : "right");
                    else toggleFaceMapping("right");
                  }}
                  onMouseDown={(e) => handleFaceSpatialDown(e, "right")}
                  onMouseMove={(e) => handleFaceSpatialMove(e, "right")}
                  onWheel={(e) => handleFaceSpatialScroll(e, "right")}
                  onDoubleClick={() => setTextureSettings(prev => ({ ...prev, right: { scale: 100, x: 50, y: 50 } }))}
                  className="absolute border border-gray-200 flex items-center justify-center overflow-hidden bg-white/50 group"
                >
                  {!boxTextures.right && (
                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.6em] rotate-[-90deg]">
                      Right
                    </div>
                  )}
                  {renderFaceTexture("right")}
                  {renderFaceLogo("right")}
                </div>
                <div
                  style={{
                    ...faceStyle("left"),
                    width: W,
                    height: H,
                    transform: `rotateY(-90deg) translateZ(${L / 2}px)`,
                    left: (L - W) / 2,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (customMode === "logo") setSelectedFace(selectedFace === "left" ? null : "left");
                    else if (boxTextures.left) setSelectedFace(selectedFace === "left" ? null : "left");
                    else toggleFaceMapping("left");
                  }}
                  onMouseDown={(e) => handleFaceSpatialDown(e, "left")}
                  onMouseMove={(e) => handleFaceSpatialMove(e, "left")}
                  onWheel={(e) => handleFaceSpatialScroll(e, "left")}
                  onDoubleClick={() => setTextureSettings(prev => ({ ...prev, left: { scale: 100, x: 50, y: 50 } }))}
                  className="absolute border border-gray-200 flex items-center justify-center overflow-hidden bg-white/50 group"
                >
                  {!boxTextures.left && (
                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.6em] rotate-[90deg]">
                      Left
                    </div>
                  )}
                  {renderFaceTexture("left")}
                  {renderFaceLogo("left")}
                </div>
                <div
                  style={{
                    ...faceStyle("top"),
                    width: L,
                    height: W,
                    transform: `rotateX(90deg) translateZ(${H / 2}px)`,
                    top: (H - W) / 2,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (customMode === "logo") setSelectedFace(selectedFace === "top" ? null : "top");
                    else if (boxTextures.top) setSelectedFace(selectedFace === "top" ? null : "top");
                    else toggleFaceMapping("top");
                  }}
                  onMouseDown={(e) => handleFaceSpatialDown(e, "top")}
                  onMouseMove={(e) => handleFaceSpatialMove(e, "top")}
                  onWheel={(e) => handleFaceSpatialScroll(e, "top")}
                  onDoubleClick={() => setTextureSettings(prev => ({ ...prev, top: { scale: 100, x: 50, y: 50 } }))}
                  className="absolute border border-gray-200 flex items-center justify-center overflow-hidden bg-white/50 group"
                >
                  {!boxTextures.top && (
                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.6em] z-10">
                      Top_Header
                    </div>
                  )}

                  {renderFaceTexture("top")}
                  {renderFaceLogo("top")}

                  {customText && textOnBox && (
                    <div
                      className={`absolute drop-shadow-2xl flex items-center justify-center pointer-events-none ${textStyleMap[boxTextStyle]}`}
                      style={{
                        left: `${boxTextSettings.x}%`,
                        top: `${boxTextSettings.y}%`,
                        transform: "translate(-50%, -50%) translateZ(2px)",
                        fontSize: `${boxTextSettings.size}px`,
                        color: boxTextColor,
                        width: '100%',
                        zIndex: 30
                      }}
                    >
                      {customText}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    ...faceStyle("bottom"),
                    width: L,
                    height: W,
                    transform: `rotateX(-90deg) translateZ(${H / 2}px)`,
                    top: (H - W) / 2,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (customMode === "logo") setSelectedFace(selectedFace === "bottom" ? null : "bottom");
                    else if (boxTextures.bottom) setSelectedFace(selectedFace === "bottom" ? null : "bottom");
                    else toggleFaceMapping("bottom");
                  }}
                  onMouseDown={(e) => handleFaceSpatialDown(e, "bottom")}
                  onMouseMove={(e) => handleFaceSpatialMove(e, "bottom")}
                  onWheel={(e) => handleFaceSpatialScroll(e, "bottom")}
                  onDoubleClick={() => setTextureSettings(prev => ({ ...prev, bottom: { scale: 100, x: 50, y: 50 } }))}
                  className="absolute border border-gray-200 flex items-center justify-center overflow-hidden bg-white/50 group"
                >
                  {!boxTextures.bottom && (
                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.6em]">
                      base
                    </div>
                  )}
                  {renderFaceTexture("bottom")}
                  {renderFaceLogo("bottom")}
                </div>
              </motion.div>
            </div>

            {/* Layout Metadata */}
            <div className="absolute top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8 pointer-events-none">
              <div className="flex items-center gap-2 sm:gap-3 bg-white/95 backdrop-blur-md px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
                <Maximize2 size={13} className="text-emerald-500" />
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-gray-700 italic">
                  Scale_Context_1:1
                </span>
              </div>
            </div>

            <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 right-4 sm:right-6 md:right-8 flex items-end justify-between pointer-events-none">
              <div className="space-y-2 sm:space-y-4">
                <div className="flex gap-4 sm:gap-6 md:gap-10">
                  {["l", "w", "h"].map((d) => (
                    <div key={d}>
                      <p className="text-[7px] sm:text-[8px] md:text-[9px] font-black text-emerald-600 uppercase mb-1 tracking-[0.3em] sm:tracking-[0.4em]">
                        {d}_DIM
                      </p>
                      <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black italic text-gray-950 leading-none">
                        {(parseFloat(dimensions[d]) || 0).toFixed(unit === "mm" ? 0 : 1)}
                        <span className="text-[10px] sm:text-xs not-italic ml-0.5 text-gray-500 lowercase">
                          {unit}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-emerald-600 text-[7px] sm:text-[8px] font-black tracking-[0.2em] sm:tracking-[0.3em] uppercase">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Real-time Rendering Active
                </div>
              </div>

              {/* Spatial UI Controls removed as per user request - Controls are now in Sidebar Asset Tuning Lab */}

              <div className="group pointer-events-auto cursor-pointer flex flex-col items-center gap-1.5 sm:gap-2 bg-white/95 p-3 sm:p-4 md:p-5 rounded-2xl sm:rounded-[2.5rem] border border-gray-100 shadow-lg backdrop-blur-md active:scale-90 transition-all duration-300">
                <RotateCw
                  size={18}
                  className="text-gray-950 group-hover:rotate-180 transition-transform duration-700"
                />
                <span className="text-[6px] sm:text-[7px] font-black text-gray-400 uppercase tracking-[0.4em]">
                  Drag_to_Inspect
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTROL PANEL (RIGHT) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Step 1: Product Formulation */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden group transition-all hover:border-emerald-200">
            <div className="flex items-center justify-between px-6 py-5 bg-gray-50/50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white text-[10px] font-black">1</div>
                <h3 className="text-xs font-black text-gray-950 uppercase tracking-widest">Product Formulation</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedGSM("280");
                  setSelectedMaterial("SBS");
                  setSelectedBrand("ITC");
                  setSelectedFinish("Plain");
                  setSelectedPrintType("Four Colour");
                  setSelectedMarkup("Retail");
                  setDieCutting(true);
                  setSelectedCategory("All");
                  setSelectedSubCategory("All");
                  setQuantity(500);
                  setDimensions({ l: 12, w: 8, h: 4 });
                  setDesignName("Untitled Design");
                  if (typeof setUnit === "function") setUnit("in");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest shadow-sm"
              >
                <RefreshCw size={12} />
                <span>Reset All</span>
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Select Category</label>
                  <select
                    value={selectedCategory || "All"}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[11px] font-bold text-gray-950 outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="All">All Categories</option>
                    {categories.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Select Sub-Category</label>
                  <select
                    value={selectedSubCategory || "All"}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[11px] font-bold text-gray-950 outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="All">All Sub-Categories</option>
                    {subCategories.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Select GSM</label>
                  <select
                    value={selectedGSM || "280"}
                    onChange={(e) => setSelectedGSM(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[11px] font-bold text-gray-950 outline-none focus:border-emerald-500 transition-all"
                  >
                    {ENGINE_GSM_OPTIONS.map(g => <option key={g} value={g}>{g} GSM</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Select Material</label>
                  <select
                    value={selectedMaterial || "SBS"}
                    onChange={(e) => {
                      const mat = e.target.value;
                      setSelectedMaterial(mat);
                      const brands = getBrandsForMaterial(mat);
                      setSelectedBrand(brands.includes("ITC") ? "ITC" : brands[0]);
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[11px] font-bold text-gray-950 outline-none focus:border-emerald-500 transition-all"
                  >
                    {MATERIAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Lamination / Finish</label>
                  <select
                    value={selectedFinish || "Plain"}
                    onChange={(e) => setSelectedFinish(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[11px] font-bold text-gray-950 outline-none focus:border-emerald-500 transition-all"
                  >
                    {FINISH_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Printing Type</label>
                  <select
                    value={selectedPrintType || "Four Colour"}
                    onChange={(e) => setSelectedPrintType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[11px] font-bold text-gray-950 outline-none focus:border-emerald-500 transition-all"
                  >
                    {PRINT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Predefined Standard Sizes</label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['in', 'mm'].map(u => (
                      <button
                        key={u}
                        onClick={() => {
                          if (unit !== u) {
                            setUnit(u);
                            const factor = u === 'mm' ? 25.4 : (1 / 25.4);
                            setDimensions({
                              l: parseFloat((dimensions.l * factor).toFixed(u === 'mm' ? 0 : 1)),
                              w: parseFloat((dimensions.w * factor).toFixed(u === 'mm' ? 0 : 1)),
                              h: parseFloat((dimensions.h * factor).toFixed(u === 'mm' ? 0 : 1)),
                            });
                            setSelectedSpec('custom_contact'); // Force custom mode after conversion
                          }
                        }}
                        className={`px-2 py-0.5 rounded text-[8px] font-black uppercase transition-all ${unit === u ? 'bg-white text-emerald-500 shadow-sm' : 'text-gray-400'}`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative group">
                  <select
                    value={selectedSpec?.spec || (typeof selectedSpec === 'string' ? selectedSpec : "")}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "custom_contact") {
                        setSelectedSpec("custom_contact");
                        return;
                      }
                      const selected = labConfig.specifications.find(s => s.spec === val);
                      if (selected) {
                        setDimensions({ l: selected.l, w: selected.w, h: selected.h });
                        setUnit(selected.unit || "mm");
                        setSelectedSpec(selected);
                        if (selected.category !== "All") setSelectedCategory(selected.category);
                        if (selected.subCategory !== "All") setSelectedSubCategory(selected.subCategory);
                        if (selected.category === "Bakery") { setSelectedMaterial("SBS"); setSelectedBrand("ITC"); }
                      } else {
                        setSelectedSpec('custom_contact');
                      }
                    }}
                    className="w-full bg-white border-2 border-emerald-100 rounded-2xl px-5 py-3.5 text-xs font-black uppercase tracking-wider text-gray-950 outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="">Select a calibrated size...</option>
                    {labConfig.specifications.filter(s => (selectedCategory === "All" || s.category === selectedCategory) && (selectedSubCategory === "All" || s.subCategory === selectedSubCategory)).map((spec, idx) => (
                      <option key={idx} value={spec.spec}>{spec.spec?.split('|')[0].trim() || 'Standard Spec'}</option>
                    ))}
                    <option value="custom_contact">REQUEST CUSTOM SIZE (WHATSAPP)</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" size={16} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {["l", "w", "h"].map((d) => (
                    <div key={d} className="space-y-1">
                      <input
                        type="text"
                        value={dimensions[d] === "" ? "" : dimensions[d]}
                        onChange={(e) => {
                          const val = e.target.value;
                          // Allow numbers and decimal point for fluid typing
                          if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
                            setDimensions({ ...dimensions, [d]: val });
                            setSelectedSpec('custom_contact');
                          }
                        }}
                        className="w-full h-12 bg-white border border-gray-200 rounded-xl px-2 text-lg font-black text-center focus:border-emerald-500 outline-none transition-all"
                      />
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-center">
                        {d === "l" ? "Length" : d === "w" ? "Width" : "Height"}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 px-5 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex-1">
                    <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Vol_Cubic_{unit.toUpperCase()}</p>
                    <p className="text-xs font-black text-gray-950">{(dimensions.l * dimensions.w * dimensions.h).toFixed(unit === "mm" ? 0 : 1)}<span className="text-[9px] ml-0.5 opacity-40">{unit}³</span></p>
                  </div>
                  <div className="w-px h-6 bg-gray-200" />
                  <div className="flex-1">
                    <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Surf_Area</p>
                    <p className="text-xs font-black text-gray-950">{(unit === "mm" ? 2 * (dimensions.l * dimensions.w + dimensions.w * dimensions.h + dimensions.h * dimensions.l) : currentSA).toFixed(unit === "mm" ? 0 : 1)}<span className="text-[9px] ml-0.5 opacity-40">{unit}²</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Neural_Maps */}
          <div className={`relative rounded-[2rem] border transition-all duration-700 overflow-hidden group shadow-xl ${customMode === 'texture' ? 'bg-emerald-50/30 border-emerald-500/50 shadow-emerald-500/10' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
            {/* Neural Scanning Animation (Visible only in Texture mode) */}
            {customMode === 'texture' && (
              <motion.div
                initial={{ top: '0%' }}
                animate={{ top: '100%' }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent z-10 pointer-events-none"
              />
            )}

            <div className={`flex items-center justify-between px-6 py-5 border-b transition-colors duration-500 ${customMode === 'texture' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-gray-50/50 border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-[10px] font-black transition-all ${customMode === 'texture' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-blue-600 text-white'}`}>2</div>
                <div>
                  <h3 className={`text-[12px] font-black uppercase tracking-[0.1em] ${customMode === 'texture' ? 'text-emerald-900' : 'text-gray-900'}`}>Neural_Maps</h3>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Apply Textures & Logos</p>
                </div>
              </div>
              {customMode === 'texture' && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white rounded-full">
                  <Zap size={10} className="animate-pulse" />
                  <span className="text-[8px] font-black tracking-widest uppercase">Live_Lab</span>
                </div>
              )}
            </div>

            <div className="p-6 space-y-8">
              {/* Step 2.1: Intelligence_Input (Chips and Prompt) */}
              {customMode === 'texture' && (
                <div className="space-y-6">
                  {/* AI Forge Logic (Chips) */}
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
                      {Object.keys(chipCategories).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveChipCategory(cat)}
                          className={`px-4 py-2 text-[8px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeChipCategory === cat ? 'bg-gray-950 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <div className="p-4 flex flex-wrap gap-2">
                      {chipCategories[activeChipCategory]?.map(chip => (
                        <button
                          key={chip}
                          onClick={() => toggleChip(chip)}
                          className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${selectedChips.includes(chip) ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-blue-200'}`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Describe Your Idea (Prompt) */}
                  <div className={`space-y-3 p-4 rounded-3xl transition-all ${customMode === 'texture' ? 'bg-emerald-500/5 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]' : ''}`}>
                    <div className="flex items-center justify-between px-1">
                      <label className={`text-[11px] font-black uppercase tracking-[0.15em] transition-colors ${customMode === 'texture' ? 'text-emerald-900' : 'text-blue-700'}`}>Describe Your Idea</label>
                      {customMode === 'texture' && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 text-white rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          <span className="text-[8px] font-black uppercase tracking-widest">Neural_Processor_v2.5</span>
                        </div>
                      )}
                    </div>
                    <textarea
                      placeholder="e.g. minimalist white mailer with gold foil logo..."
                      value={aiPrompt || ""}
                      onChange={(e) => { setAiPrompt(e.target.value); setIsPromptEnhanced(false); }}
                      rows={3}
                      className={`w-full border-2 rounded-[1.5rem] p-5 text-[13px] font-bold outline-none transition-all resize-none shadow-sm ${customMode === 'texture'
                        ? 'bg-white border-emerald-500/30 focus:border-emerald-500 text-emerald-950 placeholder:text-emerald-100 shadow-emerald-500/5'
                        : 'bg-gray-50 border-gray-100 focus:border-blue-400'
                        }`}
                    />
                    {customMode === 'texture' && (
                      <div className="flex items-center gap-2 px-1">
                        <div className="w-1 h-1 rounded-full bg-emerald-400" />
                        <p className="text-[9px] font-bold text-emerald-600/60 uppercase tracking-wider">AI uses Neural_Maps to project your description onto the 3D dieline</p>
                      </div>
                    )}
                  </div>

                  {/* Ignite_Forge Button - Moved below text box as per request */}
                  <div className="space-y-4 pt-2">
                    <button
                      onClick={generateAITexture}
                      disabled={isGenerating || (!aiPrompt.trim() && selectedChips.length === 0)}
                      className={`w-full py-4 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl font-black uppercase text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.45em] flex flex-col items-center justify-center gap-1 transition-all shadow-lg active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group relative overflow-hidden ${customMode === 'texture'
                        ? 'bg-emerald-500 text-white shadow-emerald-500/40 hover:bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        : 'bg-gray-950 text-white hover:bg-emerald-500'
                        }`}
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-3">
                          <RefreshCw className="animate-spin shrink-0" size={18} />
                          <span>Processing Neural Maps...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 sm:gap-4">
                          <Sparkles size={17} className="group-hover:rotate-12 transition-transform shrink-0" />
                          <span>Ignite_Forge</span>
                        </div>
                      )}
                    </button>
                    <div className="flex items-center justify-between gap-2 px-2">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shadow-sm">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[7px] font-black uppercase tracking-[0.2em]">Neural_Activation_Ready</span>
                      </div>
                      <div className="px-3 py-1.5 bg-gray-50 rounded-full text-[7px] font-black text-gray-500 uppercase tracking-widest border border-gray-100 shadow-sm">
                        {user?.aiUnlimitedUntil && new Date(user.aiUnlimitedUntil) > new Date() ? 'Unlimited Generations' : `${user ? Math.max(0, 5 - (user?.aiGenerationCount || 0)) : guestGenerationsLeft} Generations Left`}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2.3: Mode Switcher Tabs */}
              <div className={`flex p-1 rounded-xl transition-colors ${customMode === 'texture' ? 'bg-emerald-100/50' : 'bg-gray-100'}`}>
                {['texture', 'logo', 'color', 'upload'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setCustomMode(mode)}
                    className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${customMode === mode
                      ? (mode === 'texture' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white text-blue-600 shadow-sm')
                      : (customMode === 'texture' ? 'text-emerald-700/60 hover:text-emerald-900' : 'text-gray-400 hover:text-gray-600')
                      }`}
                  >
                    {mode === 'texture' ? 'AI_Texture' : mode === 'logo' ? 'Logo_Lab' : mode === 'color' ? 'Solid_Lab' : 'Image_Upload'}
                  </button>
                ))}
              </div>

              {/* Mode-Specific Tools */}
              {customMode === 'logo' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-3">
                    <label className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all">
                      <input type="file" className="hidden" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => { setBoxLogos(prev => ({ ...prev, [selectedFace || 'top']: reader.result })); showToast("Logo Uploaded!"); };
                          reader.readAsDataURL(file);
                        }
                      }} />
                      <Upload size={20} className="text-gray-300" />
                    </label>
                    {Object.entries(boxLogos).filter(([_, src]) => src).map(([face, src], idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl border border-gray-100 bg-white p-2 group overflow-hidden">
                        <img src={src} className="w-full h-full object-contain" />
                        <button onClick={() => setBoxLogos(prev => ({ ...prev, [face]: null }))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {boxLogos[selectedFace || 'top'] && (
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                      <div className="flex justify-between items-center"><span className="text-[8px] font-black uppercase text-gray-400">Scale</span><span className="text-[9px] font-black text-blue-600">{logoSettings[selectedFace || 'top']?.scale || 100}%</span></div>
                      <input type="range" min="1" max="100" value={logoSettings[selectedFace || 'top']?.scale || 100} onChange={(e) => setLogoSettings(prev => ({ ...prev, [selectedFace || 'top']: { ...prev[selectedFace || 'top'], scale: parseInt(e.target.value) } }))} className="w-full h-1 bg-gray-200 rounded-full appearance-none accent-blue-600" />
                      <div className="flex justify-between items-center"><span className="text-[8px] font-black uppercase text-gray-400">Rotation</span><span className="text-[9px] font-black text-blue-600">{logoSettings[selectedFace || 'top']?.rotate || 0}°</span></div>
                      <input type="range" min="-180" max="180" value={logoSettings[selectedFace || 'top']?.rotate || 0} onChange={(e) => setLogoSettings(prev => ({ ...prev, [selectedFace || 'top']: { ...prev[selectedFace || 'top'], rotate: parseInt(e.target.value) } }))} className="w-full h-1 bg-gray-200 rounded-full appearance-none accent-blue-600" />
                    </div>
                  )}
                </div>
              )}

              {customMode === 'color' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase text-gray-400 tracking-[0.2em]">Quick Fill</span>
                    <button
                      onClick={() => {
                        if (activeColor) {
                          const allSides = {};
                          ['front', 'back', 'top', 'bottom', 'left', 'right'].forEach(s => {
                            allSides[s] = activeColor;
                          });
                          setBoxColors(allSides);
                          setBoxTextures({}); // Clear textures if solid fill
                          showToast("Solid color applied to all sides!");
                        }
                      }}
                      className="px-3 py-1 bg-gray-50 text-gray-400 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-gray-950 hover:text-white transition-all"
                    >
                      Fill All Sides
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {["#000000", "#FFFFFF", "#059669", "#1D4ED8", "#B91C1C", "#D97706"].map(c => (
                      <button key={c} onClick={() => setActiveColor(c)} style={{ backgroundColor: c }} className={`aspect-square rounded-xl border-2 ${activeColor === c ? 'border-blue-600 scale-90' : 'border-gray-100'}`} />
                    ))}
                    <div className="aspect-square rounded-xl bg-white border border-gray-100 flex items-center justify-center relative overflow-hidden">
                      <input type="color" value={activeColor || "#FFFFFF"} onChange={(e) => setActiveColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-[5]" />
                      <Palette size={14} className="text-gray-400" />
                    </div>
                  </div>

                  <div className="pt-4 space-y-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase text-gray-400 tracking-[0.2em]">Map Color to Side</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {['front', 'back', 'top', 'bottom', 'left', 'right'].map(side => {
                        const isMapped = boxColors[side] === activeColor;
                        return (
                          <button
                            key={side}
                            onClick={() => {
                              if (!activeColor) return;
                              setBoxColors(prev => ({
                                ...prev,
                                [side]: isMapped ? "rgba(16, 185, 129, 0.05)" : activeColor
                              }));
                              if (!isMapped) {
                                setBoxTextures(prev => ({ ...prev, [side]: null }));
                              }
                            }}
                            className={`py-3 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all ${isMapped ? 'bg-white border-emerald-500 text-emerald-500 shadow-sm' : 'bg-white border-gray-100 text-gray-400'}`}
                          >
                            {side}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              {customMode === 'upload' && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50/50');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50/50');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50/50');
                    handleFileUpload(e);
                  }}
                  className="p-10 border-2 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-5 bg-gray-50/30 hover:bg-blue-50/30 hover:border-blue-200 transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Upload size={32} />
                  </div>
                  <div className="text-center relative z-10">
                    <p className="text-[12px] font-black text-gray-950 uppercase tracking-widest">Advanced_Asset_Upload</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Drag & Drop or Click to Select</p>
                    <p className="text-[7px] font-medium text-blue-500 uppercase tracking-widest mt-2 px-2 py-0.5 bg-blue-50 rounded-full inline-block">High-Res PNG/JPG/SVG</p>
                  </div>
                  <label className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 cursor-pointer hover:bg-blue-700 transition-all active:scale-95 hover:shadow-blue-500/40 relative z-10">
                    Choose Files
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              )}

              {/* Shared Asset Manager (Visible in Texture and Upload Modes) */}
              {(customMode === 'texture' || customMode === 'upload') && (
                <div className="space-y-6 pt-8 border-t border-gray-100">
                  {/* Multi-Asset Pool Gallery */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-4 rounded-full ${customMode === 'texture' ? 'bg-emerald-500' : 'bg-blue-600'}`} />
                          <label className={`text-[11px] font-black uppercase tracking-widest transition-colors ${customMode === 'texture' ? 'text-emerald-700' : 'text-blue-700'}`}>Asset_Inventory ({assetPool.length})</label>
                        </div>
                        <span className={`text-[8px] font-bold uppercase tracking-widest mt-1 transition-colors ${customMode === 'texture' ? 'text-emerald-500/50' : 'text-gray-400'}`}>Multi-Asset Neural Management Enabled</span>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${customMode === 'texture' ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        <span className="text-[8px] font-black uppercase tracking-widest">{customMode === 'texture' ? 'Studio Mode' : 'Upload Mode'}</span>
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${customMode === 'texture' ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-blue-600'}`} />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {assetPool.map((asset, idx) => (
                        <div key={idx} className="relative aspect-square">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileActive={{ scale: 0.95 }}
                            onClick={() => setActiveAssetIndex(idx)}
                            className={`w-full h-full rounded-2xl border-2 overflow-hidden cursor-pointer transition-all ${activeAssetIndex === idx ? 'border-blue-600 shadow-xl shadow-blue-500/20' : 'border-gray-100 hover:border-blue-200'}`}
                          >
                            <img src={asset} className="w-full h-full object-cover" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAssetPool(prev => prev.filter((_, i) => i !== idx));
                                if (activeAssetIndex >= idx) setActiveAssetIndex(Math.max(0, activeAssetIndex - 1));
                                showToast("Asset removed from pool");
                              }}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500/90 backdrop-blur-md text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors border border-white/20"
                            >
                              <X size={10} />
                            </button>
                          </motion.div>
                        </div>
                      ))}
                      {assetPool.length < 10 && (
                        <div className="aspect-square border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center text-gray-300 hover:border-blue-200 hover:text-blue-400 transition-all cursor-pointer group"
                          onClick={() => setCustomMode('upload')}>
                          <Plus size={20} className="group-hover:scale-110 transition-transform" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Active Asset Mapping Controls */}
                  {assetPool[activeAssetIndex] && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-3xl border border-gray-100 p-6 space-y-5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                          <h4 className="text-[10px] font-black text-gray-950 uppercase tracking-widest">Assign_To_Side</h4>
                        </div>
                        <button
                          onClick={() => {
                            const current = assetPool[activeAssetIndex];
                            setBoxTextures({
                              top: current, bottom: current, front: current, back: current, left: current, right: current
                            });
                            showToast("Asset applied to all sides!");
                          }}
                          className="px-4 py-1.5 bg-gray-950 text-white rounded-xl text-[8px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all active:scale-95 shadow-lg shadow-gray-950/10"
                        >
                          Apply_To_All
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {['top', 'bottom', 'front', 'back', 'left', 'right'].map(face => {
                          const isMapped = boxTextures[face] === assetPool[activeAssetIndex];
                          const hasOtherImage = boxTextures[face] && !isMapped;
                          return (
                            <button
                              key={face}
                              onClick={() => {
                                setBoxTextures(prev => ({
                                  ...prev,
                                  [face]: isMapped ? null : assetPool[activeAssetIndex]
                                }));
                              }}
                              className={`group relative py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${isMapped ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200 hover:text-gray-600'}`}
                            >
                              {face}
                              {isMapped && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center shadow-md">
                                  <Check size={6} className="text-blue-600" />
                                </div>
                              )}
                              {hasOtherImage && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                                  <Layers size={6} className="text-white" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-6 border-t border-gray-100 space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
                            <h4 className="text-[11px] font-black text-gray-950 uppercase tracking-widest">Asset_Tuning_Lab</h4>
                          </div>
                          <button
                            onClick={() => {
                              setImageToCrop(assetPool[activeAssetIndex]);
                              setCropRotation(0);
                              setZoom(1);
                              setShowCropModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-900/10 active:scale-95"
                          >
                            <Scissors size={12} />
                            Crop Asset
                          </button>
                        </div>
                        <div className="space-y-6 bg-gray-50/50 p-5 rounded-[1.5rem] border border-gray-100">
                          {/* Neural Positioning Matrix */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Grid3x3 size={12} className="text-blue-500" />
                              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Neural Positioning Matrix</span>
                            </div>
                            <div className="flex gap-4 items-center">
                              <div className="grid grid-cols-3 gap-1.5 p-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                                {[
                                  { label: 'TL', x: 20, y: 20 }, { label: 'TC', x: 50, y: 20 }, { label: 'TR', x: 80, y: 20 },
                                  { label: 'ML', x: 20, y: 50 }, { label: 'CC', x: 50, y: 50 }, { label: 'MR', x: 80, y: 50 },
                                  { label: 'BL', x: 20, y: 80 }, { label: 'BC', x: 50, y: 80 }, { label: 'BR', x: 80, y: 80 }
                                ].map((pos) => {
                                  // Determine if this position is "active"
                                  const currentX = selectedFace ? textureSettings[selectedFace]?.x : 50;
                                  const currentY = selectedFace ? textureSettings[selectedFace]?.y : 50;
                                  const isActive = Math.abs(currentX - pos.x) < 5 && Math.abs(currentY - pos.y) < 5;

                                  return (
                                    <button
                                      key={pos.label}
                                      onClick={() => {
                                        setTextureSettings(prev => {
                                          const updated = { ...prev };
                                          if (selectedFace) {
                                            updated[selectedFace] = { ...updated[selectedFace], x: pos.x, y: pos.y };
                                          } else {
                                            Object.keys(updated).forEach(face => {
                                              if (boxTextures[face] === assetPool[activeAssetIndex]) {
                                                updated[face] = { ...updated[face], x: pos.x, y: pos.y };
                                              }
                                            });
                                          }
                                          return updated;
                                        });
                                        showToast(`Snapped to ${pos.label}`, "success");
                                      }}
                                      className={`w-6 h-6 rounded-md border text-[6px] font-black transition-all ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-300 hover:border-blue-200 hover:text-blue-500'}`}
                                    >
                                      {pos.label}
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="flex-1 space-y-3">
                                <div className="space-y-1.5">
                                  <div className="flex justify-between">
                                    <span className="text-[7px] font-black text-gray-400 uppercase">Micro-Nudge X</span>
                                    <span className="text-[7px] font-black text-blue-600">{(selectedFace ? textureSettings[selectedFace]?.x : 50)}%</span>
                                  </div>
                                  <input
                                    type="range" min="0" max="100"
                                    value={selectedFace ? textureSettings[selectedFace]?.x : 50}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value);
                                      setTextureSettings(prev => {
                                        const updated = { ...prev };
                                        if (selectedFace) updated[selectedFace] = { ...updated[selectedFace], x: val };
                                        return updated;
                                      });
                                    }}
                                    className="w-full h-1 bg-gray-200 rounded-full appearance-none accent-blue-600"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <div className="flex justify-between">
                                    <span className="text-[7px] font-black text-gray-400 uppercase">Micro-Nudge Y</span>
                                    <span className="text-[7px] font-black text-blue-600">{(selectedFace ? textureSettings[selectedFace]?.y : 50)}%</span>
                                  </div>
                                  <input
                                    type="range" min="0" max="100"
                                    value={selectedFace ? textureSettings[selectedFace]?.y : 50}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value);
                                      setTextureSettings(prev => {
                                        const updated = { ...prev };
                                        if (selectedFace) updated[selectedFace] = { ...updated[selectedFace], y: val };
                                        return updated;
                                      });
                                    }}
                                    className="w-full h-1 bg-gray-200 rounded-full appearance-none accent-blue-600"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <RotateCcw size={12} className="text-blue-500" />
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Master Rotation</span>
                              </div>
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black">
                                {(() => {
                                  if (selectedFace) return textureSettings[selectedFace]?.rotate || 0;
                                  const firstFace = Object.keys(boxTextures).find(f => boxTextures[f] === assetPool[activeAssetIndex]);
                                  return (firstFace ? textureSettings[firstFace]?.rotate : 0) || 0;
                                })()}°
                              </span>
                            </div>
                            <input
                              type="range"
                              min="-180"
                              max="180"
                              value={(() => {
                                if (selectedFace) return textureSettings[selectedFace]?.rotate || 0;
                                const firstFace = Object.keys(boxTextures).find(f => boxTextures[f] === assetPool[activeAssetIndex]);
                                return (firstFace ? textureSettings[firstFace]?.rotate : 0) || 0;
                              })()}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setTextureSettings(prev => {
                                  const updated = { ...prev };
                                  if (selectedFace) {
                                    updated[selectedFace] = { ...updated[selectedFace], rotate: val };
                                  } else {
                                    Object.keys(updated).forEach(face => {
                                      if (boxTextures[face] === assetPool[activeAssetIndex]) {
                                        updated[face] = { ...updated[face], rotate: val };
                                      }
                                    });
                                  }
                                  return updated;
                                });
                              }}
                              className="w-full h-1.5 bg-gray-200 rounded-full appearance-none accent-blue-600 cursor-pointer"
                            />
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Maximize size={12} className="text-blue-500" />
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Master Scale</span>
                              </div>
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black">
                                {(() => {
                                  if (selectedFace) return textureSettings[selectedFace]?.scale || 100;
                                  const firstFace = Object.keys(boxTextures).find(f => boxTextures[f] === assetPool[activeAssetIndex]);
                                  return (firstFace ? textureSettings[firstFace]?.scale : 100) || 100;
                                })()}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="400"
                              value={(() => {
                                if (selectedFace) return textureSettings[selectedFace]?.scale || 100;
                                const firstFace = Object.keys(boxTextures).find(f => boxTextures[f] === assetPool[activeAssetIndex]);
                                return (firstFace ? textureSettings[firstFace]?.scale : 100) || 100;
                              })()}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setTextureSettings(prev => {
                                  const updated = { ...prev };
                                  if (selectedFace) {
                                    updated[selectedFace] = { ...updated[selectedFace], scale: val };
                                  } else {
                                    Object.keys(updated).forEach(face => {
                                      if (boxTextures[face] === assetPool[activeAssetIndex]) {
                                        updated[face] = { ...updated[face], scale: val };
                                      }
                                    });
                                  }
                                  return updated;
                                });
                              }}
                              className="w-full h-1.5 bg-gray-200 rounded-full appearance-none accent-blue-600 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      <p className="text-[9px] leading-relaxed text-gray-400 font-bold text-center uppercase tracking-widest">
                        Tap any side to toggle the current image. Mix AI and Uploads seamlessly.
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <button onClick={() => setTextOnBox(!textOnBox)} className="w-full flex items-center justify-between py-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-700">Brand Text on Box</span>
                  <div className={`w-8 h-4 rounded-full transition-all ${textOnBox ? 'bg-blue-600' : 'bg-gray-200'}`}><div className={`w-3 h-3 m-0.5 rounded-full bg-white transition-all ${textOnBox ? 'translate-x-4' : 'translate-x-0'}`} /></div>
                </button>
                {textOnBox && (
                  <div className="mt-4 space-y-4">
                    <textarea
                      placeholder="Enter brand text..."
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-[11px] font-medium outline-none focus:border-blue-400 transition-all resize-none"
                      rows={2}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase text-gray-400">Shift X</label>
                        <input type="range" min="0" max="100" value={boxTextSettings.x} onChange={(e) => setBoxTextSettings(prev => ({ ...prev, x: parseInt(e.target.value) }))} className="w-full h-1 bg-gray-200 rounded-full appearance-none accent-blue-600" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase text-gray-400">Shift Y</label>
                        <input type="range" min="0" max="100" value={boxTextSettings.y} onChange={(e) => setBoxTextSettings(prev => ({ ...prev, y: parseInt(e.target.value) }))} className="w-full h-1 bg-gray-200 rounded-full appearance-none accent-blue-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase text-gray-400">Text Color</label>
                      <div className="flex flex-wrap gap-2">
                        {["#FFFFFF", "#000000", "#059669", "#1D4ED8", "#B91C1C", "#D97706"].map(c => (
                          <button key={c} onClick={() => setBoxTextColor(c)} style={{ backgroundColor: c }} className={`w-6 h-6 rounded-full border ${boxTextColor === c ? 'ring-2 ring-blue-600 ring-offset-1' : 'border-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>


              {/* Secondary Forge Button at bottom as requested */}

            </div>
          </div>
          {/* Step 3: Order_Quantity */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden group transition-all hover:border-emerald-200">
            <div className="flex items-center justify-between px-6 py-5 bg-gray-50/50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white text-[10px] font-black">3</div>
                <h3 className="text-xs font-black text-gray-950 uppercase tracking-widest">Order_Quantity</h3>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Unit Count</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") { setQuantity(""); return; }
                        let val = parseInt(raw, 10);
                        if (isNaN(val)) val = 10;
                        if (val > 5000) val = 5000;
                        setQuantity(val);
                      }}
                      onBlur={() => {
                        if (!quantity || quantity < 10) setQuantity(10);
                      }}
                      className="w-20 h-8 bg-white border border-emerald-200 rounded-lg text-center font-black text-xs focus:border-emerald-500 outline-none"
                    />
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Units</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(10, (parseInt(quantity) || 10) - 50))}
                    className="w-8 h-8 rounded-lg bg-white border border-emerald-200 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-sm"
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="range"
                    min="10"
                    max="5000"
                    step="50"
                    value={quantity || 10}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="flex-1 h-1 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(5000, (parseInt(quantity) || 10) + 50))}
                    className="w-8 h-8 rounded-lg bg-white border border-emerald-200 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-sm"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Live_Quote */}
          <div id="live-quote" className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden group transition-all hover:border-gray-950/10">
            <div className="flex items-center justify-between px-6 py-5 bg-gray-50/50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-950 text-white text-[10px] font-black">4</div>
                <h3 className="text-xs font-black text-gray-950 uppercase tracking-widest">Live_Quote</h3>
              </div>
              <div className="flex items-center gap-1 text-emerald-500 animate-pulse">
                <Zap size={12} fill="currentColor" />
                <span className="text-[9px] font-black uppercase tracking-widest italic">Instant</span>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-[8px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
                  <RotateCw size={10} className="animate-spin-slow" />
                  Updates with every change
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Per Unit</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-black text-gray-400">₹</span>
                    <span className="text-2xl font-black tracking-tighter text-gray-950">
                      {displayUnitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Final Total</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-black text-gray-400">₹</span>
                    <span className="text-2xl font-black tracking-tighter text-emerald-600">
                      {Math.round(displayPrice).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {pricingResult && (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest text-gray-500"
                  >
                    <span>Analyze Cost Breakdown</span>
                    <ChevronDown size={12} className={`transition-transform ${showBreakdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showBreakdown && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm"
                    >
                      <table className="w-full text-[9px] border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-gray-500 uppercase font-black tracking-widest border-b border-gray-100">
                            <th className="px-3 py-2 text-left">Component</th>
                            <th className="px-3 py-2 text-right">Job Total</th>
                            <th className="px-3 py-2 text-right">Unit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-bold text-gray-700">
                          <tr>
                            <td className="px-3 py-2">Printing (X2)</td>
                            <td className="px-3 py-2 text-right">₹{pricingResult.printCost.toLocaleString('en-IN')}</td>
                            <td className="px-3 py-2 text-right">₹{(pricingResult.printCost / quantity).toFixed(4)}</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2">Paper Cost (P2)</td>
                            <td className="px-3 py-2 text-right">₹{pricingResult.paperCost.toLocaleString('en-IN')}</td>
                            <td className="px-3 py-2 text-right">₹{(pricingResult.paperCost / quantity).toFixed(4)}</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2">Fixed Charges (AE2)</td>
                            <td className="px-3 py-2 text-right">₹{pricingResult.fixedCharges.toLocaleString('en-IN')}</td>
                            <td className="px-3 py-2 text-right">₹{(pricingResult.fixedCharges / quantity).toFixed(4)}</td>
                          </tr>
                          {/* Die Run Cost is now accounted for in AE2 and AD2 logic per reference sheet */}
                          <tr>
                            <td className="px-3 py-2">Other Charges (AD2)</td>
                            <td className="px-3 py-2 text-right">₹{pricingResult.otherCharges.toLocaleString('en-IN')}</td>
                            <td className="px-3 py-2 text-right">₹{(pricingResult.otherCharges / quantity).toFixed(4)}</td>
                          </tr>
                          <tr className="bg-emerald-50/30 text-emerald-700">
                            <td className="px-3 py-2 italic font-black">Base Per Unit (AG2)</td>
                            <td className="px-3 py-2 text-right">₹{(pricingResult.basePerUnit * quantity).toLocaleString('en-IN')}</td>
                            <td className="px-3 py-2 text-right">₹{pricingResult.basePerUnit.toFixed(4)}</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2">Lamination</td>
                            <td className="px-3 py-2 text-right">₹{pricingResult.breakdown.lamination.toLocaleString('en-IN')}</td>
                            <td className="px-3 py-2 text-right">₹{pricingResult.lamPerUnit.toFixed(4)}</td>
                          </tr>
                          <tr className="bg-gray-100 text-gray-900 border-t border-gray-200">
                            <td className="px-3 py-2 font-black uppercase">Subtotal (Base)</td>
                            <td className="px-3 py-2 text-right">₹{(pricingResult.subtotalPerUnit * quantity).toLocaleString('en-IN')}</td>
                            <td className="px-3 py-2 text-right">₹{pricingResult.subtotalPerUnit.toFixed(4)}</td>
                          </tr>
                          <tr className="text-emerald-600">
                            <td className="px-3 py-2 font-black">Markup ({selectedMarkup} {Math.round(pricingResult.markup * 100)}%)</td>
                            <td className="px-3 py-2 text-right">₹{(pricingResult.markupAmount * quantity).toLocaleString('en-IN')}</td>
                            <td className="px-3 py-2 text-right">₹{pricingResult.markupAmount.toFixed(4)}</td>
                          </tr>
                          <tr className="bg-gray-950 text-white">
                            <td className="px-3 py-2 font-black uppercase tracking-wider">Boxes Total</td>
                            <td className="px-3 py-2 text-right">₹{pricingResult.finalTotal.toLocaleString('en-IN')}</td>
                            <td className="px-3 py-2 text-right">₹{pricingResult.finalPerUnit.toFixed(4)}</td>
                          </tr>

                          <tr className="bg-emerald-600 text-white border-t border-white/20">
                            <td className="px-3 py-2 font-black uppercase tracking-[0.1em]">Final Grand Total</td>
                            <td className="px-3 py-2 text-right text-[12px] font-black">₹{pricingResult.grandTotal.toLocaleString('en-IN')}</td>
                            <td className="px-3 py-2 text-right">-</td>
                          </tr>
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </div>
              )}

              <div className="pt-2">
                {!selectedSpec || typeof selectedSpec !== 'object' ? (
                  <button
                    onClick={() => {
                      const msg = `Hi BoxFox! I've designed a custom box and would like a quote.\n\nDimensions: ${dimensions.l}${unit} x ${dimensions.w}${unit} x ${dimensions.h}${unit}\nQuantity: ${quantity}\nMaterial: ${selectedMaterial}\nGSM: ${selectedGSM}\nEst. Unit Price: ₹${calculatedUnitPrice}\nEst. Total: ₹${pricingResult?.finalTotal.toLocaleString('en-IN')}\n\nI have the design ready in the lab. Please help with the die-line and quote.`;
                      window.open(`https://wa.me/918449339999?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 group"
                  >
                    <Zap size={16} className="text-white group-hover:scale-110 transition-transform" />
                    Connect on WhatsApp
                  </button>
                ) : (
                  <button
                    disabled={isAddingToCart}
                    onClick={async () => {
                      if (isAddingToCart) return;
                      const isValid = await validateDesign();
                      if (!isValid) return;
                      setIsAddingToCart(true);
                      try {
                        const uploadedBoxTextures = { ...boxTextures };
                        const faces = Object.keys(uploadedBoxTextures);
                        for (let face of faces) {
                          const texture = uploadedBoxTextures[face];
                          if (texture && texture.startsWith("data:image")) {
                            const res = await fetch("/api/upload", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ image: texture })
                            });
                            const data = await res.json();
                            if (data.url) uploadedBoxTextures[face] = data.url;
                          }
                        }
                        const userName = user?.name || user?.username || "Guest";
                        const customizedProduct = {
                          ...product,
                          id: `${product.id}-${Date.now()}`,
                          name: `${userName}_customize ${dimensions.l}x${dimensions.w}x${dimensions.h}`,
                          img: uploadedBoxTextures.front || uploadedBoxTextures.top || Object.values(uploadedBoxTextures).find(t => t) || product.img,
                          price: calculatedUnitPrice,
                          customDesign: {
                            textures: uploadedBoxTextures,
                            colors: boxColors,
                            textureSettings: textureSettings,
                            text: customText,
                            textStyle: boxTextStyle,
                            textColor: boxTextColor,
                            textSettings: boxTextSettings,
                            dimensions: dimensions,
                            unit: unit,
                            selectedGSM: selectedGSM,
                            selectedMaterial: selectedMaterial,
                            selectedFinish: selectedFinish,
                            specData: selectedSpec
                          }
                        };
                        addToCart(customizedProduct, quantity);
                      } finally {
                        setIsAddingToCart(false);
                      }
                    }}
                    className="w-full py-5 bg-gray-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all shadow-xl active:scale-95 group disabled:opacity-50"
                  >
                    {isAddingToCart ? <RotateCw size={16} className="animate-spin" /> : <ShoppingCart size={16} className="group-hover:scale-110 transition-transform" />}
                    {isAddingToCart ? "Deploying..." : "Add_to_Basket"}
                  </button>
                )}
              </div>
            </div>
          </div>
          <AnimatePresence>
            {shareToast && (
              <motion.div
                initial={{ opacity: 0, y: -20, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: -20, x: "-50%" }}
                className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] bg-gray-950 text-white px-6 py-4 rounded-2xl shadow-2xl flex flex-col gap-3 border border-white/10 min-w-[300px]"
              >
                <div className="flex items-center gap-3">
                  <Link2 size={16} className="text-emerald-400" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">Design Share Link</p>
                    <p className="text-[10px] font-bold text-gray-400 truncate max-w-[200px] sm:max-w-xs">{shareLink}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    showToast("Link copied to clipboard!", "success");
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Copy size={12} /> Copy Link
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Crop Modal Overlay */}
          <AnimatePresence>
            {showCropModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10000] bg-gray-950/80 backdrop-blur-md flex items-center justify-center p-6"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col"
                >
                  <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-gray-950 uppercase tracking-tighter">Perfect_Crop</h2>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Adjust mapping for structural fit</p>
                    </div>
                    <button onClick={() => setShowCropModal(false)} className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="relative h-[50vh] bg-gray-950">
                    <Cropper
                      image={imageToCrop}
                      crop={crop}
                      zoom={zoom}
                      rotation={cropRotation}
                      aspect={1}
                      onCropChange={setCrop}
                      onRotationChange={setCropRotation}
                      onCropComplete={handleCropComplete}
                      onZoomChange={setZoom}
                    />
                  </div>

                  <div className="p-8 bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Zoom_Precision</p>
                          <span className="text-sm font-black text-gray-950">{Math.round(zoom * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          value={zoom}
                          min={1}
                          max={3}
                          step={0.1}
                          onChange={(e) => setZoom(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Angle_Rotation</p>
                          <span className="text-sm font-black text-gray-950">{Math.round(cropRotation)}°</span>
                        </div>
                        <input
                          type="range"
                          value={cropRotation}
                          min={-180}
                          max={180}
                          step={1}
                          onChange={(e) => setCropRotation(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col justify-end space-y-3">
                      <button
                        onClick={finalizeCrop}
                        className="w-full py-6 bg-gray-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-emerald-500 transition-all shadow-xl active:scale-95"
                      >
                        Apply_Neural_Mapping
                      </button>
                      <button
                        onClick={() => {
                          setShowCropModal(false);
                          setImageToCrop(null);
                        }}
                        className="w-full py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-950 transition-colors"
                      >
                        Skip & Use Original
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Price Tag removed in favor of Small Card in flow */}

      {/* Mobile Experience Warning */}
      <AnimatePresence>
        {showMobileWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md p-8 sm:p-10 shadow-2xl border border-white/20 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10" />

              <div className="flex justify-center mb-8">
                <div className="relative">
                  <Monitor className="w-16 h-16 text-emerald-500" />
                  <Smartphone className="w-8 h-8 text-emerald-200 absolute -bottom-1 -right-2 bg-white rounded-lg p-1 border border-emerald-50" />
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-gray-950 uppercase tracking-widest leading-tight mb-4">
                Upgrade Your <br />Design Canvas
              </h3>

              <p className="text-gray-500 text-xs sm:text-sm font-medium leading-relaxed mb-8">
                The 3D Customize Lab is a high-precision spatial tool. For the absolute best creative experience, we recommend using a <span className="text-emerald-600 font-black">Laptop or Tablet</span>.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => setShowMobileWarning(false)}
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition-all active:scale-95"
                >
                  Continue to Lab
                </button>
                <button
                  onClick={() => router.push('/shop')}
                  className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-gray-950 hover:text-white transition-all"
                >
                  Return to Shop
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPremiumModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md p-8 sm:p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 blur-[80px] -z-10 rounded-full" />
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-2">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-2xl font-black text-gray-950 uppercase tracking-widest leading-tight">Upgrade to Neural Pro</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  You've reached your free limit of 5 AI generations for today.
                  Unlock unlimited designs for just <span className="text-emerald-500 font-black text-base">₹59 / week</span>.
                </p>
                <div className="w-full space-y-3 mt-6">
                  <button
                    onClick={() => {
                      showToast("Routing to payment gateway to subscribe for ₹59/week.", "info");
                      setShowPremiumModal(false);
                    }}
                    className="w-full py-4 bg-gray-950 text-white rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-emerald-500 transition-all active:scale-95"
                  >
                    Unlock Unlimited - ₹59
                  </button>
                  <button
                    onClick={() => setShowPremiumModal(false)}
                    className="w-full py-3 bg-gray-50 text-gray-400 rounded-xl font-black uppercase text-[10px] tracking-widest hover:text-gray-950 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes loadbar {
          0% {
            width: 0%;
          }
          40% {
            width: 55%;
          }
          70% {
            width: 80%;
          }
          100% {
            width: 100%;
          }
        }
        @keyframes fadecycle {
          0%,
          100% {
            opacity: 0;
            transform: translateY(4px);
          }
          30%,
          70% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </motion.div>
  );
}

// Reusable loading UI
const MainLoadingScreen = ({ label = "Initializing Studio…" }) => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center overflow-hidden relative">
    {/* Subtle grid */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(16,185,129,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
    {/* Soft glow */}
    <div className="absolute w-80 h-80 rounded-full bg-emerald-100 blur-3xl animate-pulse" />

    {/* Rings + logo */}
    <div className="relative flex items-center justify-center mb-10">
      <div
        className="absolute w-52 h-52 rounded-full border border-emerald-200 animate-spin"
        style={{ animationDuration: "8s" }}
      />
      <div
        className="absolute w-40 h-40 rounded-full border border-emerald-300 animate-spin"
        style={{ animationDuration: "5s", animationDirection: "reverse" }}
      />
      <div
        className="absolute w-28 h-28 rounded-full border-2 border-emerald-400 animate-spin"
        style={{ animationDuration: "3s" }}
      />
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-emerald-500"
          style={{
            transform: `rotate(${deg}deg) translateX(84px)`,
            animationDelay: `${i * 0.15}s`,
            opacity: 0.4 + i * 0.1,
          }}
        />
      ))}
      <div className="relative z-10 w-24 h-24 rounded-2xl bg-white border border-emerald-100 shadow-xl flex items-center justify-center">
        <img
          src="/BOXFOX-1.png"
          alt="BOXFOX"
          className="w-16 object-contain"
        />
      </div>
    </div>

    {/* Brand label */}
    <div className="flex items-center gap-3 mb-1.5">
      <div className="w-8 h-px bg-emerald-400" />
      <p className="text-gray-950 font-black tracking-[0.6em] text-xs uppercase">
        BoxFox
      </p>
      <div className="w-8 h-px bg-emerald-400" />
    </div>
    <p className="text-emerald-500 text-[9px] font-bold tracking-[0.4em] uppercase mb-10">
      Design Studio
    </p>

    {/* Progress bar */}
    <div className="w-64 h-0.5 bg-gray-100 rounded-full overflow-hidden mb-5">
      <div
        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
        style={{ animation: "loadbar 2.2s ease-in-out forwards" }}
      />
    </div>

    {/* Cycling steps */}
    <div className="flex flex-col items-center gap-1.5">
      {["Initializing Studio…", "Loading Assets…", "Calibrating Forge…"].map(
        (step, i) => (
          <p
            key={step}
            className="text-gray-400 text-[9px] font-bold tracking-[0.3em] uppercase"
            style={{
              animation: `fadecycle 2.4s ease-in-out ${i * 0.7}s infinite`,
            }}
          >
            {step}
          </p>
        ),
      ) || null}
    </div>
  </div>
);

export default function StandaloneCustomizePage() {
  return (
    <Suspense fallback={<MainLoadingScreen />}>
      <CustomizeLabContent />
    </Suspense>
  );
}

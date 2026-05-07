"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronRight,
  ArrowRight,
  Box,
  Heart,
  Minus,
  Plus,
  Sparkles,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import AnnouncementBar from "./AnnouncementBar";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { cart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, cartTotal } = useCart();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // High-performance live search with debouncing for 10k+ scalability
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchTerm)}&limit=6`);
        const data = await res.json();
        // Since API returns sections, flatten items for the live dropdown
        const items = Array.isArray(data) ? data.flatMap(s => s.items || []) : [];
        setSearchResults(items);
      } catch (e) {
        console.error("Nav Search Error:", e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Corporate Gifts", href: "/gifts" },
    { label: "B2B", href: "/b2b", isB2B: true },
    { label: "AI Customization", href: "/customize", isAI: true },
    { label: "Quality", href: "/quality" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      {/* ─── Navbar ──────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-500 ${isScrolled ? "bg-white/95 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)]" : ""}`} suppressHydrationWarning>
        <AnimatePresence>
          {!isScrolled && (
            <motion.div
              initial={{ height: "auto", opacity: 1 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <AnnouncementBar />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating pill wrapper */}
        <div className={`mx-auto transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isScrolled
          ? "w-[96%] sm:w-[94%] xl:max-w-[1300px] mt-2 mb-2 bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-2xl rounded-[2rem] py-1 px-4 lg:px-10"
          : "w-full bg-white border-b border-gray-100 py-0 px-4 sm:px-8 lg:px-14 shadow-none"
          }`}>
          <div className="flex items-center justify-between h-10 sm:h-12">

            {/* ── Logo — always left ── */}
            <Link href="/" className="shrink-0 flex items-center">
              <img
                src="/BOXFOX-1.png"
                alt="BOXFOX Logo"
                className={`transition-all duration-500 object-contain ${isScrolled ? "h-3 sm:h-4" : "h-3.5 sm:h-5"}`}
              />
            </Link>

            {/* ── Nav Links — centered (desktop only) ── */}
            <div className="hidden lg:flex items-center gap-0 xl:gap-0.5 absolute left-1/2 -translate-x-1/2 w-max max-w-[50%] xl:max-w-none px-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const isAI = link.isAI;
                const isB2B = link.isB2B;

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`relative px-2 xl:px-4 py-2 text-[9.5px] xl:text-[11px] font-black uppercase tracking-[0.16em] transition-all duration-300 group active:scale-95 rounded-xl flex items-center gap-1.5 ${isActive
                      ? "text-emerald-600"
                      : isAI
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/30 hover:-translate-y-0.5 ml-1 xl:ml-2"
                        : isB2B
                          ? "bg-gray-950 text-white shadow-lg shadow-gray-900/5 hover:bg-emerald-600 hover:shadow-emerald-500/20 hover:-translate-y-0.5 ml-1"
                          : "text-gray-400 hover:text-gray-950"
                      }`}
                  >
                    {isAI && <Sparkles size={11} className="animate-pulse" />}
                    {isB2B && <Briefcase size={10} />}
                    <span className="relative z-10">{link.label}</span>

                    {!isAI && !isB2B && (
                      <div className="absolute inset-0 bg-transparent group-hover:bg-gray-900/[0.04] rounded-lg transition-all duration-200" />
                    )}

                    {isActive && !isAI && !isB2B && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 bg-emerald-500/5 rounded-lg z-0"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-0.5 sm:gap-1.5">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search"
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 active:scale-90 transition-all text-gray-600 hover:text-gray-900 duration-200"
              >
                <Search size={14} />
              </button>

              {/* Login / Account */}
              <div className="relative group flex items-center">
                <Link
                  href={user ? "/account" : `/login?redirect=${encodeURIComponent(pathname)}`}
                  className={`flex items-center gap-2 px-3 sm:px-4 h-8 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${user
                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200/60"
                    : "bg-gray-950 text-white hover:bg-emerald-600 shadow-lg shadow-gray-200/80"
                    }`}
                >
                  <User size={14} />
                  <span className="inline">{user ? "Account" : "Login"}</span>
                </Link>

                {user && (
                  <div className="absolute right-0 top-full mt-2.5 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[200]">
                    <Link href="/account" className="block px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-emerald-600 hover:bg-gray-50 transition-colors rounded-xl mx-1">
                      My Dashboard
                    </Link>
                    <Link href="/account?tab=wishlist" className="block px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-emerald-600 hover:bg-gray-50 transition-colors rounded-xl mx-1">
                      My Wishlist
                    </Link>
                    <div className="h-px bg-gray-100 mx-4 my-1" />
                    <button
                      onClick={logout}
                      className="w-full text-left px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-xl mx-0"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                aria-label="Open Shopping Cart"
                className="relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 active:scale-90 transition-all text-gray-600 hover:text-gray-900 duration-200"
              >
                <ShoppingCart size={15} />
                {cart.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-white text-[7px] font-black rounded-full h-3.5 w-3.5 flex items-center justify-center ring-1 ring-white">
                    {cart.length}
                  </span>
                )}
              </button>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "Close Menu" : "Open Menu"}
                className="lg:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 active:scale-90 transition-all text-gray-700 duration-200"
              >
                {menuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Global Search Overlay ── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-[300]"
            >
              <div className="relative">
                <div className="bg-white border border-gray-100 rounded-3xl sm:rounded-[2rem] p-3 sm:p-4 shadow-2xl flex items-center gap-3 sm:gap-4">
                  <Search className={`${isSearching ? "text-emerald-500 animate-pulse" : "text-gray-400"} ml-2 sm:ml-4`} size={18} />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search designs, SKUs, or boxes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent w-full text-[11px] sm:text-sm font-bold text-gray-950 outline-none placeholder:text-gray-300 uppercase tracking-widest"
                  />
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchTerm("");
                    }}
                    className="p-2 hover:bg-gray-50 rounded-full transition-all"
                  >
                    <X size={16} className="text-gray-400" />
                  </button>
                </div>

                {/* Search Results Dropdown (Large Scale Ready) */}
                <AnimatePresence>
                  {(searchResults.length > 0 || isSearching) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.12)] overflow-hidden p-2 z-[301]"
                    >
                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {isSearching && searchResults.length === 0 ? (
                          <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-300">
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                              <Search size={24} />
                            </motion.div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Searching Database...</span>
                          </div>
                        ) : (
                          searchResults.map((item) => (
                            <Link
                              key={item.id}
                              href={`/products/${item.id}`}
                              onClick={() => {
                                setSearchOpen(false);
                                setSearchTerm("");
                              }}
                              className="flex items-center gap-4 p-3 hover:bg-emerald-50 rounded-2xl transition-all group"
                            >
                              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[11px] font-black text-gray-950 uppercase tracking-tight truncate">{(item.name || '').replace(/\s+[A-Z][A-Z\s]*BOX\s*$/i, '').replace(/_[A-Z][A-Z\s]*BOX\s*$/i, '') || item.name}</h4>
                                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{item.price}</p>
                              </div>
                              <ArrowRight size={14} className="text-gray-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                            </Link>
                          ))
                        )}
                        {searchResults.length === 0 && !isSearching && (
                          <div className="py-12 text-center text-gray-400">
                            <p className="text-[10px] font-black uppercase tracking-widest">No models match your search</p>
                          </div>
                        )}
                        {searchResults.length > 0 && (
                          <Link
                            href={`/shop?search=${encodeURIComponent(searchTerm)}`}
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchTerm("");
                            }}
                            className="block p-4 text-center border-t border-gray-50 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 hover:bg-emerald-50 transition-all"
                          >
                            View All Search results
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>


      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-gray-950/20 backdrop-blur-sm z-[150] lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-[280px] sm:w-[340px] md:w-[400px] h-full bg-white z-[160] lg:hidden p-6 sm:p-10 md:p-12 shadow-2xl flex flex-col justify-between pt-24 sm:pt-32"
            >
              <button
                onClick={() => setMenuOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-50 transition-colors"
                aria-label="Close Menu"
              >
                <X size={24} className="text-gray-950" />
              </button>

              <div className="flex flex-col h-full">
                {/* Account Section at Top */}
                <div className="pb-8 mb-4 border-b border-gray-50">
                  {user ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-extrabold text-lg border border-emerald-100">
                          {user.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase tracking-widest text-gray-950">{user.name}</span>
                          <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-[0.2em]">{user.role}_Profile</span>
                        </div>
                      </div>
                      <Link
                        href="/account"
                        onClick={() => setMenuOpen(false)}
                        className="p-3 bg-gray-50 rounded-xl text-gray-950 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                      >
                        <User size={20} />
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href={`/login?redirect=${encodeURIComponent(pathname)}`}
                      className="flex items-center justify-center gap-4 py-4 bg-gray-950 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-gray-200"
                      onClick={() => setMenuOpen(false)}
                    >
                      <User size={16} /> Login / Sign Up
                    </Link>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:gap-4 flex-1">
                  {navLinks.map((link, idx) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        className={`text-lg sm:text-xl font-black uppercase tracking-tighter flex items-center justify-between group py-3 px-4 rounded-2xl transition-all ${pathname === link.href
                          ? "text-emerald-500 bg-emerald-50"
                          : link.isAI
                            ? "text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-xl shadow-emerald-500/10"
                            : link.isB2B
                              ? "text-white bg-gray-950 shadow-xl shadow-gray-900/5"
                              : "text-gray-950 hover:bg-gray-50"
                          }`}
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-2">
                            {link.isAI && <Sparkles size={18} className="text-white animate-pulse" />}
                            {link.isB2B && <Briefcase size={16} className="text-white" />}
                            {link.label}
                          </span>
                        </div>
                        <ChevronRight size={20} className={`transition-transform group-hover:translate-x-1 ${pathname === link.href ? "opacity-100" : "opacity-0"}`} />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-8 border-t border-gray-100 space-y-4">
                  {user && (
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/account?tab=wishlist"
                        className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-emerald-600 transition-all group text-center"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Heart size={16} className="group-hover:scale-110 transition-transform" /> Wishlist
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setMenuOpen(false);
                        }}
                        className="flex flex-col items-center gap-2 p-4 bg-red-50/50 rounded-2xl text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-all group text-center"
                      >
                        <ArrowRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> Logout
                      </button>
                    </div>
                  )}

                  <div className="p-4 bg-gray-50/50 rounded-3xl flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Support_Line</p>
                      <a href="mailto:office.ggn@iopl.co" className="text-[10px] font-black text-gray-950 hover:text-emerald-600 transition-colors">office.ggn@iopl.co</a>
                    </div>
                    <Briefcase size={16} className="text-gray-200" />
                  </div>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[200] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-gray-950/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-950 tracking-tighter uppercase">Your Basket</h2>
                  <p className="text-[10px] font-black tracking-[0.1em] text-emerald-500 uppercase">{cart.length} Designs</p>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-3 hover:bg-gray-50 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <Box size={40} className="mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest leading-loose">Basket is empty <br /> Select your packaging</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-6 group items-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                        <img src={item.img} className="w-full h-full object-cover" alt={item.name} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[11px] font-black text-gray-950 uppercase tracking-tight line-clamp-1">{item.name}</h4>
                        <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">QTY: {item.quantity}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center bg-gray-50 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(10, item.quantity - 10))}
                              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-950"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-[10px] font-black text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 10)}
                              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-950"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-[10px] font-black text-gray-300 hover:text-red-500 uppercase">Remove</button>
                        </div>
                        <p className="text-xs font-black text-emerald-600 mt-2">₹{(parseFloat(item.price) * item.quantity).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-8 border-t border-gray-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Grand Total</span>
                    <span className="text-3xl font-black text-gray-950">₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="grid gap-3">
                    <Link
                      href="/cart"
                      onClick={() => setIsCartOpen(false)}
                      className="w-full py-4 bg-gray-50 text-gray-950 rounded-2xl flex items-center justify-center gap-4 font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100"
                    >
                      Review Shopping Cart
                    </Link>
                    <Link
                      href={user ? "/checkout" : `/login?redirect=/checkout`}
                      onClick={() => setIsCartOpen(false)}
                      className="w-full py-5 bg-gray-950 text-white rounded-2xl flex items-center justify-center gap-4 font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-gray-100"
                    >
                      Confirm Order <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

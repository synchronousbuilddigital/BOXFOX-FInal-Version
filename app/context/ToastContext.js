"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-[calc(76px+env(safe-area-inset-bottom,0px))] lg:bottom-8 right-8 z-[1000] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            className="pointer-events-auto"
                        >
                            <div className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] bg-white border shadow-2xl min-w-[320px] max-w-md ${toast.type === 'error' ? 'border-red-100' :
                                toast.type === 'info' ? 'border-blue-100' : 'border-emerald-100'
                                }`}>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${toast.type === 'error' ? 'bg-red-50 text-red-500' :
                                    toast.type === 'info' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'
                                    }`}>
                                    {toast.type === 'error' ? <AlertCircle size={20} /> :
                                        toast.type === 'info' ? <Info size={20} /> : <CheckCircle2 size={20} />}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-[11px] font-black uppercase tracking-widest ${toast.type === 'error' ? 'text-red-500' :
                                        toast.type === 'info' ? 'text-blue-500' : 'text-emerald-600'
                                        }`}>
                                        {toast.type === 'error' ? 'Error_Issue' :
                                            toast.type === 'info' ? 'Notification_Log' : 'Operation_Success'}
                                    </p>
                                    <p className="text-xs font-bold text-gray-950 mt-0.5 leading-relaxed">{toast.message}</p>
                                </div>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="p-1 hover:bg-gray-50 rounded-lg transition-colors text-gray-400 hover:text-gray-950"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);

"use client";
import { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsStandalone(true);
      return;
    }

    // Android/Chrome
    const handler = (e) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isIosDevice && !window.navigator.standalone) {
      setIsIOS(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onClickInstall = async () => {
    if (promptInstall) {
      promptInstall.prompt();
      const { outcome } = await promptInstall.userChoice;
      if (outcome === 'accepted') {
        setSupportsPWA(false);
      }
    }
  };

  const onClickIOSInstall = () => {
    setShowIOSPrompt(true);
  };

  if (isStandalone || dismissed) return null;

  if (!supportsPWA && !isIOS) return null;

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={supportsPWA ? onClickInstall : onClickIOSInstall}
          className="flex items-center gap-2 bg-black text-white px-4 py-3 rounded-full shadow-lg border border-gray-800 hover:bg-gray-900 transition-colors"
        >
          <Download size={20} />
          <span className="font-semibold text-sm">Install App</span>
        </motion.button>
      </div>

      {/* iOS Instructions Modal */}
      <AnimatePresence>
        {showIOSPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center"
            onClick={() => setShowIOSPrompt(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white text-black p-6 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-sm relative"
            >
              <button 
                onClick={() => setShowIOSPrompt(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-xl font-bold mb-2">Install BoxFox App</h3>
              <p className="text-gray-600 text-sm mb-6">
                Install this application on your home screen for quick and easy access when you're on the go.
              </p>
              
              <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded shadow-sm">
                    <Share className="text-blue-500" size={24} />
                  </div>
                  <p className="text-sm font-medium">1. Tap the Share icon at the bottom of Safari.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded shadow-sm">
                    <PlusSquare className="text-black" size={24} />
                  </div>
                  <p className="text-sm font-medium">2. Select <span className="font-bold">Add to Home Screen</span>.</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                   setShowIOSPrompt(false);
                   setDismissed(true);
                }}
                className="mt-6 w-full py-3 text-center text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
              >
                Maybe Later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

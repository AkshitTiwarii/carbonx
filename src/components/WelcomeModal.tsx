"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function WelcomeModal() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("carbonx_welcome_seen");
    if (!seen) setShowModal(true);
  }, []);

  const handleClose = () => {
    localStorage.setItem("carbonx_welcome_seen", "true");
    setShowModal(false);
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl max-w-md text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">Welcome to CarbonX 🌍</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Trade and retire carbon credits with AI and Web3 transparency.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleClose}>Explore Dashboard</Button>
              <Button variant="secondary" onClick={handleClose}>
                Connect Wallet
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

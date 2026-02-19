"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SidebarContent } from "./sidebar-content";
import { Logo } from "@/components/logo";
import { X } from "lucide-react";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  tier?: string;
}

export function MobileDrawer({ open, onClose, tier }: MobileDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-overlay lg:hidden"
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 w-64 bg-surface border-r border-border z-modal flex flex-col lg:hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <Logo size="md" />
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="py-4 flex-1 overflow-y-auto">
              <SidebarContent onNavigate={onClose} tier={tier} />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

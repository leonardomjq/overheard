"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { AlphaCard } from "@/components/alpha-card";
import type { AlphaCard as AlphaCardType } from "@/types";

interface CardGridProps {
  cards: AlphaCardType[];
}

export function CardGrid({ cards }: CardGridProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {cards.map((card) => (
        <motion.div key={card.id} variants={staggerItem}>
          <AlphaCard card={card} />
        </motion.div>
      ))}
    </motion.div>
  );
}

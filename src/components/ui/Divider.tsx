"use client";

import { motion } from "framer-motion";

export default function Divider() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent origin-center"
        />
      </div>
    </div>
  );
}


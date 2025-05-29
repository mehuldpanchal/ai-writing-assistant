import React from "react";
import { motion } from "framer-motion";
import Button from "./Button";

export default function StyleButton({
  style,
  selectedStyle,
  onClick,
  children,
  icon
}) {
  const isSelected = selectedStyle === style;
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="relative"
    >
      <Button
        icon={icon}
        onClick={onClick}
        className={
          "w-full p-4 rounded-xl flex flex-col items-center justify-center " +
          (isSelected
            ? "ring-2 ring-blue-400 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 shadow-lg"
            : "bg-blue-900/60 hover:bg-blue-800 text-blue-100")
        }
      >
        <span className="font-medium text-sm sm:text-base z-10">
          {children}
        </span>
        {isSelected && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-1 text-xs opacity-80 z-10"
          >
            Selected
          </motion.div>
        )}
      </Button>
    </motion.div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      // Show the button after scrolling down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    // Clean up the event listener on component unmount
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    // 在 React 中，当一个组件被移除时，它通常会立即消失。Motion 提供了 AnimatePresence 组件，它可以在元素执行 exit 动画时将其保留在 DOM 中。
    <AnimatePresence initial={false}>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-[#ECEAE8] text-black flex items-center justify-center shadow-lg hover:bg-[#F5F3F1] transition-colors z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5 text-[#363433]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

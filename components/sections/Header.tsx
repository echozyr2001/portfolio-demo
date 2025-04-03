"use client";

import { useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import Link from "next/link";

const Logo = () => (
  <svg
    width="48"
    height="24"
    viewBox="0 0 48 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="12" fill="#2C2A25" />
    <path
      d="M24 0C30.6274 0 36 5.37258 36 12C36 18.6274 30.6274 24 24 24V0Z"
      fill="#2C2A25"
    />
    <path
      d="M36 0C42.6274 0 48 5.37258 48 12C48 18.6274 42.6274 24 36 24V0Z"
      fill="#2C2A25"
    />
  </svg>
);

export function Header() {
  const { scrollY } = useScroll();
  const [isHovered, setIsHovered] = useState<number | null>(null);

  // 使用 useTransform 创建平滑的动画值
  const navWidth = useTransform(scrollY, [0, 700], ["90%", "30%"]);
  const backdropBlur = useTransform(scrollY, [0, 700], [0, 12]);
  const borderOpacity = useTransform(scrollY, [0, 700], [0, 0.15]);
  const bgOpacity = useTransform(scrollY, [0, 700], [0, 0.1]);

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Portfolio", href: "#portfolio" },
    { name: "Exhibitions", href: "#exhibitions" },
    { name: "Contact", href: "#contact" },
  ];

  // 导航项目的动画变体
  const itemVariants = {
    initial: { y: 0, skewY: 0 },
    hover: { y: "-110%", skewY: 6 },
  };

  const secondaryItemVariants = {
    initial: { y: "110%", skewY: 6 },
    hover: { y: 0, skewY: 0 },
  };

  return (
    // 修改 Header 组件，解决元素碰撞问题

    // 将 flex 布局改为更稳定的布局方式，使用绝对定位和固定宽度
    // 将 nav 元素改为 relative 定位，内部元素使用绝对定位

    // 修改 header 类名，移除 bg-white
    <header className="hidden md:flex fixed w-full z-50 justify-center items-center top-3 text-[#2C2A25]">
      {/* 修改 nav 元素的类名和内部结构 */}
      <motion.nav
        style={{
          width: navWidth,
          backdropFilter: `blur(${backdropBlur.get()}px)`,
          borderColor: `rgba(255, 255, 255, ${borderOpacity.get()})`,
          backgroundColor: `rgba(255, 255, 255, ${bgOpacity.get()})`,
        }}
        className="flex items-center px-6 py-1 gap-1 p-0.5 border rounded-full bg-white/10 relative min-w-[600px] max-w-[1400px]"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Logo - 使用绝对定位固定在左侧 */}
        <motion.div
          className="absolute left-6 w-12 h-8 items-center justify-center flex"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Link href="/">
            <Logo />
            {/* IB */}
          </Link>
        </motion.div>

        {/* 导航菜单 - 始终居中，不受左侧元素影响 */}
        <div className="w-full flex justify-center">
          <ul className="flex items-center gap-6 text-sm mx-10">
            {navItems.map((item, index) => (
              <motion.li
                key={index}
                className="group relative"
                onHoverStart={() => setIsHovered(index)}
                onHoverEnd={() => setIsHovered(null)}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link href={item.href} className="px-2 py-1 block relative">
                  <span className="relative inline-flex overflow-hidden">
                    <motion.div
                      className="transform-gpu font-normal"
                      variants={itemVariants}
                      initial="initial"
                      animate={isHovered === index ? "hover" : "initial"}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {item.name}
                    </motion.div>

                    <motion.div
                      className="absolute transform-gpu font-medium"
                      variants={secondaryItemVariants}
                      initial="initial"
                      animate={isHovered === index ? "hover" : "initial"}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {item.name}
                    </motion.div>
                  </span>

                  {/* 添加下划线动画 */}
                  <AnimatePresence>
                    {isHovered === index && (
                      <motion.span
                        className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#A2ABB1] to-[#8A9AA3] rounded-full"
                        initial={{ scaleX: 0, originX: 0 }}
                        animate={{ scaleX: 1 }}
                        exit={{ scaleX: 0, originX: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </AnimatePresence>
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* 右侧区域 - 使用绝对定位固定在右侧 */}
        <motion.div
          className="absolute right-6 w-12 h-8 items-center justify-center flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.div
            className="w-8 h-8 rounded-full bg-[#A2ABB1] flex items-center justify-center"
            whileHover={{ scale: 1.1, backgroundColor: "#8A9AA3" }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <span className="text-white text-xs">SC</span>
          </motion.div>
        </motion.div>
      </motion.nav>
    </header>
  );
}

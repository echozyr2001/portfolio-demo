"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";

export function Header() {
	const { scrollY } = useScroll();
	const [isHovered, setIsHovered] = useState<number | null>(null);
	const [isMounted, setIsMounted] = useState(false);

	// 在客户端挂载后设置isMounted为true，避免SSR水合不匹配
	useEffect(() => {
		setIsMounted(true);
	}, []);

	// 使用 useTransform 创建平滑的动画值
	// 导航宽度
	const navWidth = useTransform(scrollY, [0, 700], ["90%", "30%"]);

	// 背景模糊效果
	const blurValue = useTransform(scrollY, [0, 500], [0, 12]);
	const backdropBlurStyle = useTransform(
		blurValue,
		(blur) => `blur(${blur}px)`,
	);

	// 边框颜色透明度
	const borderOpacity = useTransform(scrollY, [0, 500], [0, 0.15]);
	const borderColorStyle = useTransform(
		borderOpacity,
		(opacity) => `rgba(255, 255, 255, ${opacity})`,
	);

	// 背景颜色透明度
	const backgroundOpacity = useTransform(scrollY, [0, 500], [0, 0.6]);
	const backgroundColorStyle = useTransform(
		backgroundOpacity,
		(opacity) => `rgba(255, 255, 255, ${opacity})`,
	);

	// 阴影效果
	const shadowOpacity = useTransform(scrollY, [0, 100, 500], [0, 0.3, 1]);
	const shadowStyle = useTransform(shadowOpacity, (opacity) => {
		if (opacity <= 0) return "none";
		const baseOpacity = opacity * 0.15;
		const mainShadowOpacity = opacity * 0.08;
		return `0 8px 32px rgba(0, 0, 0, ${mainShadowOpacity}), 0 4px 16px rgba(0, 0, 0, ${baseOpacity}), 0 2px 8px rgba(0, 0, 0, ${
			baseOpacity * 0.8
		})`;
	});

	// 移动端阴影效果
	const mobileShadowOpacity = useTransform(scrollY, [0, 50, 300], [0, 0.2, 1]);
	const mobileShadowStyle = useTransform(mobileShadowOpacity, (opacity) => {
		if (opacity <= 0) return "none";
		const shadowOpacity = opacity * 0.1;
		const baseOpacity = opacity * 0.12;
		return `0 6px 24px rgba(0, 0, 0, ${shadowOpacity}), 0 3px 12px rgba(0, 0, 0, ${baseOpacity}), 0 1px 4px rgba(0, 0, 0, ${
			baseOpacity * 0.8
		})`;
	});

	const navItems = [
		{ name: "Home", href: "#home" },
		{ name: "About", href: "#about" },
		{ name: "Skills", href: "#skills" },
		{ name: "Projects", href: "#projects" },
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
		<>
			{/* 移动端Header */}
			{isMounted && (
				<header className="md:hidden fixed w-full z-50 top-0 text-[#2C2A25]">
					<motion.nav
						className="flex justify-between items-center px-4 py-2 border rounded-b-3xl"
						style={{
							backdropFilter: backdropBlurStyle,
							borderColor: borderColorStyle,
							backgroundColor: backgroundColorStyle,
							boxShadow: mobileShadowStyle,
						}}
					>
						<Logo />
						<Drawer>
							<DrawerTrigger className="p-2 rounded-full transition-colors">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="currentColor"
									className="!size-6"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M3.75 9h16.5m-16.5 6.75h16.5"
									></path>
								</svg>
							</DrawerTrigger>
							<DrawerContent className="px-4">
								<DrawerHeader>
									<DrawerTitle className="sr-only"></DrawerTitle>
								</DrawerHeader>
								<nav className="flex-1 mb-12">
									<ul className="space-y-2">
										{navItems.map((item, index) => (
											<li key={index}>
												<Link
													href={item.href}
													className="block px-4 py-2 text-lg text-[#2C2A25] hover:bg-gray-100 rounded-lg transition-colors"
													onClick={() =>
														document.dispatchEvent(
															new KeyboardEvent("keydown", { key: "Escape" }),
														)
													}
												>
													{item.name}
												</Link>
											</li>
										))}
									</ul>
								</nav>
							</DrawerContent>
						</Drawer>
					</motion.nav>
				</header>
			)}

			{/* 桌面端Header */}
			<header className="hidden md:flex fixed w-full z-50 justify-center items-center top-3 text-[#2C2A25]">
				{/* 修改 nav 元素的类名和内部结构 */}
				<motion.nav
					style={{
						width: navWidth,
						backdropFilter: backdropBlurStyle,
						borderColor: borderColorStyle,
						backgroundColor: backgroundColorStyle,
						boxShadow: shadowStyle,
					}}
					className="flex items-center px-6 py-1 gap-1 p-0.5 border rounded-full bg-white/10 relative min-w-[600px] max-w-[1400px]"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.4, ease: "easeOut" }}
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
												transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
											>
												{item.name}
											</motion.div>

											<motion.div
												className="absolute transform-gpu font-medium"
												variants={secondaryItemVariants}
												initial="initial"
												animate={isHovered === index ? "hover" : "initial"}
												transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
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

					{/* 右侧区域 - 使用绝对定位固定在右侧
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="16" height="16" rx="3" fill="white" />
              </svg>
            </motion.div>
          </motion.div> */}
				</motion.nav>
			</header>
		</>
	);
}

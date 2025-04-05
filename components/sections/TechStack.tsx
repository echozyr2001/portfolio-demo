import Image from "next/image";
import { Fragment } from "react";

// Color constants to match the example page
const COLORS = {
  background: "#D9D5D2",
  text: "#2C2A25",
  accent: "#A2ABB1",
  dark: "#333333",
  light: "#ECEAE8",
};

import TypeScriptIcon from "@/assets/icons/logos-typescript.svg";
import ReactIcon from "@/assets/icons/logos-react.svg";
import NextjsIcon from "@/assets/icons/logos-nextjs.svg";
import JavaScriptIcon from "@/assets/icons/logos-javascript.svg";
import TailwindIcon from "@/assets/icons/logos-tailwindcss.svg";
import PostgresqlIcon from "@/assets/icons/logos-postgresql.svg";
import MongodbIcon from "@/assets/icons/logos-mongodb.svg";
import DockerIcon from "@/assets/icons/logos-docker.svg";
import GitIcon from "@/assets/icons/logos-git.svg";
import RustIcon from "@/assets/icons/logos-rust.svg";
import GoIcon from "@/assets/icons/logos-go.svg";

const techStack = [
  { name: "Rust", icon: RustIcon },
  { name: "Go", icon: GoIcon },
  { name: "Next.js", icon: NextjsIcon },
  { name: "React.js", icon: ReactIcon },
  { name: "TypeScript", icon: TypeScriptIcon },
  { name: "JavaScript", icon: JavaScriptIcon },
  { name: "Tailwind CSS", icon: TailwindIcon },
  { name: "PostgreSQL", icon: PostgresqlIcon },
  { name: "MongoDB", icon: MongodbIcon },
  { name: "Docker", icon: DockerIcon },
  { name: "Git", icon: GitIcon },
];

export function TechStack() {
  return (
    <div className="py-16 lg:py-24">
      <div className="overflow-x-clip border-y border-[#A2ABB1]/30 relative">
        {/* 
          flex-none prevents the element from growing or shrinking,
          keeping its original size for the animation to work properly
        */}
        {/*
          在 flex 容器里，如果没有加 flex-none，子元素默认是 flex: 1 1 auto，也就是说：
            可以被压缩（shrink）；
            可以被拉伸（grow）；
          如果不加 flex-none 会怎样？
            内容宽度可能被父容器压缩（比如视口比较小）；
            动画运行时，translateX 移动的距离和内容宽度不匹配 → 出现跳动、断层；
            尤其是使用了 translateX(-50%) 时，只有内容宽度精确为两倍视口宽度时，动画才是循环无缝的。
          flex-none = "别让我自己伸缩，我要保持原始宽度"，这是保证滚动动画稳定运行的"关键配置"之一。
        */}
        {/* Add gradient overlays for smoother fade effect */}
        <div className="absolute inset-y-0 left-0 w-[100px] bg-gradient-to-r from-[#FBF9F9] to-transparent z-10"></div>
        <div className="absolute inset-y-0 right-0 w-[100px] bg-gradient-to-l from-[#FBF9F9] to-transparent z-10"></div>

        <div className="flex [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex flex-none gap-4 pr-4 py-6 animate-move-left [animation-duration:30s] hover:[animation-play-state:paused] hover:cursor-pointer">
            {[...new Array(2)].fill(0).map((_, index) => (
              <Fragment key={index}>
                {techStack.map((tech, index) => {
                  return (
                    <div
                      key={index}
                      className="inline-flex gap-2 items-center bg-[#A2ABB1]/10 rounded-full px-4 py-2 border border-[#A2ABB1]/20 transition-all duration-300 hover:bg-[#A2ABB1]/30 hover:scale-105 hover:shadow-md hover:border-[#A2ABB1]/40"
                    >
                      <Image
                        src={tech.icon}
                        alt={tech.name}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                      <span className="text-[#2C2A25] uppercase font-extrabold text-sm">
                        {tech.name}
                      </span>
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";
import grainImage from "@/assets/images/grain.svg";

export function Card({
  className,
  children,
  ...other
}: ComponentPropsWithoutRef<"div">) {
  return (
    // after 来表示背后的内容，可以用来实现一些特殊的效果，这里用来制作 outline
    // 设置 after:pointer-events-none 防止点击事件被阻挡
    <div
      className={cn(
        "bg-gray-800 rounded-3xl relative z-0 overflow-hidden after:z-10 after:content-[''] after:absolute after:inset-0 after:outline-2 after:-outline-offset-2 after:rounded-3xl after:outline-white/20 after:pointer-events-none p-6",
        className
      )}
      {...other}
    >
      <div
        className="absolute inset-0 -z-10 opacity-5"
        style={{ backgroundImage: `url(${grainImage.src})` }}
      />
      {children}
    </div>
  );
}

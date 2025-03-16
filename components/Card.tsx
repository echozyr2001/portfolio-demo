import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";
import grainImage from "@/assets/images/grain.svg";

export function Card({
  className,
  children,
  ...other
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={
        (cn("bg-gray-800 rounded-3xl relative z-0 overflow-hidden"), className)
      }
      {...other}
    >
      <div
        className="absolute inset-0 -z-10 opacity-5"
        style={{ backgroundImage: `url(${grainImage.src})` }}
      ></div>
      {children}
    </div>
  );
}

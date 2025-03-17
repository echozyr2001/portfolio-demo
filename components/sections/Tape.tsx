import { Sparkle } from "lucide-react";
import { Fragment } from "react";

const words = [
  "Performant",
  "Accessible",
  "Secure",
  "Interactive",
  "Scalable",
  "User Friendly",
  "Responsive",
  "Maintainable",
  "Search Optimized",
  "Usable",
  "Reliable",
];

export function Tape() {
  return (
    <div className="py-16 lg:py-24 overflow-x-clip ">
      <div className="bg-gradient-to-r from-emerald-300 to-sky-400 overflow-x-clip -rotate-3 -mx-1">
        {/* 这里 flex 与 flex-none 的使用没有搞明白 */}
        <div className="flex [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex flex-none gap-4 pr-4 py-3 animate-move-left [animation-duration:30s]">
            {[...new Array(2)].fill(0).map((_, i) => (
              <Fragment key={i}>
                {words.map((word) => {
                  return (
                    <div key={word} className="inline-flex gap-4 items-center">
                      <span className="text-gray-900 uppercase font-extrabold text-sm">
                        {word}
                      </span>
                      <Sparkle className="size-6 text-gray-900 -rotate-20" />
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

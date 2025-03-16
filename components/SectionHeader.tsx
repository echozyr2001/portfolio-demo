export function SectionHeader({
  title,
  eyebrow,
  description,
}: {
  title: string;
  eyebrow: string;
  description: string;
}) {
  return (
    <>
      {/* 渐变文字，外层使用 div
        包裹，目的是让渐变能从文字的开头到结尾，而不是容器的开头到结尾 */}
      <div className="flex justify-center">
        <p className="uppercase font-semibold tracking-widest bg-gradient-to-r from-emerald-300 to-sky-400 text-center text-transparent bg-clip-text">
          {eyebrow}
        </p>
      </div>
      <h2 className="font-serif text-3xl md:text-5xl text-center mt-6">
        {title}
      </h2>
      <p className="text-center text-white/60 mt-4 md:text-lg lg:text-xl max-w-md mx-auto">
        {description}
      </p>
    </>
  );
}

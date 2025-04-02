import ReactLenis from "lenis/react";

export default function ExampleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactLenis root>
      <div>{children}</div>
    </ReactLenis>
  );
}

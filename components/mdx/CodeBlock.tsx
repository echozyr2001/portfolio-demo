import React from "react";
import { Card } from "@/components/ui/card";

export interface CodeBlockProps {
  children: React.ReactNode;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  language = "javascript",
  title,
  showLineNumbers = false,
  className = "",
}) => {
  return (
    <Card className={`my-4 overflow-hidden ${className}`}>
      {title && (
        <div className="bg-muted px-4 py-2 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{title}</span>
            {language && (
              <span className="text-xs text-muted-foreground uppercase">
                {language}
              </span>
            )}
          </div>
        </div>
      )}
      <div className="relative">
        <pre
          className={`p-4 overflow-x-auto text-sm ${showLineNumbers ? "pl-12" : ""}`}
        >
          <code className={`language-${language}`}>{children}</code>
        </pre>
        {showLineNumbers && (
          <div className="absolute left-0 top-0 p-4 text-xs text-muted-foreground select-none">
            {String(children)
              .split("\n")
              .map((_, i) => (
                <div key={i} className="leading-5">
                  {i + 1}
                </div>
              ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default CodeBlock;

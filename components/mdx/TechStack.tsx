import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface TechStackProps {
  technologies: string[];
  title?: string;
  variant?: "badges" | "list" | "grid";
  className?: string;
}

export const TechStack: React.FC<TechStackProps> = ({
  technologies,
  title = "Tech Stack",
  variant = "badges",
  className = "",
}) => {
  const renderTechnologies = () => {
    switch (variant) {
      case "list":
        return (
          <ul className="space-y-2">
            {technologies.map((tech) => (
              <li key={tech} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>{tech}</span>
              </li>
            ))}
          </ul>
        );

      case "grid":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {technologies.map((tech) => (
              <div
                key={tech}
                className="p-3 bg-muted rounded-lg text-center text-sm font-medium"
              >
                {tech}
              </div>
            ))}
          </div>
        );

      case "badges":
      default:
        return (
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        );
    }
  };

  if (variant === "badges" && !title) {
    return <div className={`my-4 ${className}`}>{renderTechnologies()}</div>;
  }

  return (
    <Card className={`my-6 ${className}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{renderTechnologies()}</CardContent>
    </Card>
  );
};

export default TechStack;

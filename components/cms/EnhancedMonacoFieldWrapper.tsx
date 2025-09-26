"use client";

import React from "react";
import { useField } from "@payloadcms/ui";
import { MonacoMDXEditor } from "./MonacoMDXEditor";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EnhancedMonacoFieldWrapperProps {
  value?: string;
  onChange?: (value: string) => void;
  path?: string;
  field?: any;
  [key: string]: any;
}

export const EnhancedMonacoFieldWrapper: React.FC<
  EnhancedMonacoFieldWrapperProps
> = (props) => {
  const { path, field } = props;

  const { value, setValue } = useField({ path });

  const stringValue = typeof value === "string" ? value : "";

  const handleChange = React.useCallback(
    (newValue: string) => {
      setValue(newValue);
      if (typeof props.onChange === "function") {
        props.onChange(newValue);
      }
    },
    [setValue, props.onChange]
  );

  const wordCount = React.useMemo(() => {
    return stringValue.split(/\s+/).filter(Boolean).length;
  }, [stringValue]);

  const lineCount = React.useMemo(() => {
    return stringValue.split("\n").length;
  }, [stringValue]);

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg font-semibold">
              ✨ MDX Editor
            </CardTitle>
            <Badge variant="secondary">Professional</Badge>
            <Badge variant="secondary">MDX Ready</Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {field?.label || field?.name || "Content"}
            {field?.required && <span className="ml-1 text-red-500">*</span>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <MonacoMDXEditor
          value={stringValue}
          onChange={handleChange}
          height="500px"
          showToolbar={true}
          theme="dark"
          showMinimap={true}
          readOnly={field?.admin?.readOnly || false}
        />
      </CardContent>

      <CardFooter className="flex-wrap items-center gap-x-4 gap-y-2 border-t bg-muted/40 py-2 text-sm text-muted-foreground">
        <Badge variant="outline">Lines: {lineCount}</Badge>
        <Badge variant="outline">Words: {wordCount}</Badge>
        <Badge variant="outline">Characters: {stringValue.length}</Badge>
      </CardFooter>
    </Card>
  );
};

export default EnhancedMonacoFieldWrapper;
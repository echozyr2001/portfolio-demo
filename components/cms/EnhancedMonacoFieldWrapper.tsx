"use client";

import React from "react";
import { useField } from "@payloadcms/ui";
import { MonacoMDXEditor } from "./MonacoMDXEditor";

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

  // Use Payload's useField hook to manage field state
  const { value, setValue } = useField({ path });

  // Convert value to string and handle undefined
  const stringValue = typeof value === "string" ? value : "";

  const handleChange = React.useCallback(
    (newValue: string) => {
      // Use Payload's setValue to update the field
      setValue(newValue);

      // Also try the onChange callback as fallback
      if (typeof props.onChange === "function") {
        props.onChange(newValue);
      }
    },
    [setValue, path, props.onChange]
  );

  return (
    <div style={{ width: "100%" }}>
      {/* Beautiful header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "20px",
          marginBottom: "0px",
          background:
            "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%)",
          borderRadius: "12px 12px 0 0",
          border: "2px solid #10b981",
          borderBottom: "1px solid rgba(16, 185, 129, 0.3)",
          boxShadow: "0 2px 8px rgba(16, 185, 129, 0.1)",
        }}
      >
        <div
          style={{
            width: "10px",
            height: "10px",
            backgroundColor: "#10b981",
            borderRadius: "50%",
            boxShadow: "0 0 8px rgba(16, 185, 129, 0.4)",
          }}
        />
        <h3
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            background: "linear-gradient(135deg, #059669, #10b981)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            margin: 0,
            letterSpacing: "0.5px",
          }}
        >
          ✨ Enhanced Monaco Editor
        </h3>
        <span
          style={{
            padding: "6px 12px",
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            color: "#059669",
            fontSize: "12px",
            fontWeight: "600",
            borderRadius: "16px",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            boxShadow: "0 2px 4px rgba(16, 185, 129, 0.1)",
          }}
        >
          Professional
        </span>
        <span
          style={{
            padding: "6px 12px",
            backgroundColor: "rgba(59, 130, 246, 0.15)",
            color: "#1d4ed8",
            fontSize: "12px",
            fontWeight: "600",
            borderRadius: "16px",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            boxShadow: "0 2px 4px rgba(59, 130, 246, 0.1)",
          }}
        >
          MDX Ready
        </span>
      </div>

      {/* Monaco Editor */}
      <div
        style={{
          border: "2px solid #10b981",
          borderTop: "none",
          borderRadius: "0 0 12px 12px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.1)",
        }}
      >
        <MonacoMDXEditor
          value={stringValue}
          onChange={handleChange}
          height="500px"
          showToolbar={true}
          theme="dark"
          showMinimap={true}
          readOnly={field?.admin?.readOnly || false}
        />
      </div>

      {/* Footer stats */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "12px",
          padding: "16px 20px",
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          borderRadius: "12px",
          fontSize: "13px",
          color: "#475569",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 8px",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderRadius: "6px",
              fontWeight: "500",
            }}
          >
            📊 Lines: {stringValue.split("\n").length}
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 8px",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              borderRadius: "6px",
              fontWeight: "500",
            }}
          >
            🔤 Characters: {stringValue.length}
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 8px",
              backgroundColor: "rgba(168, 85, 247, 0.1)",
              borderRadius: "6px",
              fontWeight: "500",
            }}
          >
            📝 Words:{" "}
            {
              stringValue.split(/\s+/).filter((word: string) => word.length > 0)
                .length
            }
          </span>
        </div>
        <span
          style={{
            fontWeight: "600",
            color: "#374151",
            padding: "4px 8px",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            borderRadius: "6px",
          }}
        >
          {field?.required && <span style={{ color: "#ef4444" }}>* </span>}
          {field?.label || field?.name || "Content"}
        </span>
      </div>
    </div>
  );
};

export default EnhancedMonacoFieldWrapper;

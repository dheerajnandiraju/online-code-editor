import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

export default function EditorArea({
  activePath,
  workspace,
  updateFile,
  disabled
}) {

  const [value, setValue] = useState("");

  function getFileByPath(tree, path) {
    const parts = path.split("/");
    let current = tree;

    for (let part of parts) {
      const next = current.find(item => item.name === part);
      if (!next) return null;
      current = next.children || next;
    }

    return current;
  }

  useEffect(() => {
    if (!activePath) return;

    const file = getFileByPath(workspace, activePath);
    setValue(file?.content || "");

  }, [activePath, workspace]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>

      {/* ===== VIEW MODE BANNER ===== */}
      {disabled && (
        <div
          style={{
            background: "#252526",
            padding: "6px 12px",
            fontSize: "13px",
            color: "#00ffcc",
            borderBottom: "1px solid #333"
          }}
        >
          👁 View Mode — Press Start to edit
        </div>
      )}

      {/* ===== MONACO EDITOR ===== */}
      <Editor
        height="100%"
        theme="vs-dark"
        language="javascript"
        value={value}
        onChange={(val) => {
          if (!disabled) {
            updateFile(activePath, val || "");
          }
        }}
        options={{
          readOnly: disabled,        // ✅ blocks editing
          domReadOnly: disabled,     // ✅ blocks keyboard input
          minimap: { enabled: false },
          fontSize: 14,
          smoothScrolling: true,
          scrollBeyondLastLine: false,
          cursorBlinking: disabled ? "solid" : "blink"
        }}
      />

    </div>
  );
}

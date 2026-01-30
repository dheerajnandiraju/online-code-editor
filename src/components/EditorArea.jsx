import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

export default function EditorArea({ activePath, workspace, updateFile }) {

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
    <Editor
      height="100%"
      theme="vs-dark"
      language="javascript"
      value={value}
      onChange={(val) => updateFile(activePath, val || "")}
    />
  );
}

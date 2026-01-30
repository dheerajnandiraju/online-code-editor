import React, { useState } from "react";

export default function FileExplorer({
  workspace,
  onSelect,
  onCreate,
  onRename,
  onDelete
}) {

  const [expanded, setExpanded] = useState({});
  const [renamingPath, setRenamingPath] = useState(null);
  const [tempName, setTempName] = useState("");

  function toggleFolder(path) {
    setExpanded(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  }

  function startRename(path, oldName) {
    setRenamingPath(path);
    setTempName(oldName);
  }

  function commitRename(path) {
    if (!tempName.trim()) return;
    onRename(path, tempName);
    setRenamingPath(null);
  }

  function renderTree(nodes, parentPath = "") {

    return nodes.map(node => {

      const fullPath = parentPath
        ? `${parentPath}/${node.name}`
        : node.name;

      const isFolder = node.type === "folder";
      const isOpen = expanded[fullPath];
      const isRenaming = renamingPath === fullPath;

      return (
        <div key={fullPath}>

          {/* ===== ROW ===== */}
          <div
            className="explorer-row"
            onDoubleClick={() => startRename(fullPath, node.name)}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "4px 8px",
              cursor: "pointer",
              fontSize: "13px",
              color: "#cccccc"
            }}
          >

            {/* Expand Arrow */}
            {isFolder ? (
              <span
                onClick={() => toggleFolder(fullPath)}
                style={{ width: 16 }}
              >
                {isOpen ? "▾" : "▸"}
              </span>
            ) : (
              <span style={{ width: 16 }} />
            )}

            {/* Icon */}
            <span style={{ marginRight: 6 }}>
              {isFolder ? "📁" : "📄"}
            </span>

            {/* Name / Rename */}
            {isRenaming ? (
              <input
                autoFocus
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                onBlur={() => commitRename(fullPath)}
                onKeyDown={e => {
                  if (e.key === "Enter") commitRename(fullPath);
                  if (e.key === "Escape") setRenamingPath(null);
                }}
                style={{
                  background: "#1e1e1e",
                  border: "1px solid #007acc",
                  color: "#fff",
                  outline: "none",
                  fontSize: "13px",
                  width: "130px"
                }}
              />
            ) : (
              <span
                onClick={() => !isFolder && onSelect(fullPath)}
                style={{ flex: 1 }}
              >
                {node.name}
              </span>
            )}

            {/* Hover Actions */}
            <div className="actions">

              {isFolder && (
                <>
                  <span
                    title="New File"
                    onClick={() => onCreate(fullPath, "file")}
                  >
                    📄+
                  </span>

                  <span
                    title="New Folder"
                    onClick={() => onCreate(fullPath, "folder")}
                  >
                    📁+
                  </span>
                </>
              )}

              <span
                title="Delete"
                onClick={() => onDelete(fullPath)}
              >
                🗑
              </span>

            </div>

          </div>

          {/* ===== CHILDREN ===== */}
          {isFolder && isOpen && (
            <div style={{ paddingLeft: 16 }}>
              {renderTree(node.children, fullPath)}
            </div>
          )}

        </div>
      );
    });
  }

  return (
    <div
      style={{
        height: "100%",
        background: "#252526",
        overflow: "auto",
        display: "flex",
        flexDirection: "column"
      }}
    >

      {/* ===== EXPLORER TOOLBAR ===== */}
      <div
        style={{
          height: "34px",
          padding: "0 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#1f1f1f",
          borderBottom: "1px solid #333",
          fontSize: "11px",
          color: "#cccccc"
        }}
      >

        <span>EXPLORER</span>
<div style={{ display: "flex", gap: "10px", pointerEvents: "auto" }}>

  <button
    type="button"
    title="New File"
    className="icon-btn"
    onClick={(e) => {
      e.stopPropagation();
      onCreate("", "file");
    }}
  >
    📄
  </button>

  <button
    type="button"
    title="New Folder"
    className="icon-btn"
    onClick={(e) => {
      e.stopPropagation();
      onCreate("", "folder");
    }}
  >
    📁
  </button>



  <button
    type="button"
    title="Collapse All"
    className="icon-btn"
    onClick={(e) => {
      e.stopPropagation();
      setExpanded({});
    }}
  >
    📂➖
  </button>

</div>


      </div>

      {/* ===== TREE ===== */}
      <div style={{ flex: 1 }}>
        {renderTree(workspace)}
      </div>

      {/* ===== STYLES ===== */}
      <style>
        {`
          .explorer-row:hover {
            background: #2a2d2e;
          }

          .actions {
            display: none;
            gap: 6px;
          }

          .explorer-row:hover .actions {
            display: flex;
          }

          .actions span {
            cursor: pointer;
            opacity: 0.8;
          }

          .actions span:hover {
            opacity: 1;
            color: #ffffff;
          }

          .icon-btn {
            background: transparent;
            border: none;
            color: #cccccc;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            font-size: 14px;
          }

          .icon-btn:hover {
            background: #2a2d2e;
            color: #ffffff;
          }
        `}
      </style>

    </div>
  );
}

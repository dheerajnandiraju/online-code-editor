import React, { useState } from "react";
import FileExplorer from "./components/FileExplorer";
import EditorArea from "./components/EditorArea";
import Preview from "./components/Preview";
import { Group, Panel, Separator } from "react-resizable-panels";

/* ================= HELPER: FLATTEN WORKSPACE ================= */

function flattenWorkspace(tree, basePath = "") {
  let result = [];

  tree.forEach(item => {
    const fullPath = basePath
      ? `${basePath}/${item.name}`
      : item.name;

    if (item.type === "file") {
      result.push({
        name: fullPath.replace("src/", ""), // Sandpack expects root files
        content: item.content
      });
    }

    if (item.type === "folder") {
      result = result.concat(flattenWorkspace(item.children, fullPath));
    }
  });

  return result;
}

/* ================= MAIN APP ================= */

function App() {

  /* -------- Workspace Tree -------- */

  const [workspace, setWorkspace] = useState([
    {
      type: "folder",
      name: "src",
      children: [
        {
          type: "file",
          name: "App.js",
          content: `
import React from "react";

export default function App() {
  return <h1>Hello Monaco IDE 🚀</h1>;
}
`
        },
        {
          type: "file",
          name: "index.js",
          content: `
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
`
        }
      ]
    },
    {
      type: "folder",
      name: "components",
      children: []
    }
  ]);

  /* -------- Derived Flat Files For Preview -------- */

  const flatFiles = flattenWorkspace(workspace);

  /* -------- Editor State -------- */

  const [activeFilePath, setActiveFilePath] = useState("src/App.js");

  /* -------- Tabs -------- */

  const [openTabs, setOpenTabs] = useState(["src/App.js"]);
  const [activeTab, setActiveTab] = useState("src/App.js");

  /* -------- Run Preview -------- */

  const [runProject, setRunProject] = useState(0);

  /* -------- Update File Content -------- */

  function updateFileContent(path, newContent) {
    function update(nodes) {
      return nodes.map(node => {
        if (node.type === "file" && path.endsWith(node.name)) {
          return { ...node, content: newContent };
        }

        if (node.type === "folder") {
          return {
            ...node,
            children: update(node.children)
          };
        }

        return node;
      });
    }

    setWorkspace(prev => update(prev));
  }

  /* ================= UI ================= */

function createItem(parentPath, type) {
  const name = prompt(`Enter ${type} name`);
  if (!name) return;

  const newItem =
    type === "file"
      ? { type: "file", name, content: "" }
      : { type: "folder", name, children: [] };

  // ROOT LEVEL CREATE
  if (!parentPath || parentPath === "") {
    setWorkspace(prev => [...prev, newItem]);
    return;
  }

  function update(nodes, parts) {
    return nodes.map(node => {
      if (node.type === "folder" && node.name === parts[0]) {

        if (parts.length === 1) {
          return {
            ...node,
            children: [...node.children, newItem]
          };
        }

        return {
          ...node,
          children: update(node.children, parts.slice(1))
        };
      }

      return node;
    });
  }

  setWorkspace(prev => update(prev, parentPath.split("/")));
}

/**============================================================ */
function renameItem(path) {
  const newName = prompt("Enter new name");
  if (!newName) return;

  function update(nodes, parts) {
    return nodes.map(node => {
      if (node.name === parts[0]) {
        if (parts.length === 1) {
          return { ...node, name: newName };
        }

        return {
          ...node,
          children: update(node.children, parts.slice(1))
        };
      }
      return node;
    });
  }

  setWorkspace(prev =>
    update(prev, path.split("/"))
  );
}
/**======================================================= */
function deleteItem(path) {

  function update(nodes, parts) {
    if (parts.length === 1) {
      return nodes.filter(n => n.name !== parts[0]);
    }

    return nodes.map(node => {
      if (node.name === parts[0]) {
        return {
          ...node,
          children: update(node.children, parts.slice(1))
        };
      }
      return node;
    });
  }

  setWorkspace(prev =>
    update(prev, path.split("/"))
  );
}


  return (
    <div
      style={{
        height: "100vh",
        background: "#1e1e1e",
        color: "#cccccc"
      }}
    >

      <Group direction="horizontal" style={{ height: "100%" }}>

        {/* ================= FILE EXPLORER ================= */}

        <Panel defaultSize={15} minSize={10}>

            <FileExplorer
          workspace={workspace}
          onSelect={(path) => {
            setActiveFilePath(path);
            setActiveTab(path);

            setOpenTabs(prev =>
              prev.includes(path) ? prev : [...prev, path]
            );
          }}
          onCreate={createItem}
          onRename={renameItem}
          onDelete={deleteItem}
        />


        </Panel>

        <Separator
          style={{
            width: "4px",
            background: "#333",
            cursor: "col-resize"
          }}
        />

        {/* ================= EDITOR ================= */}

        <Panel defaultSize={55} minSize={30}>

          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column"
            }}
          >

            {/* ===== TOP BAR ===== */}

            <div
              style={{
                padding: "6px",
                background: "#252526",
                borderBottom: "1px solid #333"
              }}
            >
              <button
                onClick={() => setRunProject(p => p + 1)}
                style={{
                  background: "#0e639c",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  cursor: "pointer",
                  borderRadius: "4px"
                }}
              >
                ▶ Run
              </button>
            </div>

            {/* ===== TABS ===== */}

            <div
              style={{
                display: "flex",
                background: "#2d2d2d",
                borderBottom: "1px solid #333"
              }}
            >

              {openTabs.map(tab => (

                <div
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setActiveFilePath(tab);
                  }}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    background: activeTab === tab ? "#1e1e1e" : "#2d2d2d",
                    borderBottom:
                      activeTab === tab
                        ? "2px solid #007acc"
                        : "2px solid transparent"
                  }}
                >

                  {tab.split("/").pop()}

                  <span
                    onClick={(e) => {
                      e.stopPropagation();

                      setOpenTabs(prev => prev.filter(t => t !== tab));

                      if (activeTab === tab) {
                        const remaining = openTabs.filter(t => t !== tab);
                        const next = remaining[remaining.length - 1];
                        setActiveTab(next || null);
                        setActiveFilePath(next || null);
                      }
                    }}
                    style={{
                      marginLeft: "8px",
                      color: "#ff5f56",
                      cursor: "pointer"
                    }}
                  >
                    ✖
                  </span>

                </div>

              ))}

            </div>

            {/* ===== EDITOR AREA ===== */}

            <EditorArea
              activePath={activeFilePath}
              workspace={workspace}
              updateFile={updateFileContent}
            />

          </div>

        </Panel>

        <Separator
          style={{
            width: "4px",
            background: "#333",
            cursor: "col-resize"
          }}
        />

        {/* ================= PREVIEW ================= */}

        <Panel defaultSize={30} minSize={20}>

          <div style={{ height: "100%" }}>

            <Preview
              files={flatFiles}
              runProject={runProject}
              visible={runProject > 0}
            />

          </div>

        </Panel>

      </Group>

    </div>
  );
}

export default App;

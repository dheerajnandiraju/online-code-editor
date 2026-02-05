import React, { useState, useEffect } from "react";
import "./App.css"; // Import the styles
import FileExplorer from "./components/FileExplorer";
import EditorArea from "./components/EditorArea";
import Preview from "./components/Preview";
import { Group, Panel, Separator } from "react-resizable-panels";

/* ================= HELPER: FLATTEN WORKSPACE ================= */

function flattenWorkspace(tree, basePath = "") {
  let result = [];

  tree.forEach((item) => {
    const fullPath = basePath ? `${basePath}/${item.name}` : item.name;

    if (item.type === "file") {
      result.push({
        name: fullPath.replace("src/", ""), // Sandpack expects root files
        content: item.content,
      });
    }

    if (item.type === "folder") {
      result = result.concat(flattenWorkspace(item.children, fullPath));
    }
  });

  return result;
}

/* ================= MAIN APP ================= */

const QUESTIONS = ["Text Overwrite on Button Click.Initially display some default text (e.g., 'Hello'). Provide an input field and a button. When the user enters text and clicks the button, overwrite the initially displayed text with the entered text.",
  "Countdown to 14 February.Calculate how much time is left until 14th February using the current date and time (Date.now()) and display the remaining time dynamically.",
  "Simple Task Manager.Create a simple task manager where the user can add tasks using an input field and button, display the list of added tasks, and remove individual tasks from the list on button click."];



function App() {
  const [isRoundActive, setIsRoundActive] = useState(false);

  const [gameOver, setGameOver] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);


function startChallenge() {

  // GAME RESET
  if (gameOver) {
    setRound(1);
    setSubmissionLog([]);
    setGameOver(false);
  }

  // NEXT ROUND AFTER SUBMIT
  if (overlayMode === "submit" && round < TOTAL_ROUNDS) {
    setRound(prev => prev + 1);
    setIsRoundActive(false); // new round not started yet
  }

  // START ROUND TIMER ONLY ON NEW ROUND
  if (!isRoundActive) {
    setRoundStartTime(Date.now()); // stopwatch start
    setIsRoundActive(true);
  }

  setEditorLocked(false);
  setIsRunning(true);
setTimeLeft(ROUND_TIME);
  setShowQuestion(true);
}




  const TOTAL_ROUNDS = 3;
  const ROUND_TIME = 90; // seconds

  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [editorLocked, setEditorLocked] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);

  const [submissionLog, setSubmissionLog] = useState([]);
  const [roundStartTime, setRoundStartTime] = useState(null);

  /* -------- Workspace Tree -------- */

  function handleSwitchOnly() {
    setOverlayMode("switch");
    setEditorLocked(true);
    setIsRunning(false);
    setShowOverlay(true);
  
  }

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
  return <h1>let's go for a tea break 🍵🍵</h1>;
}
`,
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
`,
        },
      ],
    },
    {
      type: "folder",
      name: "components",
      children: [],
    },
  ]);
  const [overlayMode, setOverlayMode] = useState("switch");

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
      return nodes.map((node) => {
        if (node.type === "file" && path.endsWith(node.name)) {
          return { ...node, content: newContent };
        }

        if (node.type === "folder") {
          return {
            ...node,
            children: update(node.children),
          };
        }

        return node;
      });
    }

    setWorkspace((prev) => update(prev));
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
      setWorkspace((prev) => [...prev, newItem]);
      return;
    }

    function update(nodes, parts) {
      return nodes.map((node) => {
        if (node.type === "folder" && node.name === parts[0]) {
          if (parts.length === 1) {
            return {
              ...node,
              children: [...node.children, newItem],
            };
          }

          return {
            ...node,
            children: update(node.children, parts.slice(1)),
          };
        }

        return node;
      });
    }

    setWorkspace((prev) => update(prev, parentPath.split("/")));
  }

  /**============================================================ */
  function renameItem(path) {
    const newName = prompt("Enter new name");
    if (!newName) return;

    function update(nodes, parts) {
      return nodes.map((node) => {
        if (node.name === parts[0]) {
          if (parts.length === 1) {
            return { ...node, name: newName };
          }

          return {
            ...node,
            children: update(node.children, parts.slice(1)),
          };
        }
        return node;
      });
    }

    setWorkspace((prev) => update(prev, path.split("/")));
  }
  /**======================================================= */
  function deleteItem(path) {
    function update(nodes, parts) {
      if (parts.length === 1) {
        return nodes.filter((n) => n.name !== parts[0]);
      }

      return nodes.map((node) => {
        if (node.name === parts[0]) {
          return {
            ...node,
            children: update(node.children, parts.slice(1)),
          };
        }
        return node;
      });
    }

    setWorkspace((prev) => update(prev, path.split("/")));
  }
useEffect(() => {
  if (!isRunning) return;

  const timer = setInterval(() => {
    setTimeLeft(prev => {
      if (prev === 1) {

        clearInterval(timer);

        // Stop timer first
        setIsRunning(false);

        // Delay overlay UI update
        setTimeout(() => {
          handleSwitchOnly();
        }, 0);

        return 0;
      }

      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);

}, [isRunning]);


 function handleSubmit() {

  if (!isRunning || !roundStartTime) return;

  setOverlayMode("submit");
  setEditorLocked(true);
  setIsRunning(false);
  setShowOverlay(true);
  setShowQuestion(false);

  setIsRoundActive(false); // freeze round time

  logSubmission("MANUAL");

  if (round === TOTAL_ROUNDS) {
  setGameOver(true);
}
}

  function logSubmission(type) {
    const entry = {
      round,
      type,
      timeTaken: Math.floor((Date.now() - roundStartTime) / 1000),
      timestamp: new Date().toLocaleTimeString(),
    };

    setSubmissionLog((prev) => [...prev, entry]);
  }
function closeOverlayOnly() {

  setShowOverlay(false);

  // AUTO CONTINUE TURN ONLY
  if (overlayMode === "switch") {

    setEditorLocked(false);
    setIsRunning(true);

    // DO NOT reset timer here -- CHANGED per request to Loop Timer
    setTimeLeft(ROUND_TIME);
    // DO NOT touch roundStartTime
  }

}
const safeTime = Math.max(0, timeLeft);

  return (
    <div className="app-container">
      {showOverlay && (
        <div className="overlay-backdrop">
          <div className="overlay-card">
            <h2 className="overlay-title">
            </h2>

            <p className="overlay-message">
              {overlayMode === "submit"
                ? "Click Start to begin next round"
                : "Switch Player Now"}
            </p>

            <button
              onClick={closeOverlayOnly}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "10px" }}
            >
              {gameOver ? "Restart Game ▶" : "Start Next ▶"}
            </button>
            <div className="log-container">
              <div className="log-header">Submission Log</div>
              <div className="log-list">
                {submissionLog.map((log, i) => (
                  <div key={i} className="log-item">
                    <span>Round {log.round} ({log.type})</span>
                    <span style={{color: "#cbd5e1"}}>{log.timeTaken}s</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}


{showQuestion && (
  <div className="question-banner">
    <span className="question-icon">🧠</span> 
    {QUESTIONS[round - 1]}
  </div>
)}
      <Group
      autoSaveId={null}
        id="main-layout"
        orientation="horizontal"
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        {/* ================= FILE EXPLORER ================= */}

        <Panel id="file-explorer" defaultSize={15} minSize={5}>
          <div style={{ height: "100%", minWidth: 0, overflow: "hidden" }}>
            <FileExplorer
              workspace={workspace}
              onSelect={(path) => {
                setActiveFilePath(path);
                setActiveTab(path);

                setOpenTabs((prev) =>
                  prev.includes(path) ? prev : [...prev, path],
                );
              }}
              onCreate={createItem}
              onRename={renameItem}
              onDelete={deleteItem}
            />
          </div>
        </Panel>

        <Separator className="resize-handle" />

        {/* ================= EDITOR ================= */}

        <Panel id="editor" defaultSize={55} minSize={20}>
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minWidth: 0,
              minHeight: 0,
            }}
          >
            {/* ===== TOP BAR ===== */}

            <div className="top-bar">
              <div className="top-bar-left">
                <button
                    onClick={() => setRunProject((p) => p + 1)}
                    className="btn btn-success"
                >
                    ▶ Run
                </button>
                
                <div className="info-badge">
                  Round: {round}/{TOTAL_ROUNDS}
                </div>
              </div>

              <div className="top-bar-right">
                <div className="info-badge timer-badge">
⏱ {Math.floor(safeTime / 60)}:{String(safeTime % 60).padStart(2, "0")}
                </div>

                <button 
                  onClick={startChallenge} 
                  disabled={isRunning && !gameOver}
                  className="btn"
                >
                  ▶ Start
                </button>

                <button 
                  onClick={handleSubmit} 
                  disabled={editorLocked}
                  className="btn btn-primary"
                >
                  ✅ Submit
                </button>
              </div>
            </div>

            {/* ===== TABS ===== */}

            <div className="tabs-container">
              {openTabs.map((tab) => (
                <div
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setActiveFilePath(tab);
                  }}
                  className={`tab-item ${activeTab === tab ? "active" : ""}`}
                >
                  {tab.split("/").pop()}

                  <span
                    onClick={(e) => {
                      e.stopPropagation();

                      setOpenTabs((prev) => prev.filter((t) => t !== tab));

                      if (activeTab === tab) {
                        const remaining = openTabs.filter((t) => t !== tab);
                        const next = remaining[remaining.length - 1];
                        setActiveTab(next || null);
                        setActiveFilePath(next || null);
                      }
                    }}
                    className="tab-close"
                  >
                    ✖
                  </span>
                </div>
              ))}
            </div>

            {/* ===== EDITOR AREA ===== */}

            <EditorArea
              disabled={editorLocked}
              activePath={activeFilePath}
              workspace={workspace}
              updateFile={updateFileContent}
            />
          </div>
        </Panel>

        <Separator className="resize-handle" />

        {/* ================= PREVIEW ================= */}

<Panel id="preview" defaultSize={30} minSize={10}>
  <div
    style={{
      height: "100%",
      width: "100%",
      display: "flex",
      flex: 1,
      minWidth: 0,
      minHeight: 0
    }}
  >
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

import {
  SandpackProvider,
  SandpackPreview,
  SandpackConsole
} from "@codesandbox/sandpack-react";

export default function Preview({ files, runProject, visible }) {

  const sandpackFiles = {
    "/index.html": {
      code: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Preview</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`
    }
  };

  files.forEach(file => {
    sandpackFiles["/" + file.name] = {
      code: file.content
    };
  });

  return (
<SandpackProvider
  key={runProject}
  template="react"
  files={sandpackFiles}
  customSetup={{
    entry: "/index.js",
   dependencies: {
  react: "18.2.0",
  "react-dom": "18.2.0",

  // Routing
  "react-router-dom": "6.22.3",

  // API
  axios: "1.6.7",

  // State
  "@reduxjs/toolkit": "2.2.3",
  "react-redux": "9.1.0",

  // UI
  "@mui/material": "5.15.15",
  "@emotion/react": "11.11.4",
  "@emotion/styled": "11.11.0",

  // Icons
  "react-icons": "5.0.1",

  // Forms
  "react-hook-form": "7.51.2",

  // Animation
  "framer-motion": "11.0.8",

  // Charts
  recharts: "2.12.2",

  // Utils
  dayjs: "1.11.10",
  lodash: "4.17.21"
}
  
  }}
  options={{
    externalResources: []
  }}
>

      <div
  style={{
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0
  }}
>


<div
  style={{
    flex: 1,
    display: visible ? "flex" : "none",
    minHeight: 0,
    minWidth: 0
  }}
>

<SandpackPreview
  style={{
    height: "100%",
    width: "100%",
    minWidth: 0,
    minHeight: 0
  }}
  showOpenInCodeSandbox={false}
  showRefreshButton={false}
  showRestartButton={false}
/>

</div>

{!visible && (
  <div style={{
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#888"
  }}>
    Click ▶ Run to start preview
  </div>
)}
        <hr />

        <SandpackConsole style={{  height: "30%",
    minHeight: "120px", background:"black", fontSize:"large",  }} />

      </div>
    </SandpackProvider>
  );
}

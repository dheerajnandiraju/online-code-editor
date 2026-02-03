import {
  SandpackProvider,
  SandpackPreview
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
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden"
      }}
      key={runProject}
      template="react"
      files={sandpackFiles}
      customSetup={{
        entry: "/index.js",
        dependencies: {
          react: "18.2.0",
          "react-dom": "18.2.0"
        }
      }}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden"
        }}
      >
        {visible ? (
          <SandpackPreview
            style={{
              flex: 1,
              height: "100%",
              width: "100%",
              minWidth: 0
            }}
            showOpenInCodeSandbox={false}
            showRefreshButton={false}
            showRestartButton={false}
          />
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#888",
              background: "#1e1e1e"
            }}
          >
            Click ▶ Run to start preview
          </div>
        )}
      </div>

    </SandpackProvider>
  );


}

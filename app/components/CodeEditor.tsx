import { Editor, OnChange } from "@monaco-editor/react";
import { useGlobal } from "~/context/GlobalContext";

export default function CodeEditor() {
  const { assistantMinimized } = useGlobal();

  const handleEditorChange: OnChange = (value) => {
    console.log("Python Code:", value);
  };
  return (
    <div className="h-screen">
      {assistantMinimized && (
        <Editor
          height="100%"
          defaultLanguage="python"
          defaultValue={`# Write your Python code here\n`}
          onChange={handleEditorChange}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
        />
      )}
    </div>
  );
}

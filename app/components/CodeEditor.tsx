import { Editor, OnChange } from "@monaco-editor/react";
import { Fragment } from "react/jsx-runtime";
import { useGlobal } from "~/context/GlobalContext";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { Button } from "./ui/button";

export default function CodeEditor() {
  const { assistantMinimized } = useGlobal();

  const handleEditorChange: OnChange = (value) => {
    console.log("Python Code:", value);
  };
  return (
    <div className="h-screen overflow-hidden">
      {assistantMinimized && (
        <Fragment>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel>
              <Editor
                height="100%"
                defaultLanguage="python"
                defaultValue={`# Write your Python code here\ndef test(n):
    pass`}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                }}
              />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
              <div className="h-full bg-[#282a2c] flex pb-4 flex-col">
                <div className="w-full h-full flex flex-col">content</div>
                <div className="w-full flex justify-between px-4 self-end">
                  <Button variant={"outline"}>Run Test Case</Button>
                  <Button variant={"secondary"}>Submit</Button>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Fragment>
      )}
    </div>
  );
}

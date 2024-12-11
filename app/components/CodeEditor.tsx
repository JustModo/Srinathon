import { Editor } from "@monaco-editor/react";
import { Fragment } from "react/jsx-runtime";
import { useGlobal } from "~/context/GlobalContext";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";

import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { useSocket } from "~/context/SocketContext";

export default function CodeEditor() {
  const { assistantMinimized } = useGlobal();
  const [result, setResult] = useState<string | null>(null);
  const [question, setQuestion] = useState<string | null>(null);

  const { testSocket } = useSocket();

  const [solutionCode, setSolutionCode] = useState<
    string | undefined
  >(`# Write your Python code here\ndef test(n):
    pass`);

  useEffect(() => {
    testSocket?.connect();
    return () => {
      testSocket?.disconnect();
    };
  }, [testSocket]);

  useEffect(() => {
    if (!testSocket) return;

    const handleResult = (data: string) => {
      console.log("Received /result:", data);
      setResult(data);
    };

    const handleNextQuestion = (data: string) => {
      console.log("Received /nextQuestion:", data);
      setResult(null);
      setSolutionCode(`# Write your Python code here\ndef test(n):
    pass`);
      setQuestion(data);
    };

    testSocket.on("result", handleResult);
    testSocket.on("nextQuestion", handleNextQuestion);

    return () => {
      testSocket.off("result", handleResult);
      testSocket.off("nextQuestion", handleNextQuestion);
    };
  }, [testSocket]);

  const sendCode = () => {
    testSocket?.emit("test", solutionCode);
  };

  const submitCode = () => {
    testSocket?.emit("submit", solutionCode);
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
                value={solutionCode}
                onChange={(code) => setSolutionCode(code)}
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
                  <Button variant={"outline"} onClick={sendCode}>
                    Run Test Case
                  </Button>
                  <Button variant={"secondary"} onClick={submitCode}>
                    Submit
                  </Button>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Fragment>
      )}
    </div>
  );
}

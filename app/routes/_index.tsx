import type { MetaFunction } from "@remix-run/node";
import Assitant from "~/components/Assistant";
import PythonEditor from "~/components/CodeEditor";
import Sidebar from "~/components/Sidebar";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Assitant />
      <Sidebar />
      <div className="w-full h-full">
        <PythonEditor />
      </div>
    </div>
  );
}

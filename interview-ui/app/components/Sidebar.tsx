import WebcamComponent from "./WebcamComponent";

export default function Sidebar() {
  return (
    <div className="w-[300px] h-full flex items-end border-r border-zinc-600">
      <WebcamComponent />
    </div>
  );
}

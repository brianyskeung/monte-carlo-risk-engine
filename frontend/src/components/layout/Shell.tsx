import SideBar from "./SideBar";
import TopBar from "./TopBar";

export default function Shell({ children }) {
  return (
    <div className="flex flex-col h-screen bg-bg text-text-primary">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <SideBar />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
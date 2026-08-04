import { BrowserRouter, Routes, Route } from "react-router-dom";
import Shell from "./components/layout/Shell";
import Simulate from "./pages/Simulate";

export default function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Simulate />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
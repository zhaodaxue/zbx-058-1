import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sandbox from "@/pages/Sandbox";
import Replay from "@/pages/Replay";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Sandbox />} />
        <Route path="/replay" element={<Replay />} />
      </Routes>
    </Router>
  );
}

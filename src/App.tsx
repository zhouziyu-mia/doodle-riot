import { BrowserRouter as Router, Navigate, Routes, Route } from "react-router-dom";
import Lobby from "@/pages/Lobby";
import Room from "@/pages/Room";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:code" element={<Room />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

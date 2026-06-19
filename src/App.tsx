import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Workbench from "@/pages/Workbench";
import WorkDetail from "@/pages/WorkDetail";
import FeedbackBoard from "@/pages/FeedbackBoard";
import CompareView from "@/pages/CompareView";
import Reader from "@/pages/Reader";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Workbench />} />
        <Route path="/work/:workId" element={<WorkDetail />} />
        <Route path="/read/:token" element={<Reader />} />
        <Route path="/work/:workId/feedback" element={<FeedbackBoard />} />
        <Route path="/work/:workId/compare/:pageIndex" element={<CompareView />} />
      </Routes>
    </Router>
  );
}

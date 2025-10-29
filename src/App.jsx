import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Inicio from "./components/pages/Inicio";
import Personal from "./components/pages/Personal";
import Negocio from "./components/pages/Negocio";
import Login from "./components/pages/login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/personal" element={<Personal />} />
        <Route path="/negocio" element={<Negocio />} />
        <Route path="/login" element = {<Login/>} />
      </Routes>
    </Router>
  );
}

export default App;

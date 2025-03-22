import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/Home";
import Setup from "./pages/Setup";
import Success from "./pages/Success";

function App() {
    return (
    <BrowserRouter>
        <Routes>
            <Route path="/setup" element={<Setup />} />
            <Route path="/setup/complete" element={<Success />} />
            <Route path={"*"} element={<Home />} />
        </Routes>
    </BrowserRouter>
    );
}

export default App

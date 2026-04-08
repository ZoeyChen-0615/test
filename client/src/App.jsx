import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Search from "./pages/Search";
import Favorites from "./pages/Favorites";
import Feed from "./pages/Feed";
import Login from "./pages/Login";
import "./App.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Search />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

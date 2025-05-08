import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./components/PrivateRoute";
import "./App.css";
import WhatsappLogin from "./components/WhatsappLogin";
import Dashboard from "./components/Dashboard";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/login-whatsapp"
          element={
            <PrivateRoute>
              <WhatsappLogin />
            </PrivateRoute>
          }
        />
        <Route
          path="/list-group"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/menu/:groupWaId"
          element={
            <PrivateRoute>
              <MenuPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;

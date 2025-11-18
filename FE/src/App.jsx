import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Accounts from "./pages/admin/Accounts";
import Categories from "./pages/admin/Categories";
import Brands from "./pages/admin/Brands";
import Products from "./pages/admin/Products";
import Suppliers from "./pages/admin/Suppliers";
import Receipts from "./pages/admin/Receipts";
import Warehouse from "./pages/admin/Warehouse";
import Orders from "./pages/admin/Orders";
import Reports from "./pages/admin/Reports";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

export default function App() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);

        let extractedRole = null;

        if (decoded.authorities?.length > 0) {
          extractedRole = decoded.authorities[0].replace("ROLE_", "");
        }

        extractedRole = extractedRole || decoded.role || decoded.vaiTro || null;

        setRole(extractedRole);
      } catch (err) {
        console.error("JWT decode error:", err);
        setRole(null);
      }
    } else {
      setRole(null);
    }
  }, []);

  const isAdmin = role === "ADMIN";
  const isStaff = role === "NHANVIEN";

  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />

        {/* Protected admin layout */}
        <Route
          path="/"
          element={
            role ? <AdminLayout /> : <Navigate to="/login" replace />
          }
        >
          <Route index element={<Dashboard />} />

          {isAdmin && <Route path="categories" element={<Categories />} />}
          {isAdmin && <Route path="brands" element={<Brands />} />}

          {(isAdmin || isStaff) && <Route path="products" element={<Products />} />}
          {(isAdmin || isStaff) && <Route path="suppliers" element={<Suppliers />} />}
          {(isAdmin || isStaff) && <Route path="receipts" element={<Receipts />} />}
          {(isAdmin || isStaff) && <Route path="warehouse" element={<Warehouse />} />}
          {(isAdmin || isStaff) && <Route path="orders" element={<Orders />} />}

          {isAdmin && <Route path="accounts" element={<Accounts />} />}
          {isAdmin && <Route path="reports" element={<Reports />} />}
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={role ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}
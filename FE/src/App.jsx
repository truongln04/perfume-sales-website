import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

import AdminLayout from "./layouts/AdminLayout";
import ClientLayout from "./layouts/ClientLayout";

// Admin pages
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

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Client pages
import Home from "./pages/client/Home";
import ProductList from "./pages/client/ProductList";
import ProductDetail from "./pages/client/ProductDetail";
import Cart from "./pages/client/Cart";
import Checkout from "./pages/client/Checkout";
import Profile from "./pages/client/Profile";

// Component xử lý redirect theo role khi vào root "/"
function RootRedirect() {
  const location = useLocation();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setRole(null);
      return;
    }

    try {
      const decoded = jwtDecode(token);

      // Token Google → luôn là khách hàng
      if (decoded.email && !decoded.authorities) {
        setRole("KHACHHANG");
        return;
      }

      // Token Spring Security
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
  }, []);

  // Nếu đang ở một route khác (ví dụ /login, /admin, …) thì không can thiệp
  if (location.pathname !== "/" && location.pathname !== "") {
    return null; // để các route khác xử lý bình thường
  }

  if (role === "ADMIN" || role === "NHANVIEN") {
    return <Navigate to="/admin" replace />;
  }

  if (role === "KHACHHANG") {
    return <Navigate to="/client" replace />;
  }

  // Chưa đăng nhập hoặc token lỗi → đi tới trang client public
  return <Navigate to="/client" replace />;
}

export default function App() {
  const [role, setRole] = useState(null);

  // Cập nhật role toàn cục (dùng cho các protected route)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setRole(null);
      return;
    }

    try {
      const decoded = jwtDecode(token);

      if (decoded.email && !decoded.authorities) {
        setRole("KHACHHANG");
        return;
      }

      let extractedRole = null;
      if (decoded.authorities?.length > 0) {
        extractedRole = decoded.authorities[0].replace("ROLE_", "");
      }
      extractedRole = extractedRole || decoded.role || decoded.vaiTro || null;
      setRole(extractedRole);
    } catch (err) {
      console.error("JWT decode error:", err);
      setRole(null);
      localStorage.removeItem("token"); // token hỏng thì xóa luôn
    }
  }, []);

  const isAdmin = role === "ADMIN";
  const isStaff = role === "NHANVIEN";
  const isCustomer = role === "KHACHHANG";

  return (
    <Router>
      <Routes>
        {/* Redirect root theo role */}
        <Route path="/" element={<RootRedirect />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />

        {/* Client public + private */}
        <Route path="/client" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="products" element={<ProductList />} />
          <Route path="product/:id" element={<ProductDetail />} />

          {/* Chỉ khách hàng mới vào được */}
          <Route
            path="cart"
            element={isCustomer ? <Cart /> : <Navigate to="/login" replace />}
          />
          <Route
            path="checkout"
            element={isCustomer ? <Checkout /> : <Navigate to="/login" replace />}
          />
          <Route
            path="profile"
            element={!!localStorage.getItem("token") ? <Profile /> : <Navigate to="/login" replace />}
          />
        </Route>

        {/* Admin / Staff protected area */}
        <Route
          path="/admin/*"
          element={isAdmin || isStaff ? <AdminLayout /> : <Navigate to="/login" replace />}
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

        {/* Catch-all: đưa về trang phù hợp */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
import {BrowserRouter as Router, Routes, Route, Navigate, useLocation} from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

import AdminLayout from "./layouts/AdminLayout";
import ClientLayout from "./layouts/ClientLayout";

// Pages import (giữ nguyên như cũ)
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
import DonHangReport from "./pages/admin/DonHangReport";
import DoanhThuReport from "./pages/admin/DoanhThuReport";
import TonKhoReport from "./pages/admin/TonKhoReport";
import BanChayReport from "./pages/admin/BanChayReport";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

import Home from "./pages/client/Home";
import ProductList from "./pages/client/ProductList";
import ProductDetail from "./pages/client/ProductDetail";
import Cart from "./pages/client/Cart";
import Checkout from "./pages/client/Checkout";
import Profile from "./pages/client/Profile";
import BrandDetail from "./pages/client/BrandDetail";
import CategoryDetail from "./pages/client/CategoryDetail";
import OrdersList from "./pages/client/OrdersList";
import MomoReturnPage from "./pages/client/payment/MomoReturnPage";

// Custom Hook: Luôn trả về role mới nhất sau mỗi lần login/logout
function useRole() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const updateRole = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setRole(null);
        return;
      }

      try {
        const decoded = jwtDecode(token);

        // KIỂM TRA TOKEN EXPIRE → AUTO LOGOUT
        if (decoded.exp * 1000 < Date.now()) {
          console.warn("Token expired → auto logout");

          localStorage.removeItem("token");
          localStorage.removeItem("user");

          // Trigger redirect (global)
          window.dispatchEvent(new Event("storage"));

          setRole(null);
          return;
        }

        // Google login → luôn là KHACHHANG
        if (decoded.email && !decoded.authorities) {
          setRole("KHACHHANG");
          return;
        }

        // Spring Security token
        let r = null;
        if (decoded.authorities?.length > 0) {
          r = decoded.authorities[0].authority?.replace("ROLE_", "") ||
              decoded.authorities[0]?.replace("ROLE_", "");
        }
        r = r || decoded.role || decoded.vaiTro || decoded.scope || null;

        setRole(r?.toUpperCase() || null);
      } catch (err) {
        console.error("Token invalid:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setRole(null);
      }
    };

    // Chạy ngay
    updateRole();

    // Bắt sự kiện login/logout từ Login.jsx
    window.addEventListener("storage", updateRole);
    window.addEventListener("account-updated", updateRole); // bạn đã dispatch rồi → cực tốt!

    // Poll nhẹ để bắt login cùng tab (an toàn nhất)
    const interval = setInterval(updateRole, 1000);

    return () => {
      window.removeEventListener("storage", updateRole);
      window.removeEventListener("account-updated", updateRole);
      clearInterval(interval);
    };
  }, []);

  return role;
}

// Root redirect khi vào "/"
function RootRedirect() {
  const role = useRole();
  const location = useLocation();


  if (location.pathname !== "/") return null;

  if (role === "ADMIN" || role === "NHANVIEN") return <Navigate to="/admin" replace />;
  if (role === "KHACHHANG") return <Navigate to="/client" replace />;
  return <Navigate to="/client" replace />;
}

export default function App() {
  const role = useRole(); // ← luôn chính xác, luôn cập nhật realtime

  const isAdmin = role === "ADMIN";
  const isStaff = role === "NHANVIEN";
  const isCustomer = role === "KHACHHANG";

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />

        {/* CLIENT AREA */}
        <Route path="/client/*"  element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="brand/:id" element={<BrandDetail />} />
          <Route path="category/:id" element={<CategoryDetail />} />
          {/* Các trang chỉ dành cho khách hàng đã đăng nhập */}
          <Route path="orderslist" element={isCustomer ? <OrdersList /> : <Navigate to="/login" replace />} />
          <Route path="cart" element={isCustomer ? <Cart /> : <Navigate to="/login" replace />} />
          <Route path="checkout" element={isCustomer ? <Checkout /> : <Navigate to="/login" replace />} />
          <Route path="profile" element={isCustomer ? <Profile /> : <Navigate to="/login" replace />} />
          <Route path="payment/momo-return" element={<MomoReturnPage />} />
        </Route>

        {/* ADMIN / STAFF AREA */}
        <Route
          path="/admin/*"
          element={(isAdmin || isStaff) ? <AdminLayout /> : <Navigate to="/login" replace />}
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
          {isAdmin && <Route path="reports/donhang" element={<DonHangReport />} />}
          {isAdmin && <Route path="reports/doanhthu" element={<DoanhThuReport />} />}
          {isAdmin && <Route path="reports/tonkho" element={<TonKhoReport />} />}
          {isAdmin && <Route path="reports/banchay" element={<BanChayReport />} />}
        </Route>

        <Route path="*" element={<div>404 - Không tìm thấy trang</div>} />

      </Routes>
    </Router>
  );
}
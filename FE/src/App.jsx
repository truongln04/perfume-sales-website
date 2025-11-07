import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

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
          element={user ? <AdminLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="brands" element={<Brands />} />
          <Route path="products" element={<Products />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="receipts" element={<Receipts />} />
          <Route path="warehouse" element={<Warehouse />} />
          <Route path="orders" element={<Orders />} />

          {/* Admin-only routes */}
          {isAdmin && <Route path="accounts" element={<Accounts />} />}
          {isAdmin && <Route path="reports" element={<Reports />} />}
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}


// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Sidebar from "./components/Sidebar";
// import Header from "./components/Header";

// import Dashboard from "./pages/admin/Dashboard";
// import Accounts from "./pages/admin/Accounts";
// import Categories from "./pages/admin/Categories";
// import Brands from "./pages/admin/Brands";
// import Products from "./pages/admin/Products";
// import Suppliers from "./pages/admin/Suppliers";
// import Receipts from "./pages/admin/Receipts";
// import Warehouse from "./pages/admin/Warehouse";
// import Orders from "./pages/admin/Orders";
// import Reports from "./pages/admin/Reports";

// export default function App() {
//   return (
//     <Router>
//       <div className="d-flex">
//         <Sidebar />
//         <div className="flex-grow-1">
//           <Header />
//           <div className="container-fluid py-3">
//             <Routes>
//               <Route path="/" element={<Dashboard />} />
//               <Route path="/accounts" element={<Accounts />} />
//               <Route path="/categories" element={<Categories />} />
//               <Route path="/brands" element={<Brands />} />
//               <Route path="/products" element={<Products />} />
//               <Route path="/suppliers" element={<Suppliers />} />
//               <Route path="/receipts" element={<Receipts />} />
//               <Route path="/warehouse" element={<Warehouse />} />
//               <Route path="/orders" element={<Orders />} />
//               <Route path="/reports" element={<Reports />} />
//             </Routes>
//           </div>
//         </div>
//       </div>
//     </Router>
//   );
// }
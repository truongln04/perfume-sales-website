import { Outlet } from "react-router-dom";
import Navbar from "../components/Client/Navbar";
import Footer from "../components/Client/Footer";

export default function ClientLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

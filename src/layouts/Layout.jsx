import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

// Public layout — used for landing, features, pricing, etc.
export default function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
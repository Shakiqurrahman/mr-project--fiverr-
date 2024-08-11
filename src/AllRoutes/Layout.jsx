import React from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import Header from "../components/partials/Header"
import Navbar from "../components/partials/Navbar"

const Layout = () => {
  return (
    <>
      <Header />
      <Navbar />
      <Outlet />
      {/* <ScrollRestoration /> */}
      {/* <Footer /> */}
    </>
  );
};

export default Layout;
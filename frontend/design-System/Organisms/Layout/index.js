import React from "react";
import { useState, useEffect } from "react";
import ReactModal from "react-modal";
import Footer from "../Footer";
import Header from "../Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MenuBar } from "../../Molecules/MenuBar";
import Head from "next/head";

const Layout = ({ children }) => {
  const [render, setRender] = useState(false);
  useEffect(() => {
    setRender(true);
  }, []);
  if (typeof window !== "undefined") {
    ReactModal.setAppElement("body");
  }
  return (
    render && (
      <div className="min-h-screen bg-indigo-50 my-font ">
        <Head>
          <title>Hodl</title>
          <link rel="icon" href="/images/hodlLogoDark.png" />
        </Head>
        <Header />
        <div className="hidden md:block">
          <MenuBar />
        </div>
        {children}
        <Footer />
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
        />
      </div>
    )
  );
};

export default Layout;

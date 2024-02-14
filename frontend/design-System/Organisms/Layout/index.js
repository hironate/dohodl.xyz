import React from 'react';
import { useState, useEffect } from 'react';
import ReactModal from 'react-modal';
import Footer from '../Footer';
import Header from '../Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MenuBar } from '../../Molecules/MenuBar';
const Layout = ({ children }) => {
  const [render, setRender] = useState(false);
  useEffect(() => {
    setRender(true);
  }, []);
  if (typeof window !== 'undefined') {
    ReactModal.setAppElement('body');
  }
  return (
    render && (
      <div className="bg-indigo-50 min-h-screen my-font ">
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

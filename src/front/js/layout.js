import React from "react";
import { BrowserRouter, Route, Routes, Switch } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { GoogleOAuthProvider } from '@react-oauth/google';


// Imports para las vistas de cliente
import { Home } from "./pages/Home";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Private from "./pages/Private";
import Cart from "./pages/Cart"
import ContactUs from "./pages/ContactUs"
import PayingForm from "./pages/PayingForm"
import Profile from "./pages/Profile"
import ShopDetail from "./pages/ShopDetail"
import Shops from "./pages/Shops"
import ShopsSearch from "./pages/ShopsSearch"
import MysteryBoxDetail from "./pages/MysteryBoxDetail";

// Vistas para Admins
import AdminHome from "./pages/Admins/AdminHome"

// Vistas para Tiendas
import ShopHome from "./pages/Shops/ShopHome"
import ShopSignUp from "./pages/Shops/ShopSignUp"
import CreateBox from "./pages/Shops/CreateBox";

import { Navbar } from "./component/navbar";
import { Footer } from "./component/footer";

import injectContext from "./store/appContext"; // Asegúrate de importar correctamente

const Layout = () => {
  const basename = process.env.BASENAME || "";



  return (
    <div>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_ID_CLIENTE_GOOGLE}>
        <BrowserRouter basename={basename}>
          <ScrollToTop>
            <Navbar />
            <Routes>

              {/* Vistas de cliente */}
              <Route element={<Home />} path="/home" />
              <Route element={<SignUp />} path="/signup" />
              <Route element={<Login />} path="/" />
              <Route element={<Private />} path="/private" />
              <Route element={<Cart />} path="/cart" />
              <Route element={<ContactUs />} path="/contactus" />
              <Route element={<PayingForm />} path="/payingform" />
              <Route element={<Profile />} path="/profile" />
              <Route element={<Shops />} path="/shops" />
              <Route element={<ShopDetail />} path="/shops/:id" />
              <Route element={<ShopsSearch />} path="/shopssearch" />
              <Route element={<MysteryBoxDetail />} path="/mysterybox/:id" />


              {/* Vistas de Admin */}
              <Route element={<AdminHome />} path="/adminhome" />

              {/* Vistas de Tienda */}
              <Route element={<ShopHome />} path="/shophome" />
              <Route element={<ShopSignUp />} path="/shopsignup" />
              <Route element={<CreateBox />} path="/createbox" />

              <Route element={<h1>Not found!</h1>} path="*" />
            </Routes>
            <Footer />
          </ScrollToTop>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </div>
  );
};

// Aplica injectContext al Layout
export default injectContext(Layout);

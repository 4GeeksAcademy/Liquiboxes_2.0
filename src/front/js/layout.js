import React from "react";
import { BrowserRouter, Route, Routes, Switch } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";



// Imports para las vistas de cliente
import { Home } from "./pages/Home";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Cart from "./pages/Cart"
import AboutUs from "./pages/AboutUs"
import PayingForm from "./pages/PayingForm"
import Profile from "./pages/Profile"
import ShopDetail from "./pages/ShopDetail"
import ShopsSearch from "./pages/ShopsSearch"
import MysteryBoxDetail from "./pages/MysteryBoxDetail";
import ChooseRegistration from "./pages/ChooseRegistration";

// Vistas para Admins
import AdminHome from "./pages/Admins/AdminHome"
import AdminLogin from "./pages/Admins/AdminLogin";

// Vistas para Tiendas
import ShopHome from "./pages/Shops/ShopHome"
import ShopSignUp from "./pages/Shops/ShopSignUp"
import CreateBox from "./pages/Shops/CreateBox";
import { Navbar } from "./component/navbar";
import Footer from "./component/Footer";

// Not Found
import NotFound from "./pages/NotFound";

import injectContext from "./store/appContext"; // Asegúrate de importar correctamente

const Layout = () => {
  const basename = process.env.BASENAME || "";

  const initialOptions = {
    clientId: "AU2HNEjnvlNYSB7p6hGNb8gjhh0leKkEIZechEQLIb1IpU0k8IOeZa4ECvXdj5ErYrdZUn8UWFGTGNNC",
    currency: "EUR",
    intent: "capture",
  };




  return (
    <div className="layout">
      <GoogleOAuthProvider clientId={process.env.REACT_APP_ID_CLIENTE_GOOGLE}>
        <PayPalScriptProvider options={initialOptions}>
          <BrowserRouter basename={basename}>
            <ScrollToTop>
              <Navbar />
              <div className="main-content">
                <Routes>


                  {/* Vistas de cliente */}
                  <Route element={<Home />} path="/home" />
                  <Route element={<SignUp />} path="/signup" />
                  <Route element={<Login />} path="/" />
                  <Route element={<Cart />} path="/cart" />
                  <Route element={<AboutUs />} path="/aboutus" />
                  <Route element={<PayingForm />} path="/payingform" />
                  <Route element={<Profile />} path="/profile" />
                  <Route element={<ShopDetail />} path="/shops/:id" />
                  <Route element={<ShopsSearch />} path="/shopssearch" />
                  <Route element={<MysteryBoxDetail />} path="/mysterybox/:id" />
                  <Route element={<ChooseRegistration />} path="/chooseregistration" />


                  {/* Vistas de Admin */}
                  <Route element={<AdminHome />} path="/adminhome" />
                  <Route element={<AdminLogin />} path="/adminlogin" />

                  {/* Vistas de Tienda */}
                  <Route element={<ShopHome />} path="/shophome" />
                  <Route element={<ShopSignUp />} path="/shopsignup" />
                  <Route element={<CreateBox />} path="/createbox" />

                  <Route element={<NotFound />} path="*" />
                </Routes>
              </div>
              <Footer />
            </ScrollToTop>
          </BrowserRouter>
        </PayPalScriptProvider>
      </GoogleOAuthProvider>
    </div>
  );
};

// Aplica injectContext al Layout
export default injectContext(Layout);

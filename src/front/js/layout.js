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
import Profile from "./pages/UserDashboard"
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

// Previews
import { NavbarPreview } from "./component/Previews/navbarPreview";
import FooterPreview from "./component/Previews/FooterPreview";
import ShopPreview from "./pages/Shops/Previews/ShopPreview";
import MisteryBoxPreview from "./pages/Shops/Previews/MysteryBoxPreview";

const NavbarWrapper = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

const PreviewWrapper = ({ children }) => (
  <>
    <NavbarPreview />
    {children}
    <FooterPreview />
  </>
)

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
              <div className="main-content">
                <Routes>

                  <Route element={<Login />} path="/" />
                  <Route element={<ChooseRegistration />} path="/chooseregistration" />



                  {/* Rutas con Navbar */}
                  <Route element={<NavbarWrapper><Home /></NavbarWrapper>} path="/home" />
                  <Route element={<NavbarWrapper><SignUp /></NavbarWrapper>} path="/signup" />
                  <Route element={<NavbarWrapper><Cart /></NavbarWrapper>} path="/cart" />
                  <Route element={<NavbarWrapper><AboutUs /></NavbarWrapper>} path="/aboutus" />
                  <Route element={<NavbarWrapper><PayingForm /></NavbarWrapper>} path="/payingform" />
                  <Route element={<NavbarWrapper><Profile /></NavbarWrapper>} path="/userdashboard" />
                  <Route element={<NavbarWrapper><ShopDetail /></NavbarWrapper>} path="/shops/:id" />
                  <Route element={<NavbarWrapper><ShopsSearch /></NavbarWrapper>} path="/shopssearch" />
                  <Route element={<NavbarWrapper><MysteryBoxDetail /></NavbarWrapper>} path="/mysterybox/:id" />

                  {/* Rutas sin Navbar */}
                  <Route element={<AdminHome />} path="/adminhome" />
                  <Route element={<AdminLogin />} path="/adminlogin" />
                  <Route element={<ShopHome />} path="/shophome" />

                  <Route element={<ShopSignUp />} path="/shopsignup" />
                  <Route element={<CreateBox />} path="/createbox" />

                  {/* Vistas Preview */}
                  <Route element={<PreviewWrapper><ShopPreview /></PreviewWrapper>} path="/shoppreview/:id" />
                  <Route element={<PreviewWrapper><MisteryBoxPreview /></PreviewWrapper>} path="/mysteryboxpreview/:id" />

                  <Route element={<NotFound />} path="*" />
                </Routes>
              </div>
            </ScrollToTop>
          </BrowserRouter>
        </PayPalScriptProvider>
      </GoogleOAuthProvider>
    </div>
  );
};

export default injectContext(Layout);
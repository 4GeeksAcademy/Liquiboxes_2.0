import React, { useContext, useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Context } from "../store/appContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faBars, faHome } from "@fortawesome/free-solid-svg-icons";
import "../../styles/navbar.css"

export const Navbar = () => {
    const { store, actions } = useContext(Context);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [isNavCollapsed, setIsNavCollapsed] = useState(true);
    const location = useLocation();
    const [token, setToken] = useState("")
    const access_token = sessionStorage.getItem('token') || ""
    const navRef = useRef(null);

    useEffect(() => {
        const totalItems = Object.values(store.cart).reduce((total, item) => total + item.quantity, 0);
        setCartItemCount(totalItems);
    }, [actions]);

    useEffect(() => {
        setToken(access_token)
    }, [access_token])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setIsNavCollapsed(true);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

    const handleNavLinkClick = () => {
        setIsNavCollapsed(true);
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark" ref={navRef}>
            <div className="container-fluid">
                <button className="navbar-toggler" type="button" onClick={handleNavCollapse} aria-expanded={!isNavCollapsed}>
                    <FontAwesomeIcon icon={faBars} />
                </button>
                <Link to="/home" className="navbar-brand"><FontAwesomeIcon icon={faHome}/></Link>
                <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`}>
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link to="/shopssearch" className={`nav-link ${location.pathname === '/shopssearch' ? 'active' : ''}`} onClick={handleNavLinkClick}>Buscar Tiendas</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/aboutus" className={`nav-link ${location.pathname === '/aboutus' ? 'active' : ''}`} onClick={handleNavLinkClick}>Sobre Nosotros</Link>
                        </li>
                        <li className="nav-item">
                            {token ? (
                                <Link to="/userdashboard" className={`nav-link ${location.pathname === '/userdashboard' ? 'active' : ''}`} onClick={handleNavLinkClick}>Panel de Control</Link>
                            ) : (
                                <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={handleNavLinkClick}>Iniciar Sesión</Link>
                            )}
                        </li>
                    </ul>
                </div>
                <Link to="/cart" className="position-relative navbar-brand mt-1" id='navbar-cart' onClick={handleNavLinkClick}>
                    <FontAwesomeIcon icon={faShoppingCart} />
                    {cartItemCount > 0 && (
                        <span className="position-absolute top-25 start-100 translate-middle badge rounded-pill bg-danger py-1 px-2">
                            {cartItemCount}
                            <span className="visually-hidden">items en el carrito</span>
                        </span>
                    )}
                </Link>
            </div>
        </nav>
    );
};
import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Context } from "../store/appContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faBars } from "@fortawesome/free-solid-svg-icons";
import "../../styles/navbar.css"



export const Navbar = () => {
    const { store, actions } = useContext(Context);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [isNavCollapsed, setIsNavCollapsed] = useState(true);
    const location = useLocation();
    const [token, setToken] = useState("")
    const access_token = sessionStorage.getItem('token') || ""

    useEffect(() => {
        const totalItems = Object.values(store.cart).reduce((total, item) => total + item.quantity, 0);
        setCartItemCount(totalItems);
    }, [actions]);

    useEffect(() => {
        setToken(access_token)
    }, [access_token])

    const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

    return (
        <nav className="navbar navbar-expand-lg navbar-dark">
            <div className="container-fluid">
                <button className="navbar-toggler" type="button" onClick={handleNavCollapse} aria-expanded={!isNavCollapsed}>
                    <FontAwesomeIcon icon={faBars} />
                </button>
                <Link to="/home" className="navbar-brand">Liquiboxes</Link>
                <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`}>
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link to="/shopssearch" className={`nav-link ${location.pathname === '/shopssearch' ? 'active' : ''}`}>Buscar Tiendas</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/aboutus" className={`nav-link ${location.pathname === '/aboutus' ? 'active' : ''}`}>Sobre Nosotros</Link>
                        </li>
                        <li className="nav-item">
                            {token ? (
                                <Link to="/userdashboard" className={`nav-link ${location.pathname === '/userdashboard' ? 'active' : ''}`}>Panel de Control</Link>
                            ) : (
                                <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Iniciar Sesión</Link>
                            )}
                        </li>

                    </ul>
                </div>
                <Link to="/cart" className="nav-link position-relative cart-icon">
                    <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                    {cartItemCount > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            {cartItemCount}
                            <span className="visually-hidden">items en el carrito</span>
                        </span>
                    )}
                </Link>
            </div>
        </nav>
    );
};
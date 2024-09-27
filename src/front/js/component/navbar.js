import "../../styles/navbar.css"

import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faBars } from "@fortawesome/free-solid-svg-icons";

export const Navbar = () => {
    const { store, actions } = useContext(Context);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [isNavCollapsed, setIsNavCollapsed] = useState(true);

    useEffect(() => {
        const totalItems = Object.values(store.cart).reduce((total, item) => total + item.quantity, 0);
        setCartItemCount(totalItems);
    }, [actions]);

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
                            <Link to="/aboutus" className="nav-link">Sobre Nosotros</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/shopssearch" className="nav-link">Buscar Tiendas</Link>
                        </li>
                        <li className="nav-item">
                            {store.token ? (
                                <Link to="/userdashboard" className="nav-link">Panel de Control</Link>
                            ) : (
                                <Link to="/" className="nav-link">Iniciar Sesión</Link>
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
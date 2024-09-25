import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import "../../styles/navbar.css"

export const Navbar = () => {
    const { store, actions } = useContext(Context);
    const [cartItemCount, setCartItemCount] = useState(0);

    useEffect(() => {
        const totalItems = store.cart.reduce((total, item) => total + item.quantity, 0);
        setCartItemCount(totalItems);
    }, [store.cart, actions]);

    return (
        <nav className="navbar navbar-expand-lg">
            <div className="container-fluid mx-5">
                <Link to="/home" className="navbar-brand">Liquiboxes</Link>
                <ul className="navbar-nav me-auto">
                    <li><Link to="/aboutus" className="single-item">Sobre Nosotros</Link></li>
                    <li><Link to="/shopssearch" className="single-item">Buscar Tiendas</Link></li>
                    {store.token ? (
                        <li><Link to="/userdashboard" className="single-item">Panel de Control</Link></li>
                    ) : (
                        <li><Link to="/" className="single-item">Iniciar Sesión</Link></li>
                    )}
                </ul>
                <Link to="/cart" className="nav-link position-relative">
                    <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                    {cartItemCount > 0 && (
                        <span className="position-absolute top-25 start-100 translate-middle badge rounded-pill">
                            {cartItemCount}
                            <span className="visually-hidden">items en el carrito</span>
                        </span>
                    )}
                </Link>
            </div>
        </nav>
    );
};
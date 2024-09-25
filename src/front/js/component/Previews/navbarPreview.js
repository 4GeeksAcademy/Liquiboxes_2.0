import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import "../../../styles/navbar.css"

export const NavbarPreview = () => {

    return (
        <nav className="navbar navbar-expand-lg">
            <div className="container-fluid mx-5">
                <Link className="navbar-brand">Liquiboxes</Link>
                <ul className="navbar-nav me-auto">
                    <li className="single-item">Sobre Nosotros</li>
                    <li className="single-item">Buscar Tiendas</li>
                    <li className="single-item">Panel de Control</li>
                </ul>
                <Link className="nav-link position-relative">
                    <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                        <span className="position-absolute top-25 start-100 translate-middle badge rounded-pill">
                        </span>
                </Link>
            </div>
        </nav>
    );
};
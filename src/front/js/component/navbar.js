import React from "react";
import { Link } from "react-router-dom";

export const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container">
                <Link to="/" className="navbar-brand">Mi Aplicación</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNavDropdown">
                    <ul className="navbar-nav">
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Cliente
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                                <li><Link to="/signup" className="dropdown-item">Registro</Link></li>
                                <li><Link to="/home" className="dropdown-item">Home</Link></li>
                                <li><Link to="/private" className="dropdown-item">Área Privada</Link></li>
                                <li><Link to="/cart" className="dropdown-item">Carrito</Link></li>
                                <li><Link to="/contactus" className="dropdown-item">Contáctenos</Link></li>
                                <li><Link to="/payingform" className="dropdown-item">Formulario de Pago</Link></li>
                                <li><Link to="/profile" className="dropdown-item">Perfil</Link></li>
                                <li><Link to="/shops" className="dropdown-item">Tiendas</Link></li>
                                <li><Link to="/shopssearch" className="dropdown-item">Buscar Tiendas</Link></li>
                            </ul>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Admin
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                                <li><Link to="/adminhome" className="dropdown-item">Inicio Admin</Link></li>
                            </ul>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Tienda
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                                <li><Link to="/shophome" className="dropdown-item">Inicio Tienda</Link></li>
                                <li><Link to="/shopsignup" className="dropdown-item">Registro Tienda</Link></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};
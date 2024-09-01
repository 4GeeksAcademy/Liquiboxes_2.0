import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Private() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            navigate("/");
        }
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="container mt-5">
            <h2>Página Privada</h2>
            <p>Bienvenido a la página privada. Solo los usuarios autenticados pueden ver esto.</p>
            <button onClick={handleLogout} className="btn btn-danger">Cerrar Sesión</button>
        </div>
    );
}
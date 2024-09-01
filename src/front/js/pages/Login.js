import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { Context } from "../store/appContext";

export default function Login() {
    const {store, actions} = useContext(Context)
    const [showError, setShowError] = useState(false)

    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(process.env.BACKEND_URL + "/users/login", loginData, {
                headers: { "Content-Type": "application/json" },
            });
            console.log("Usuario autenticado:", response.data);
            if (response.data.access_token) {
                sessionStorage.setItem("token", response.data.access_token);
                navigate("/profile");
            } else {
                throw new Error("No se recibió el token de acceso");
            }
        } catch (error) {
            console.log("Error de autenticación:", error);
            setShowError(true);
        }
    };


    return (
        <div className="container mt-5">
            <h2>Iniciar Sesión</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={loginData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Contraseña</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={loginData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                {showError && ( // Esto se muestra solo y exclusivamente si showError === true
                    <div>
                        <p className="text-danger">Tu email o tu contraseña no coinciden</p>
                    </div>
                )}
                <button type="submit" className="btn btn-primary">Iniciar Sesión</button>
                <GoogleLogin
                    onSuccess={credentialResponse => {
                        console.log(credentialResponse);
                        // Aquí deberías manejar la respuesta exitosa, por ejemplo, enviando el token al backend
                    }}
                    onError={() => {
                        console.log('Login Failed');
                    }}
                />
            </form>

            <div className="alert alert-info">
		 		{store.message || "Loading message from the backend (make sure your python backend is running)..."}
		 	</div>
        </div>
    );

}
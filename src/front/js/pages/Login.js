import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { Context } from "../store/appContext";

export default function Login() {
    const { store, actions } = useContext(Context);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
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

    const attemptLogin = async (endpoint, loginData) => {
        try {
            const baseUrl = process.env.BACKEND_URL.replace(/\/$/, '');
            const response = await axios.post(`${baseUrl}/${endpoint}`, loginData, {
                headers: { "Content-Type": "application/json" },
            });
            return response.data;
        } catch (error) {
            console.log(`Error en ${endpoint}:`, error);
            if (error.response) {
                console.log("Response data:", error.response.data);
                console.log("Response status:", error.response.status);
                throw new Error(error.response.data.error || "Error de autenticación");
            } else if (error.request) {
                throw new Error("No se pudo conectar con el servidor");
            } else {
                throw new Error("Error al procesar la solicitud");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowError(false);
        setErrorMessage("");

        try {
            // Intenta iniciar sesión como usuario normal
            try {
                const userLoginResult = await attemptLogin("users/login", loginData);
                if (userLoginResult && userLoginResult.access_token) {
                    sessionStorage.setItem("token", userLoginResult.access_token);
                    sessionStorage.setItem("userType", "normal");
                    console.log("Ha entrado como usuario")
                    navigate("/profile");
                    return;
                }
            } catch (userError) {
                console.log("Error en inicio de sesión de usuario:", userError);
            }

            // Si falla, intenta iniciar sesión como tienda
            try {
                const shopLoginResult = await attemptLogin("shops/login", loginData);
                if (shopLoginResult && shopLoginResult.access_token) {
                    sessionStorage.setItem('token', shopLoginResult.access_token);
                    sessionStorage.setItem('shopId', shopLoginResult.shop.id);
                    sessionStorage.setItem("userType", "shop");
                    console.log("Ha entrado como tienda")
                    navigate("/shophome");
                    return;
                }
            } catch (shopError) {
                console.log("Error en inicio de sesión de tienda:", shopError);
            }

            // Si ambos fallan, lanza un error
            throw new Error("Credenciales inválidas para usuario y tienda");
        } catch (error) {
            console.log("Error de autenticación:", error);
            setShowError(true);
            setErrorMessage(error.message);
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            // Aquí deberías enviar el token de Google al backend para verificación
            const response = await axios.post(`${process.env.BACKEND_URL}/google-login`, {
                token: credentialResponse.credential
            });

            if (response.data.access_token) {
                sessionStorage.setItem("token", response.data.access_token);
                sessionStorage.setItem("userType", response.data.user_type);
                navigate(response.data.user_type === "normal" ? "/profile" : "/shophome");
            } else {
                throw new Error("Error en la autenticación con Google");
            }
        } catch (error) {
            console.log("Error en la autenticación con Google:", error);
            setShowError(true);
            setErrorMessage("Error en la autenticación con Google");
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
                {showError && (
                    <div className="alert alert-danger" role="alert">
                        {errorMessage}
                    </div>
                )}
                <button type="submit" className="btn btn-primary">Iniciar Sesión</button>
            </form>

            <div className="mt-3">
                <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => {
                        console.log('Login Failed');
                        setShowError(true);
                        setErrorMessage("Error en la autenticación con Google");
                    }}
                />
            </div>

            <div className="alert alert-info mt-3">
                {store.message || "Cargando mensaje del backend..."}
            </div>
        </div>
    );
}
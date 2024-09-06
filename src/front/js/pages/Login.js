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

    const attemptLogin = async (loginData) => {
        try {
            const baseUrl = process.env.BACKEND_URL;
            const response = await axios.post(`${baseUrl}/auth/login`, loginData, {
                headers: { "Content-Type": "application/json" },
            });
            return response.data;
        } catch (error) {
            console.log("Error en login:", error);
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
            const loginResult = await attemptLogin(loginData);
            if (loginResult && loginResult.access_token) {
                sessionStorage.setItem("token", loginResult.access_token);
                sessionStorage.setItem("userType", loginResult.user_type);
                console.log(`Ha entrado como ${loginResult.user_type}`);
                navigate(loginResult.user_type === "normal" ? "/home" : "/shophome");
            }
        } catch (error) {
            console.log("Error de autenticación:", error);
            setShowError(true);
            setErrorMessage(error.message);
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const response = await axios.post(`${process.env.BACKEND_URL}/auth/google_login`, {
                token: credentialResponse.credential
            });

            const { access_token, user_type, is_new_user, google_data, user } = response.data;

            if (is_new_user) {
                // Usuario nuevo, navegar a la página de elección de tipo de registro
                navigate('/chooseregistration', { 
                    state: { 
                        google_data,
                        access_token 
                    }
                });
            } else {
                // Usuario existente, guardar token y redirigir
                sessionStorage.setItem('token', access_token);
                sessionStorage.setItem('userType', user_type);
                navigate(user_type === 'normal' ? "/home" : "/shophome");
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

            {showError && (
                <div className="alert alert-danger" role="alert">
                    {errorMessage}
                </div>
            )}
        </div>
    );
}
import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { Context } from "../store/appContext";
import Spinner from '../component/Spinner'
import "../../styles/login.css"

export default function Login() {
    const { store, actions } = useContext(Context);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    });
    const navigate = useNavigate();
    const location = useLocation();
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

    useEffect(() => {
        // Guarda la ruta anterior cuando se monta el componente
        const prevPath = location.state?.from || "/";
        if (prevPath !== "/") {
            localStorage.setItem("prevPath", prevPath);
        }

        setLoading(false)
    }, [location]);

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
        setLoading(true)

        try {
            const loginResult = await attemptLogin(loginData);
            if (loginResult && loginResult.access_token) {
                store.token = loginResult.access_token
                sessionStorage.setItem("token", loginResult.access_token);
                sessionStorage.setItem("userType", loginResult.user_type);
                console.log(`Ha entrado como ${loginResult.user_type}`);

                // Obtén la ruta anterior del almacenamiento local
                const prevPath = localStorage.getItem("prevPath");

                // Elimina la ruta anterior del almacenamiento local
                localStorage.removeItem("prevPath");

                // Redirige al usuario a la ruta anterior o a la ruta por defecto
                if (prevPath && prevPath !== "/") {
                    navigate(prevPath);
                } else {
                    navigate(loginResult.user_type === "user" ? "/home" : "/shophome");
                }
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

                // Obtén la ruta anterior del almacenamiento local
                const prevPath = localStorage.getItem("prevPath");

                // Elimina la ruta anterior del almacenamiento local
                localStorage.removeItem("prevPath");

                // Redirige al usuario a la ruta anterior o a la ruta por defecto
                if (prevPath && prevPath !== "/") {
                    navigate(prevPath);
                } else {
                    navigate(user_type === 'user' ? "/home" : "/shophome");
                }
            }
        } catch (error) {
            console.log("Error en la autenticación con Google:", error);
            setShowError(true);
            setErrorMessage("Error en la autenticación con Google");
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setShowError(false);
        setErrorMessage("");
        setLoading(true);

        try {
            const response = await axios.post(`${process.env.BACKEND_URL}/auth/forgot-password`, { email: forgotPasswordEmail });
            setShowError(true);
            setErrorMessage(response.data.message);
        } catch (error) {
            setShowError(true);
            setErrorMessage(error.response?.data?.error || "Error al enviar el correo de recuperación");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return < Spinner />


    return (
        <div className="login-container">
            <div className="login-content">
                <div className="liquiboxes-logo">
                    <h1><strong>Liquiboxes</strong></h1>
                    <p>Descubre el misterio en cada caja</p>
                </div>
                <div className="login-sections-wrapper">
                    <div className="login-form-wrapper">
                        <h2 className="login-title">Iniciar Sesión</h2>
                        {!showForgotPassword ? (
                            <form onSubmit={handleSubmit} className="login-form">
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={loginData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="tu@email.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password">Contraseña</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={loginData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Tu contraseña"
                                    />
                                </div>
                                {showError && <div className="error-message"><strong>{errorMessage}</strong></div>}
                                <button type="submit">Iniciar Sesión</button>
                                <button type="button" onClick={() => setShowForgotPassword(true)} className="btn btn-link">
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleForgotPassword} className="login-form">
                                <div className="form-group">
                                    <label htmlFor="forgotPasswordEmail">Email</label>
                                    <input
                                        type="email"
                                        id="forgotPasswordEmail"
                                        name="forgotPasswordEmail"
                                        value={forgotPasswordEmail}
                                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                        required
                                        placeholder="tu@email.com"
                                    />
                                </div>
                                <button type="submit">Enviar correo de recuperación</button>
                                <button type="button" onClick={() => setShowForgotPassword(false)} className="btn btn-link">
                                    Volver al inicio de sesión
                                </button>
                            </form>
                        )}
                        <div className="google-login-wrapper">
                            <GoogleLogin
                                onSuccess={handleGoogleLogin}
                                onError={() => {
                                    setShowError(true);
                                    setErrorMessage("Error en la autenticación con Google");
                                }}
                            />
                        </div>
                        <div className="mt-3 text-center">
                            <a onClick={() => { navigate('/adminlogin') }} className="text-success">Acceso a Administradores</a>
                        </div>
                    </div>
                    <div className="create-account-section my-auto">
                        <h2>Crea tu cuenta</h2>
                        <ul className="benefits-list">
                            <li>Accede a Mystery Boxes exclusivas</li>
                            <li>Realiza tus compras con total seguridad</li>
                            <li>Elige tus preferencias para las Mystery Boxes</li>
                            <li>Encuentra las tiendas que más se parecen a tí</li>
                            <li>Descubre productos de calidad a un precio inmejorable</li>
                        </ul>
                        <button onClick={() => navigate('/chooseregistration')} className="w-100">Crear cuenta</button>
                    </div>
                </div>
            </div>

        </div>
    );
}
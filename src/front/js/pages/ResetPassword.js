import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../../styles/login.css";

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        try {
            const response = await axios.post(`${process.env.BACKEND_URL}/auth/reset-password/${token}`, { new_password: password });
            setSuccess(response.data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setError(error.response?.data?.error || 'Error al restablecer la contraseña');
        }
    };

    return (
        <div className="login-container">
            <div className="login-content">
                <div className="login-sections-wrapper">
                    <div className="login-form-wrapper">
                        <h2 className="login-title">Restablecer Contraseña</h2>
                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="form-group">
                                <label htmlFor="password">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength="8"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength="8"
                                />
                            </div>
                            {error && <div className="error-message">{error}</div>}
                            {success && <div className="success-message">{success}</div>}
                            <button type="submit">Restablecer Contraseña</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
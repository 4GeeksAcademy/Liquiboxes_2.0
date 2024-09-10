import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../../styles/admins/adminlogin.css';

const AdminLogin = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(
        `${process.env.BACKEND_URL}/admins/login`, 
        loginData, 
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const { token, user_type } = response.data;
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('userType', user_type);
      console.log(`Ha entrado como ${user_type}`);
      navigate('/adminhome');

    } catch (error) {
      console.log("Error de autenticación:", error);
      if (error.response) {
        setError(error.response.data.error || 'Credenciales inválidas');
      } else if (error.request) {
        setError('No se pudo conectar con el servidor');
      } else {
        setError('Error al procesar la solicitud');
      }
    }
  };

  return (
    <div className="admin-login">
      <h2>Admin Login</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={loginData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={loginData.password}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          <FontAwesomeIcon icon={faSignInAlt} /> Login
        </Button>
      </Form>
    </div>
  );
};

export default AdminLogin;
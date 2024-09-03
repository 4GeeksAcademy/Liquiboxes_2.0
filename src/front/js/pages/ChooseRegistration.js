import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ChooseRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { google_data, access_token } = location.state || {};

  const handleChoice = (choice) => {
    const route = choice === 'user' ? '/signup' : '/shopsignup';
    navigate(route, { state: { google_data, access_token } });
  };

  return (
    <div className="choose-registration-container">
      <div className="choose-registration-card">
        <h1 className="welcome-title">Bienvenido a nuestra plataforma</h1>
        <p className="welcome-text">Parece que aún no tienes una cuenta. Elige cómo te gustaría unirte a nosotros:</p>
        
        <div className="registration-options">
          <div className="option-card" onClick={() => handleChoice('user')}>
            <div className="option-icon user-icon"></div>
            <h2>Como Usuario</h2>
            <p>Accede a ofertas exclusivas y gestiona tus pedidos fácilmente.</p>
            <button className="btn btn-primary">Registrarse como Usuario</button>
          </div>
          
          <div className="option-card" onClick={() => handleChoice('shop')}>
            <div className="option-icon shop-icon"></div>
            <h2>Como Tienda</h2>
            <p>Expande tu negocio y llega a más clientes en nuestra plataforma.</p>
            <button className="btn btn-secondary">Registrarse como Tienda</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseRegistration;
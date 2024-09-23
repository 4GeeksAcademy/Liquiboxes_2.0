import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import "../../styles/shops/notfound.css";

const NotFound = () => {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    const countdown = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Redirigir a la página de inicio después de 5 segundos
    if (seconds === 0) {
      navigate('/');
    }

    return () => clearInterval(countdown);
  }, [seconds, navigate]);

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="not-found-container">
      <div className="animation-container">
        <h1>404</h1>
        <div className="animation-circle"></div>
      </div>
      <h2>¡Oops! Página no encontrada</h2>
      <p>
        Parece que la página que estás buscando no existe o fue eliminada.
      </p>
      <p>Te redirigiremos en <span>{seconds}</span> segundos...</p>
      <button onClick={handleGoHome} className="go-home-button">
        Ir a login
      </button>
    </div>
  );
};

export default NotFound;

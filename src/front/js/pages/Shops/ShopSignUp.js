import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faStore, faEnvelope, faLock, faShoppingBag, faBriefcase, faComments } from '@fortawesome/free-solid-svg-icons';
import "../../../styles/signup.css";

const STEPS = [
  { icon: faUser, title: "Datos del Propietario", description: "Información sobre el dueño de la tienda" },
  { icon: faStore, title: "Datos de la Tienda", description: "Detalles sobre tu negocio" },
  { icon: faEnvelope, title: "Cuenta", description: "Crea tu cuenta segura" },
  { icon: faShoppingBag, title: "Categorías", description: "Selecciona las categorías de tus productos" },
  { icon: faBriefcase, title: "Core del Negocio", description: "Cuéntanos sobre la esencia de tu negocio" },
  { icon: faComments, title: "Descripción de la Tienda", description: "Comparte la historia y valores de tu tienda" }
];

const CATEGORIES = ['Moda', 'Ropa de Trabajo', 'Tecnología', 'Carpintería', 'Outdoor', 'Deporte', 'Arte', 'Cocina', 'Jardinería', 'Música', 'Viajes', 'Lectura', 'Cine', 'Fotografía', 'Yoga'];

export default function ShopSignUp() {
  const [step, setStep] = useState(1);
  const [isStepValid, setIsStepValid] = useState(false);
  const [signupData, setSignUpData] = useState({
    owner_name: "", 
    owner_surname: "", 
    shop_name: "", 
    shop_address: "", 
    postal_code: "", 
    email: "", 
    password: "", 
    categories: [], 
    business_core: "", 
    shop_description: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (checked) {
        setSignUpData(prev => ({
          ...prev,
          [name]: [...prev[name], value]
        }));
      } else {
        setSignUpData(prev => ({
          ...prev,
          [name]: prev[name].filter(item => item !== value)
        }));
      }
    } else {
      setSignUpData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (signupData.categories.length === 0) {
      alert(`Por favor selecciona al menos una categoría`);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.BACKEND_URL}/shops/register`,
        signupData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Tienda registrada:", response.data);
      navigate("/shop-dashboard");
    } catch (error) {
      console.error("Ha habido un error:", error);
    }
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        return signupData.owner_name && signupData.owner_surname;
      case 2:
        return signupData.shop_name && signupData.shop_address && signupData.postal_code && signupData.postal_code.length === 5;
      case 3:
        return signupData.email && signupData.password;
      case 4:
        return signupData.categories.length > 0;
      case 5:
        return signupData.business_core.length >= 10; // Asegurarse de que haya una descripción mínima
      case 6:
        return signupData.shop_description.length >= 50; // Asegurarse de que haya una descripción sustancial
      default:
        return false;
    }
  };

  useEffect(() => {
    setIsStepValid(validateStep());
  }, [signupData, step]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <input type="text" name="owner_name" value={signupData.owner_name} onChange={handleChange} placeholder="Nombre del Propietario" required />
            <input type="text" name="owner_surname" value={signupData.owner_surname} onChange={handleChange} placeholder="Apellido del Propietario" required />
          </>
        );
      case 2:
        return (
          <>
            <input type="text" name="shop_name" value={signupData.shop_name} onChange={handleChange} placeholder="Nombre de la Tienda" required />
            <input type="text" name="shop_address" value={signupData.shop_address} onChange={handleChange} placeholder="Dirección de la Tienda" required />
            <input type="text" name="postal_code" value={signupData.postal_code} onChange={handleChange} placeholder="Código Postal (5 dígitos)" required maxLength="5" pattern="\d{5}" />
          </>
        );
      case 3:
        return (
          <>
            <input type="email" name="email" value={signupData.email} onChange={handleChange} placeholder="Email" required />
            <input type="password" name="password" value={signupData.password} onChange={handleChange} placeholder="Contraseña" required />
          </>
        );
      case 4:
        return (
          <div className="checkbox-group">
            <p>Selecciona las categorías de tus productos:</p>
            {CATEGORIES.map(category => (
              <label key={category}>
                <input
                  type="checkbox"
                  name="categories"
                  value={category}
                  checked={signupData.categories.includes(category)}
                  onChange={handleChange}
                /> {category}
              </label>
            ))}
          </div>
        );
      case 5:
        return (
          <>
            <p className="field-description">
              El core de tu negocio es lo que te hace único. Describe brevemente la esencia de tu tienda, 
              lo que te diferencia de la competencia y por qué los clientes deberían elegirte. 
              Esta información nos ayudará a conectarte con los usuarios adecuados.
            </p>
            <textarea 
              name="business_core" 
              value={signupData.business_core} 
              onChange={handleChange} 
              placeholder="Describe el core de tu negocio (mínimo 10 caracteres)" 
              required 
              rows="4"
            />
          </>
        );
      case 6:
        return (
          <>
            <p className="field-description">
              Tu descripción es la primera impresión que los usuarios tendrán de tu tienda. 
              Cuéntanos tu historia, tus valores, y lo que hace especial a tu negocio. 
              Sé auténtico y detallado, ya que esta información ayudará a los usuarios a 
              conectar con tu marca y entender lo que ofreces.
            </p>
            <textarea 
              name="shop_description" 
              value={signupData.shop_description} 
              onChange={handleChange} 
              placeholder="Describe tu tienda en detalle (mínimo 50 caracteres)" 
              required 
              rows="6"
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-progress">
        {STEPS.map((s, index) => (
          <div key={index} className={`step ${index + 1 === step ? 'active' : ''} ${index + 1 < step ? 'completed' : ''}`}>
            <div className="step-icon">
              <FontAwesomeIcon icon={s.icon} />
            </div>
            <div className="step-label">{s.title}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="signup-content">
          <div className="step-info">
            <h2>{STEPS[step - 1].title}</h2>
            <p>{STEPS[step - 1].description}</p>
          </div>
          <div className="step-form">
            {renderStep()}
          </div>
        </div>
        <div className="navigation-buttons">
          {step > 1 && <button type="button" onClick={() => setStep(prev => prev - 1)}>Anterior</button>}
          {step < 6 ? (
            <button 
              type="button" 
              onClick={() => setStep(prev => prev + 1)} 
              disabled={!isStepValid}
              className={isStepValid ? "button-enabled" : "button-disabled"}
            >
              Siguiente
            </button>
          ) : (
            <button 
              type="submit" 
              disabled={!isStepValid}
              className={isStepValid ? "button-enabled" : "button-disabled"}
            >
              Registrar Tienda
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
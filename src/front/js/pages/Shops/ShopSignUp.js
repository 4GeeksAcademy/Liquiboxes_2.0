import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faStore, faEnvelope, faLock, faShoppingBag, faBriefcase, faComments, faList , faImage } from '@fortawesome/free-solid-svg-icons';
import "../../../styles/signup.css";
import { Context } from "../../store/appContext";

const STEPS = [
  { icon: faUser, title: "Datos del Propietario", description: "Información sobre el dueño de la tienda" },
  { icon: faStore, title: "Datos de la Tienda", description: "Detalles sobre tu negocio" },
  { icon: faEnvelope, title: "Cuenta", description: "Crea tu cuenta segura" },
  { icon: faShoppingBag, title: "Categorías", description: "Selecciona las categorías de tus productos" },
  { icon: faBriefcase, title: "Core del Negocio", description: "Cuéntanos sobre la esencia de tu negocio" },
  { icon: faComments, title: "Descripción de la Tienda", description: "Comparte la historia y valores de tu tienda" },
  { icon: faList , title: "Resumen de la Tienda", description: "Breve descripción de tu tienda en 10 palabras" },
  { icon: faImage, title: "Imagen de la Tienda", description: "Sube una imagen representativa de tu tienda" }
];

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
    shop_description: "",
    shop_summary: "",
    image_shop_url: ""
  });
  const navigate = useNavigate();
  const {store, actions} = useContext(Context)
  const CATEGORIES = store.categories

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
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
    } else if (type === 'file') {
      setSignUpData(prev => ({ ...prev, [name]: files[0] }));
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

    const formData = new FormData();
    for (const key in signupData) {
      if (key === 'image_shop_url') {
        formData.append(key, signupData[key], signupData[key].name);
      } else {
        formData.append(key, signupData[key]);
      }
    }

    try {
      const response = await axios.post(
        `${process.env.BACKEND_URL}/shops/register`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
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
        return signupData.business_core.length >= 10;
      case 6:
        return signupData.shop_description.length >= 50;
      case 7:
        return signupData.shop_summary && signupData.shop_summary.split(' ').length <= 10;
      case 8:
        return signupData.image_shop_url;
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
      case 7:
        return (
          <>
            <p className="field-description">
              Proporciona un breve resumen de tu tienda en no más de 10 palabras.
              Este resumen aparecerá en los resultados de búsqueda y en las vistas previas de tu tienda.
            </p>
            <input
              type="text"
              name="shop_summary"
              value={signupData.shop_summary}
              onChange={handleChange}
              placeholder="Resumen de la tienda (máximo 10 palabras)"
              required
            />
            <p className="word-count">
              Palabras: {signupData.shop_summary.split(' ').filter(word => word !== '').length}/10
            </p>
          </>
        );
      case 8:
        return (
          <>
            <p className="field-description">
              Sube una imagen representativa de tu tienda. Esta imagen se mostrará en tu perfil y en los resultados de búsqueda.
            </p>
            <input
              type="file"
              name="image_shop_url"
              onChange={handleChange}
              accept="image/*"
              required
            />
            {signupData.image_shop_url && (
              <img
                src={URL.createObjectURL(signupData.image_shop_url)}
                alt="Vista previa de la imagen de la tienda"
                style={{ maxWidth: '200px', marginTop: '10px' }}
              />
            )}
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
          {step < 8 ? (
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
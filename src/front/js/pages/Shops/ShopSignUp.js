import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Context } from "../../store/appContext";
import { registerAndLogin } from "../../component/AuthenticationUtils";
import Confetti from 'react-confetti';
import ModalGlobal from '../../component/ModalGlobal'
import "../../../styles/signup.css";


const STEPS = [
  { title: "Datos del Propietario", description: "Información sobre el dueño de la tienda", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850499/Smartphone_User_y6d64l.gif" },
  { title: "Datos de la Tienda", description: "Detalles sobre tu negocio", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850497/Online_Shopping_Store_uvucsy.gif" },
  { title: "Cuenta", description: "Crea tu cuenta segura", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850498/Smartphone_Lock_cvnebi.gif" },
  { title: "Categorías", description: "Selecciona las categorías de tus productos", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850497/Filter_Item_altaic.gif"  },
  { title: "Core del Negocio", description: "Cuéntanos sobre la esencia de tu negocio", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850498/Search_Product_kzaiu5.gif" },
  { title: "Descripción de la Tienda", description: "Comparte la historia y valores de tu tienda", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850498/Qr_Code_lrmdoa.gif" },
  { title: "Resumen y Finalización", description: "Revisa y completa tu perfil de tienda", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850497/Checklist_l0hzyf.gif" }
];

export default function ShopSignUp() {
  const [step, setStep] = useState(1);
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
    image_shop_url: null
  });
  const [isStepValid, setIsStepValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userType, setUserType] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { store } = useContext(Context);
  const CATEGORIES = store.categories;

  const { google_data } = location.state || {};

  useEffect(() => {
    if (google_data) {
      setSignUpData(prev => ({
        ...prev,
        owner_name: google_data.name || prev.owner_name,
        owner_surname: google_data.surname || prev.owner_surname,
        email: google_data.email || prev.email,
      }));
    }
  }, [google_data]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setSignUpData(prev => ({
        ...prev,
        [name]: checked
          ? [...prev[name], value]
          : prev[name].filter(item => item !== value)
      }));
    } else if (type === 'file') {
      setSignUpData(prev => ({
        ...prev,
        [name]: files[0] || null
      }));
    } else {
      setSignUpData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateStep = () => {
    const validations = {
      1: () => signupData.owner_name && signupData.owner_surname,
      2: () => signupData.shop_name && signupData.shop_address && signupData.postal_code && /^\d{5}$/.test(signupData.postal_code),
      3: () => signupData.email && /\S+@\S+\.\S+/.test(signupData.email) && signupData.password && signupData.password.length >= 8,
      4: () => signupData.categories.length > 0,
      5: () => signupData.business_core.length >= 10,
      6: () => signupData.shop_description.length >= 50,
      7: () => signupData.shop_summary && signupData.shop_summary.split(' ').length <= 10 && signupData.image_shop_url
    };
    return validations[step]?.() ?? false;
  };

  useEffect(() => {
    setIsStepValid(validateStep());
  }, [signupData, step]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateStep()) return;

    if (step < STEPS.length) {
      setStep(prev => prev + 1);
    } else {
      const formData = new FormData();
      Object.entries(signupData).forEach(([key, value]) => {
        if (key === 'categories') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'image_shop_url' && value instanceof File) {
          formData.append(key, value, value.name);
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      try {
        const response = await registerAndLogin(`${process.env.BACKEND_URL}/shops/register`, formData);
        setUserType(response.user_type);
        setIsSuccess(true);
      } catch (error) {
        setError("Error en el registro o inicio de sesión. Por favor, inténtalo de nuevo.");
        console.error("Error detallado:", error.response ? error.response.data : error.message);
      }
    }
  };

  const handleCloseModal = () => {
    setIsSuccess(false);
    navigate("/shophome");
  };

  const renderStepContent = () => {
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
            <p className="field-description">
              Sube una imagen representativa de tu tienda. Esta imagen se mostrará en tu perfil y en los resultados de búsqueda.
            </p>
            <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setSignUpData(prev => ({ ...prev, image_shop_url: file }));
              }
            }}
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
      <div className="signup-content">
        <div className="animation-section">
          <h2 className="step-title">{STEPS[step - 1].title}</h2>
          <div className="animation-wrapper">
            <img
              src={STEPS[step - 1].src}
              className="img-fluid"
            />
          </div>
          <p className="step-description">{STEPS[step - 1].description}</p>
        </div>
        <div className="form-section">
          {step > 1 && (
            <button className="back-button" onClick={() => setStep(prev => prev - 1)}>
              ←
            </button>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <div className="step-content">
              <h2 className="step-question">{STEPS[step - 1].title}</h2>
              {renderStepContent()}
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="navigation-buttons">
              {step < STEPS.length ? (
                <button 
                  type="button" 
                  onClick={handleSubmit}
                  disabled={!isStepValid}
                  className={isStepValid ? "button-enabled" : "button-disabled"}
                >
                  Continuar
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
      </div>
      {isSuccess && (
        <>
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
          />
          <ModalGlobal
            isOpen={true}
            onClose={handleCloseModal}
            title="¡Bienvenido a Liquiboxes!"
            body="Enhorabuena, ya eres un comercio de Liquiboxes. ¡Esperamos que disfrutes de nuestra plataforma!"
            buttonBody="Continuar"
            className="welcome-modal"
          />
        </>
      )}
    </div>
  );
}
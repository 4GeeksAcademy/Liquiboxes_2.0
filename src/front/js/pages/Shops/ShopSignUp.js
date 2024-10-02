import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Context } from "../../store/appContext";
import { registerAndLogin } from "../../component/AuthenticationUtils";
import FullScreenConfetti from "../../component/FullScreenConfetti";
import ModalGlobal from '../../component/ModalGlobal'
import "../../../styles/signup.css";
import Spinner from "../../component/Spinner";


const STEPS = [
  { title: "Datos del Propietario", description: "Información sobre el dueño de la tienda", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850499/Smartphone_User_y6d64l.gif" },
  { title: "Datos de la Tienda", description: "Detalles sobre tu negocio", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850497/Online_Shopping_Store_uvucsy.gif" },
  { title: "Cuenta", description: "Crea tu cuenta segura", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850498/Smartphone_Lock_cvnebi.gif" },
  { title: "Categorías", description: "Selecciona las categorías de tus productos", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850497/Filter_Item_altaic.gif" },
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
    confirmPassword: "",
    categories: [],
    business_core: "",
    shop_description: "",
    shop_summary: "",
    image_shop_url: null
  });
  const [isStepValid, setIsStepValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userType, setUserType] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false)


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
    let stepErrors = {};
    switch (step) {
      case 1:
        if (!signupData.owner_name) stepErrors.owner_name = "El nombre es requerido";
        if (!signupData.owner_surname) stepErrors.owner_surname = "El apellido es requerido";
        break;
      case 2:
        if (!signupData.shop_name) stepErrors.shop_name = "El nombre de la tienda es requerido";
        if (!signupData.shop_address) stepErrors.shop_address = "La dirección de la tienda es requerida";
        if (!signupData.postal_code) stepErrors.postal_code = "El código postal es requerido";
        else if (!/^\d{5}$/.test(signupData.postal_code)) stepErrors.postal_code = "El código postal debe tener 5 dígitos";
        break;
      case 3:
        if (!signupData.email) stepErrors.email = "El email es requerido";
        else if (!/\S+@\S+\.\S+/.test(signupData.email)) stepErrors.email = "El email no es válido";
        if (!signupData.password) stepErrors.password = "La contraseña es requerida";
        else if (signupData.password.length < 8) stepErrors.password = "La contraseña debe tener al menos 8 caracteres";
        if (!signupData.confirmPassword) stepErrors.confirmPassword = "Confirma tu contraseña";
        else if (signupData.password !== signupData.confirmPassword) stepErrors.confirmPassword = "Las contraseñas no coinciden";
        break;
      case 4:
        if (signupData.categories.length === 0) stepErrors.categories = "Selecciona al menos una categoría";
        break;
      case 5:
        if (!signupData.business_core) stepErrors.business_core = "El core del negocio es requerido";
        else if (signupData.business_core.length < 10) stepErrors.business_core = "El core del negocio debe tener al menos 10 caracteres";
        break;
      case 6:
        if (!signupData.shop_description) stepErrors.shop_description = "La descripción de la tienda es requerida";
        else if (signupData.shop_description.length < 50) stepErrors.shop_description = "La descripción debe tener al menos 50 caracteres";
        break;
      case 7:
        if (!signupData.shop_summary) stepErrors.shop_summary = "El resumen de la tienda es requerido";
        else if (signupData.shop_summary.split(' ').length > 10) stepErrors.shop_summary = "El resumen no debe exceder las 10 palabras";
        if (!signupData.image_shop_url) stepErrors.image_shop_url = "La imagen de la tienda es requerida";
        break;
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  useEffect(() => {
    setIsStepValid(validateStep());
  }, [signupData, step]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(null);
    setIsSubmitted(true)

    if (!validateStep()) return;

    if (step < STEPS.length) {
      setIsSubmitted(false)
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
        setLoading(true)
        const response = await registerAndLogin(`${process.env.BACKEND_URL}/shops/register`, formData);
        setUserType(response.user_type);
        setLoading(false)
        setIsSuccess(true);
      } catch (error) {
        setErrors("Error en el registro o inicio de sesión. Por favor, inténtalo de nuevo.");
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
          <div className="signup-step-content">
            <h2 className="signup-step-question">¿Cuáles son los datos del propietario?</h2>
            <div className="signup-input-group">
              <label htmlFor="owner_name">Nombre del Propietario</label>
              <input
                id="owner_name"
                type="text"
                name="owner_name"
                value={signupData.owner_name}
                onChange={handleChange}
                className="signup-input"
                placeholder="Ingrese el nombre del propietario"
              />
              {isSubmitted && errors.owner_name && <p className="signup-error-message">{errors.owner_name}</p>}
            </div>
            <div className="signup-input-group">
              <label htmlFor="owner_surname">Apellido del Propietario</label>
              <input
                id="owner_surname"
                type="text"
                name="owner_surname"
                value={signupData.owner_surname}
                onChange={handleChange}
                className="signup-input"
                placeholder="Ingrese el apellido del propietario"
              />
              {isSubmitted && errors.owner_surname && <p className="signup-error-message">{errors.owner_surname}</p>}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="signup-step-content">
            <h2 className="signup-step-question">Datos de la Tienda</h2>
            <div className="signup-input-group">
              <label htmlFor="shop_name">Nombre de la Tienda</label>
              <input
                id="shop_name"
                type="text"
                name="shop_name"
                value={signupData.shop_name}
                onChange={handleChange}
                className="signup-input"
                placeholder="Ingrese el nombre de la tienda"
              />
              {isSubmitted && errors.shop_name && <p className="signup-error-message">{errors.shop_name}</p>}
            </div>
            <div className="signup-input-group">
              <label htmlFor="shop_address">Dirección de la Tienda</label>
              <input
                id="shop_address"
                type="text"
                name="shop_address"
                value={signupData.shop_address}
                onChange={handleChange}
                className="signup-input"
                placeholder="Ingrese la dirección de la tienda"
              />
              {isSubmitted && errors.shop_address && <p className="signup-error-message">{errors.shop_address}</p>}
            </div>
            <div className="signup-input-group">
              <label htmlFor="postal_code">Código Postal</label>
              <input
                id="postal_code"
                type="text"
                name="postal_code"
                value={signupData.postal_code}
                onChange={handleChange}
                className="signup-input"
                placeholder="Código Postal (5 dígitos)"
                maxLength="5"
                pattern="\d{5}"
              />
              {isSubmitted && errors.postal_code && <p className="signup-error-message">{errors.postal_code}</p>}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="signup-step-content">
            <h2 className="signup-step-question">Crea tu cuenta</h2>
            <div className="signup-input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={signupData.email}
                onChange={handleChange}
                className="signup-input"
                placeholder="Email"
              />
              {isSubmitted && errors.email && <p className="signup-error-message">{errors.email}</p>}
            </div>
            <div className="signup-input-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                name="password"
                value={signupData.password}
                onChange={handleChange}
                className="signup-input"
                placeholder="Contraseña"
              />
              {isSubmitted && errors.password && <p className="signup-error-message">{errors.password}</p>}
            </div>
            <div className="signup-input-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={signupData.confirmPassword || ''}
                onChange={handleChange}
                className="signup-input"
                placeholder="Confirmar Contraseña"
              />
              {isSubmitted && errors.confirmPassword && <p className="signup-error-message">{errors.confirmPassword}</p>}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="signup-step-content">
            <h2 className="signup-step-question">Categorías</h2>
            <div className="signup-checkbox-group">
              <p>Selecciona las categorías de tus productos (máximo 3):</p>
              <div className="signup-checkbox-options">
                {CATEGORIES.map(category => (
                  <label key={category} className="signup-checkbox-label">
                    <input
                      type="checkbox"
                      name="categories"
                      value={category}
                      checked={signupData.categories.includes(category)}
                      onChange={handleChange}
                      disabled={signupData.categories.length >= 3 && !signupData.categories.includes(category)}
                      className="signup-checkbox"
                    /> {category}
                  </label>
                ))}
              </div>
            </div>
            {isSubmitted && errors.categories && <p className="signup-error-message">{errors.categories}</p>}
          </div>
        );
      case 5:
        return (
          <div className="signup-step-content">
            <h2 className="signup-step-question">Core del Negocio</h2>
            <p className="signup-field-description">
              El core de tu negocio es lo que te hace único. Describe brevemente la esencia de tu tienda,
              lo que te diferencia de la competencia y por qué los clientes deberían elegirte.
              Esta información nos ayudará a conectarte con los usuarios adecuados.
            </p>
            <div className="signup-input-group">
              <label htmlFor="business_core">Core del Negocio</label>
              <textarea
                id="business_core"
                name="business_core"
                value={signupData.business_core}
                onChange={handleChange}
                className="signup-input"
                placeholder="Describe el core de tu negocio (mínimo 10 caracteres)"
                rows="4"
              />
              {isSubmitted && errors.business_core && <p className="signup-error-message">{errors.business_core}</p>}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="signup-step-content">
            <h2 className="signup-step-question">Descripción de la Tienda</h2>
            <p className="signup-field-description">
              Tu descripción es la primera impresión que los usuarios tendrán de tu tienda.
              Cuéntanos tu historia, tus valores, y lo que hace especial a tu negocio.
              Sé auténtico y detallado, ya que esta información ayudará a los usuarios a
              conectar con tu marca y entender lo que ofreces.
            </p>
            <div className="signup-input-group">
              <label htmlFor="shop_description">Descripción de la Tienda</label>
              <textarea
                id="shop_description"
                name="shop_description"
                value={signupData.shop_description}
                onChange={handleChange}
                className="signup-input"
                placeholder="Describe tu tienda en detalle (mínimo 50 caracteres)"
                rows="6"
              />
              {isSubmitted && errors.shop_description && <p className="signup-error-message">{errors.shop_description}</p>}
            </div>
          </div>
        );
      case 7:
        return (
          <div className="signup-step-content">
            <h2 className="signup-step-question">Resumen y Finalización</h2>
            <p className="signup-field-description">
              Proporciona un breve resumen de tu tienda en no más de 10 palabras.
              Este resumen aparecerá en los resultados de búsqueda y en las vistas previas de tu tienda.
            </p>
            <div className="signup-input-group">
              <label htmlFor="shop_summary">Resumen de la Tienda</label>
              <input
                id="shop_summary"
                type="text"
                name="shop_summary"
                value={signupData.shop_summary}
                onChange={handleChange}
                className="signup-input"
                placeholder="Resumen de la tienda (máximo 10 palabras)"
              />
              <p className="signup-word-count">
                Palabras: {signupData.shop_summary.split(' ').filter(word => word !== '').length}/10
              </p>
              {isSubmitted && errors.shop_summary && <p className="signup-error-message">{errors.shop_summary}</p>}
            </div>
            <p className="signup-field-description">
              Sube una imagen representativa de tu tienda. Esta imagen se mostrará en tu perfil y en los resultados de búsqueda.
            </p>
            <div className="signup-input-group">
              <label htmlFor="image_shop_url">Imagen de la Tienda</label>
              <input
                id="image_shop_url"
                type="file"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setSignUpData(prev => ({ ...prev, image_shop_url: file }));
                  }
                }}
                accept="image/*"
                className="signup-input"
              />
              {signupData.image_shop_url && (
                <img
                  src={URL.createObjectURL(signupData.image_shop_url)}
                  alt="Vista previa de la imagen de la tienda"
                  className="signup-preview-image"
                />
              )}
              {isSubmitted && errors.image_shop_url && <p className="signup-error-message">{errors.image_shop_url}</p>}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) return <Spinner />

  return (
    <div className="signup-container">
      <div className="signup-content">
        <div className="signup-animation-section">
          <h2 className="signup-step-title">{STEPS[step - 1].title}</h2>
          <div className="signup-animation-wrapper">
            <img
              src={STEPS[step - 1].src}
              alt={STEPS[step - 1].title}
              className="signup-step-animation"
            />
          </div>
          <p className="signup-step-description">{STEPS[step - 1].description}</p>
        </div>
        <div className="signup-form-section">
          <button
            className="signup-back-button"
            onClick={() => step === 1 ? navigate('/') : setStep(prev => prev - 1)}
          >
            ←
          </button>
          <form onSubmit={handleSubmit} noValidate>
            {renderStepContent()}
            <div className="signup-navigation-buttons">
              <button
                type="submit"
                className="signup-next-button"
              >
                {step < STEPS.length ? "Continuar" : "Registrar Tienda"}
              </button>
            </div>
          </form>
        </div>
      </div>
      {isSuccess && (
        <>
          <FullScreenConfetti />
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
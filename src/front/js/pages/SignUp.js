import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import '../../styles/signup.css';
import { Context } from "../store/appContext";
import { registerAndLogin } from "../component/AuthenticationUtils";
import FullScreenConfetti from '../component/FullScreenConfetti'
import ModalGlobal from '../component/ModalGlobal'
import Spinner from "../component/Spinner";


const STEPS = [
  { title: "Datos Personales", description: "Cuéntanos un poco sobre ti", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850499/Smartphone_User_y6d64l.gif" },
  { title: "Cuenta", description: "Crea tu cuenta segura", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850498/Smartphone_Lock_cvnebi.gif" },
  { title: "Tallas", description: "Ayúdanos a personalizar tu experiencia", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850497/Filter_Item_altaic.gif" },
  { title: "Estilo", description: "Define tus preferencias de estilo", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850498/Shopping_Bag_jlntsk.gif" },
  { title: "Preferencias", description: "Dinos qué te gusta y qué no", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850498/Remove_Item_sqgou4.gif" },
  { title: "Últimos detalles", description: "Solo necesitamos unos últimos detalles para completar tu perfil", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850497/Checklist_l0hzyf.gif" }
];

const SIZES = {
  upper: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  lower: Array.from({ length: 35 }, (_, i) => i + 26),
  shoe: Array.from({ length: 27 }, (_, i) => i + 28)
};

const COLORS = ['Rojo', 'Azul', 'Verde', 'Amarillo', 'Naranja', 'Morado', 'Rosa', 'Marrón', 'Negro', 'Blanco'];
const CLOTHES = ['Camisetas', 'Pantalones', 'Faldas', 'Vestidos', 'Chaquetas', 'Abrigos', 'Zapatos', 'Accesorios', 'Ropa Interior', 'Trajes'];
const PROFESSIONS = ['Salud', 'Informática', 'Educación', 'Ingeniería', 'Artes', 'Finanzas', 'Ventas', 'Administración', 'Construcción', 'Hostelería', 'Estudiante', 'Otro'];

export default function SignUp() {
  const [step, setStep] = useState(1);
  const [signupData, setSignUpData] = useState({
    name: "", surname: "", gender: "", address: "", postalCode: "",
    email: "", password: "", confirmPassword: "", upperSize: "", lowerSize: "", capSize: "", shoeSize: "",
    notColors: [], stamps: "", fit: "", notClothes: [], categories: [], profession: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { store } = useContext(Context);
  const CATEGORIES = store.categories;
  const [isSuccess, setIsSuccess] = useState(false);
  const [userType, setUserType] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false)




  const { google_data, access_token } = location.state || {};

  useEffect(() => {
    if (google_data) {
      setSignUpData(prev => ({
        ...prev,
        name: google_data.name || prev.name,
        surname: google_data.surname || prev.surname,
        email: google_data.email || prev.email,
      }));
    }
  }, [google_data]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const maxItems = name === 'categories' ? 5 : 3;
      setSignUpData(prev => ({
        ...prev,
        [name]: checked
          ? [...prev[name], value].slice(0, maxItems)
          : prev[name].filter(item => item !== value)
      }));
    } else {
      setSignUpData(prev => ({ ...prev, [name]: value }));
    }
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep = (e,) => {
    e.preventDefault();
    e.stopPropagation();

    const newErrors = {};
    switch (step) {
      case 1:
        if (!signupData.name) newErrors.name = "El nombre es requerido";
        if (!signupData.surname) newErrors.surname = "El apellido es requerido";
        if (!signupData.gender) newErrors.gender = "El género es requerido";
        if (!signupData.address) {
          newErrors.address = "La dirección es requerida";
        } else if (signupData.address.length > 300) {
          newErrors.address = "La dirección no puede tener más de 300 caracteres";
          signupData.address = signupData.address.slice(0, 300);
        }
        if (!signupData.postalCode) newErrors.postalCode = "El código postal es requerido";
        else if (!/^\d{5}$/.test(signupData.postalCode)) newErrors.postalCode = "El código postal debe tener 5 dígitos";
        break;
      case 2:
        if (!signupData.email) newErrors.email = "El email es requerido";
        else if (!/\S+@\S+\.\S+/.test(signupData.email)) newErrors.email = "El email no es válido";
        if (!signupData.password) newErrors.password = "La contraseña es requerida";
        else if (signupData.password.length < 8) newErrors.password = "La contraseña debe tener al menos 8 caracteres";
        if (!signupData.confirmPassword) newErrors.confirmPassword = "Confirma tu contraseña";
        else if (signupData.password !== signupData.confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden";
        break;
      case 3:
        if (!signupData.upperSize) newErrors.upperSize = "La talla superior es requerida";
        if (!signupData.lowerSize) newErrors.lowerSize = "La talla inferior es requerida";
        if (!signupData.capSize) newErrors.capSize = "La talla de gorra o sombrero es requerida";
        if (!signupData.shoeSize) newErrors.shoeSize = "La talla de zapato es requerida";
        break;
      case 4:
        if (!signupData.stamps) newErrors.stamps = "La preferencia de estampado es requerida";
        if (!signupData.fit) newErrors.fit = "La preferencia de ajuste es requerida";
        break;
      case 5:
        break
      case 6:
        if (signupData.categories.length === 0) newErrors.categories = "Selecciona al menos una categoría";
        if (!signupData.profession) newErrors.profession = "La profesión es requerida";
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setError(null);

    try {
      setLoading(true)
      const response = await registerAndLogin(`${process.env.BACKEND_URL}/users/register`, signupData);
      setUserType(response.user_type);
      setLoading(false)

      setIsSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsSuccess(false);
    navigate("/home");
  };

  if (isSuccess) {
    return (
      <>
        <FullScreenConfetti />
        <ModalGlobal
          isOpen={true}
          onClose={handleCloseModal}
          title="¡Bienvenido a Liquiboxes!"
          body={`Enhorabuena, ya eres un ${userType === "user" ? "usuario" : "comercio"} de Liquiboxes. ¡Esperamos que disfrutes de nuestra plataforma!`}
          buttonBody="Continuar"
          className="welcome-modal"
        />
      </>
    );
  }


  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="signup-step-content">
            <h2 className="signup-step-question">¿Cuáles son tus datos personales?</h2>
            <div className="signup-input-group">
              <label htmlFor="name">Nombre</label>
              <input
                type="text"
                id="name"
                name="name"
                value={signupData.name}
                onChange={handleChange}
                placeholder="Nombre"
                className="signup-input"
              />
              {errors.name && <p className="signup-error-message">{errors.name}</p>}
            </div>
            <div className="signup-input-group">
              <label htmlFor="surname">Apellido</label>
              <input
                type="text"
                id="surname"
                name="surname"
                value={signupData.surname}
                onChange={handleChange}
                placeholder="Apellido"
                className="signup-input"
              />
              {errors.surname && <p className="signup-error-message">{errors.surname}</p>}
            </div>
            <div className="signup-input-group">
              <label htmlFor="gender">Género</label>
              <select
                id="gender"
                name="gender"
                value={signupData.gender}
                onChange={handleChange}
                className="signup-select"
              >
                <option value="">Selecciona género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="No especificado">No especificado</option>
              </select>
              {errors.gender && <p className="signup-error-message">{errors.gender}</p>}
            </div>
            <div className="signup-input-group">
              <label htmlFor="address">Dirección</label>
              <input
                type="text"
                id="address"
                name="address"
                value={signupData.address}
                onChange={handleChange}
                placeholder="Dirección"
                className="signup-input"
              />
              {errors.address && <p className="signup-error-message">{errors.address}</p>}
            </div>
            <div className="signup-input-group">
              <label htmlFor="postalCode">Código Postal</label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={signupData.postalCode}
                onChange={handleChange}
                placeholder="Código Postal"
                className="signup-input"
                maxLength="5"
                pattern="\d{5}"
              />
              {errors.postalCode && <p className="signup-error-message">{errors.postalCode}</p>}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="signup-step-content">
            <h2 className="signup-step-question">Crea tu cuenta</h2>
            <div className="signup-input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={signupData.email}
                onChange={handleChange}
                placeholder="Email"
                className="signup-input"
              />
              {errors.email && <p className="signup-error-message">{errors.email}</p>}
            </div>
            <div className="signup-input-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={signupData.password}
                onChange={handleChange}
                placeholder="Contraseña"
                className="signup-input"
              />
              {errors.password && <p className="signup-error-message">{errors.password}</p>}
            </div>
            <div className="signup-input-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={signupData.confirmPassword || ''}
                onChange={handleChange}
                placeholder="Confirmar Contraseña"
                className="signup-input"
              />
              {errors.confirmPassword && <p className="signup-error-message">{errors.confirmPassword}</p>}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="signup-step-content">
            <h2 className="signup-step-question">¿Cuáles son tus tallas?</h2>
            <div className="signup-input-group">
              <label htmlFor="upperSize">Talla Superior</label>
              <select
                id="upperSize"
                name="upperSize"
                value={signupData.upperSize}
                onChange={handleChange}
                className="signup-select"
              >
                <option value="">Selecciona talla superior</option>
                {SIZES.upper.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              {errors.upperSize && <p className="signup-error-message">{errors.upperSize}</p>}
            </div>
            <div className="signup-input-group">
              <label htmlFor="lowerSize">Talla Inferior</label>
              <select
                id="lowerSize"
                name="lowerSize"
                value={signupData.lowerSize}
                onChange={handleChange}
                className="signup-select"
              >
                <option value="">Selecciona talla inferior</option>
                {SIZES.lower.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              {errors.lowerSize && <p className="signup-error-message">{errors.lowerSize}</p>}
            </div>
            <div className="signup-input-group">
              <label htmlFor="capSize">Talla de Gorra</label>
              <select
                id="capSize"
                name="capSize"
                value={signupData.capSize}
                onChange={handleChange}
                className="signup-select"
              >
                <option value="">Selecciona talla de gorra</option>
                {SIZES.upper.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              {errors.capSize && <p className="signup-error-message">{errors.capSize}</p>}
            </div>
            <div className="signup-input-group">
              <label htmlFor="shoeSize">Talla de Zapato</label>
              <select
                id="shoeSize"
                name="shoeSize"
                value={signupData.shoeSize}
                onChange={handleChange}
                className="signup-select"
              >
                <option value="">Selecciona talla de zapato</option>
                {SIZES.shoe.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              {errors.shoeSize && <p className="signup-error-message">{errors.shoeSize}</p>}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="signup-step-content">
            <h2 className="signup-step-question">Define tus preferencias de estilo</h2>

            <div className="signup-input-group">
              <label htmlFor="stamps">Preferencia de Estampado</label>
              <select
                id="stamps"
                name="stamps"
                value={signupData.stamps}
                onChange={handleChange}
                className="signup-select"
              >
                <option value="">Selecciona preferencia de estampado</option>
                <option value="Estampados">Estampados</option>
                <option value="Lisos">Lisos</option>
              </select>
              {errors.stamps && <p className="signup-error-message">{errors.stamps}</p>}
            </div>
            <div className="signup-input-group">
              <label htmlFor="fit">Preferencia de Ajuste</label>
              <select
                id="fit"
                name="fit"
                value={signupData.fit}
                onChange={handleChange}
                className="signup-select"
              >
                <option value="">Selecciona preferencia de ajuste</option>
                <option value="Ajustado">Ajustado</option>
                <option value="Holgado">Holgado</option>
              </select>
              {errors.fit && <p className="signup-error-message">{errors.fit}</p>}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="signup-step-content">
            <h2 className="signup-step-question">Dinos si hay alguna prenda o algún color que no te represente</h2>
            <div className="signup-checkbox-group">
              <p>Opcional: ¿Hay alguna prenda que no vaya con tu estilo? (máximo 3):</p>
              <div className="signup-checkbox-options">
                {CLOTHES.map(cloth => (
                  <label key={cloth} className="signup-checkbox-label">
                    <input
                      type="checkbox"
                      name="notClothes"
                      value={cloth}
                      checked={signupData.notClothes.includes(cloth)}
                      onChange={handleChange}
                      disabled={signupData.notClothes.length >= 3 && !signupData.notClothes.includes(cloth)}
                      className="signup-checkbox"
                    />
                    {cloth}
                  </label>
                ))}
              </div>
            </div>
            <div className="signup-checkbox-group">
              <p>Opcional: ¿Hay algún color que no te identifique? (Máximo 3):</p>
              <div className="signup-checkbox-options">
                {COLORS.map(color => (
                  <label key={color} className="signup-checkbox-label">
                    <input
                      type="checkbox"
                      name="notColors"
                      value={color}
                      checked={signupData.notColors.includes(color)}
                      onChange={handleChange}
                      disabled={signupData.notColors.length >= 3 && !signupData.notColors.includes(color)}
                      className="signup-checkbox"
                    />
                    {color}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="signup-step-content">
            <h2 className="signup-step-question">Últimos detalles para completar tu perfil</h2>
            <div className="signup-checkbox-group">
              <p>Categorías con las que te identificas (máximo 5):</p>
              <div className="signup-checkbox-options">
                {CATEGORIES.map(category => (
                  <label key={category} className="signup-checkbox-label">
                    <input
                      type="checkbox"
                      name="categories"
                      value={category}
                      checked={signupData.categories.includes(category)}
                      onChange={handleChange}
                      disabled={signupData.categories.length >= 5 && !signupData.categories.includes(category)}
                      className="signup-checkbox"
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>
            {errors.categories && <p className="signup-error-message">{errors.categories}</p>}
            <div className="signup-input-group">
              <label htmlFor="profession">Profesión</label>
              <select
                id="profession"
                name="profession"
                value={signupData.profession}
                onChange={handleChange}
                className="signup-select"
              >
                <option value="">Selecciona tu profesión</option>
                {PROFESSIONS.map(profession => (
                  <option key={profession} value={profession}>{profession}</option>
                ))}
              </select>
              {errors.profession && <p className="signup-error-message">{errors.profession}</p>}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderNavigationButtons = () => {
    if (step < 5) {
      return (
        <button
          type="button"
          onClick={(e) => {
            if (validateStep(e)) setStep(prev => prev + 1);
          }}
          className="signup-next-button"
        >
          Continuar
        </button>
      );
    } else if (step === 5) {
      const isStepEmpty = signupData.notClothes.length === 0 && signupData.notColors.length === 0;
      return (
        <button
          type="button"
          onClick={() => setStep(prev => prev + 1)}
          className={isStepEmpty ? 'btn btn-outline-secondary' : 'signup-next-button'}
        >
          {isStepEmpty ? 'Omitir' : 'Continuar'}
        </button>
      );
    } else {
      return (
        <button type="button" className="signup-next-button" onClick={(e) => {
          if (validateStep(e)) handleSubmit(e)
        }}
        >
          Registrarse
        </button>
      );
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
            onClick={() => { step === 1 ? navigate('/') : setStep(prev => prev - 1); setError(null); }}
          >
            ←
          </button>
          <form noValidate>
            {renderStep()}
            {error && <p className="signup-error-message">{error}</p>}

            <div className="signup-navigation-buttons">
              {renderNavigationButtons()}
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
            body={`Enhorabuena, ya eres un ${userType === "user" ? "usuario" : "comercio"} de Liquiboxes. ¡Esperamos que disfrutes de nuestra plataforma!`}
            buttonBody="Continuar"
            className="welcome-modal"
          />
        </>
      )}
    </div>
  );
}
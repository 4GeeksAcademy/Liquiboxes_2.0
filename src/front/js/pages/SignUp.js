import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import '../../styles/signup.css';
import { Context } from "../store/appContext";
import { registerAndLogin } from "../component/AuthenticationUtils";
import Confetti from 'react-confetti';
import ModalGlobal from '../component/ModalGlobal'


const STEPS = [
  { title: "Datos Personales", description: "Cuéntanos un poco sobre ti", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850499/Smartphone_User_y6d64l.gif" },
  { title: "Cuenta", description: "Crea tu cuenta segura", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850498/Smartphone_Lock_cvnebi.gif" },
  { title: "Tallas", description: "Ayúdanos a personalizar tu experiencia", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850497/Filter_Item_altaic.gif" },
  { title: "Estilo", description: "Define tus preferencias de estilo", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850498/Shopping_Bag_jlntsk.gif" },
  { title: "Preferencias", description: "Dinos qué te gusta y qué no", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850498/Remove_Item_sqgou4.gif" },
  { title: "Finalizar", description: "Últimos detalles para completar tu perfil", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850497/Checklist_l0hzyf.gif" }
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
    email: "", password: "", upperSize: "", lowerSize: "", capSize: "", shoeSize: "",
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

  const validateStep = () => {
    const newErrors = {};
    switch (step) {
      case 1:
        if (!signupData.name) newErrors.name = "El nombre es requerido";
        if (!signupData.surname) newErrors.surname = "El apellido es requerido";
        if (!signupData.gender) newErrors.gender = "El género es requerido";
        if (!signupData.address) newErrors.address = "La dirección es requerida";
        if (!signupData.postalCode) newErrors.postalCode = "El código postal es requerido";
        else if (!/^\d{5}$/.test(signupData.postalCode)) newErrors.postalCode = "El código postal debe tener 5 dígitos";
        break;
      case 2:
        if (!signupData.email) newErrors.email = "El email es requerido";
        else if (!/\S+@\S+\.\S+/.test(signupData.email)) newErrors.email = "El email no es válido";
        if (!signupData.password) newErrors.password = "La contraseña es requerida";
        else if (signupData.password.length < 8) newErrors.password = "La contraseña debe tener al menos 8 caracteres";
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
    setError(null);
    if (!validateStep()) return;

    try {
      const { user_type } = await registerAndLogin(`${process.env.BACKEND_URL}/users/register`, signupData);
      setUserType(user_type);
      setIsSuccess(true);
    } catch (error) {
      setError("Error en el registro o inicio de sesión. Por favor, inténtalo de nuevo.");
      console.error(error);
    }
  };

  const handleCloseModal = () => {
    setIsSuccess(false);
    navigate("/home");
  };

  if (isSuccess) {
    return (
      <>
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
        />
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


  const renderCheckboxGroup = (name, options, maxItems) => (
    <div className="checkbox-group">
      <p>{name === 'notColors' ? 'Colores que menos te gustan' : 'Prendas que menos te gustan'} (máximo {maxItems}):</p>
      {options.map(option => (
        <label key={option}>
          <input
            type="checkbox"
            name={name}
            value={option}
            checked={signupData[name].includes(option)}
            onChange={handleChange}
            disabled={signupData[name].length >= maxItems && !signupData[name].includes(option)}
          /> {option}
        </label>
      ))}
    </div>
  );

  const renderSelect = (name, options, placeholder) => (
    <select name={name} value={signupData[name]} onChange={handleChange} required>
      <option value="">{placeholder}</option>
      {options.map(option => (
        <option key={option} value={typeof option === 'number' ? option : option.toLowerCase()}>
          {option}
        </option>
      ))}
    </select>
  );



  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="step-content">
            <h2 className="step-question">¿Cuáles son tus datos personales?</h2>
            <div className="input-group">
              <input
                type="text"
                name="name"
                value={signupData.name}
                onChange={handleChange}
                placeholder="Nombre"
                className="input"
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>
            <div className="input-group">
              <input
                type="text"
                name="surname"
                value={signupData.surname}
                onChange={handleChange}
                placeholder="Apellido"
                className="input"
              />
              {errors.surname && <span className="error">{errors.surname}</span>}
            </div>
            <div className="input-group">
              <select
                name="gender"
                value={signupData.gender}
                onChange={handleChange}
                className="input"
              >
                <option value="">Selecciona género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="No especificado">No especificado</option>
              </select>
              {errors.gender && <span className="error">{errors.gender}</span>}
            </div>
            <div className="input-group">
              <input
                type="text"
                name="address"
                value={signupData.address}
                onChange={handleChange}
                placeholder="Dirección"
                className="input"
              />
              {errors.address && <span className="error">{errors.address}</span>}
            </div>
            <div className="input-group">
              <input
                type="text"
                name="postalCode"
                value={signupData.postalCode}
                onChange={handleChange}
                placeholder="Código Postal"
                className="input"
                maxLength="5"
                pattern="\d{5}"
              />
              {errors.postalCode && <span className="error">{errors.postalCode}</span>}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            <h2 className="step-question">Crea tu cuenta</h2>
            <div className="input-group">
              <input
                type="email"
                name="email"
                value={signupData.email}
                onChange={handleChange}
                placeholder="Email"
                className="input"
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
            <div className="input-group">
              <input
                type="password"
                name="password"
                value={signupData.password}
                onChange={handleChange}
                placeholder="Contraseña"
                className="input"
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step-content">
            <h2 className="step-question">¿Cuáles son tus tallas?</h2>
            <div className="input-group">
              <select
                name="upperSize"
                value={signupData.upperSize}
                onChange={handleChange}
                className="input"
              >
                <option value="">Selecciona talla superior</option>
                {SIZES.upper.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              {errors.upperSize && <span className="error">{errors.upperSize}</span>}
            </div>
            <div className="input-group">
              <select
                name="lowerSize"
                value={signupData.lowerSize}
                onChange={handleChange}
                className="input"
              >
                <option value="">Selecciona talla inferior</option>
                {SIZES.lower.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              {errors.lowerSize && <span className="error">{errors.lowerSize}</span>}
            </div>
            <div className="input-group">
              <select
                name="capSize"
                value={signupData.capSize}
                onChange={handleChange}
                className="input"
              >
                <option value="">Selecciona talla de gorra</option>
                {SIZES.upper.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              {errors.capSize && <span className="error">{errors.capSize}</span>}
            </div>
            <div className="input-group">
              <select
                name="shoeSize"
                value={signupData.shoeSize}
                onChange={handleChange}
                className="input"
              >
                <option value="">Selecciona talla de zapato</option>
                {SIZES.shoe.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              {errors.shoeSize && <span className="error">{errors.shoeSize}</span>}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="step-content">
            <h2 className="step-question">Define tus preferencias de estilo</h2>
            <div className="checkbox-group">
              <p>Colores que menos te gustan (máximo 3):</p>
              <div className="checkbox-options">
                {COLORS.map(color => (
                  <label key={color} className="checkbox-label">
                    <input
                      type="checkbox"
                      name="notColors"
                      value={color}
                      checked={signupData.notColors.includes(color)}
                      onChange={handleChange}
                      disabled={signupData.notColors.length >= 3 && !signupData.notColors.includes(color)}
                      className="checkbox"
                    />
                    {color}
                  </label>
                ))}
              </div>
            </div>
            <div className="input-group">
              <select
                name="stamps"
                value={signupData.stamps}
                onChange={handleChange}
                className="input"
              >
                <option value="">Selecciona preferencia de estampado</option>
                <option value="Estampados">Estampados</option>
                <option value="Lisos">Lisos</option>
              </select>
              {errors.stamps && <span className="error">{errors.stamps}</span>}
            </div>
            <div className="input-group">
              <select
                name="fit"
                value={signupData.fit}
                onChange={handleChange}
                className="input"
              >
                <option value="">Selecciona preferencia de ajuste</option>
                <option value="Ajustado">Ajustado</option>
                <option value="Holgado">Holgado</option>
              </select>
              {errors.fit && <span className="error">{errors.fit}</span>}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="step-content">
            <h2 className="step-question">Dinos qué prendas prefieres</h2>
            <div className="checkbox-group">
              <p>Prendas que menos te gustan (máximo 3):</p>
              <div className="checkbox-options">
                {CLOTHES.map(cloth => (
                  <label key={cloth} className="checkbox-label">
                    <input
                      type="checkbox"
                      name="notClothes"
                      value={cloth}
                      checked={signupData.notClothes.includes(cloth)}
                      onChange={handleChange}
                      disabled={signupData.notClothes.length >= 3 && !signupData.notClothes.includes(cloth)}
                      className="checkbox"
                    />
                    {cloth}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="step-content">
            <h2 className="step-question">Últimos detalles para completar tu perfil</h2>
            <div className="checkbox-group">
              <p>Categorías con las que te identificas (máximo 5):</p>
              <div className="checkbox-options">
                {CATEGORIES.map(category => (
                  <label key={category} className="checkbox-label">
                    <input
                      type="checkbox"
                      name="categories"
                      value={category}
                      checked={signupData.categories.includes(category)}
                      onChange={handleChange}
                      disabled={signupData.categories.length >= 5 && !signupData.categories.includes(category)}
                      className="checkbox"
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>
            {errors.categories && <span className="error">{errors.categories}</span>}
            <div className="input-group">
              <select
                name="profession"
                value={signupData.profession}
                onChange={handleChange}
                className="input"
              >
                <option value="">Selecciona tu profesión</option>
                {PROFESSIONS.map(profession => (
                  <option key={profession} value={profession}>{profession}</option>
                ))}
              </select>
              {errors.profession && <span className="error">{errors.profession}</span>}
            </div>
          </div>
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
            {renderStep()}
            <div className="navigation-buttons">
              {step < 6 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep()) setStep(prev => prev + 1);
                  }}
                  className="next-button"
                >
                  Continuar
                </button>
              ) : (
                <button type="submit" className="submit-button">
                  Registrarse
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      {isSuccess && (
        <>
          <Confetti width={window.innerWidth} height={window.innerHeight} />
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
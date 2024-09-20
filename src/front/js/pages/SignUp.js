import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faTshirt, faShoePrints, faPalette, faTextHeight, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import "../../styles/signup.css";
import { Context } from "../store/appContext";
import { registerAndLogin } from "../component/AuthenticationUtils";
import Confetti from 'react-confetti';
import ModalGlobal from '../component/ModalGlobal'


const STEPS = [
  { icon: faUser, title: "Datos Personales", description: "Cuéntanos un poco sobre ti" },
  { icon: faEnvelope, title: "Cuenta", description: "Crea tu cuenta segura" },
  { icon: faTshirt, title: "Tallas", description: "Ayúdanos a personalizar tu experiencia" },
  { icon: faPalette, title: "Estilo", description: "Define tus preferencias de estilo" },
  { icon: faTextHeight, title: "Preferencias", description: "Dinos qué te gusta y qué no" },
  { icon: faBriefcase, title: "Finalizar", description: "Últimos detalles para completar tu perfil" }
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
          <>
            <input type="text" name="name" value={signupData.name} onChange={handleChange} placeholder="Nombre" required aria-label="Nombre" />
            {errors.name && <span className="error">{errors.name}</span>}
            <input type="text" name="surname" value={signupData.surname} onChange={handleChange} placeholder="Apellido" required aria-label="Apellido" />
            {errors.surname && <span className="error">{errors.surname}</span>}
            {renderSelect("gender", ["Masculino", "Femenino", "No especificado"], "Selecciona género")}
            {errors.gender && <span className="error">{errors.gender}</span>}
            <input type="text" name="address" value={signupData.address} onChange={handleChange} placeholder="Dirección" required aria-label="Dirección" />
            {errors.address && <span className="error">{errors.address}</span>}
            <input type="text" name="postalCode" value={signupData.postalCode} onChange={handleChange} placeholder="Código Postal" required aria-label="Código Postal" maxLength="5" pattern="\d{5}" />
            {errors.postalCode && <span className="error">{errors.postalCode}</span>}
          </>
        );
      case 2:
        return (
          <>
            <input type="email" name="email" value={signupData.email} onChange={handleChange} placeholder="Email" required aria-label="Email" />
            {errors.email && <span className="error">{errors.email}</span>}
            <input type="password" name="password" value={signupData.password} onChange={handleChange} placeholder="Contraseña" required aria-label="Contraseña" minLength="8" />
            {errors.password && <span className="error">{errors.password}</span>}
          </>
        );
      case 3:
        return (
          <>
            {renderSelect("upperSize", SIZES.upper, "Talla Superior")}
            {errors.upperSize && <span className="error">{errors.upperSize}</span>}
            {renderSelect("lowerSize", SIZES.lower, "Talla Inferior")}
            {errors.lowerSize && <span className="error">{errors.lowerSize}</span>}
            {renderSelect("capSize", SIZES.upper, "Talla de Gorra o Sombrero")}
            {errors.capSize && <span className="error">{errors.capSize}</span>}
            {renderSelect("shoeSize", SIZES.shoe, "Talla de Zapato (EU)")}
            {errors.shoeSize && <span className="error">{errors.shoeSize}</span>}
          </>
        );
      case 4:
        return (
          <>
            {renderCheckboxGroup("notColors", COLORS, 3)}
            {renderSelect("stamps", ["Estampados", "Lisos"], "Preferencia de Estampado")}
            {errors.stamps && <span className="error">{errors.stamps}</span>}
            {renderSelect("fit", ["Ajustado", "Holgado"], "Preferencia de Ajuste")}
            {errors.fit && <span className="error">{errors.fit}</span>}
          </>
        );
      case 5:
        return renderCheckboxGroup("notClothes", CLOTHES, 3);
      case 6:
        return (
          <>
            <div className="checkbox-group">
              <p>Categorías con las que te identificas (máximo 5):</p>
              {CATEGORIES.map(category => (
                <label key={category}>
                  <input
                    type="checkbox"
                    name="categories"
                    value={category}
                    checked={signupData.categories.includes(category)}
                    onChange={handleChange}
                    disabled={signupData.categories.length >= 5 && !signupData.categories.includes(category)}
                  /> {category}
                </label>
              ))}
            </div>
            {errors.categories && <span className="error">{errors.categories}</span>}
            {renderSelect("profession", PROFESSIONS, "Selecciona tu profesión")}
            {errors.profession && <span className="error">{errors.profession}</span>}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-progress" role="progressbar" aria-valuenow={step} aria-valuemin="1" aria-valuemax="6">
        {STEPS.map((s, index) => (
          <div key={index} className={`step ${index + 1 === step ? 'active' : ''} ${index + 1 < step ? 'completed' : ''}`}>
            <div className="step-icon">
              <FontAwesomeIcon icon={s.icon} aria-hidden="true" />
            </div>
            <div className="step-label">{s.title}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <div className="signup-content">
          <div className="step-info">
            <h2>{STEPS[step - 1].title}</h2>
            <p>{STEPS[step - 1].description}</p>
          </div>
          <div className="step-form">
            {renderStep()}
          </div>
        </div>
        {errors.submit && <div className="error-message">{errors.submit}</div>}
        <div className="navigation-buttons">
          {step > 1 && <button type="button" onClick={() => setStep(prev => prev - 1)}>Anterior</button>}
          {step < 6 ? (
            <button
              type="button"
              onClick={() => {
                if (validateStep()) setStep(prev => prev + 1);
              }}
            >
              Siguiente
            </button>
          ) : (
            <button type="submit">Registrarse</button>
          )}
        </div>
      </form>
    </div>
  );
}
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faVenusMars,
  faMapMarkerAlt,
  faMapPin,
  faTshirt,
  faHatCowboy,
  faShoePrints,
  faPalette,
  faTape,
  faBriefcase,
  faBan,
  faList,
  faBell,
  faShoppingBag,
  faHeadset,
  faPowerOff
} from '@fortawesome/free-solid-svg-icons';
import "../../styles/userdashboard.css";
import ProfileField from '../component/Profile/ProfileField';
import { Context } from '../store/appContext'
import UserNotifications from '../component/Profile/UserNotifications';
import UserMessages from '../component/Profile/UserMessages';
import ContactSupport from '../component/ShopHome/ContactSupport';
import ModalLogout from '../component/Modals/ModalLogout'
import UserPurchases from '../component/Profile/UserPurchases';
import ClimbingBoxLoader from "react-spinners/ClipLoader"

function UserDashboard() {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('notifications');
  const [isLoading, setIsLoading] = useState(true);
  const { store, actions } = useContext(Context)

  // Definiciones para opciones de selección
  const sizeOptions = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const lowerSizeOptions = Array.from({ length: 35 }, (_, i) => (i + 26).toString());
  const shoeSizeOptions = Array.from({ length: 27 }, (_, i) => (i + 28).toString());
  const colorOptions = ['Rojo', 'Azul', 'Verde', 'Amarillo', 'Naranja', 'Morado', 'Rosa', 'Marrón', 'Negro', 'Blanco'];
  const clothesOptions = ['Camisetas', 'Pantalones', 'Faldas', 'Vestidos', 'Chaquetas', 'Abrigos', 'Zapatos', 'Accesorios', 'Ropa Interior', 'Trajes'];
  const categoryOptions = store.categories;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true)

    const fetchUserData = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setError("No se encontró el token de autenticación");
        return;
      }
      try {
        const response = await axios.get(`${process.env.BACKEND_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Procesar las categorías
        let categories;
        try {
          categories = JSON.parse(response.data.categories);
        } catch (e) {
          categories = response.data.categories || [];
        }

        // Asegurarse de que categories sea un array
        categories = Array.isArray(categories) ? categories : [];

        setUserData({ ...response.data, categories });
        setIsLoading(false);
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error.response || error);
        setError(error.response?.data?.msg || error.message);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleEdit = (field) => {
    setEditMode(prev => ({ ...prev, [field]: true }));
  };

  const handleSave = async (field) => {
    const token = sessionStorage.getItem('token');
    try {
      let value = userData[field];

      if (!validateField(field, value)) {
        setError(`Entrada inválida para ${field}`);
        return;
      }

      if (value === '' || (Array.isArray(value) && value.length === 0)) {
        setError(`El campo ${field} no puede estar vacío`);
        return;
      }

      await axios.patch(`${process.env.BACKEND_URL}/users/profile`,
        { [field]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditMode(prev => ({ ...prev, [field]: false }));
      setError(null);
    } catch (error) {
      console.error("Error al actualizar datos del usuario:", error);
      setError("Error al actualizar el perfil. Por favor, inténtalo de nuevo.");
    }
  };

  const handleChange = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const validateField = (field, value) => {
    switch (field) {
      case 'name':
      case 'surname':
        return value.length > 0 && value.length <= 120;
      case 'gender':
        return ['masculino', 'femenino', 'no_especificado'].includes(value);
      case 'address':
        return value.length > 0 && value.length <= 200;
      case 'postal_code':
        return /^\d{5}$/.test(value);
      case 'upper_size':
        return sizeOptions.includes(value);
      case 'lower_size':
        return lowerSizeOptions.includes(value);
      case 'cap_size':
        return sizeOptions.includes(value);
      case 'shoe_size':
        return shoeSizeOptions.includes(value);
      case 'not_colors':
        return Array.isArray(value) && value.length <= 3;  // Máximo 3 elementos
      case 'stamps':
        return ['estampados', 'lisos'].includes(value);
      case 'fit':
        return ['ajustado', 'holgado'].includes(value);
      case 'not_clothes':
        return Array.isArray(value) && value.length <= 3;  // Máximo 3 elementos
      case 'categories':
        return Array.isArray(value) && value.length <= 5 && value.length > 0;
      case 'profession':
        return ['Salud', 'Informática', 'Educación', 'Ingeniería', 'Artes', 'Finanzas', 'Ventas', 'Administración', 'Construcción', 'Hostelería', 'Estudiante', 'Otro'].includes(value);
      default:
        return true;
    }
  };

  const renderField = (field, icon, label) => {
    if (!userData || !userData[field]) return null;

    const value = userData[field];
    const isListField = ['not_colors', 'not_clothes', 'categories'].includes(field);

    const renderInput = () => {
      if (isListField) {
        return (
          <div>
            {Array.isArray(value) && value.length > 0 ? (
              value.map((item, index) => (
                <span key={index} className="tag">
                  {item}
                  <button className='btn mx-1' onClick={() => handleRemoveItem(field, item)}>x</button>
                </span>
              ))
            ) : (
              <span className="text-muted">No especificado</span>
            )}
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddItem(field, e.target.value);
                  e.target.value = '';
                }
              }}
            >
              <option value="">Seleccionar {label.toLowerCase()}...</option>
              {(field === 'not_colors' ? colorOptions :
                field === 'not_clothes' ? clothesOptions :
                  categoryOptions).filter(option => !value.includes(option)).map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
            </select>
          </div>
        );
      }
      switch (field) {
        case 'gender':
          return (
            <select value={value} onChange={(e) => handleChange(field, e.target.value)}>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="no_especificado">Prefiero no decirlo</option>
            </select>
          );
        case 'upper_size':
        case 'cap_size':
          return (
            <select value={value} onChange={(e) => handleChange(field, e.target.value)}>
              {sizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          );
        case 'lower_size':
          return (
            <select value={value} onChange={(e) => handleChange(field, e.target.value)}>
              {lowerSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          );
        case 'shoe_size':
          return (
            <select value={value} onChange={(e) => handleChange(field, e.target.value)}>
              {shoeSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          );
        case 'stamps':
          return (
            <select value={value} onChange={(e) => handleChange(field, e.target.value)}>
              <option value="estampados">Estampados</option>
              <option value="lisos">Lisos</option>
            </select>
          );
        case 'fit':
          return (
            <select value={value} onChange={(e) => handleChange(field, e.target.value)}>
              <option value="ajustado">Ajustado</option>
              <option value="holgado">Holgado</option>
            </select>
          );
        case 'profession':
          return (
            <select value={value} onChange={(e) => handleChange(field, e.target.value)}>
              {['Salud', 'Informática', 'Educación', 'Ingeniería', 'Artes', 'Finanzas', 'Ventas', 'Administración', 'Construcción', 'Hostelería', 'Estudiante', 'Otro'].map(prof => (
                <option key={prof} value={prof}>{prof}</option>
              ))}
            </select>
          );

        default:
          return (
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder="No especificado"
            />
          );
      }
    };

    return (
      <div className='col-12 col-md-6 col-lg-4 mb-3'>
        <ProfileField
          icon={icon}
          label={label}
          value={isListField && Array.isArray(value) ? (value.length > 0 ? value.join(', ') : 'No especificado') : (value || 'No especificado')}
          onEdit={() => handleEdit(field)}
          onSave={() => {
            if (value === '' || (Array.isArray(value) && value.length === 0)) {
              setError(`El campo ${label} no puede estar vacío`);
            } else {
              handleSave(field);
            }
          }}
          isEditing={editMode[field]}
        >
          {renderInput()}
        </ProfileField>
      </div>
    );
  };

  const handleAddItem = (field, item) => {
    if (item && userData[field].length < (field === 'categories' ? 5 : 3)) {
      setUserData(prev => ({
        ...prev,
        [field]: [...prev[field], item]
      }));
    }
  };

  const handleRemoveItem = (field, item) => {
    setUserData(prev => ({
      ...prev,
      [field]: prev[field].filter(i => i !== item)
    }));
  };

  if (error) return <div className="error-message">Error: {error}</div>;
  if (!userData) return <div className="loading-message">Cargando...</div>;

  const renderContent = () => {
    if (isLoading) return <div>
      <ClimbingBoxLoader
        color="#6a8e7f"
        cssOverride={{
          'margin-bottom': '2rem',
          'margin-top': '2rem'
        }}
        loading
        size={25}
        speedMultiplier={1}
      /></div>;
    if (error) return <div className="error-message">Error: {error}</div>;

    switch (activeSection) {
      case 'notifications':
        return <div><UserNotifications data={userData} /></div>;
      case 'messages':
        return <UserMessages />;
      case 'purchases':
        return <div><UserPurchases id={userData.id} /></div>;
      case 'profile':
        return (
          <div className="row my-3">
            {renderField('name', faUser, 'Nombre')}
            {renderField('surname', faUser, 'Apellido')}
            {renderField('email', faEnvelope, 'Correo electrónico')}
            {renderField('gender', faVenusMars, 'Género')}
            {renderField('address', faMapMarkerAlt, 'Dirección')}
            {renderField('postal_code', faMapPin, 'Código Postal')}
            {renderField('upper_size', faTshirt, 'Talla Superior')}
            {renderField('lower_size', faTshirt, 'Talla Inferior')}
            {renderField('cap_size', faHatCowboy, 'Talla de Gorra o Sombrero')}
            {renderField('shoe_size', faShoePrints, 'Talla de Zapato')}
            {renderField('stamps', faPalette, 'Preferencia de Estampado')}
            {renderField('fit', faTape, 'Preferencia de Ajuste')}
            {renderField('profession', faBriefcase, 'Profesión')}
            {renderField('not_colors', faBan, 'Colores que menos te gustan')}
            {renderField('not_clothes', faBan, 'Prendas que menos te gustan')}
            {renderField('categories', faList, 'Categorías')}
          </div>
        );
      case 'support':
        return <div><ContactSupport /></div>;
      default:
        return <div>Selecciona una opción del menú</div>;
    }
  };
  return (
    <div className={`wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="bg-light border-right" id="sidebar-wrapper">
        <div className="sidebar-heading d-flex justify-content-between align-items-center">
          <strong>Panel de control</strong>
        </div>
        <div className="list-group list-group-flush">
          <button
            className={`list-group-item list-group-item-action ${activeSection === 'notifications' ? 'active' : ''}`}
            onClick={() => { setActiveSection('notifications'); setIsSidebarOpen(false); }}
          >
            <FontAwesomeIcon icon={faBell} className="mr-2" /> Notificaciones
          </button>
          <button
            className={`list-group-item list-group-item-action ${activeSection === 'messages' ? 'active' : ''}`}
            onClick={() => { setActiveSection('messages'); setIsSidebarOpen(false); }}
          >
            <FontAwesomeIcon icon={faEnvelope} className="mr-2" /> Mensajes
          </button>
          <button
            className={`list-group-item list-group-item-action ${activeSection === 'purchases' ? 'active' : ''}`}
            onClick={() => { setActiveSection('purchases'); setIsSidebarOpen(false); }}
          >
            <FontAwesomeIcon icon={faShoppingBag} className="mr-2" /> Compras
          </button>
          <button
            className={`list-group-item list-group-item-action ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => { setActiveSection('profile'); setIsSidebarOpen(false); }}
          >
            <FontAwesomeIcon icon={faUser} className="mr-2" /> Editar Perfil
          </button>
          <button
            className={`list-group-item list-group-item-action ${activeSection === 'support' ? 'active' : ''}`}
            onClick={() => { setActiveSection('support'); setIsSidebarOpen(false); }}
          >
            <FontAwesomeIcon icon={faHeadset} className="mr-2" /> Contacto con Soporte
          </button>
          <button type='button' className={`btn btn-danger rounded-0`} onClick={() => { actions.setModalLogout(true) }}>
            <FontAwesomeIcon icon={faPowerOff} className="mr-2" /> Cerrar sesión
          </button>
        </div>
      </div>
      <div id="page-content-wrapper">
        <button className="btn" id="menu-toggle" onClick={toggleSidebar}>
          Mostrar Panel de Control
        </button>
        <div className="container-fluid profile-container">
          <div className="profile-content">
            {renderContent()}
          </div>
        </div>
      </div>
      <div className="overlay" onClick={closeSidebar}></div>

      {store.modalLogout && (
        <div>
          <ModalLogout />
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
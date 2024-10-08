import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faUser,
  faHeadset,
  faShoppingCart,
  faPlus,
  faBoxes,
  faStore,
  faEnvelope,
  faImage,
  faPowerOff,
  faShop
} from '@fortawesome/free-solid-svg-icons';
import ProfileField from '../../component/Profile/ProfileField';
import { Context } from '../../store/appContext';
import ModalLogout from '../../component/Modals/ModalLogout'
import ModalGlobal from '../../component/ModalGlobal';

import BoxesOnSale from '../../component/ShopHome/BoxesOnSale';
import ContactSupport from '../../component/ShopHome/ContactSupport';
import ShopNotifications from '../../component/ShopHome/ShopNotifications';
import ShopSales from '../../component/ShopHome/ShopSales';
import { faSignalMessenger } from '@fortawesome/free-brands-svg-icons';
import Spinner from '../../component/Spinner';
import NotToken from '../../component/Utils/NotToken';
import NotType from '../../component/Utils/NotType';

function ShopHome() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('notifications');
  const [shopData, setShopData] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [error, setError] = useState(null);
  const { store, actions } = useContext(Context);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', body: '' });

  const categoryOptions = store.categories;

  const fetchShopData = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setError("No se encontró el token de autenticación");
      return;
    }
    try {
      const response = await axios.get(`${process.env.BACKEND_URL}/shops/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const processedCategories = response.data.categories.map(cat => {
        return cat.replace(/^"/, '').replace(/"$/, '').replace(/\\"/g, '"');
      });

      setShopData({ ...response.data, categories: processedCategories });

      setTimeout(() => setLoading(false), 500);

    } catch (error) {
      console.error("Error fetching shop data:", error.response || error);
      setError(error.response?.data?.msg || error.message);
      setLoading(false)
    }
  };

  useEffect(() => {
    setLoading(true)

    fetchShopData();
  }, []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const showModal = (title, body) => {
    setModalContent({ title, body });
    setModalOpen(true);
  };

  const handleEdit = (field) => {
    setEditMode(prev => ({ ...prev, [field]: true }));
  };

  const validateField = (field, value) => {
    switch (field) {
      case 'owner_name':
      case 'owner_surname':
        return value.trim() !== "" ? null : `El ${field === 'owner_name' ? 'nombre' : 'apellido'} es necesario`;
      case 'shop_name':
        return value.trim() !== "" ? null : "El nombre de la tienda es necesario";
      case 'shop_address':
        return value.trim() !== "" ? null : "La dirección de la tienda es necesario";
      case 'postal_code':
        return /^\d{5}$/.test(value) ? null : "El código postal debe tener 5 dígitos";
      case 'email':
        return /\S+@\S+\.\S+/.test(value) ? null : "El email no es válido";
      case 'categories':
        return Array.isArray(value) && value.length > 0 && value.length <= 3 ? null : "Selecciona entre 1 y 3 categorías";
      case 'business_core':
        return value.length >= 10 ? null : "El core del negocio debe tener al menos 10 caracteres";
      case 'shop_description':
        return value.length >= 50 ? null : "La descripción debe tener al menos 50 caracteres";
      case 'shop_summary':
        return value.split(' ').length <= 10 ? null : "El resumen no debe exceder las 10 palabras";
      case 'image_shop_url':
        return value ? null : "La imagen de la tienda es necesaria";
      default:
        return null;
    }
  };

  const handleSave = async (field) => {
    const token = sessionStorage.getItem('token');
    try {
      let value = shopData[field];

      // Validación del campo
      const errorMessage = validateField(field, value);
      if (errorMessage) {
        showModal('Error de validación', errorMessage);
        setLoading(false);
        return;
      }

      const formData = new FormData();

      if (field === 'categories' && Array.isArray(value)) {
        value = JSON.stringify(value.map(cat => `"${cat}"`));
      }

      if (field === 'image_shop_url' && previewImage) {
        formData.append('image_shop_url', previewImage);
      } else {
        formData.append(field, value);
      }

      await axios.patch(`${process.env.BACKEND_URL}/shops/profile`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setEditMode(prev => ({ ...prev, [field]: false }));
      setError(null);

      // Actualizar la imagen en shopData si se subió una nueva
      if (field === 'image_shop_url' && previewImage) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setShopData(prev => ({ ...prev, image_shop_url: reader.result }));
        };
        reader.readAsDataURL(previewImage);
      }

      showModal('Éxito', 'Los cambios se han guardado correctamente.');
    } catch (error) {
      showModal('Error', "Error al actualizar el perfil. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setShopData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreviewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setShopData(prev => ({ ...prev, image_shop_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const renderField = (field, icon, label) => {

    if (!shopData) return null;

    const value = shopData[field];
    const isListField = field === 'categories';
    const isImageField = field === 'image_shop_url';

    const renderInput = () => {
      if (isListField) {
        const availableCategories = categoryOptions.filter(cat => !value.includes(cat));
        const canAddMore = value.length < 3;
        return (
          <div>
            {Array.isArray(value) && value.map((item, index) => (
              <span key={index} className="tag">
                {item}
                <button className='btn mx-1' onClick={() => handleRemoveItem(field, item)}>x</button>
              </span>
            ))}
            {canAddMore && availableCategories.length > 0 ? (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddItem(field, e.target.value);
                    e.target.value = '';
                  }
                }}
              >
                <option value="">Seleccionar categoría...</option>
                {availableCategories.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <p>{value.length >= 3 ? "Has alcanzado el límite de 3 categorías." : "Has seleccionado todas las categorías posibles."}</p>
            )}
          </div>
        );
      } else if (isImageField) {
        return (
          <div className="d-flex flex-column align-items-center">
            <img
              src={value}
              alt="Shop"
              style={{ width: '200px', height: '200px', objectFit: 'cover', marginBottom: '10px' }}
            />
            {editMode[field] && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            )}
          </div>
        );
      } else {
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            placeholder={`Ingrese ${label}`}
          />
        );
      }
    };

    return (
      <div className='col-12 mb-3'>
        <ProfileField
          icon={icon}
          label={label}
          value={isImageField ? 'Pulsa en editar para cambiar la imagen de tu tienda' : (isListField && Array.isArray(value) ? (value.length > 0 ? value.join(', ') : 'No especificado') : (value || ''))}
          onEdit={() => handleEdit(field)}
          onSave={() => handleSave(field)}
          isEditing={editMode[field]}
        >
          {editMode[field] ? renderInput() : (isImageField ? renderInput() : null)}
        </ProfileField>
      </div>
    );
  };

  const handleAddItem = (field, item) => {
    if (item && Array.isArray(shopData[field]) && !shopData[field].includes(item) && shopData[field].length < 3) {
      setShopData(prev => ({
        ...prev,
        [field]: [...prev[field], item]
      }));
    }
  };

  const handleRemoveItem = (field, item) => {
    if (Array.isArray(shopData[field])) {
      setShopData(prev => ({
        ...prev,
        [field]: prev[field].filter(i => i !== item)
      }));
    }
  };

  const renderContent = () => {
    if (error) return <div className="error-message">Error: {error}</div>;

    if (loading) return <Spinner />

    switch (activeSection) {
      case 'notifications':
        return <div>
          < ShopNotifications />
        </div>;
      case 'profile':
        return (
          <div className='p-3'>
            <h2>Edita aquí los datos de tu tienda:</h2>
            <div className="row">
              {renderField('owner_name', faUser, 'Nombre del Propietario')}
              {renderField('owner_surname', faUser, 'Apellido del Propietario')}
              {renderField('name', faStore, 'Nombre de la Tienda')}
              {renderField('address', faStore, 'Dirección de la Tienda')}
              {renderField('postal_code', faStore, 'Código Postal')}
              {renderField('email', faEnvelope, 'Correo electrónico')}
              {renderField('categories', faStore, 'Categorías')}
              {renderField('business_core', faStore, 'Actividad Principal')}
              {renderField('shop_description', faStore, 'Descripción de la Tienda')}
              {renderField('shop_summary', faStore, 'Resumen de la Tienda')}
              {renderField('image_shop_url', faImage, 'Imagen de la tienda')}
              {renderField('name', faSignalMessenger, 'Nombre de la tienda')}
            </div>
          </div>

        );
      case 'support':
        return <div>
          <ContactSupport shopData={shopData} />
        </div>;
      case 'sales':
        return <div>
          <h2>Estas son tus ventas:</h2>
          <ShopSales shopData={shopData} />
        </div>;
      case 'createBox':
        return <div>
          <h3>Crear Nueva Caja</h3>
          <button type='button' className='btn btn-success' onClick={() => { navigate("/createbox") }}>Crear una nueva caja</button>
        </div>;
      case 'boxesOnSale':
        return <div>
          <BoxesOnSale shopData={shopData} fetchData={fetchShopData} />
        </div>;
      default:
        return <div>Selecciona una opción del menú</div>;
    }
  };

  if (loading) return <Spinner />

  return (
    <div className={`wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="bg-light border-right" id="sidebar-wrapper">
        <div className="list-group list-group-flush">
          <button
            className={`list-group-item list-group-item-action ${activeSection === 'notifications' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('notifications');
              closeSidebar();
            }}
          >            <FontAwesomeIcon icon={faBell} className="mr-2" /> Notificaciones
          </button>
          <button
            className={`list-group-item list-group-item-action ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('profile');
              closeSidebar();
            }}
          >            <FontAwesomeIcon icon={faUser} className="mr-2" /> Editar Perfil
          </button>
          <button
            className={`list-group-item list-group-item-action ${activeSection === 'support' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('support');
              closeSidebar();
            }}
          >            <FontAwesomeIcon icon={faHeadset} className="mr-2" /> Contacto con Soporte
          </button>
          <button
            className={`list-group-item list-group-item-action ${activeSection === 'sales' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('sales');
              closeSidebar();
            }}
          >            <FontAwesomeIcon icon={faShoppingCart} className="mr-2" /> Ventas
          </button>
          <button
            className={`list-group-item list-group-item-action ${activeSection === 'BoxesOnSale' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('boxesOnSale');
              closeSidebar();
            }}
          >            <FontAwesomeIcon icon={faBoxes} className="mr-2" /> Cajas a la Venta
          </button>
          <button className={`list-group-item list-group-item-action ${activeSection === 'createBox' ? 'active' : ''}`} onClick={() => {
            navigate("/createbox"); closeSidebar();
          }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Crear Nueva Caja
          </button>
          <button className={`list-group-item list-group-item-action ${activeSection === 'createBox' ? 'active' : ''}`} onClick={() => {
            navigate(`/shoppreview/${shopData.id}`); closeSidebar();
          }}>
            <FontAwesomeIcon icon={faShop} className="mr-2" /> Ver Perfil de tu tienda
          </button>
          <button type='button' className={`btn btn-danger rounded-0`} onClick={() => {
            actions.setModalLogout(true); closeSidebar();
          }}>
            <FontAwesomeIcon icon={faPowerOff} className="mr-2" /> Cerrar sesión
          </button>
        </div>
      </div>
      <div id="page-content-wrapper" className="flex-grow-1 p-4">
        <button className="btn btn-primary" id="menu-toggle" onClick={toggleSidebar}>
          Mostrar Panel de Control
        </button>
        {renderContent()}
      </div>
      {isSidebarOpen && <div className="overlay" onClick={closeSidebar}></div>}

      {store.modalLogout && (
        <div>
          <ModalLogout />
        </div>
      )}


      <ModalGlobal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalContent.title}
        body={modalContent.body}
        buttonBody="Cerrar"
      />

      <NotToken />
      <NotType user_or_shop='shop' />
    </div>
  );
}

export default ShopHome;
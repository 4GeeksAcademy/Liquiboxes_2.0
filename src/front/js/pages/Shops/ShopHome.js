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


import BoxesOnSale from '../../component/ShopHome/BoxesOnSale';
import ContactSupport from '../../component/ShopHome/ContactSupport';
import ShopNotifications from '../../component/ShopHome/ShopNotifications';
import ShopSales from '../../component/ShopHome/ShopSales';
import { faSignalMessenger } from '@fortawesome/free-brands-svg-icons';
import Spinner from '../../component/Spinner';

function ShopHome() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('notifications');
  const [shopData, setShopData] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [error, setError] = useState(null);
  const { store, actions } = useContext(Context);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true)

  const categoryOptions = store.categories;

  useEffect(() => {
    setLoading(true)

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
      }
    };

    fetchShopData();
  }, []);

  const handleEdit = (field) => {
    setEditMode(prev => ({ ...prev, [field]: true }));
  };

  const handleSave = async (field) => {
    setLoading(true)
    const token = sessionStorage.getItem('token');
    try {
      let value = shopData[field];
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
      setTimeout(() => setLoading(false), 200);
    } catch (error) {
      console.error("Error updating shop data:", error);
      setError("Error al actualizar el perfil. Por favor, inténtalo de nuevo.");
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

    if (!shopData || !shopData[field]) return null;

    if (loading) return <Spinner />

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
          <div className="d-flex align-items-center">
            <img
              src={value}
              alt="Profile"
              style={{ width: '100px', height: '100px', objectFit: 'cover', marginRight: '10px' }}
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
          />
        );
      }
    };

    return (
      <div className='col-12 col-lg-6 mb-3'>
        <ProfileField
          icon={icon}
          label={label}
          value={isImageField ? renderInput() : (isListField && Array.isArray(value) ? value.join(', ') : value)}
          onEdit={() => handleEdit(field)}
          onSave={() => handleSave(field)}
          isEditing={editMode[field]}
        >
          {isImageField ? renderInput() : (editMode[field] ? renderInput() : null)}
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
          <div className="row">
            {renderField('owner_name', faUser, 'Nombre del Propietario')}
            {renderField('owner_surname', faUser, 'Apellido del Propietario')}
            {renderField('shop_name', faStore, 'Nombre de la Tienda')}
            {renderField('shop_address', faStore, 'Dirección de la Tienda')}
            {renderField('postal_code', faStore, 'Código Postal')}
            {renderField('email', faEnvelope, 'Correo electrónico')}
            {renderField('categories', faStore, 'Categorías')}
            {renderField('business_core', faStore, 'Actividad Principal')}
            {renderField('shop_description', faStore, 'Descripción de la Tienda')}
            {renderField('shop_summary', faStore, 'Resumen de la Tienda')}
            {renderField('image_shop_url', faImage, 'Imagen de la tienda')}
            {renderField('name', faSignalMessenger, 'Nombre de la tienda')}
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
          <BoxesOnSale shopData={shopData} />
        </div>;
      default:
        return <div>Selecciona una opción del menú</div>;
    }
  };

  if (loading) return <Spinner />

  return (
    <div className="d-flex">
      <div className="bg-light border-right" id="sidebar-wrapper">
        <div className="list-group list-group-flush">
          <button className={`list-group-item list-group-item-action ${activeSection === 'notifications' ? 'active' : ''}`} onClick={() => setActiveSection('notifications')}>
            <FontAwesomeIcon icon={faBell} className="mr-2" /> Notificaciones
          </button>
          <button className={`list-group-item list-group-item-action ${activeSection === 'profile' ? 'active' : ''}`} onClick={() => setActiveSection('profile')}>
            <FontAwesomeIcon icon={faUser} className="mr-2" /> Editar Perfil
          </button>
          <button className={`list-group-item list-group-item-action ${activeSection === 'support' ? 'active' : ''}`} onClick={() => setActiveSection('support')}>
            <FontAwesomeIcon icon={faHeadset} className="mr-2" /> Contacto con Soporte
          </button>
          <button className={`list-group-item list-group-item-action ${activeSection === 'sales' ? 'active' : ''}`} onClick={() => setActiveSection('sales')}>
            <FontAwesomeIcon icon={faShoppingCart} className="mr-2" /> Ventas
          </button>
          <button className={`list-group-item list-group-item-action ${activeSection === 'boxesOnSale' ? 'active' : ''}`} onClick={() => setActiveSection('boxesOnSale')}>
            <FontAwesomeIcon icon={faBoxes} className="mr-2" /> Cajas a la Venta
          </button>
          <button className={`list-group-item list-group-item-action ${activeSection === 'createBox' ? 'active' : ''}`} onClick={() => { navigate("/createbox") }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Crear Nueva Caja
          </button>
          <button className={`list-group-item list-group-item-action ${activeSection === 'createBox' ? 'active' : ''}`} onClick={() => { navigate(`/shoppreview/${shopData.id}`) }}>
            <FontAwesomeIcon icon={faShop} className="mr-2" /> Ver Perfil de tu tienda
          </button>
          <button type='button' className={`btn btn-danger rounded-0`} onClick={() => { actions.setModalLogout(true) }}>
            <FontAwesomeIcon icon={faPowerOff} className="mr-2" /> Cerrar sesión
          </button>
        </div>
      </div>
      <div id="page-content-wrapper" className="flex-grow-1 p-4">
        {renderContent()}
      </div>

      {store.modalLogout && (
        <div>
          <ModalLogout />
        </div>
      )}

    </div>
  );
}

export default ShopHome;
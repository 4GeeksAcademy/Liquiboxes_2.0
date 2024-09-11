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
  faStore
} from '@fortawesome/free-solid-svg-icons';
import ProfileField from '../../component/Profile/ProfileField';
import { Context } from '../../store/appContext';

import BoxesOnSale from '../../component/ShopHome/BoxesOnSale';
import ContactSupport from '../../component/ShopHome/ContactSupport';
import SaleStatistics from '../../component/ShopHome/SaleStatistics';
import ShopNotifications from '../../component/ShopHome/ShopNotifications';

function ShopHome() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('notifications');
  const [shopData, setShopData] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { store } = useContext(Context);

  const categoryOptions = store.categories;

  useEffect(() => {
    const fetchShopData = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setError("No se encontró el token de autenticación");
        setIsLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${process.env.BACKEND_URL}/shops/profile`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        // Procesar las categorías
        const processedCategories = response.data.categories.map(cat => {
          // Eliminar las comillas extras y los caracteres de escape
          return cat.replace(/^"/, '').replace(/"$/, '').replace(/\\"/g, '"');
        });

        setShopData({ ...response.data, categories: processedCategories });
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching shop data:", error.response || error);
        setError(error.response?.data?.msg || error.message);
        setIsLoading(false);
      }
    };

    fetchShopData();
  }, []);

  const handleEdit = (field) => {
    setEditMode(prev => ({ ...prev, [field]: true }));
  };

  const handleSave = async (field) => {
    const token = sessionStorage.getItem('token');
    try {
      let value = shopData[field];
      if (field === 'categories' && Array.isArray(value)) {
        // Convertir el array de categorías a un formato que el backend pueda procesar
        value = JSON.stringify(value.map(cat => `"${cat}"`));
      }

      const formData = new FormData();
      formData.append(field, value);

      await axios.patch(`${process.env.BACKEND_URL}/shops/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setEditMode(prev => ({ ...prev, [field]: false }));
      setError(null);
    } catch (error) {
      console.error("Error updating shop data:", error);
      setError("Error al actualizar el perfil. Por favor, inténtalo de nuevo.");
    }
  };

  const handleChange = (field, value) => {
    setShopData(prev => ({ ...prev, [field]: value }));
  };

  const renderField = (field, icon, label) => {
    if (!shopData || !shopData[field]) return null;

    const value = shopData[field];
    const isListField = field === 'categories';

    const renderInput = () => {
      if (isListField) {
        const availableCategories = categoryOptions.filter(cat => !value.includes(cat));
        return (
          <div>
            {Array.isArray(value) && value.map((item, index) => (
              <span key={index} className="tag">
                {item}
                <button className='btn mx-1' onClick={() => handleRemoveItem(field, item)}>x</button>
              </span>
            ))}
            {availableCategories.length > 0 ? (
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
              <p>Has seleccionado todas las categorías posibles.</p>
            )}
          </div>
        );
      }
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
        />
      );
    };

    return (
      <div className='col-12 mb-3'>
        <ProfileField
          icon={icon}
          label={label}
          value={isListField && Array.isArray(value) ? value.join(', ') : value}
          onEdit={() => handleEdit(field)}
          onSave={() => handleSave(field)}
          isEditing={editMode[field]}
        >
          {renderInput()}
        </ProfileField>
      </div>
    );
  };

  const handleAddItem = (field, item) => {
    if (item && Array.isArray(shopData[field]) && !shopData[field].includes(item)) {
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
    if (isLoading) return <div>Cargando...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;

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
            {renderField('categories', faStore, 'Categorías')}
            {renderField('business_core', faStore, 'Actividad Principal')}
            {renderField('shop_description', faStore, 'Descripción de la Tienda')}
            {renderField('shop_summary', faStore, 'Resumen de la Tienda')}
          </div>
        );
      case 'support':
        return <div>
          <ContactSupport />
        </div>;
      case 'sales':
        return <div>
          <SaleStatistics />
        </div>;
      case 'createBox':
        return <div>
          <h3>Crear Nueva Caja</h3>
          <button type='button' className='btn btn-success' onClick={() => { navigate("/createbox") }}>Crear una nueva caja</button>
        </div>;
      case 'boxesOnSale':
        return <div>
          <BoxesOnSale />
        </div>;
      default:
        return <div>Selecciona una opción del menú</div>;
    }
  };

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
        </div>
      </div>
      <div id="page-content-wrapper" className="flex-grow-1 p-4">
        <h2 className="mb-4">Panel de Control de la Tienda</h2>
        {renderContent()}
      </div>
    </div>
  );
}

export default ShopHome;
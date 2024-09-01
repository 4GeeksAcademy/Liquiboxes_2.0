import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faTshirt, faPalette, faTextHeight, faBriefcase, faEdit, faSave } from '@fortawesome/free-solid-svg-icons';
import "../../styles/profile.css";
import ProfileField from '../component/Profile/ProfileField';

function Profile() {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [error, setError] = useState(null);

  // Definiciones para opciones de selección
  const sizeOptions = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const lowerSizeOptions = Array.from({ length: 35 }, (_, i) => (i + 26).toString());
  const shoeSizeOptions = Array.from({ length: 27 }, (_, i) => (i + 28).toString());
  const colorOptions = ['Rojo', 'Azul', 'Verde', 'Amarillo', 'Naranja', 'Morado', 'Rosa', 'Marrón', 'Negro', 'Blanco'];
  const clothesOptions = ['Camisetas', 'Pantalones', 'Faldas', 'Vestidos', 'Chaquetas', 'Abrigos', 'Zapatos', 'Accesorios', 'Ropa Interior', 'Trajes'];
  const categoryOptions = ['Moda', 'Ropa de Trabajo', 'Tecnología', 'Carpintería', 'Outdoor', 'Deporte', 'Arte', 'Cocina', 'Jardinería', 'Música', 'Viajes', 'Lectura', 'Cine', 'Fotografía', 'Yoga'];

  useEffect(() => {
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

        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error.response || error);
        setError(error.response?.data?.msg || error.message);
      }
    };

    fetchUserData();
  }, []);

  const handleEdit = (field) => {
    setEditMode(prev => ({ ...prev, [field]: true }));
  };

  const handleSave = async (field) => {
    const token = sessionStorage.getItem('token');
    try {
      let value = userData[field];
      if (['not_colors', 'not_clothes', 'categories'].includes(field) && Array.isArray(value)) {
        value = value.join(',');
      }

      if (!validateField(field, value)) {
        setError(`Invalid input for ${field}`);
        return;
      }

      await axios.patch(`${process.env.BACKEND_URL}/users/profile`,
        { [field]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditMode(prev => ({ ...prev, [field]: false }));
      setError(null);
    } catch (error) {
      console.error("Error updating user data:", error);
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
      case 'cup_size':
        return sizeOptions.includes(value);
      case 'shoe_size':
        return shoeSizeOptions.includes(value);
      case 'not_colors':
        return value.split(',').length <= 3;
      case 'stamps':
        return ['estampados', 'lisos'].includes(value);
      case 'fit':
        return ['ajustado', 'holgado'].includes(value);
      case 'not_clothes':
        return value.split(',').length <= 3;
      case 'categories':
        return value.split(',').length <= 5 && value.split(',').length > 0;
      case 'profession':
        return ['Salud', 'Informática', 'Educación', 'Ingeniería', 'Artes', 'Finanzas', 'Ventas', 'Administración', 'Construcción', 'Hostelería', 'Estudiante', 'Otro'].includes(value);
      default:
        return true;
    }
  };

  const renderField = (field, icon, label) => {
    const value = userData[field];
    const isListField = ['not_colors', 'not_clothes', 'categories'].includes(field);

    const renderInput = () => {
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
        case 'cup_size':
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
        case 'not_colors':
        case 'not_clothes':
        case 'categories':
          const options = field === 'not_colors' ? colorOptions :
            field === 'not_clothes' ? clothesOptions :
              categoryOptions;
          const maxItems = field === 'categories' ? 5 : 3;
          return (
            <div>
              {value.map((item, index) => (
                <span key={index} className="tag">
                  {item}
                  <button onClick={() => handleRemoveItem(field, item)}>x</button>
                </span>
              ))}
              {value.length < maxItems && (
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddItem(field, e.target.value);
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">Seleccionar {field.replace('_', ' ')}...</option>
                  {options.filter(option => !value.includes(option)).map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              )}
              <p>Máximo {maxItems} {field === 'categories' ? 'categorías' : 'elementos'}</p>
            </div>
          );
        default:
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
      <ProfileField
        icon={icon}
        label={label}
        value={isListField ? value.join(', ') : value}
        onEdit={() => handleEdit(field)}
        onSave={() => handleSave(field)}
        isEditing={editMode[field]}
      >
        {renderInput()}
      </ProfileField>
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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">Mi Perfil</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderField('name', faUser, 'Nombre')}
        {renderField('surname', faUser, 'Apellido')}
        {renderField('email', faEnvelope, 'Email')}
        {renderField('gender', faUser, 'Género')}
        {renderField('address', faUser, 'Dirección')}
        {renderField('postal_code', faUser, 'Código Postal')}
        {renderField('upper_size', faTshirt, 'Talla Superior')}
        {renderField('lower_size', faTshirt, 'Talla Inferior')}
        {renderField('cup_size', faTshirt, 'Talla de Gorra o Sombrero')}
        {renderField('shoe_size', faTshirt, 'Talla de Zapato')}
        {renderField('stamps', faPalette, 'Preferencia de Estampado')}
        {renderField('fit', faPalette, 'Preferencia de Ajuste')}
        {renderField('profession', faBriefcase, 'Profesión')}
        {renderField('not_colors', faPalette, 'Colores no preferidos')}
        {renderField('not_clothes', faTshirt, 'Prendas no preferidas')}
        {renderField('categories', faBriefcase, 'Categorías')}
      </div>
    </div>
  );
}

export default Profile;
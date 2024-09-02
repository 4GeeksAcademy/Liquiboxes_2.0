import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faInfoCircle, faCoins, faRuler, faList, faImage } from '@fortawesome/free-solid-svg-icons';

const STEPS = [
  { icon: faBox, title: "Información Básica", description: "Nombre y descripción de tu caja misteriosa" },
  { icon: faCoins, title: "Precio", description: "Establece el valor de tu caja" },
  { icon: faRuler, title: "Tamaño y Cantidad", description: "Define el tamaño y número de artículos" },
  { icon: faList, title: "Contenido Posible", description: "Lista los posibles artículos en la caja" },
  { icon: faImage, title: "Imagen", description: "Sube una imagen representativa" },
  { icon: faInfoCircle, title: "Resumen", description: "Revisa y confirma los detalles" }
];

const CreateMysteryBox = () => {
    const [step, setStep] = useState(1);
    const [newBox, setNewBox] = useState({
        name: "",
        description: "",
        price: "",
        size: "",
        possibleItems: [],
        image: null,
        numberOfItems: 1
    });
    const [newItem, setNewItem] = useState("");
    const [token, setToken] = useState("");
    const [errors, setErrors] = useState({});
    const [previewImage, setPreviewImage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = sessionStorage.getItem('token');
        if (!storedToken) {
            alert('Debes iniciar sesión para crear una nueva caja misteriosa');
            navigate('/');
        } else {
            setToken(storedToken);
        }
    }, [navigate]);

    const validateStep = () => {
        let stepErrors = {};
        switch(step) {
            case 1:
                if (!newBox.name) stepErrors.name = "El nombre es requerido";
                if (!newBox.description) stepErrors.description = "La descripción es requerida";
                break;
            case 2:
                if (!newBox.price) stepErrors.price = "El precio es requerido";
                break;
            case 3:
                if (!newBox.size) stepErrors.size = "El tamaño es requerido";
                break;
            case 4:
                if (newBox.possibleItems.length === 0) stepErrors.possibleItems = "Debe añadir al menos un item posible";
                break;
            case 5:
                if (!newBox.image) stepErrors.image = "La imagen es requerida";
                break;
            default:
                break;
        }
        setErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setNewBox(prevState => ({
            ...prevState,
            [name]: type === 'number' ? parseFloat(value) || '' : value
        }));
    };

    const handleAddItem = (e) => {
        e.preventDefault();
        if (newItem.trim() !== "") {
            setNewBox(prevState => ({
                ...prevState,
                possibleItems: [...prevState.possibleItems, newItem.trim()]
            }));
            setNewItem("");
        }
    };

    const handleRemoveItem = (index) => {
        setNewBox(prevState => ({
            ...prevState,
            possibleItems: prevState.possibleItems.filter((_, i) => i !== index)
        }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewBox(prevState => ({
                ...prevState,
                image: file
            }));
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep()) return;
    
        const formData = new FormData();
        for (const key in newBox) {
            if (key === 'possibleItems') {
                formData.append(key, newBox[key].join(','));
            } else if (key === 'image') {
                if (newBox[key]) {
                    formData.append(key, newBox[key], newBox[key].name);
                }
            } else {
                formData.append(key, newBox[key]);
            }
        }
    
        const token = sessionStorage.getItem('token');
        const shopId = sessionStorage.getItem('shopId');
    
        try {
            const response = await axios.post(
                `${process.env.BACKEND_URL}/shops/mystery-box`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            console.log('Caja misteriosa creada:', response.data);
            alert('Caja misteriosa creada con éxito!');
            navigate(`/mysterybox/${response.data.id}`);
        } catch (error) {
            console.error('Error al crear la caja misteriosa:', error);
            setErrors({ submit: error.response?.data?.error || 'Hubo un error al crear la caja misteriosa. Por favor, inténtalo de nuevo.' });
        }
    };

    const renderStepContent = () => {
        switch(step) {
            case 1:
                return (
                    <>
                        <input
                            type="text"
                            name="name"
                            value={newBox.name}
                            onChange={handleChange}
                            placeholder="Nombre de la caja misteriosa"
                            className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <p className="error-message">{errors.name}</p>}
                        <textarea
                            name="description"
                            value={newBox.description}
                            onChange={handleChange}
                            placeholder="Descripción de la caja misteriosa"
                            className={errors.description ? 'error' : ''}
                            rows="4"
                        />
                        {errors.description && <p className="error-message">{errors.description}</p>}
                    </>
                );
            case 2:
                return (
                    <>
                        <input
                            type="number"
                            name="price"
                            value={newBox.price}
                            onChange={handleChange}
                            placeholder="Precio de la caja misteriosa"
                            step="0.01"
                            className={errors.price ? 'error' : ''}
                        />
                        {errors.price && <p className="error-message">{errors.price}</p>}
                    </>
                );
            case 3:
                return (
                    <>
                        <select
                            name="size"
                            value={newBox.size}
                            onChange={handleChange}
                            className={errors.size ? 'error' : ''}
                        >
                            <option value="">Selecciona un tamaño</option>
                            <option value="pequeño">Pequeño</option>
                            <option value="mediano">Mediano</option>
                            <option value="grande">Grande</option>
                        </select>
                        {errors.size && <p className="error-message">{errors.size}</p>}
                        <input
                            type="number"
                            name="numberOfItems"
                            value={newBox.numberOfItems}
                            onChange={handleChange}
                            placeholder="Número de artículos incluidos"
                            min="1"
                        />
                    </>
                );
            case 4:
                return (
                    <>
                        <div className="input-group">
                            <input
                                type="text"
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                placeholder="Añadir nuevo item"
                            />
                            <button onClick={handleAddItem}>Añadir</button>
                        </div>
                        {errors.possibleItems && <p className="error-message">{errors.possibleItems}</p>}
                        <ul className="items-list">
                            {newBox.possibleItems.map((item, index) => (
                                <li key={index}>
                                    {item}
                                    <button onClick={() => handleRemoveItem(index)}>Eliminar</button>
                                </li>
                            ))}
                        </ul>
                    </>
                );
            case 5:
                return (
                    <>
                        <input
                            type="file"
                            onChange={handleImageChange}
                            accept="image/*"
                            className={errors.image ? 'error' : ''}
                        />
                        {errors.image && <p className="error-message">{errors.image}</p>}
                        {previewImage && (
                            <img src={previewImage} alt="Vista previa" className="preview-image" />
                        )}
                    </>
                );
            case 6:
                return (
                    <div className="summary">
                        <h3>Resumen de la Caja Misteriosa</h3>
                        <p><strong>Nombre:</strong> {newBox.name}</p>
                        <p><strong>Descripción:</strong> {newBox.description}</p>
                        <p><strong>Precio:</strong> ${newBox.price}</p>
                        <p><strong>Tamaño:</strong> {newBox.size}</p>
                        <p><strong>Número de artículos:</strong> {newBox.numberOfItems}</p>
                        <p><strong>Posibles artículos:</strong></p>
                        <ul>
                            {newBox.possibleItems.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                        {previewImage && (
                            <img src={previewImage} alt="Imagen de la caja" className="preview-image" />
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-progress">
                {STEPS.map((s, index) => (
                    <div key={index} className={`step ${index + 1 === step ? 'active' : ''} ${index + 1 < step ? 'completed' : ''}`}>
                        <div className="step-icon">
                            <FontAwesomeIcon icon={s.icon} />
                        </div>
                        <div className="step-label">{s.title}</div>
                    </div>
                ))}
            </div>
            <div className="signup-content">
                <div className="step-info">
                    <h2>{STEPS[step - 1].title}</h2>
                    <p>{STEPS[step - 1].description}</p>
                </div>
                <div className="step-form">
                    <form onSubmit={handleSubmit}>
                        {renderStepContent()}
                        {errors.submit && <p className="error-message">{errors.submit}</p>}
                        <div className="navigation-buttons">
                            {step > 1 && (
                                <button type="button" onClick={() => setStep(step - 1)}>
                                    Anterior
                                </button>
                            )}
                            {step < STEPS.length ? (
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        if (validateStep()) setStep(step + 1);
                                    }}
                                >
                                    Siguiente
                                </button>
                            ) : (
                                <button type="submit">Crear Caja Misteriosa</button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateMysteryBox;
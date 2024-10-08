import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faCoins, faList, faImage, faXmark } from '@fortawesome/free-solid-svg-icons';
import FullScreenConfetti from '../../component/FullScreenConfetti';
import ModalGlobal from '../../component/ModalGlobal';
import { Context } from '../../store/appContext'
import "../../../styles/shops/createMysteryBox.css";
import Spinner from '../../component/Spinner';
import NotToken from '../../component/Utils/NotToken';
import NotType from '../../component/Utils/NotType';

const STEPS = [
    { icon: faBox, title: "Información Básica", description: "Nombre y descripción de tu caja misteriosa", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850498/Package_fwghe4.gif" },
    { icon: faCoins, title: "Precio y Tamaño", description: "Establece el valor y dimensiones de tu caja", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726856991/Price_Tag_h0xjli.gif" },
    { icon: faList, title: "Contenido Posible", description: "Lista los posibles artículos en la caja", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726856985/Gift_Box_mzmnxc.gif" },
    { icon: faImage, title: "Imagen y Resumen", description: "Sube una imagen y revisa los detalles", src: "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726850497/Checklist_l0hzyf.gif" }
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
    const [errors, setErrors] = useState({});
    const [previewImage, setPreviewImage] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [mysteryBoxId, setMysteryBoxId] = useState(null)
    const { store } = useContext(Context)
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false)

    const validateStep = () => {
        let stepErrors = {};
        switch (step) {
            case 1:
                if (!newBox.name) stepErrors.name = "El nombre es requerido";
                if (!newBox.description) stepErrors.description = "La descripción es requerida";
                break;
            case 2:
                if (!newBox.price) stepErrors.price = "El precio es requerido";
                if (!newBox.size) stepErrors.size = "El tamaño es requerido";
                break;
            case 3:
                if (newBox.possibleItems.length === 0) stepErrors.possibleItems = "Debe añadir al menos un item posible";
                break;
            case 4:
                if (!newBox.image) stepErrors.image = "La imagen es requerida";
                break;
        }
        setErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            handleImageChange(e);
        } else {
            setNewBox(prevState => ({
                ...prevState,
                [name]: type === 'number' ? parseFloat(value) || '' : value
            }));
        }
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

    const handleRemoveItem = (e, index) => {
        e.preventDefault(); // Prevenir la acción por defecto
        e.stopPropagation(); // Detener la propagación del evento

        setNewBox(prevState => ({
            ...prevState,
            possibleItems: prevState.possibleItems.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep()) return;

        if (step < STEPS.length) {
            setStep(prev => prev + 1);
        } else {
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

            try {
                setLoading(true)
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
                setMysteryBoxId(response.data.id)
                setLoading(false)
                setIsSuccess(true);
            } catch (error) {
                console.error('Error al crear la caja misteriosa:', error);
                setErrors(prev => ({ ...prev, submit: error.response?.data?.error || 'Hubo un error al crear la caja misteriosa. Por favor, inténtalo de nuevo.' }));
            }
            finally {
                setLoading(false)
            }
        }
    };

    const handleCloseModal = (id) => {
        setIsSuccess(false);
        navigate(`/mysteryboxpreview/${id}`);
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="signup-step-content">
                        <h2 className="signup-step-question">Información Básica</h2>
                        <div className="signup-input-group">
                            <label htmlFor="name">Nombre de la caja misteriosa</label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={newBox.name}
                                onChange={handleChange}
                                className={`signup-input ${errors.name ? 'error' : ''}`}
                                placeholder="Ingrese el nombre de la caja misteriosa"
                            />
                            {errors.name && <p className="signup-error-message">{errors.name}</p>}
                        </div>
                        <div className="signup-input-group">
                            <label htmlFor="description">Descripción de la caja misteriosa</label>
                            <textarea
                                id="description"
                                name="description"
                                value={newBox.description}
                                onChange={handleChange}
                                className={`signup-input ${errors.description ? 'error' : ''}`}
                                rows="4"
                                placeholder="Describa el contenido de la caja misteriosa"
                            />
                            {errors.description && <p className="signup-error-message">{errors.description}</p>}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="signup-step-content">
                        <h2 className="signup-step-question">Precio y Tamaño</h2>
                        <div className="signup-input-group">
                            <label htmlFor="price">Precio de la caja misteriosa</label>
                            <input
                                id="price"
                                type="number"
                                name="price"
                                value={newBox.price}
                                onChange={handleChange}
                                className={`signup-input ${errors.price ? 'error' : ''}`}
                                step="0.01"
                                placeholder="Ingrese el precio"
                            />
                            {errors.price && <p className="signup-error-message">{errors.price}</p>}
                        </div>
                        <div className="signup-input-group">
                            <label htmlFor="size">Tamaño de la caja</label>
                            <select
                                id="size"
                                name="size"
                                value={newBox.size}
                                onChange={handleChange}
                                className={`signup-select ${errors.size ? 'error' : ''}`}
                            >
                                <option value="">Selecciona un tamaño</option>
                                <option value="pequeño">Pequeño</option>
                                <option value="mediano">Mediano</option>
                                <option value="grande">Grande</option>
                            </select>
                            {errors.size && <p className="signup-error-message">{errors.size}</p>}
                        </div>
                        <div className="signup-input-group">
                            <label htmlFor="numberOfItems">Número de artículos incluidos</label>
                            <input
                                id="numberOfItems"
                                type="number"
                                name="numberOfItems"
                                value={newBox.numberOfItems}
                                onChange={handleChange}
                                className="signup-input"
                                min="1"
                                placeholder="Ingrese el número de artículos"
                            />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="signup-step-content">
                        <h2 className="signup-step-question">Contenido Posible</h2>
                        <div className="signup-input-group">
                            <label htmlFor="newItem">Añadir nuevo artículo</label>
                            <div className="signup-add-item-container">
                                <div className='input-group'>
                                    <input
                                        id="newItem"
                                        type="text"
                                        value={newItem}
                                        onChange={(e) => setNewItem(e.target.value)}
                                        className="form-control"
                                        placeholder="Ej: Camiseta, Libro, Taza..."
                                    />
                                    <button onClick={handleAddItem} className="btn btn-outline-secondary">Añadir</button>
                                </div>

                            </div>
                        </div>
                        {errors.possibleItems && <p className="signup-error-message">{errors.possibleItems}</p>}
                        <div className="items-grid">
                            {newBox.possibleItems.map((item, index) => (
                                <div key={index} className="item-card ">
                                    <span className="item-name">{item}</span>
                                    <button onClick={(e) => handleRemoveItem(e, index)} className="remove-button">
                                        <FontAwesomeIcon icon={faXmark} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="signup-step-content">
                        <h2 className="signup-step-question">Imagen y Resumen</h2>
                        <div className="signup-input-group">
                            <label htmlFor="image">Imagen de la caja misteriosa</label>
                            <input
                                id="image"
                                type="file"
                                onChange={handleImageChange}
                                name="image"
                                accept="image/*"
                                className={`signup-input ${errors.image ? 'error' : ''}`}
                            />
                            {errors.image && <p className="signup-error-message">{errors.image}</p>}
                        </div>
                        {previewImage && (

                            <img src={previewImage} alt="Vista previa" className="signup-preview-image mx-auto" />
                        )}

                        <div className="signup-summary">
                            <h3>Resumen de la Caja Misteriosa</h3>
                            <p><strong>Nombre:</strong> {newBox.name}</p>
                            <p><strong>Descripción:</strong> {newBox.description}</p>
                            <p><strong>Precio:</strong> {newBox.price} €</p>
                            <p><strong>Tamaño:</strong> {newBox.size}</p>
                            <p><strong>Número de artículos:</strong> {newBox.numberOfItems}</p>
                            <p><strong>Posibles artículos:</strong></p>
                            <ul>
                                {newBox.possibleItems.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
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
                        <img src={STEPS[step - 1].src} alt={STEPS[step - 1].title} className="signup-step-animation" />
                    </div>
                    <p className="signup-step-description">{STEPS[step - 1].description}</p>
                </div>
                <div className="signup-form-section">
                    <button
                        className="signup-back-button"
                        onClick={() => step === 1 ? navigate('/shophome') : setStep(prev => prev - 1)}
                    >
                        ←
                    </button>
                    <form onSubmit={handleSubmit} noValidate>
                        {renderStepContent()}
                        {errors.submit && <p className="signup-error-message">{errors.submit}</p>}
                        <div className="signup-navigation-buttons">
                            <button
                                type="submit"
                                className="signup-next-button"
                            >
                                {step < STEPS.length ? "Continuar" : "Crear Caja Misteriosa"}
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
                        onClose={() => { handleCloseModal(mysteryBoxId) }}
                        title="¡Caja Misteriosa Creada!"
                        body="Tu caja misteriosa ha sido creada con éxito. ¡Esperamos que los usuarios disfruten descubriendo su contenido!"
                        buttonBody="Continuar"
                        className="welcome-modal"
                    />
                </>
            )}

            <NotToken />
            <NotType user_or_shop='shop' />
        </div>
    );
};

export default CreateMysteryBox;
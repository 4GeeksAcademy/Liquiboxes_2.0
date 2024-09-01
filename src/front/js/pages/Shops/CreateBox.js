import React, { useState } from 'react';

// Plantillas predefinidas
const imagePlaceholders = [
    { id: 1, url: 'https://i.imgur.com/FGi5Wug.jpeg', name: 'Plantilla 1' },
    { id: 2, url: 'https://i.imgur.com/OZdivIs.jpeg', name: 'Plantilla 2' },
    { id: 3, url: 'https://i.imgur.com/P0yKQDg.jpeg', name: 'Plantilla 3' },
    { id: 4, url: 'https://i.imgur.com/NuomJvP.jpeg', name: 'Plantilla 4' },
    { id: 5, url: 'https://i.imgur.com/x0rZvRf.jpeg', name: 'Plantilla 5' },
    { id: 6, url: 'https://i.imgur.com/9T5RY6r.jpeg', name: 'Plantilla 6' },
    { id: 7, url: 'https://i.imgur.com/KdKGmjf.jpeg', name: 'Plantilla 7' },
    { id: 8, url: 'https://i.imgur.com/5aSj28b.jpeg', name: 'Plantilla 8' },
    { id: 9, url: 'https://i.imgur.com/oS8cKaC.jpeg', name: 'Plantilla 9' },
];

function CreateBox() {
    const [newBox, setNewBox] = useState({
        name: "",
        description: "",
        price: "",
        size: "",
        possibleItems: [],
        image: "",
        numberOfItems: 1
    });
    const [newItem, setNewItem] = useState("");
    const [selectedImageType, setSelectedImageType] = useState("upload");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewBox(prevState => ({
            ...prevState,
            [name]: name === 'price' || name === 'numberOfItems' ? parseFloat(value) || '' : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí iría la lógica para enviar los datos a la base de datos
        console.log('Datos de la nueva caja:', newBox);
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

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddItem(e);
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
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewBox(prevState => ({
                    ...prevState,
                    image: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePlaceholderSelect = (url) => {
        setNewBox(prevState => ({
            ...prevState,
            image: url
        }));
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Crear Nueva Caja Misteriosa</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Nombre</label>
                    <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={newBox.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Descripción</label>
                    <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        value={newBox.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="price" className="form-label">Precio</label>
                    <input
                        type="number"
                        className="form-control"
                        id="price"
                        name="price"
                        value={newBox.price}
                        onChange={handleChange}
                        step="0.01"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="size" className="form-label">Tamaño</label>
                    <select
                        className="form-select"
                        id="size"
                        name="size"
                        value={newBox.size}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Selecciona un tamaño</option>
                        <option value="pequeño">Pequeño</option>
                        <option value="mediano">Mediano</option>
                        <option value="grande">Grande</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="numberOfItems" className="form-label">Número de artículos incluidos</label>
                    <input
                        type="number"
                        className="form-control"
                        id="numberOfItems"
                        name="numberOfItems"
                        value={newBox.numberOfItems}
                        onChange={handleChange}
                        min="1"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="possibleItems" className="form-label">Posibles Items</label>
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            id="newItem"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Añadir nuevo item (presiona Enter)"
                        />
                        <button className="btn btn-outline-secondary" type="button" onClick={handleAddItem}>Añadir</button>
                    </div>
                    <ul className="list-group mt-2">
                        {newBox.possibleItems.map((item, index) => (
                            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                {item}
                                <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveItem(index)}>Eliminar</button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mb-3">
                    <label className="form-label">Imagen de la Caja</label>
                    <div className="mb-2">
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="imageType"
                                id="uploadImage"
                                value="upload"
                                checked={selectedImageType === "upload"}
                                onChange={() => setSelectedImageType("upload")}
                            />
                            <label className="form-check-label" htmlFor="uploadImage">
                                Subir imagen
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="imageType"
                                id="placeholderImage"
                                value="placeholder"
                                checked={selectedImageType === "placeholder"}
                                onChange={() => setSelectedImageType("placeholder")}
                            />
                            <label className="form-check-label" htmlFor="placeholderImage">
                                Usar plantilla
                            </label>
                        </div>
                    </div>
                    {selectedImageType === "upload" ? (
                        <input
                            type="file"
                            className="form-control"
                            onChange={handleImageChange}
                            accept="image/*"
                        />
                    ) : (
                        <div className="row">
                            {imagePlaceholders.map((placeholder) => (
                                <div key={placeholder.id} className="col-md-4 mb-2">
                                    <img
                                        src={placeholder.url}
                                        alt={placeholder.name}
                                        className="img-thumbnail"
                                        onClick={() => handlePlaceholderSelect(placeholder.url)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <p className="text-center">{placeholder.name}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {newBox.image && (
                    <div className="mb-3">
                        <label className="form-label">Vista previa de la imagen</label>
                        <img src={newBox.image} alt="Vista previa" className="img-thumbnail" style={{ maxWidth: '200px' }} />
                    </div>
                )}

                <button type="submit" className="btn btn-primary">Crear Caja</button>
            </form>
        </div>
    );
}

export default CreateBox;
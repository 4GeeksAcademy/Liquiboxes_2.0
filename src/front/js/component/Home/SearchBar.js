import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const categories = ['Moda', 'Ropa de Trabajo', 'Tecnología', 'Carpintería', 'Outdoor', 'Deporte', 'Arte', 'Cocina', 'Jardinería', 'Música', 'Viajes', 'Lectura', 'Cine', 'Fotografía', 'Yoga'];

export default function SearchBar({ onSearch, onCategoryChange, initialSearchTerm = "" }) {
    const [search, setSearch] = useState(initialSearchTerm);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setSearch(initialSearchTerm);
    }, [initialSearchTerm]);

    const handleInputSearch = (event) => {
        setSearch(event.target.value);
    };

    const handleSubmitSearch = (event) => {
        event.preventDefault();
        if (location.pathname === "/home") {
            navigate(`/shopssearch?search=${encodeURIComponent(search)}`);
        } else {
            onSearch(search);
        }
    };

    const handleCategoryChange = (category) => {
        const updatedCategories = selectedCategories.includes(category)
            ? selectedCategories.filter(c => c !== category)
            : [...selectedCategories, category];
        setSelectedCategories(updatedCategories);
        onCategoryChange(updatedCategories);
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="search-bar">
            <div className="search-container">
                <form className="search-form" onSubmit={handleSubmitSearch}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o dirección"
                        value={search}
                        className="my-auto"
                        onChange={handleInputSearch}
                        // Aseguramos que se puedan ingresar caracteres especiales
                        lang="es"
                    />
                    <button type="submit">
                        Buscar
                    </button>
                </form>
                <div className="category-filter">
                    <button className="category-toggle" onClick={toggleExpand}>
                        {isExpanded ? "Ocultar categorías" : "Mostrar categorías"}
                    </button>
                </div>
            </div>
            {isExpanded && (
                <div className="category-buttons">
                    {categories.map((category) => (
                        <button
                            key={category}
                            className={selectedCategories.includes(category) ? 'active' : ''}
                            onClick={() => handleCategoryChange(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
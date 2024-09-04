import React, { useState, useEffect, useCallback, useMemo } from "react";
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

    const handleInputSearch = useCallback((event) => {
        setSearch(event.target.value);
    }, []);

    const handleSubmitSearch = useCallback((event) => {
        event.preventDefault();
        if (location.pathname === "/home") {
            navigate(`/shopssearch?search=${encodeURIComponent(search)}`);
        } else {
            onSearch(search);
        }
    }, [location.pathname, navigate, onSearch, search]);

    const handleCategoryChange = useCallback((category) => {
        setSelectedCategories(prev => {
            const updatedCategories = prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category];
            onCategoryChange(updatedCategories);
            return updatedCategories;
        });
    }, [onCategoryChange]);

    const toggleExpand = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    const categoryButtons = useMemo(() => (
        categories.map((category) => (
            <button
                key={category}
                className={selectedCategories.includes(category) ? 'active' : ''}
                onClick={() => handleCategoryChange(category)}
                aria-pressed={selectedCategories.includes(category)}
            >
                {category}
            </button>
        ))
    ), [selectedCategories, handleCategoryChange]);

    return (
        <div className="search-bar">
            <div className="search-container">
                <form className="search-form" onSubmit={handleSubmitSearch}>
                    <label htmlFor="search-input" className="sr-only">Buscar tiendas</label>
                    <input
                        id="search-input"
                        type="text"
                        placeholder="Buscar por nombre o dirección"
                        value={search}
                        className="my-auto"
                        onChange={handleInputSearch}
                        lang="es"
                    />
                    <button type="submit">
                        Buscar
                    </button>
                </form>
                <div className="category-filter">
                    <button 
                        className="category-toggle" 
                        onClick={toggleExpand}
                        aria-expanded={isExpanded}
                        aria-controls="category-buttons"
                    >
                        {isExpanded ? "Ocultar categorías" : "Mostrar categorías"}
                    </button>
                </div>
            </div>
            {isExpanded && (
                <div id="category-buttons" className="category-buttons">
                    {categoryButtons}
                </div>
            )}
        </div>
    );
}
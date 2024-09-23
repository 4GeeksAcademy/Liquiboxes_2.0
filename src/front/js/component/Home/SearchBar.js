import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import '../../../styles/searchbar.css'

export default function UltimateSearchBar({ onSearch, onCategoryChange, initialSearchTerm = "", shops = [], categories = [] }) {
    const [search, setSearch] = useState(initialSearchTerm);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const isHomePage = location.pathname === "/home";

    useEffect(() => {
        setSearch(initialSearchTerm);
    }, [initialSearchTerm]);

    const normalizeString = (str) => {
        return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const handleInputSearch = useCallback((event) => {
        const value = event.target.value;
        setSearch(value);
        
        if (value.length > 0 && shops.length > 0) {
            const normalizedValue = normalizeString(value);
            const filteredSuggestions = shops.filter(shop =>
                normalizeString(shop.name).includes(normalizedValue) ||
                (shop.address && normalizeString(shop.address).includes(normalizedValue))
            ).map(shop => ({ name: shop.name, address: shop.address }));
            setSuggestions(filteredSuggestions.slice(0, 5));
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [shops]);

    const handleSubmitSearch = useCallback((event) => {
        event.preventDefault();
        if (isHomePage) {
            navigate(`/shopssearch?search=${encodeURIComponent(search)}`);
        } else {
            onSearch(search);
        }
        setShowSuggestions(false);
    }, [isHomePage, navigate, onSearch, search]);

    const handleSuggestionClick = useCallback((suggestion) => {
        setSearch(suggestion.name);
        setShowSuggestions(false);
        if (isHomePage) {
            navigate(`/shopssearch?search=${encodeURIComponent(suggestion.name)}`);
        } else {
            onSearch(suggestion.name);
        }
    }, [isHomePage, navigate, onSearch]);

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
                className={`ultimate-search-category-btn ${selectedCategories.includes(category) ? 'ultimate-search-category-btn-active' : ''}`}
                onClick={() => handleCategoryChange(category)}
                aria-pressed={selectedCategories.includes(category)}
            >
                {category}
            </button>
        ))
    ), [categories, selectedCategories, handleCategoryChange]);

    return (
        <div className="ultimate-search-bar-container">
            <h2 className="ultimate-search-title">Descubre Nuestras<br />Tiendas:</h2>
            <div className={`ultimate-search-inner-container ${showSuggestions && suggestions.length > 0 ? 'showing-suggestions' : ''}`}>
                <form className="ultimate-search-form" onSubmit={handleSubmitSearch}>
                    <div className="ultimate-search-input-group">
                        <FontAwesomeIcon icon={faSearch} className="ultimate-search-icon" />
                        <input
                            id="ultimate-search-input"
                            type="text"
                            className="ultimate-search-input"
                            placeholder="Buscar por nombre o dirección"
                            value={search}
                            onChange={handleInputSearch}
                            lang="es"
                            aria-label="Buscar tiendas"
                            autoComplete="off"
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <ul className="ultimate-search-suggestions">
                                {suggestions.map((suggestion, index) => (
                                    <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                                        <strong>{suggestion.name}</strong>
                                        {suggestion.address && <small>{suggestion.address}</small>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <button className="ultimate-search-submit-btn" type="submit">
                        Buscar
                    </button>
                </form>
            </div>
            {!isHomePage && categories.length > 0 && (
                <div className="ultimate-search-category-section">
                    <button
                        className="ultimate-search-toggle-btn"
                        onClick={toggleExpand}
                        aria-expanded={isExpanded}
                        aria-controls="ultimate-search-category-buttons"
                    >
                        {isExpanded ? "Ocultar categorías" : "Mostrar categorías"}
                        <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className="ultimate-search-icon-right" />
                    </button>
                    <div
                        id="ultimate-search-category-buttons"
                        className={`ultimate-search-category-buttons ${isExpanded ? 'ultimate-search-expanded' : ''}`}
                    >
                        {categoryButtons}
                    </div>
                </div>
            )}
        </div>
    );
}
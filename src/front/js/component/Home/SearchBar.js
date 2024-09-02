import React, { useState } from "react";

export default function SearchBar() {
    const [search, setSearch] = useState("");

    // Función para manejar cambios en el input
    const handleInputSearch = (event) => {
        setSearch(event.target.value);
    };

    // Función para manejar el submit del formulario
    const handleSubmitSearch = async (event) => {
        event.preventDefault();
        console.log("Valor del input:", search);

        // Aquí puede ir el fetch 
    };

    return (
      <div>
        <form className="d-flex align-items-center p-2" role="search" onSubmit={handleSubmitSearch}>
            <input
                className="form-control border-0 border-bottom shadow"
                type="search"
                placeholder="Search"
                aria-label="Search"
                value={search} // Valor del input vinculado al estado
                onChange={handleInputSearch} // Maneja el cambio de texto en el input
            />
            <button className="ms-2 px-4" type="submit">
                Search
            </button>
        </form>
</div>
    );
}

// ContactSupport.js
import React, { useState } from 'react';
import "../../../styles/shops/contactsupport.css";

const ContactSupport = () => {
  const [asunto, setAsunto] = useState("");
  const [contenido, setContenido] = useState("");
  const [ventaId, setVentaId] = useState("");
  const [isVenta, setIsVenta] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isVenta && !ventaId) {
      alert("Por favor, ingrese el ID de la venta.");
      return;
    }
    alert(`Formulario enviado:
    Asunto: ${asunto}
    Contenido: ${contenido}
    ${isVenta ? `ID de Venta: ${ventaId}` : ""}`);
  };

  const handleVentaIdChange = (e) => {
    const value = e.target.value;
    setVentaId(value);
    setIsVenta(value.trim() !== "");
  };

  return (
    <div className="contact-support-container">
      <h2>Contacto con Soporte</h2>
      <form onSubmit={handleSubmit} className="contact-support-form">
        
        {/* Campo opcional para ID de Venta */}
        <div className="form-group">
          <label htmlFor="ventaId">ID de Venta (Opcional)</label>
          <input
            type="text"
            id="ventaId"
            value={ventaId}
            onChange={handleVentaIdChange}
            placeholder="Ingrese el ID de la venta si aplica"
          />
        </div>

        {/* Campo de Asunto */}
        <div className="form-group">
          <label htmlFor="asunto">Asunto *</label>
          <input
            type="text"
            id="asunto"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            placeholder="Escriba el asunto"
            required
          />
        </div>

        {/* Campo de Contenido */}
        <div className="form-group">
          <label htmlFor="contenido">Contenido *</label>
          <textarea
            id="contenido"
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="Describa su consulta"
            required
          />
        </div>

        {/* Botón para enviar */}
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
};

export default ContactSupport;


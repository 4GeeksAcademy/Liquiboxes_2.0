// ContactSupport.js
import React, { useState } from 'react';
import axios from 'axios';
import "../../../styles/shops/contactsupport.css";

const ContactSupport = () => {
  const [newform, setNewForm] = useState({
    saleId: null,
    subjectAffair: "",
    content: ""
  })

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewForm(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');

    try {
      const response = await axios.post(`${process.env.BACKEND_URL}/notifications/shop/contactsupport`,
        newform,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      alert('Notificación de contacto enviada a soporte, contactaremos lo antes posible.')
      // Limpiar el formulario de contacto.
      setNewForm({
        saleId: null,
        subjectAffair: "",
        content: ""
      })
    } catch (error) {
      console.error(error);
    }

  };

  return (
    <div className="contact-support-container">
      <h2>Contacto con Soporte</h2>
      <form onSubmit={handleSubmit} className="contact-support-form">

        {/* Campo opcional para ID de Venta */}
        <div className="form-group">
          <label htmlFor="ventaId">ID de Venta (Opcional)</label>
          <input
            type="number"
            id="ventaId"
            name='saleId'
            value={newform.saleId}
            onChange={handleChange}
            placeholder="Ingrese el ID de la venta si aplica"
          />
        </div>

        {/* Campo de Asunto */}
        <div className="form-group">
          <label htmlFor="asunto">Asunto *</label>
          <input
            type="text"
            id="asunto"
            name='subjectAffair'
            value={newform.subjectAffair}
            onChange={handleChange}
            placeholder="Escriba el asunto"
            required
          />
        </div>

        {/* Campo de Contenido */}
        <div className="form-group">
          <label htmlFor="contenido">Contenido *</label>
          <textarea
            id="contenido"
            name='content'
            value={newform.content}
            onChange={handleChange}
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


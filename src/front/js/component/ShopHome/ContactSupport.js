import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../../../styles/shops/contactsupport.css";
import { useNavigate } from 'react-router-dom';
import ModalGlobal from '../ModalGlobal';
import supportImagen from '/workspaces/Liquiboxes_2.0/src/front/img/rb_2148899114.png';
import supportImage from '/workspaces/Liquiboxes_2.0/src/front/img/rb_2148887720.png';
import { Zoom } from 'react-awesome-reveal';



const ContactSupport = () => {
  const [newform, setNewForm] = useState({
    saleId: null,
    subjectAffair: "",
    content: ""
  });
  const [userType, setUserType] = useState(null);
  const [isModalLoggingOpen, setIsModalLoggingOpen] = useState(false);
  const [isModalSuccessOpen, setIsModalSuccessOpen] = useState(false);
  const navigate = useNavigate();
  const [isModalErrorOpen, setIsModalErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const storedUserType = sessionStorage.getItem('userType');
    setUserType(storedUserType);

    if (!storedUserType) {
      setIsModalLoggingOpen(true);
    }
  }, []);

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

    if (!userType) {
      setIsModalLoggingOpen(true);
      return;
    }

    try {
      const response = await axios.post(`${process.env.BACKEND_URL}/notifications/${userType}/contactsupport`,
        newform,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setIsModalSuccessOpen(true);
      setNewForm({
        saleId: null,
        subjectAffair: "",
        content: ""
      });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Ha ocurrido un error al enviar el mensaje. Por favor, inténtelo de nuevo.');
      setIsModalErrorOpen(true);
    }
  };

  const closeErrorModal = () => {
    setIsModalErrorOpen(false);
  };

  const closeLoginModal = () => {
    setIsModalLoggingOpen(false);
    navigate('/');
  };

  const closeSuccessModal = () => {
    console.log("Tipo de usuario", userType)
    setIsModalSuccessOpen(false);
    if (userType === 'user') {
      navigate('/userdashboard');
      return
    }
    else {
      navigate('/shophome');
    }
  };

  return (
    <div id="contact-support-full-container">
      <div className="contact-support-container">
        <h2>Contacto con Soporte</h2>
        <form onSubmit={handleSubmit} className="contact-support-form">
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

          <button type="submit">Enviar</button>
        </form>

        <ModalGlobal
          isOpen={isModalLoggingOpen}
          onClose={closeLoginModal}
          title="Iniciar sesión requerido"
          body='Para ponerte en contacto con soporte, necesitas iniciar sesión.'
          buttonBody='Iniciar sesión'
        />

        <ModalGlobal
          isOpen={isModalSuccessOpen}
          onClose={closeSuccessModal}
          title='Mensaje de contacto con soporte enviado'
          body='Mensaje de contacto con soporte enviado, contactaremos lo antes posible.'
          buttonBody='Volver al panel de control'
        />

        <ModalGlobal
          isOpen={isModalErrorOpen}
          onClose={closeErrorModal}
          title="Error"
          body={errorMessage}
          buttonBody="Cerrar"
        />
      </div>
    </div>
  );

};

export default ContactSupport;
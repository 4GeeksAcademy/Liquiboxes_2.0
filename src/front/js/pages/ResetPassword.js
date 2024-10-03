import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import '../../styles/resetpassword.css';
import ModalGlobal from '../component/ModalGlobal';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', body: '' });
  const { token } = useParams();
  const navigate = useNavigate();

  const showModal = (title, body, onClose = null) => {
    setModalContent({ title, body, onClose });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      showModal('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      showModal('Error', 'Las contraseñas no coinciden');
      return;
    }
    try {
      await axios.post(`${process.env.BACKEND_URL}/auth/reset-password/${token}`, {
        new_password: password
      });
      showModal('Éxito', 'Contraseña restablecida con éxito', () => navigate('/'));
    } catch (error) {
      showModal('Error', 'Error al restablecer la contraseña');
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-content">
        <div className="reset-password-logo">
          <h1><strong>Liquiboxes</strong></h1>
          <p>Descubre el misterio en cada caja</p>
        </div>
        <div className="reset-password-form-wrapper">
          <h2 className="reset-password-title">Restablecer Contraseña</h2>
          <form onSubmit={handleSubmit} className="reset-password-form">
            <div className="reset-password-form-group">
              <label htmlFor="password">Nueva contraseña</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
            <div className="reset-password-form-group">
              <label htmlFor="confirmPassword">Confirmar nueva contraseña</label>
              <div className="input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmar nueva contraseña"
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            <p className="reset-password-requirements">La contraseña debe tener al menos 8 caracteres</p>
            <button type="submit" className="btn btn-primary reset-password-submit">Restablecer Contraseña</button>
          </form>
        </div>
      </div>

      <ModalGlobal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          if (modalContent.onClose) {
            modalContent.onClose();
          }
        }}
        title={modalContent.title}
        body={modalContent.body}
        buttonBody="Cerrar"
      />
    </div>
  );
}

export default ResetPassword;
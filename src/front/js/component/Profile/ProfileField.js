import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave } from '@fortawesome/free-solid-svg-icons';

export default function ProfileField({ icon, label, value, onEdit, onSave, isEditing, children }) {
  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex align-items-center mb-2">
          <FontAwesomeIcon icon={icon} className="me-3" />
          <h3 className="card-title mb-0">{label}</h3>
        </div>
        <div className="mt-2">
          {isEditing ? (
            <div className="d-flex justify-content-between align-items-center">
              {children}
              <button
                onClick={onSave}
                className="ms-2"
              >
                <FontAwesomeIcon icon={faSave} className="me-1" /> Guardar
              </button>
            </div>
          ) : (
            <div className="d-flex justify-content-between align-items-center">
              <span className="">{value}</span>
              <button
                onClick={onEdit}
                className="p-1"
              >
                <FontAwesomeIcon icon={faEdit} className="me-1" /> Editar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
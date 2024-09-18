import React, { useEffect, useRef } from 'react';
import '../../styles/modal-global.css';

const ModalGlobal = ({ isOpen, onClose, title, body, buttonBody, className }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className={`modal-global-overlay ${isOpen ? 'modal-global-show' : ''}`}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className={`modal-global-content ${className}`}
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-global-title"
                tabIndex="-1"
            >
                <div className="modal-global-header">
                    <h2 id="modal-global-title">{title}</h2>
                    <button
                        onClick={onClose}
                        className="modal-global-close-button"
                        aria-label="Cerrar modal"
                    >
                        ×
                    </button>
                </div>
                <div className="modal-global-body">
                    <p>{body}</p>
                </div>
                <div className="modal-global-footer">
                    <button onClick={onClose} className="modal-global-button">
                        {buttonBody}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalGlobal;
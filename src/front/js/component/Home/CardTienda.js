import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faMapMarkerAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const CardTienda = ({ id, imageSrc, shopName, shopSummary, shopAddress }) => {
    const navigate = useNavigate();

    return (
        <div className="card h-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="position-relative" style={{paddingBottom: '100%', overflow: 'hidden'}}>
                <img 
                    src={imageSrc || "https://via.placeholder.com/300"} 
                    alt={shopName || "Tienda"}
                    className="position-absolute w-100 h-100"
                    style={{objectFit: 'cover', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}
                />
            </div>
            <div className="card-body d-flex flex-column">
                <h5 className="card-title text-truncate">
                    <FontAwesomeIcon icon={faStore} className="me-2" />
                    {shopName || "Tienda sin nombre"}
                </h5>
                <p className="card-text small text-truncate mb-2" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    {shopSummary || "Sin descripción"}
                </p>
                <p className="card-text small text-muted mb-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                    {shopAddress || "Dirección no disponible"}
                </p>
                <button 
                    className="mt-auto w-100"
                    onClick={() => navigate(`/tienda/${id}`)}
                >
                    Ver detalles
                </button>
            </div>
        </div>
    );
};

export default CardTienda;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faMapMarkerAlt, faInfoCircle, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import '../../../styles/cardtienda.css';

const CardTienda = ({ id, imageSrc, shopName, shopSummary, shopAddress }) => {
    const navigate = useNavigate();

    return (
        <div className="card-tienda-shop" >
            <div className="card-img-wrapper-shop" onClick={() => navigate(`/shops/${id}`)}>
                <img 
                    src={imageSrc || "https://via.placeholder.com/300"} 
                    alt={shopName || "Tienda"}
                    className="card-img-shop"
                />
            </div>
            <div className="card-body-shop" onClick={() => navigate(`/shops/${id}`)}>
                <h5 className="card-title-shop">
                    <FontAwesomeIcon icon={faStore} className="icon-shop" />
                    {shopName || "Tienda sin nombre"}
                </h5>
                <p className="card-text-shop card-summary-shop">
                    <FontAwesomeIcon icon={faInfoCircle} className="icon-shop" />
                    {shopSummary || "Sin descripción"}
                </p>
                <p className="card-text-shop card-address-shop">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="icon-shop" />
                    {shopAddress || "Dirección no disponible"}
                </p>
                <button 
                    className="card-button-shop"
                    onClick={() => navigate(`/shops/${id}`)}
                >
                    <FontAwesomeIcon icon={faBoxOpen} className="icon-shop" />
                    Ver detalles
                </button>
            </div>
        </div>
    );
};

export default CardTienda;
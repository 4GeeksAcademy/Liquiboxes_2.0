import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faEuroSign, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import '../../../styles/cardtienda.css' 

function CardMBoxPreview({ data }) {


  return (
    <div className="card-tienda-shop">
      <div className="card-img-wrapper-shop">
        <img
          src={data.image_url}
          alt={data.name}
          className="card-img-shop"
        />
      </div>
      <div className="card-body-shop">
        <h2 className="card-title-shop">{data.name}</h2>
        <p className="card-text-shop">
          <FontAwesomeIcon icon={faStore} className="icon-shop" />
          {data.shop_name}
        </p>
        <p className="card-text-shop">
          <FontAwesomeIcon icon={faEuroSign} className="icon-shop" />
          {Number(data.price).toFixed(2)}
        </p>
        <p className="card-text-shop card-address-shop">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="icon-shop" />
          {data.address || 'Dirección no disponible'}
        </p>
        <button className="card-button-shop" >
          Ver detalles
        </button>
          <button className="card-button-shop">
            Comprar Ya
          </button>
      </div>
    </div>
  );
}

export default CardMBoxPreview;
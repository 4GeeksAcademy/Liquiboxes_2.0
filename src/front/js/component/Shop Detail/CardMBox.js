import React, { useContext } from "react";
import { Context } from "../../store/appContext";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faEuroSign, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import '../../../styles/cardtienda.css' // Asegúrate de que este archivo exista y contenga los estilos de cardtienda

function CardMBox({ data }) {
  const navigate = useNavigate();
  const { actions } = useContext(Context);
  const token = sessionStorage.getItem('token')



  const handleButtonClick = () => {
    navigate(`/mysterybox/${data.id}`);
  };

 
  const handleBuyNow = async (id) => {
    try {
      await actions.addToCart(id);
      const mysteryBoxDetails = await actions.fetchSingleItemDetail(id);
      if (mysteryBoxDetails) {
        // Actualizar cartWithDetails
        actions.updateCartWithDetails([mysteryBoxDetails]);
        navigate('/payingform');
      } else {
        throw new Error('No se pudo obtener los detalles de la Mystery Box');
      }
    } catch (error) {
      console.error('Error en Comprar Ya:', error);
      alert('No se ha podido utilizar Comprar Ya: ' + error.message);
    }
  };

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
        <button className="card-button-shop" onClick={handleButtonClick}>
          Ver detalles
        </button>
        {token ? (
          <button className="card-button-shop btn-secondary" onClick={() => handleBuyNow(data.id)}>
            Comprar Ya
          </button>
        ) : (
          <button className="card-button-shop btn-secondary" onClick={() => navigate('/', { state: { from: location.pathname } })}>
            Inicia sesión para comprar ya
          </button>
        )}
      </div>
    </div>
  );
}

export default CardMBox;
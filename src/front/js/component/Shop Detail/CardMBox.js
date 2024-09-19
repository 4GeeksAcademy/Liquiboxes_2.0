import React, { useContext } from "react";
import { Card, Button } from 'react-bootstrap';
import { Context } from "../../store/appContext";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faEuroSign, faBoxOpen, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import '../../../styles/cardmbox.css'

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
    <Card className='card-container my-4'>
      <div className="card-img-wrapper">
        <Card.Img
          src={data.image_url}
          alt={data.name}
        />
      </div>
      <Card.Body className='card-body'>
        <Card.Title className='card-title'>{data.name}</Card.Title>
        <Card.Subtitle className='card-subtitle'>
          <FontAwesomeIcon icon={faStore} /> {data.shop_name}
        </Card.Subtitle>
        <Card.Text className='card-text'>
          <FontAwesomeIcon icon={faEuroSign} /> {Number(data.price).toFixed(2)}
        </Card.Text>
        <Button className='card-button' onClick={handleButtonClick}>
          <FontAwesomeIcon icon={faBoxOpen} /> Ver detalles
        </Button>
        {token ? <Button className='card-button' onClick={() => { handleBuyNow(data.id) }}>
          <FontAwesomeIcon icon={faShoppingCart} /> Comprar Ya
        </Button>
            : <Button className='card-button' onClick={() => { navigate('/', { state: { from: location.pathname } }) }}>
            Inicia sesión para comprar ya
          </Button>
            }
        
      </Card.Body>
    </Card>
  );
}

export default CardMBox;
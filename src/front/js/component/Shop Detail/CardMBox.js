import React from 'react';
import Card from 'react-bootstrap/Card';
import "../../../styles/cardmbox.css";
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faEuroSign, faBoxOpen } from '@fortawesome/free-solid-svg-icons'; 

function CardMBox({ data }) {
  const navigate = useNavigate(); // Inicializa useNavigate

  const handleButtonClick = () => {
    // Navega al endpoint con el ID del objeto data
    navigate(`/mysterybox/${data.id}`);
  };

  //DATOS DE LAS MISTERYBOXES QUE TIENE DISPONIBLE CADA TIENDA
  return (
    <Card className='card-container mt-5'>
      <Card.Img
        variant="top"
        className='card-img'
        src={data.image_url}
      />
      <Card.Body className='card-body'>
        <Card.Title className='card-title'>
          {data.name} 
        </Card.Title>
        <Card.Subtitle className='card-subtitle'>
          <FontAwesomeIcon icon={faStore} /> Tienda: {data.shop_name}
        </Card.Subtitle>
        <Card.Text className='card-text'>
          <FontAwesomeIcon icon={faEuroSign} /> Precio: {data.price} <br />
        </Card.Text>
        <Button className='card-button' onClick={handleButtonClick}>
          <FontAwesomeIcon icon={faBoxOpen} /> Check Mystery Box
        </Button>
      </Card.Body>
    </Card>
  );
}

export default CardMBox;

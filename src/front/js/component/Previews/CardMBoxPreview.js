import React from "react";
import { Card, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faEuroSign, faBoxOpen, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import '../../../styles/cardmbox.css'

function CardMBoxPreview({ data }) {


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
        <Button className='card-button' >
          <FontAwesomeIcon icon={faBoxOpen} /> Ver detalles
        </Button>
       <Button className='card-button'>
          <FontAwesomeIcon icon={faShoppingCart} /> Comprar Ya
        </Button>
      </Card.Body>
    </Card>
  );
}

export default CardMBoxPreview;
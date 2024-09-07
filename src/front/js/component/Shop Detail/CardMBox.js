import React from 'react';
import Card from 'react-bootstrap/Card';
import "../../../styles/cardmbox.css";
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

function CardMBox({ data }) {
  const navigate = useNavigate(); // Inicializa useNavigate

  const handleButtonClick = () => {
    // Navega al endpoint con el ID del objeto data
    navigate(`/mysterybox/${data.id}`);
  };

  return (
    <Card className='container p-3' border="info" style={{ width: '18rem' }}>
      <Card.Img variant="top" className='card-img'
        src="https://t4.ftcdn.net/jpg/05/81/14/19/360_F_581141998_4eswgrNT97MJAc2RXm0A9GHGeJ6BX3cb.jpg" alt={data.name} />
      <Card.Body>
        {/* Título con el nombre del artículo */}
        <Card.Title>{data.name}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">Tienda: {data.shop_name}</Card.Subtitle>

        {/* Información adicional: Precio, ID de tienda, Total de ventas y Categorías */}
        <Card.Text>
          Precio: {data.price} <br />
          ID de tienda: {data.shop_id} <br />
          Total de ventas: {data.total_sales} <br />
          Categorías: {data.shop_categories}
        </Card.Text>

        <Button variant="primary" onClick={handleButtonClick}>Check Mystery Box</Button>
      </Card.Body>
    </Card>
  );
}

export default CardMBox;

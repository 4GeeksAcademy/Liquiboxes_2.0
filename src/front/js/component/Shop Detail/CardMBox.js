import React from 'react';
import Card from 'react-bootstrap/Card';
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
      <Card.Img variant="top" src="https://images.pexels.com/photos/1666070/pexels-photo-1666070.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt={data.name} />
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

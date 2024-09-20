import React, { useEffect, useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import axios from 'axios'; 

function CarruselTopSellers() {
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const url = `${process.env.BACKEND_URL}/shops`; 
        console.log('Fetching shops from:', url);

        const response = await axios.get(url);
        console.log('API response:', response);

        let shopsData;
        if (Array.isArray(response.data)) {
          shopsData = response.data;
        } else if (typeof response.data === 'object' && response.data !== null) {
          shopsData = response.data.shops || response.data.data || [];
        } else {
          shopsData = [];
        }

        console.log('Processed shops data:', shopsData);

        setShops(shopsData);
      } catch (error) {
        console.error("Error fetching shops:", error);
        console.error("Error details:", error.response || error.message);
        setError("No se pudieron cargar las tiendas. Por favor, intente más tarde.");
        setShops([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShops();
  }, []);

  if (isLoading) {
    return <div>Cargando tiendas...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="carousel-container">
      <Carousel fade>
        {shops.map((shop, index) => (
          <Carousel.Item key={shop.id}>
            <img
              className="img-fluid"
              src={shop.image_shop_url} 
              alt={`Slide ${index + 1}`}
            />
            <Carousel.Caption>
              <h3>{shop.name}</h3>
              <p>{shop.shop_summary}</p> 
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
}

export default CarruselTopSellers;

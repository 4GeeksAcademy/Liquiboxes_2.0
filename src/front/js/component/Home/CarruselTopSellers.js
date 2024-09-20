import React from 'react';
import Carousel from 'react-bootstrap/Carousel';

function CarruselTopSellers({ shopData }) {
    return (
        <div className="carousel-container">
            <Carousel fade>
                {shopData.map((shop, index) => (
                    <Carousel.Item key={shop.id}>
                        <img
                            className="d-block w-100 carousel-image image-fluid"
                            src={shop.image_shop_url} // Asegúrate de que la tienda tenga una imagen
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

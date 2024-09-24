import React from 'react';
import Carousel from 'react-bootstrap/Carousel';
import { useNavigate } from 'react-router-dom';

function CarruselTopSellers({ shopData }) {
    const navigate = useNavigate();
    const handleButtonClick = (id) => {
        navigate(`/shops/${id}`);
    };

    return (
        <div className="container">
            <Carousel fade>
                {shopData.map((shop, index) => (
                    <Carousel.Item key={shop.id}>
                        <div className="ratio ratio-16x9">
                            <img
                                onClick={() => handleButtonClick(shop.id)}
                                className="img-fluid w-100 h-100 object-fit-cover"
                                src={shop.image_shop_url}
                                alt={`Slide ${index + 1}`}
                                style={{ cursor: 'pointer' }}
                            />
                        </div>
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
export default CarruselTopSellers
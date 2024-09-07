import React, { useState } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import CardTienda from "./CardTienda";

// Componentes de flecha personalizados utilizando FontAwesome
const PreviousArrow = ({ className, style, onClick }) => {
  return (
    <div
      className={`rounded-2 ${className}`}
      style={{ ...style, display: "block", background: "#6a8e7fff"}}
      onClick={onClick}
    >
      <FontAwesomeIcon icon={faChevronLeft} size="2x" style={{ color: '#333'}}  />
    </div>
  );
};

const NextArrow = ({ className, style, onClick }) => {
  return (
    <div
    className={`rounded-2 ${className}`}
    style={{ ...style, display: "block", background: "#6a8e7fff"}}
    onClick={onClick}
    >
      <FontAwesomeIcon icon={faChevronRight} size="2x" style={{ color: '#333' }} />
    </div>
  );
};

function ScrollHorizontalShops({ cardsData }) {
  const [slides, setSlides] = useState(cardsData);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    prevArrow: <PreviousArrow />, // Usa el componente de flecha personalizado
    nextArrow: <NextArrow />,     // Usa el componente de flecha personalizado
        responsive: [
      {
        breakpoint: 1200, // dispositivos grandes
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
        }
      },
      {
        breakpoint: 992, // dispositivos medianos
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        }
      },
      {
        breakpoint: 768, // dispositivos pequeños
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        }
      },
      {
        breakpoint: 576, // dispositivos extra pequeños
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  return (
    <div className="slider-container">
      <Slider {...settings}>
        {slides.map((card) => (
          <div key={card.id}>
            {/* Renderiza CardTienda con los datos de la tienda */}
            <CardTienda
              imageSrc={card.image_shop_url}
              title={card.shop_name}
              text={card.shop_summary}
              link={card.id}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default ScrollHorizontalShops;

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
      style={{ ...style, display: "block", background: "#6a8e7fff" }}
      onClick={onClick}
    >
      <FontAwesomeIcon icon={faChevronLeft} size="2x" style={{ color: '#333' }} />
    </div>
  );
};

const NextArrow = ({ className, style, onClick }) => {
  return (
    <div
      className={`rounded-2 ${className}`}
      style={{ ...style, display: "block", background: "#6a8e7fff" }}
      onClick={onClick}
    >
      <FontAwesomeIcon icon={faChevronRight} size="2x" style={{ color: '#333' }} />
    </div>
  );
};

function ScrollHorizontalShops({ cardsData }) {

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4, // Por defecto, para pantallas grandes
    slidesToScroll: 1,
    prevArrow: <PreviousArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1400, // Extra large devices
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 1200, // Large devices
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 992, // Medium devices
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768, // Small devices
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 576, // Extra small devices
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false, // Ocultar flechas en dispositivos muy pequeños
          dots: true, // Mantener los puntos para navegación
        }
      }
    ]
  };

  return (
    <div className="slider-container">
      <Slider {...settings}>
        {cardsData.map((card) => {
          console.log("Renderizando tienda:", card);
          return (
            <div key={card.id}>
              <CardTienda
                id={card.id}
                imageSrc={card.image_shop_url}
                shopName={card.name}
                shopSummary={card.shop_summary}
                shopAddress={card.address}
              />
            </div>
          );
        })}
      </Slider>
    </div>
  );
}

export default ScrollHorizontalShops;

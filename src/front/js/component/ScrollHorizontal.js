import React from 'react';
import Slider from "react-slick";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../../styles/scrollhorizontal.css';

const Arrow = ({ direction, onClick }) => (
  <button
    className={`arrow-scrollhorizontal ${direction === 'prev' ? 'arrow-prev-scrollhorizontal' : 'arrow-next-scrollhorizontal'}`}
    onClick={onClick}
    aria-label={direction === 'prev' ? 'Previous' : 'Next'}
  >
    <FontAwesomeIcon icon={direction === 'prev' ? faChevronLeft : faChevronRight} />
  </button>
);

const ScrollHorizontal = ({ items, renderItem, title, subtitle }) => {
  const shouldAutoplay = items.length > 5;

  const settings = {
    dots: true,
    infinite: shouldAutoplay, // Solo infinito si hay más de 5 elementos
    speed: 300,
    slidesToShow:5, // Mostrar como máximo 5 slides
    slidesToScroll: 1,
    prevArrow: <Arrow direction="prev" />,
    nextArrow: <Arrow direction="next" />,
    autoplay: shouldAutoplay, // Solo autoplay si hay más de 5 elementos
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: Math.min(3, items.length) } },
      { breakpoint: 992, settings: { slidesToShow: Math.min(2, items.length) } },
      { breakpoint: 576, settings: { slidesToShow: 1, arrows: false } }
    ],
    dotsClass: 'slick-dots dots-scrollhorizontal',
    customPaging: (i) => (
      <div className="dot-scrollhorizontal">
        <button>{i + 1}</button>
      </div>
    )
  };

  return (
    <div className="container-scrollhorizontal">
      {title && <h2 className="title-scrollhorizontal">{title}</h2>}
      {subtitle && <p className="subtitle-scrollhorizontal">{subtitle}</p>}
      <Slider {...settings}>
        {items.map((item, index) => (
          <div key={item.id || index} className="item-scrollhorizontal">
            {renderItem(item)}
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ScrollHorizontal;
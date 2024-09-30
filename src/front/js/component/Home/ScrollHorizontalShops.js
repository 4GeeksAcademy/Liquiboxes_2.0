import React from 'react';
import ScrollHorizontal from '../ScrollHorizontal';
import CardTienda from "./CardTienda";

const ScrollHorizontalShops = ({ cardsData }) => (
  <ScrollHorizontal
    items={cardsData}
    renderItem={(card) => (
      <CardTienda
        id={card.id}
        imageSrc={card.image_shop_url}
        shopName={card.name}
        shopSummary={card.shop_summary}
        shopAddress={card.address}
      />
    )}
    
    title="Descubre Nuestras Tiendas"
    subtitle="Explora una variedad de tiendas únicas y emocionantes recomendadas para tí"
  />
);

export default ScrollHorizontalShops;
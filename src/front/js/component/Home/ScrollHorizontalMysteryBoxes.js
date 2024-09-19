import React from 'react';
import ScrollHorizontal from '../ScrollHorizontal';
import CardMBox from '../Shop Detail/CardMBox';

const ScrollHorizontalMysteryBoxes = ({ mysteryBoxes }) => (
    <ScrollHorizontal
      items={mysteryBoxes}
      renderItem={(box) => <CardMBox data={box} />}
      title="Mystery Boxes"
      subtitle="Descubre sorpresas emocionantes en cada caja"
    />
  );
  
  export default ScrollHorizontalMysteryBoxes;
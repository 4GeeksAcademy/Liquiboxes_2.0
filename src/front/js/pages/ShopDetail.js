import React, { useState } from 'react';

function ShopDetail() {
  const [isArmarioVisible, setIsArmarioVisible] = useState(false);

  const showArmario = () => setIsArmarioVisible(true);
  const showValoraciones = () => setIsArmarioVisible(false);

  return (

    <>

      <img src=''></img>
      <>
        <div>
          <h3>Nombre: nombre tienda</h3>

        </div>
        <div>
          <button>mensaje</button>
          <button>seguir</button>
        </div>
      </>



      <div>
        <button type="button" className='fa-solid fa-table-cells-large' onClick={showArmario}>
        </button>
        <button className='fa-solid fa-align-justify' type="button" onClick={showValoraciones}>
        </button>

        {isArmarioVisible ? (
          <p>Aquí va el armario</p>
        ) : (
          <p>Aquí van las valoraciones</p>
        )}
      </div>
    </>

  );
}

export default ShopDetail;

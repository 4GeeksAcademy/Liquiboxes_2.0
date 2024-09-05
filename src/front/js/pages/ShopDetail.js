import React, { useContext, useEffect } from 'react'
import HeaderShop from '../component/Shop Detail/HeaderShop';
import { useState } from 'react';
import { Context } from '../store/appContext';
import { useParams } from 'react-router-dom';
import RatingSystem from '../component/Shop Detail/RatingSystem';

export default function ShopDetail() {

  const [isArmarioVisible, setIsArmarioVisible] = useState(false);
  const showArmario = () => setIsArmarioVisible(true);
  const showValoraciones = () => setIsArmarioVisible(false);

  const { store, actions } = useContext(Context)

  const [shopDetail, setShopDetail] = useState([])
  const { id } = useParams()

  useEffect(() => {
    actions.getShopDetail(id);
    setShopDetail(store.shopDetail)
    console.log(shopDetail)

  }, [])


  return (
    <>
      <HeaderShop data={store.shopDetail} />

      <div> {/*BOTONES PARA CAMBIAR ENTRE CARDS Y VALORACIONES*/}
        <div className="row">
          <div className="col text-center">
            <button
              type="button"
              className="fa-solid fa-table-cells-large"
              onClick={showArmario}
            >
            </button>
            <button
              type="button"
              className="fa-solid fa-align-justify"
              onClick={showValoraciones}
            >
            </button>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col text-center">
            {isArmarioVisible ? (
              <p>Aquí va el armario</p>
            ) : (
              <p>Aquí van las valoraciones</p>
            )}
          </div>
        </div>
      </div> {/*FINALIZA BOTONES PARA CAMBIAR ENTRE CARDS Y VALORACIONES*/}
      
      <RatingSystem />
    </>

  )
}
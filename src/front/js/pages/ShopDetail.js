import React, { useContext, useEffect } from 'react';
import HeaderShop from '../component/Shop Detail/HeaderShop';
import { useState } from 'react';
import { Context } from '../store/appContext';
import { useParams } from 'react-router-dom';
import CardMBox from '../component/Shop Detail/CardMBox';
import SwitchButtons from '../component/Shop Detail/SwitchButtons';
export default function ShopDetail() {


  const { store, actions } = useContext(Context);
  const { id } = useParams();  // ID de la tienda y del card

  //trae los datos de la tienda y el ID
  useEffect(() => {
    actions.getShopDetail(id);
    actions.getCardID(id);
  }, [id, actions]);



  return (
    <main>

      <HeaderShop data={store.shopDetail} />
      <SwitchButtons />
      <CardMBox data={store.cardID} />

    </main>
  );
}

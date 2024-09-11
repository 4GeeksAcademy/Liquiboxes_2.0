import React, { useContext, useEffect, useState } from 'react';
import HeaderShop from '../component/Shop Detail/HeaderShop';
import { Context } from '../store/appContext';
import { useParams } from 'react-router-dom';
import CardMBox from '../component/Shop Detail/CardMBox';
import SwitchButtons from '../component/Shop Detail/SwitchButtons';

export default function ShopDetail() {
  const [mysteryBoxes, setMysteryBoxes] = useState([]);
  const [boxVisible, setBoxVisible] = useState(true);  // Maneja el estado entre cajas y valoraciones
  const { store, actions } = useContext(Context);
  const { id } = useParams();  // ID de la tienda

  // Trae los datos de la tienda y del ID
  useEffect(() => {
    const fetchData = async () => {
      await actions.getShopDetail(id);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!store.isLoading && !store.showError) {
      setMysteryBoxes(store.shopDetail.mystery_boxes);
    }
  }, [store.isLoading, store.showError, store.mysteryBoxDetail]);

  if (store.isLoading) {
    return <div className="text-center mt-5">Cargando...</div>;
  }

  return (
    <main>
      <HeaderShop data={store.shopDetail} />

      {/* Pasa el estado y la función a SwitchButtons */}
      <SwitchButtons boxVisible={boxVisible} setBoxVisible={setBoxVisible} />

      <div className="mb-5">
        {/* Renderiza las mystery boxes solo si boxVisible es true */}
        {boxVisible && mysteryBoxes && (
          <div className='row mx-5'>
            {mysteryBoxes.map((mysterybox) => {
              console.log("Renderizando mystery box:", mysterybox);
              return (
                <div key={mysterybox.id} className='col-12 col-md-6 col-lg-4 col-xl-3 col-xxl-2'>
                  <CardMBox data={mysterybox} />
                </div>
              );
            })}
          </div>
        )}

        {/* Si boxVisible es false, se muestran las Valoraciones" */}
        {!boxVisible && (
          <div className="text-center mt-5">
            <p>Aquí van las Valoraciones</p>
          </div>
        )}
      </div>

    </main>
  );
}

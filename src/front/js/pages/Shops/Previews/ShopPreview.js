import React, { useContext, useEffect, useState } from 'react';
import HeaderShop from '../../../component/Shop Detail/HeaderShop';
import { Context } from '../../../store/appContext';
import { useNavigate, useParams } from 'react-router-dom';
import SwitchButtons from '../../../component/Shop Detail/SwitchButtons';
import CardMBoxPreview from '../../../component/Previews/CardMBoxPreview';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function ShopPreview() {
  const [mysteryBoxes, setMysteryBoxes] = useState([]);
  const [boxVisible, setBoxVisible] = useState(true);  // Maneja el estado entre cajas y valoraciones
  const { store, actions } = useContext(Context);
  const { id } = useParams();  // ID de la tienda
  const navigate = useNavigate()

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
      <div>
        <button className='btn-primary p-2' onClick={() => {navigate('/shophome')}}><FontAwesomeIcon icon={faArrowLeft} className='me-2' />Volver</button>
      </div>
      <HeaderShop data={store.shopDetail} />

      {/* Pasa el estado y la función a SwitchButtons */}
      <SwitchButtons boxVisible={boxVisible} setBoxVisible={setBoxVisible} />

      <div className="mb-5">
        {/* Renderiza las mystery boxes solo si boxVisible es true */}
        {boxVisible && mysteryBoxes && (
          <div className='row mx-5'>
            {mysteryBoxes.map((mysterybox) => {
              return (
                <div key={mysterybox.id} className='col-12 col-md-6 col-lg-4 col-xl-3'>
                  <CardMBoxPreview data={mysterybox} />
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

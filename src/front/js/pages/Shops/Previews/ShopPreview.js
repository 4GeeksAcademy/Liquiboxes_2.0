import React, { useContext, useEffect, useState } from 'react';
import HeaderShop from '../../../component/Shop Detail/HeaderShop';
import { Context } from '../../../store/appContext';
import { useNavigate, useParams } from 'react-router-dom';
import CardMBoxPreview from '../../../component/Previews/CardMBoxPreview';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Spinner from '../../../component/Spinner';
import { faBoxOpen, faStar } from '@fortawesome/free-solid-svg-icons'; // Importa los íconos


export default function ShopPreview() {
  const [mysteryBoxes, setMysteryBoxes] = useState([]);
  const { store, actions } = useContext(Context);
  const { id } = useParams();  // ID de la tienda
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true);


  // Trae los datos de la tienda y del ID
  useEffect(() => {
    const fetchData = async () => {
      await actions.getShopDetail(id);
      setTimeout(() => setIsLoading(false), 500);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!store.isLoading && !store.showError) {
      setMysteryBoxes(store.shopDetail.mystery_boxes);
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [store.isLoading, store.showError, store.mysteryBoxDetail]);

  if (isLoading) {
    return (
      <Spinner />
    );
  }

  return (
    <main>
      <div>
        <button className='btn-primary p-2' onClick={() => { navigate('/shophome') }}><FontAwesomeIcon icon={faArrowLeft} className='me-2' />Volver</button>
      </div>
      <HeaderShop data={store.shopDetail} />

      {/* Pasa el estado y la función a SwitchButtons */}
      <div>
        <div className="row">
          <div className="col text-center">
            {/* Botón para mostrar las Cajas */}
            <button
              type="button"
              className="btn btn-primary mx-2"
            >
              <FontAwesomeIcon icon={faBoxOpen} /> Cajas
            </button>

            {/* Botón para mostrar las Valoraciones */}
            <button
              type="button"
              className="btn btn-primary mx-2"
            >
              <FontAwesomeIcon icon={faStar} /> Valoraciones
            </button>
          </div>
        </div>
      </div>

      <div className="mb-5 mt-4">
        {/* Renderiza las mystery boxes solo si boxVisible es true */}
          <div className='row mx-5'>
            {mysteryBoxes.map((mysterybox) => {
              return (
                <div key={mysterybox.id} className='col-12 col-md-6 col-lg-4 col-xl-3'>
                  <CardMBoxPreview data={mysterybox} />
                </div>
              );
            })}
          </div>

      </div>

    </main>
  );
}

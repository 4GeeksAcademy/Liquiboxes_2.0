import React, { useContext, useEffect, useState } from 'react';
import HeaderShop from '../component/Shop Detail/HeaderShop';
import { Context } from '../store/appContext';
import { useParams } from 'react-router-dom';
import CardMBox from '../component/Shop Detail/CardMBox';
import SwitchButtons from '../component/Shop Detail/SwitchButtons';
import RatingSystem from '../component/Shop Detail/RatingSystem';
import Spinner from '../component/Spinner';
import NotType from '../component/Utils/NotType';
import ModalGlobal from '../component/ModalGlobal';


export default function ShopDetail() {
  const [mysteryBoxes, setMysteryBoxes] = useState([]);
  const [boxVisible, setBoxVisible] = useState(true);  // Maneja el estado entre cajas y valoraciones
  const { store, actions } = useContext(Context);
  const { id } = useParams();  // ID de la tienda
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', body: '' });

  // Trae los datos de la tienda y del ID
  useEffect(() => {
    const fetchData = async () => {
      try {
        await actions.getShopDetail(id);
        setTimeout(() => setLoading(false), 500);
      } catch (error) {
        showModal("Error", "No se pudo cargar los detalles de la tienda. Por favor, intentelo más tarde.");
        setLoading(false);
      }
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

  const showModal = (title, body) => {
    setModalContent({ title, body });
    setModalOpen(true);
  };

  if (loading) return <Spinner />

  return (
    <main>
      <HeaderShop data={store.shopDetail} />

      {/* Pasa el estado y la función a SwitchButtons */}
      <SwitchButtons boxVisible={boxVisible} setBoxVisible={setBoxVisible} />

      <div className="container mt-4">
        {/* Renderiza las mystery boxes solo si boxVisible es true */}
        {boxVisible && mysteryBoxes && (
          <div className="row">
            {mysteryBoxes.map((mysterybox) => {
              return (
                <div key={mysterybox.id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                  <CardMBox data={mysterybox} />
                </div>
              );
            })}
          </div>
        )}

        {/* Renderiza las VALORACIONES */}
        {!boxVisible && (
          <div>
            <RatingSystem />
          </div>
        )}
      </div>

      <ModalGlobal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalContent.title}
        body={modalContent.body}
        buttonBody="Cerrar"
      />

      <NotType user_or_shop='user' />

    </main >
  );
}

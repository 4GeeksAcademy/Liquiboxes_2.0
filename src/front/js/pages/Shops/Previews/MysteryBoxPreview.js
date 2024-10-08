import React, { useContext, useEffect, useState } from 'react';
import { Context } from '../../../store/appContext';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faHome, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../../../../styles/mysteryboxdetail.css';
import Spinner from '../../../component/Spinner';

function MysteryBoxPreview() {
  const { store, actions } = useContext(Context);
  const [mysteryBox, setMysteryBox] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    const fetchData = async () => {
      await actions.getMysteryBoxDetail(id);
      setTimeout(() => setLoading(false), 500);
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!store.isLoading && !store.showError) {
      setMysteryBox(store.mysteryBoxDetail);
    }
  }, [store.isLoading, store.showError, store.mysteryBoxDetail]);



  const handleCloseError = () => {
    navigate('/home');
  };


  if (loading) {
    return <Spinner />
  }

  if (store.showError) {
    return (
      <div className={`modal ${store.showError ? 'd-block' : ''}`} tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Mystery Box no encontrada</h5>
              <button type="button" className="close" onClick={handleCloseError} aria-label="Close">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              <p>Lo sentimos, no hemos encontrado la Mystery Box que estás buscando.</p>
              <p>Por favor, verifica el enlace o intenta con otra Mystery Box. Si el problema persiste, no dudes en contactar con nuestro servicio de atención al cliente.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={handleCloseError}>
                <FontAwesomeIcon icon={faHome} className="me-2" />
                Volver a la página principal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!mysteryBox) {
    return null;
  }

  return (
    <>
      <div>
        <button className='btn-primary p-2' onClick={() => { navigate('/shophome') }}><FontAwesomeIcon icon={faArrowLeft} className='me-2' />Volver</button>
      </div>
      <div className="mysterybox-detail container my-5">
        <div className="row">
          {/* Sección de Imágenes */}
          <div className="col-md-8 images-section my-auto mx-auto">
            <div className="main-image px-2">
              <img src={mysteryBox.image_url} className="img-fluid" alt={mysteryBox.name} />
            </div>
          </div>

          {/* Sección de Detalles */}
          <div className="col-md-4 details-section mt-3 my-md-auto">
            <div className='row d-flex aling-items-center'>
              <div className='col-12 col-lg-6 my-auto'>
                <div className="item-info">
                  <p><strong>Nombre:</strong> {mysteryBox.name}</p>
                  <p><strong>Tamaño:</strong> {mysteryBox.size}</p>
                  <p><strong>Número de ítems:</strong> {mysteryBox.number_of_items}</p>
                </div>
              </div>
              <div className='col-12 col-lg-6 my-auto'>
                <div className="possible-items">
                  <h4><strong>Ítems posibles:</strong></h4>
                  <ul>
                    {mysteryBox.possible_items && (
                      mysteryBox.possible_items.map((item, index) => (
                        <li key={index}>{item}</li>
                      )))}
                  </ul>
                </div>
                <div className="shipping-info">
                </div>
              </div>
            </div>
            <h2>Descripción</h2>
            <p>{mysteryBox.description}</p>

            <div className="price-info">
              <h3>{mysteryBox.price} €</h3>
            </div>

            <div className="action-buttons mt-4">
              <button
                type="button"
                className="btn btn-primary w-100 mb-2"
              >
                Comprar Ahora
              </button>

              <button type="button" className="btn btn-secondary w-100" >Añadir al Carrito</button>

              <p className='sending-price'><strong>Envío:</strong> desde 3,99 €</p>

            </div>
          </div>
        </div>

      </div>
    </>

  );
}

export default MysteryBoxPreview;

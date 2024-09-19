import React, { useContext, useEffect, useState } from 'react';
import { Context } from '../store/appContext';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faHome } from '@fortawesome/free-solid-svg-icons';
import '../../styles/mysteryboxdetail.css';

function MysteryBoxDetail() {
  const { store, actions } = useContext(Context);
  const [mysteryBox, setMysteryBox] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token')

  useEffect(() => {
    const fetchData = async () => {
      await actions.getMysteryBoxDetail(id);
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!store.isLoading && !store.showError) {
      setMysteryBox(store.mysteryBoxDetail);
    }
  }, [store.isLoading, store.showError, store.mysteryBoxDetail]);

  const handleAddToCart = () => {
    actions.addToCart(id);
  };

  const handleCloseError = () => {
    navigate('/home');
  };

  const handleBuyNow = async (id) => {
    try {
      await actions.addToCart(id);
      const mysteryBoxDetails = await actions.fetchSingleItemDetail(id);
      if (mysteryBoxDetails) {
        // Actualizar cartWithDetails
        actions.updateCartWithDetails([mysteryBoxDetails]);
        navigate('/payingform');
      } else {
        throw new Error('No se pudo obtener los detalles de la Mystery Box');
      }
    } catch (error) {
      console.error('Error en Comprar Ya:', error);
      alert('No se ha podido utilizar Comprar Ya: ' + error.message);
    }
  };

  if (store.isLoading) {
    return <div className="text-center mt-5">Cargando...</div>;
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
    <div className="mysterybox-detail container my-5">
      <div className="row">
        {/* Sección de Imágenes */}
        <div className="col-md-6 images-section">
          <div className="main-image">
            <img src={mysteryBox.image_url} className="img-fluid" alt={mysteryBox.name} />
          </div>
          <div className="thumbnail-images d-flex justify-content-start mt-2">
            {/* Añadir thumbnails adicionales si tienes */}
            <img src={mysteryBox.image_url} className="img-thumbnail" alt="Thumbnail 1" />
            <img src={mysteryBox.image_url} className="img-thumbnail" alt="Thumbnail 2" />
          </div>
        </div>

        {/* Sección de Detalles */}
        <div className="col-md-6 details-section">
          <div className="price-info">
            <h3>{mysteryBox.price} €</h3>
          </div>
          <div className="item-info">
            <p><strong>Nombre:</strong> {mysteryBox.name}</p>
            <p><strong>Tamaño:</strong> {mysteryBox.size}</p>
            <p><strong>Número de ítems:</strong> {mysteryBox.number_of_items}</p>
            <h2>Descripción</h2>
            <p>{mysteryBox.description}</p>
          </div>
          <div className="possible-items">
            <h4>Ítems posibles:</h4>
            <ul>
              {mysteryBox.possible_items && (
                mysteryBox.possible_items.map((item, index) => (
                  <li key={index}>{item}</li>
                )))}
            </ul>
          </div>
          <div className="shipping-info">
            <p><strong>Envío:</strong> desde 3,99 €</p>
          </div>
          <div className="action-buttons mt-4">
            {token ? (
              <button
                type="button"
                className="btn btn-primary w-100 mb-2"
                onClick={() => handleBuyNow(mysteryBox.id)}
              >
                Comprar Ahora
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary w-100 mb-2"
                onClick={() => navigate('/', { state: { from: location.pathname } })}
              >
                Inicia sesión para comprar ya
              </button>
            )}
            <button type="button" className="btn btn-secondary w-100" onClick={handleAddToCart}>Añadir al Carrito</button>
          </div>
        </div>
      </div>

      {/* Sección de Valoraciones */}
      <div className="row reviews-section mt-4">
        <div className="col-12">
          <p><strong>4,9 (995 valoraciones)</strong> - Bermington (nombre tienda)</p>
          <hr />
          <div className="horizontal-scroll">
            {/* Aquí puedes implementar el scroll horizontal para las valoraciones */}
            <p>Valoraciones... (Scroll horizontal)</p>
          </div>
          <button type="button" className="btn btn-link">Ver todas las valoraciones</button>
        </div>
      </div>
    </div>
  );
}

export default MysteryBoxDetail;

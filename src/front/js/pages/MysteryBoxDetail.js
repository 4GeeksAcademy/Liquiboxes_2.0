import React, { useState } from 'react';

function MysteryBoxDetail() {
  const [mysteryBox, setMysteryBox] = useState({
    "description": "caja",
    "id": 1,
    "image_url": "https://res.cloudinary.com/dg7u2cizh/image/upload/v1725295377/njjhz7ecu6wmhnc8odzm.jpg",
    "name": "caja",
    "number_of_items": 12,
    "possible_items": [
      "1",
      "1",
      "1",
      "1",
      "1",
      "1"
    ],
    "price": 12.0,
    "shop_id": 7,
    "size": "grande"
  })

  return (
    <div className="mysterybox-detail container">
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
              {mysteryBox.possible_items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="shipping-info">
            <p><strong>Envío:</strong> desde 3,99 €</p>
          </div>
          <div className="action-buttons mt-4">
            <button type="button" className="btn btn-primary w-100 mb-2">Comprar Ahora</button>
            <button type="button" className="btn btn-secondary w-100">Añadir al Carrito</button>
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

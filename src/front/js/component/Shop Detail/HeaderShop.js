import React from 'react'; //PASA LOS DATOS EN EL ENCABEZADO DE CADA TIENDA//

function HeaderShop({ data }) {
  return (
    <div className="container my-5 p-4 shadow-lg p-3 mb-5 bg-body-tertiary rounded shadow-sm bg-light">
      <div className="row align-items-center">
        <div className="col-lg-4 text-center mb-4 mb-lg-0">
          <img
            className="img-fluid rounded shadow"
            src={data.image_shop_url}
            alt={data.name}
            style={{ maxWidth: '100%', height: 'auto', maxHeight: '250px', objectFit: 'cover' }}
          />
        </div>
        <div className="col-lg-8">
          <h2 className="fw-bold">{data.name}</h2>
          <p className="lead text-secondary">{data.shop_summary}</p>
          
          <div className="row">
            <div className="col-md-6 mb-2">
              <i className="fas fa-map-marker-alt me-2"></i>
              <strong>Address:</strong> <span className="text-muted">{data.address}</span>
            </div>
            <div className="col-md-6 mb-2">
              <i className="fas fa-envelope me-2"></i>
              <strong>Email:</strong> <span className="text-muted">{data.email}</span>
            </div>
            <div className="col-md-6 mb-2">
              <i className="fas fa-tags me-2"></i>
              <strong>Categories:</strong> <span className="text-muted">{data.categories}</span>
            </div>
            <div className="col-md-6 mb-2">
              <i className="fas fa-building me-2"></i>
              <strong>Business Core:</strong> <span className="text-muted">{data.business_core}</span>
            </div>
            <div className="col-md-6 mb-2">
              <i className="fas fa-user me-2"></i>
              <strong>Owner:</strong> <span className="text-muted">{data.owner_name} {data.owner_surname}</span>
            </div>
          </div>

          <hr className="my-4" />

          <div className="mb-3">
            <strong>Shop Description:</strong>
            <p className="text-muted">{data.shop_description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeaderShop;

import React, { useState, useEffect } from 'react';

function HeaderShop() {
    const [shopData, setShopData] = useState(null);

    useEffect(() => {
        // AQUI PUEDE IR EL FETCH//
    }, []);


    return (
        <div className="container my-4">
            <div className="row mb-4">
                <div className="col-md-4 text-center">
                    <img
                        className="img-fluid rounded-end shadow-sm"
                        src="https://images.pexels.com/photos/1050283/pexels-photo-1050283.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                        alt="Tienda"
                        style={{ maxWidth: '75%' }}
                    />
                </div>
                <div className="col-md-8 d-flex flex-column justify-content-center">
                    <h3 className="fw-bold">Nombre de la tienda</h3>
                    <p className="text-muted mb-1">Shop Summary:</p>
                    <p className="text-muted mb-1">Address: </p>
                    <p className="text-muted mb-1">Postal Code: </p>
                    <p className="text-muted mb-1">Email: </p>
                    <p className="text-muted mb-1">Owner Name: </p>
                    <p className="text-muted mb-1">Categories: </p>
                    <p className="text-muted mb-1">Description:</p>
                </div>
            </div>
        </div>
    );
}

export default HeaderShop;



//DATOS LISTOS DEL RETURN PARA RECIBIR DATOS DEL BACKEND//
{/* <div className="container my-4">
<div className="row mb-4">
  <div className="col-md-4 text-center">
    <img
      className="img-fluid rounded-end shadow-sm"
      src={shopData.image_shop_url} // Usando los datos del backend
      alt="Tienda"
      style={{ maxWidth: '75%' }}
    />
  </div>
  <div className="col-md-8 d-flex flex-column justify-content-center">
    <h3 className="fw-bold">{shopData.name}</h3>
    <p className="text-muted mb-1">{shopData.shop_summary}</p>
    <p className="text-muted mb-1">Address: {shopData.address}</p>
    <p className="text-muted mb-1">Postal Code: {shopData.postal_code}</p>
    <p className="text-muted mb-1">Email: {shopData.email}</p>
    <p className="text-muted mb-1">Categories: {shopData.categories.join(', ')}</p>
    <p className="text-muted mb-1">Shop Description: {shopData.shop_description}</p>
    <p className="text-muted mb-1">Owner Name: {shopData.owner_name}</p>
  </div>
</div>
</div> */}

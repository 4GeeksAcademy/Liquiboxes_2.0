import React from 'react'

export default function CartItem ({ item, onRemove }) {
    return (
        <div className="card mb-3">
        <div className="row g-0">
          <div className="col-md-4">
            <img src={item.image} alt={item.name} className="img-fluid rounded-start" style={{maxHeight: '200px', objectFit: 'cover'}} />
          </div>
          <div className="col-md-8">
            <div className="card-body">
              <h5 className="card-title">{item.name}</h5>
              <p className="card-text">Tienda: {item.storeId}</p> 
              {/* En esta línea de arriba hace falta aplicar lógica para sacar el nombre de la tienda */}
              <p className="card-text">Cantidad: {item.quantity}</p>
              <p className="card-text"><strong>Precio: ${(item.price * item.quantity).toFixed(2)}</strong></p>
              <button onClick={() => onRemove(item.id)} className="btn btn-danger">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>)
};
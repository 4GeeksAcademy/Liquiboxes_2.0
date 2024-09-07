import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faTrash } from '@fortawesome/free-solid-svg-icons';

const CartItem = ({ item, onRemove, onIncrease, onDecrease }) => {
  return (
    <div className="card mb-3 cart-item-card">
      <div className="card-body">
        <div className="row align-items-center">
          <div className="col-md-2 col-sm-4 mb-3 mb-md-0">
            <img src={item.image_url} alt={item.name} className="img-fluid rounded cart-item-image" />
          </div>
          <div className="col-md-7 col-sm-8">
            <h5 className="card-title mb-2">{item.name}</h5>
            <p className="card-text mb-1"><small className="text-muted">Tienda: {item.shop_name}</small></p>
            <p className="card-text mb-2 font-weight-bold">{item.price.toFixed(2)}€</p>
            <div className="quantity-control">
              <button className="btn btn-sm btn-outline-secondary" onClick={onDecrease}>
                <FontAwesomeIcon icon={faMinus} />
              </button>
              <span className="mx-2">{item.quantity}</span>
              <button className="btn btn-sm btn-outline-secondary" onClick={onIncrease}>
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
          </div>
          <div className="col-md-3 col-sm-12 mt-3 mt-md-0 text-md-right">
            <p className="card-text mb-2 font-weight-bold">Total: {(item.price * item.quantity).toFixed(2)}€</p>
            <button className="btn btn-outline-danger btn-sm" onClick={onRemove}>
              <FontAwesomeIcon icon={faTrash} className="mr-1" /> Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
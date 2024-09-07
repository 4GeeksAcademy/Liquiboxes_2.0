import React, { useContext, useEffect, useState } from 'react';
import { Context } from '../store/appContext';
import CartItem from '../component/Cart/CartItem';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { store, actions } = useContext(Context);
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate()
  useEffect(() => {
    const fetchCartDetails = async () => {
      setIsLoading(true); const items = await actions.getCartItemsDetails(); setCartItems(items);
      const cartTotal = await actions.getCartTotal();
      setTotal(cartTotal);
      setIsLoading(false);
    };

    fetchCartDetails();
  }, [store.cart]);

  useEffect(() => {
    const fetchCartDetails = async () => {
      setIsLoading(true);
      // Cuando el backend esté listo, cambiaremos estas líneas por las versiones async de arriba
      const items = actions.getHardcodedCartItemsDetails();
      const cartTotal = actions.getHardcodedCartTotal();
      setCartItems(items);
      setTotal(cartTotal);
      setIsLoading(false);
    };

    fetchCartDetails();
  }, [store.cart]);

  if (isLoading) {
    return <div className="text-center">Cargando carrito...</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Tu carrito</h2>
      {cartItems.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <CartItem key={item.id} item={item} onRemove={actions.removeFromCart} />
          ))}
          <div className="card mt-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <h3>Total:</h3>
                <h3>{total.toFixed(2)}€</h3>
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/payingform")}>
              Proceder al pago
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Context } from '../store/appContext';
import CartItem from '../component/Cart/CartItem';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import "../../styles/cart.css"

const Cart = () => {
  const { store, actions } = useContext(Context);
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCartDetails = useCallback(async () => {
    const cartIds = store.cart || [];

    const itemsWithDetails = await Promise.all(
      cartIds.map(async (cartItem) => {
        const details = await actions.fetchSingleItemDetail(cartItem.mysterybox_id);
        return details ? { ...details, quantity: cartItem.quantity } : null;
      })
    );

    const validItems = itemsWithDetails.filter(item => item !== null);
    setCartItems(validItems);
    actions.updateCartWithDetails(validItems)

    const cartTotal = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(cartTotal);

    setIsLoading(false);
  }, [actions, store.cart]);

  useEffect(() => {
    fetchCartDetails();
  }, [fetchCartDetails]);


  

  useEffect(() => {
    // Comenzamos la revisión periódica del carrito
    actions.startCartExpirationCheck();
  }, [actions]);




  const updateLocalCart = useCallback((itemId, updateFn) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.id === itemId ? updateFn(item) : item
      ).filter(item => item.quantity > 0);

      const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setTotal(newTotal);

      return updatedItems;
    });
  }, []);

  const handleIncreaseQuantity = useCallback((item) => {
    if (!item.id) {
      console.error("El ID del producto es inválido");
      return;
    }
    actions.addToCart(item.id);
    updateLocalCart(item.id, (item) => ({ ...item, quantity: item.quantity + 1 }));
  }, [actions, updateLocalCart]);

  const handleDecreaseQuantity = useCallback((item) => {
    if (!item.id) {
      console.error("El ID del producto es inválido");
      return;
    }
    actions.decreaseQuantity(item.id);
    updateLocalCart(item.id, (item) => ({ ...item, quantity: item.quantity - 1 }));
  }, [actions, updateLocalCart]);

  const handleRemoveItem = useCallback((item) => {
    if (!item.id) {
      console.error("El ID del producto es inválido");
      return;
    }
    actions.removeFromCart(item.id);
    setCartItems(prevItems => prevItems.filter(cartItem => cartItem.id !== item.id));
    setTotal(prevTotal => prevTotal - (item.price * item.quantity));
  }, [actions]);

  if (isLoading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
          <p className="mt-2">Cargando tu carrito...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">
        <FontAwesomeIcon icon={faShoppingCart} className="mr-2 me-3" />
        Tu Carrito
      </h2>
      {cartItems.length === 0 ? (
        <div className="text-center empty-cart">
          <p>Tu carrito está vacío.</p>
          <button className="btn btn-primary" onClick={() => navigate('/home')}>
            Continuar Comprando
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onRemove={() => handleRemoveItem(item)}
                onIncrease={() => handleIncreaseQuantity(item)}
                onDecrease={() => handleDecreaseQuantity(item)}
              />
            ))}
          </div>
          <div className="card mt-4 cart-summary">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <h3>Total:</h3>
                <h3 className="text-primary">{total.toFixed(2)}€</h3>
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <button className="mb-4" onClick={() => navigate("/payingform")}>
              <FontAwesomeIcon icon={faCreditCard} className="mr-2 me-2" />
              Proceder al pago
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
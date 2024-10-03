import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Context } from '../store/appContext';
import CartItem from '../component/Cart/CartItem';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import "../../styles/cart.css"
import Spinner from '../component/Spinner';
import NotType from '../component/Utils/NotType';
import ModalGlobal from '../component/ModalGlobal';



const Cart = () => {
  const { store, actions } = useContext(Context);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', body: '' });

  useEffect(() => {
    setLoading(true);

    fetchCartDetails();
  }, []);

  useEffect(() => {
    const syncCartWithLocalStorage = () => {
      const cartFromStorage = JSON.parse(localStorage.getItem("cart")) || {};
      const cartWithDetailsFromStorage = JSON.parse(localStorage.getItem("cartWithDetails")) || {};
      actions.updateCartWithDetails(cartWithDetailsFromStorage);
    };

    window.addEventListener('storage', syncCartWithLocalStorage);
    syncCartWithLocalStorage(); // Sincroniza al montar el componente

    return () => {
      window.removeEventListener('storage', syncCartWithLocalStorage);
    };
  }, []);

  const showModal = (title, body) => {
    setModalContent({ title, body });
    setModalOpen(true);
  };

  const { cartItemsArray, isCartEmpty, total } = useMemo(() => {
    const cartItems = store.cartWithDetails || {};
    const itemsArray = Object.values(cartItems).filter(item => item != null);
    return {
      cartItemsArray: itemsArray,
      isCartEmpty: itemsArray.length === 0,
      total: itemsArray.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0)
    };
  }, [store.cartWithDetails]);

  const fetchCartDetails = async () => {
    try {
      setError(null);
      const cartIds = Object.keys(store.cart || JSON.parse(localStorage.getItem("cart")) || {});

      if (cartIds.length === 0) {
        setLoading(false);
        return;
      }

      const itemsWithDetails = await Promise.all(
        cartIds.map(async (id) => {
          try {
            const details = await actions.fetchSingleItemDetail(id);
            return details ? { ...details, quantity: store.cart[id]?.quantity || 1 } : null;
          } catch (err) {
            console.error(`Error fetching details for item ${id}:`, err);
            return null;
          }
        })
      );

      const validItems = itemsWithDetails.filter(item => item !== null);
      actions.updateCartWithDetails(validItems.reduce((acc, item) => {
        if (item && item.id) {
          acc[item.id] = item;
        }
        setLoading(false);

        return acc;
      }, {}));
    } catch (err) {
      console.error("Error fetching cart details:", err);
      showModal("Error", "No se pudieron cargar los detalles del carrito. Por favor, intente de nuevo.");
      setLoading(false);
    }
  };

  const handleIncreaseQuantity = (item) => {
    if (item && item.id) {
      actions.addToCart(item.id);
    }
    fetchCartDetails();
  };

  const handleDecreaseQuantity = (item) => {
    if (item && item.id) {
      actions.decreaseQuantity(item.id);
    }
    fetchCartDetails();
  };

  const handleRemoveItem = (item) => {
    if (item && item.id) {
      actions.removeFromCart(item.id);
    }
    fetchCartDetails();
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    showModal("Error", error);
    return null;
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4 text-center">
        <FontAwesomeIcon icon={faShoppingCart} className="mr-2 me-3" />
        Tu Carrito
      </h2>
      {isCartEmpty ? (
        <div className="text-center empty-cart">
          <p>Tu carrito está vacío.</p>
          <button className="btn btn-primary" onClick={() => navigate('/home')}>
            Continuar Comprando
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItemsArray.map((item) => (
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

      <ModalGlobal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalContent.title}
        body={modalContent.body}
        buttonBody="Cerrar"
      />

      <NotType user_or_shop='user' />

    </div>
  );
};

export default Cart;
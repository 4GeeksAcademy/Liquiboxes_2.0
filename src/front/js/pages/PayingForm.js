import React, { useContext, useEffect, useState } from 'react';
import { Context } from "../store/appContext";
import axios from 'axios';
import PayPalCheckoutButton from '../component/PayingForm/PayPalCheckoutButton';

function PayingForm() {
  const [checkoutCart, setCheckoutCart] = useState([]);
  const { store, actions } = useContext(Context);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('normal');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setIsLoading(true);
        let cartData = store.cartWithDetails || JSON.parse(localStorage.getItem("cartWithDetails") || "[]");
        if (cartData.length === 0) {
          throw new Error("El carrito está vacío");
        }
        setCheckoutCart(cartData);

        const totalPrice = cartData.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setTotal(totalPrice);
        setError(null);

        // Fetch user profile
        const token = sessionStorage.getItem('token');
        if (!token) {
          throw new Error("No se encontró el token de autenticación");
        }
        const response = await axios.get(`${process.env.BACKEND_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserProfile(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartData();
  }, [store.cartWithDetails]);

  const handleInputChange = (e) => {
    setCardDetails({
      ...cardDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleNormalCheckout = async (e) => {
    e.preventDefault();
    try {
      // Aquí normalmente se procesaría el pago con un servicio de procesamiento de pagos
      // Por ahora, simularemos que el pago fue exitoso
      
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error("No se encontró el token de autenticación");
      }

      // Validación básica de la tarjeta
      if (cardDetails.cardNumber.length !== 16 || 
          cardDetails.expiryDate.length !== 5 || 
          cardDetails.cvv.length !== 3) {
        throw new Error("Los datos de la tarjeta no son válidos");
      }

      const response = await axios.post(`${process.env.BACKEND_URL}/sales/create`, {
        total_amount: total,
        items: checkoutCart.map(item => ({
          mystery_box_id: item.id,
          quantity: item.quantity
        })),
        payment_method: 'credit_card',
        // No envíes los detalles completos de la tarjeta al backend por seguridad
        card_last_four: cardDetails.cardNumber.slice(-4)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Compra realizada con éxito. ID de la venta: ' + response.data.sale_id);
      actions.clearCart();
    } catch (err) {
      setError("Error al procesar la compra: " + err.message);
    }
  };

  const onApprove = async (data, actions) => {
    try {
      const details = await actions.order.capture();
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error("No se encontró el token de autenticación");
      }
      const response = await axios.post(`${process.env.BACKEND_URL}/sales/create`, {
        total_amount: total,
        items: checkoutCart.map(item => ({
          mystery_box_id: item.id,
          quantity: item.quantity
        })),
        paypal_order_id: details.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Transacción completada por ' + details.payer.name.given_name + '. ID de la venta: ' + response.data.sale_id);
      actions.clearCart();
    } catch (err) {
      setError("Error al procesar el pago: " + err.message);
    }
  };

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Resumen de tu compra</h2>
      {checkoutCart.length > 0 ? (
        <>
          {/* Resumen del carrito */}
          {checkoutCart.map((item, index) => (
            <div key={index} className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text">Cantidad: {item.quantity}</p>
                <p className="card-text">Precio: €{item.price.toFixed(2)}</p>
                <p className="card-text">Subtotal: €{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
          <div className="card mb-4">
            <div className="card-body">
              <h4 className="card-title">Total a pagar: €{total.toFixed(2)}</h4>
            </div>
          </div>
          
          {/* Datos de envío */}
          {userProfile && (
            <div className="card mb-4">
              <div className="card-body">
                <h4 className="card-title">Datos de envío</h4>
                <p>Nombre: {userProfile.name} {userProfile.surname}</p>
                <p>Dirección: {userProfile.address}</p>
                <p>Código Postal: {userProfile.postal_code}</p>
              </div>
            </div>
          )}

          {/* Selección de método de pago */}
          <div className="mb-4">
            <h4>Método de pago</h4>
            <div className="form-check">
              <input 
                className="form-check-input" 
                type="radio" 
                name="paymentMethod" 
                id="normalPayment" 
                value="normal" 
                checked={paymentMethod === 'normal'}
                onChange={() => setPaymentMethod('normal')}
              />
              <label className="form-check-label" htmlFor="normalPayment">
                Tarjeta de crédito/débito
              </label>
            </div>
            <div className="form-check">
              <input 
                className="form-check-input" 
                type="radio" 
                name="paymentMethod" 
                id="paypalPayment" 
                value="paypal" 
                checked={paymentMethod === 'paypal'}
                onChange={() => setPaymentMethod('paypal')}
              />
              <label className="form-check-label" htmlFor="paypalPayment">
                PayPal
              </label>
            </div>
          </div>

          {/* Formulario de tarjeta de crédito */}
          {paymentMethod === 'normal' && (
            <form onSubmit={handleNormalCheckout} className="mb-4">
              <div className="mb-3">
                <label htmlFor="cardNumber" className="form-label">Número de tarjeta</label>
                <input
                  type="text"
                  className="form-control"
                  id="cardNumber"
                  name="cardNumber"
                  value={cardDetails.cardNumber}
                  onChange={handleInputChange}
                  maxLength="16"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="expiryDate" className="form-label">Fecha de expiración (MM/YY)</label>
                <input
                  type="text"
                  className="form-control"
                  id="expiryDate"
                  name="expiryDate"
                  value={cardDetails.expiryDate}
                  onChange={handleInputChange}
                  maxLength="5"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="cvv" className="form-label">CVV</label>
                <input
                  type="text"
                  className="form-control"
                  id="cvv"
                  name="cvv"
                  value={cardDetails.cvv}
                  onChange={handleInputChange}
                  maxLength="3"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">Realizar Compra</button>
            </form>
          )}

          {/* Botón de PayPal */}
          {paymentMethod === 'paypal' && (
            <PayPalCheckoutButton 
              total={total} 
              onApprove={onApprove}
              onError={(err) => setError("Error en PayPal: " + err.message)}
            />
          )}
        </>
      ) : (
        <div className="alert alert-warning">El carrito está vacío. Añade productos antes de proceder al pago.</div>
      )}
    </div>
  );
}

export default PayingForm;
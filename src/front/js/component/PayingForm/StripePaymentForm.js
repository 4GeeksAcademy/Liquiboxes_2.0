import React, { useEffect, useRef, useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faSpinner } from '@fortawesome/free-solid-svg-icons';

const StripePaymentForm = ({ total, onPaymentSuccess, onPaymentError, userProfile }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const response = await axios.post(`${process.env.BACKEND_URL}/sales/create-payment-intent`, {
        amount: Math.round(total * 100), // Asegúrate de que el monto sea un entero
      });

      const clientSecret = response.data.clientSecret;

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${userProfile.name} ${userProfile.surname}`,
            email: userProfile.email,
            address: {
              line1: userProfile.address,
              postal_code: userProfile.postal_code,
            }
          },
        },
      });

      if (error) {
        throw error;
      }

      if (paymentIntent.status === 'succeeded') {
        if (isMounted.current) {
          onPaymentSuccess(paymentIntent.id);
        }
      } else {
        throw new Error(`Payment failed with status: ${paymentIntent.status}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      if (isMounted.current) {
        onPaymentError(err.message);
      }
    } finally {
      if (isMounted.current) {
        setIsProcessing(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <div className="form-group">
        <label htmlFor="card-element">
          <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
          Datos de la tarjeta
        </label>
        <CardElement
          id="card-element"
          className="form-control"
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
            hidePostalCode: true, // Añade esta línea
          }}
        />
        <small className="form-text text-muted">
          Ingrese el número de tarjeta, fecha de expiración y código de seguridad (CVV).
        </small>
      </div>
      <button 
        type="submit" 
        className="btn btn-primary btn-lg mt-3" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
            Procesando...
          </>
        ) : (
          `Pagar €${total.toFixed(2)}`
        )}
      </button>
    </form>
  );
};

export default StripePaymentForm;
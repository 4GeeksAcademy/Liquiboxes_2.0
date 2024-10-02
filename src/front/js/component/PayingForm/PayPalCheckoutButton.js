import React from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";

function PayPalCheckoutButton({ total, onApprove, onError }) {
  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [{
        amount: {
          currency_code: "EUR",
          value: total.toFixed(2)
        }
      }]
    });
  };

  return (
    <PayPalButtons
      createOrder={createOrder}
      onApprove={onApprove}
      onError={onError}
      style={{ layout: "horizontal", disableMaxWidth:'true'}}
    />
  );
}

export default PayPalCheckoutButton;
import React, { useContext, useEffect, useState } from 'react'
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Context } from "../store/appContext"


function PayingForm() {
  const [checkoutCart, setCheckoutCart] = useState([]);
  const { store, actions } = useContext(Context)

  useEffect(() => {
    let data = [];

    const getCart = () => {

      // Si el store no tiene el carrito, lo obtenemos del localStorage
      if (!store.cart) {
        data = JSON.parse(localStorage.getItem("cart") || "[]");
      } else {
        data = store.cart;
      }

      return data
    }
    getCart()
    setCheckoutCart(data)
    console.log(checkoutCart)
  }, [])

  const initialOptions = {
    clientId: "YOUR_CLIENT_ID",
    vault: true,
    intent: "subscription",
  };

  const createOrder = async () => {
    const response = await fetch("/my-server/create-paypal-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cart: [
          {
            sku: "YOUR_PRODUCT_STOCK_KEEPING_UNIT",
            quantity: "YOUR_PRODUCT_QUANTITY",
          },
        ]
      })
    });

    const data = await response.json();

    return data.id;
  }

  const onApprove = async (data) => {
    // Capture the funds from the transaction.
    const response = await fetch("/my-server/capture-paypal-order", {
      method: "POST",
      body: JSON.stringify({
        orderID: data.orderID
      })
    });

    const details = await response.json();

    // Show success message to buyer
    alert(`Transaction completed by ${details.payer.name.given_name}`);
  }

  const onCancel = (data) => {
    // Show a cancel page, or return to cart
    window.location.assign("/your-cancel-page");
  }

  const onError = (err) => {
    // For example, redirect to a specific error page
    window.location.assign("/your-error-page-here");
    
    // Cuando todo este listo añadir esto a los atributos del complemento: onError={onError}
  }

  return (
    <div>
      Aquí vamos a poner los métodos de pago:
      <div>
        <PayPalButtons style={{ layout: "horizontal" }} createOrder={createOrder} onApprove={onApprove} onCancel={onCancel} />
      </div>
    </div>
  )
}

export default PayingForm
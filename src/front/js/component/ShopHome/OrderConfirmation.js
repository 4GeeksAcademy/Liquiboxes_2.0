import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faExchange, faTruck } from '@fortawesome/free-solid-svg-icons';
import { ClimbingBoxLoader } from "react-spinners";

const OrderConfirmation = ({ notificationId }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shippingDetails, setShippingDetails] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [notificationId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`${process.env.BACKEND_URL}/orders/${notificationId}/details`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setOrderDetails(response.data.orderDetails);
      setUserDetails(response.data.userDetails);
      setItems(response.data.items);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to fetch order details. Please try again.');
      setLoading(false);
    }
  };

  const handleItemConfirmation = async (itemId, isConfirmed) => {
    try {
      await axios.post(`${process.env.BACKEND_URL}/orders/confirm-item`, {
        itemId,
        isConfirmed
      }, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setItems(items.map(item =>
        item.id === itemId ? { ...item, isConfirmed } : item
      ));
    } catch (error) {
      console.error('Error confirming item:', error);
      setError('Failed to confirm item. Please try again.');
    }
  };

  const handleItemChange = async (itemId) => {
    try {
      const newItem = prompt('Enter the new item details:');
      if (newItem) {
        const response = await axios.post(`${process.env.BACKEND_URL}/orders/change-item`, {
          itemId,
          newItem,
          userDetails // Sending user details for size matching
        }, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`
          }
        });
        if (response.data.requiresAdminApproval) {
          alert('Change request sent to admin for approval.');
        } else {
          // Refresh the order details to show the updated item
          fetchOrderDetails();
        }
      }
    } catch (error) {
      console.error('Error changing item:', error);
      setError('Failed to change item. Please try again.');
    }
  };

  const handleOrderConfirmation = async () => {
    try {
      const response = await axios.post(`${process.env.BACKEND_URL}/orders/confirm`, {
        orderId: orderDetails.id
      }, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setShippingDetails(response.data.shippingDetails);
      alert('Order confirmed successfully!');
    } catch (error) {
      console.error('Error confirming order:', error);
      setError('Failed to confirm order. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ClimbingBoxLoader color="#6a8e7f" loading={true} size={40} speedMultiplier={1} />
      </div>
    )
  };
  if (error) return <div className="error">{error}</div>;
  if (!orderDetails) return <div>No order details found.</div>;

  return (
    <div className="order-confirmation">
      <h2>Order Confirmation</h2>
      <div className="user-details">
        <h3>User Details</h3>
        <p>Gender: {userDetails.gender}</p>
        <p>Upper Size: {userDetails.upper_size}</p>
        <p>Lower Size: {userDetails.lower_size}</p>
        <p>Cap Size: {userDetails.cap_size}</p>
        <p>Shoe Size: {userDetails.shoe_size}</p>
        <p>Not Colors: {userDetails.not_colors.join(', ')}</p>
        <p>Stamps: {userDetails.stamps}</p>
        <p>Fit: {userDetails.fit}</p>
        <p>Not Clothes: {userDetails.not_clothes.join(', ')}</p>
        <p>Profession: {userDetails.profession}</p>
      </div>
      <div className="items-list">
        <h3>Items</h3>
        {items.map(item => (
          <div key={item.id} className="item">
            <span>{item.name} - Size: {item.size}</span>
            <div className="item-actions">
              <button onClick={() => handleItemConfirmation(item.id, true)} disabled={item.isConfirmed}>
                <FontAwesomeIcon icon={faCheck} /> Confirm
              </button>
              <button onClick={() => handleItemConfirmation(item.id, false)} disabled={item.isConfirmed === false}>
                <FontAwesomeIcon icon={faTimes} /> Reject
              </button>
              <button onClick={() => handleItemChange(item.id)}>
                <FontAwesomeIcon icon={faExchange} /> Change
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        className="confirm-order"
        onClick={handleOrderConfirmation}
        disabled={items.some(item => item.isConfirmed === undefined)}
      >
        <FontAwesomeIcon icon={faTruck} /> Confirm Order and Get Shipping Details
      </button>
      {shippingDetails && (
        <div className="shipping-details">
          <h3>Shipping Details</h3>
          <p>Address: {shippingDetails.address}</p>
          <p>City: {shippingDetails.city}</p>
          <p>Postal Code: {shippingDetails.postalCode}</p>
          <p>Country: {shippingDetails.country}</p>
        </div>
      )}
    </div>
  );
};

export default OrderConfirmation;
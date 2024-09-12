import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faEnvelope, faEnvelopeOpen, faFilter, faCheck, faTimes, faExchange, faTruck, faPrint } from '@fortawesome/free-solid-svg-icons';
import { Modal, ProgressBar, Button, Form, Table } from 'react-bootstrap';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

const ShopNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [confirmationProgress, setConfirmationProgress] = useState(0);
  const [orderDetails, setOrderDetails] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shippingDetails, setShippingDetails] = useState(null);
  const [changeRequests, setChangeRequests] = useState([]);
  const [showChangeRequestForm, setShowChangeRequestForm] = useState(false);
  const [selectedItemForChange, setSelectedItemForChange] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);

  useEffect(() => {
    fetchNotifications();
    fetchChangeRequests();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, filter]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${process.env.BACKEND_URL}/notifications/shop`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchChangeRequests = async () => {
    try {
      const response = await axios.get(`${process.env.BACKEND_URL}/shops/change-requests`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setChangeRequests(response.data);
    } catch (error) {
      console.error('Error fetching change requests:', error);
    }
  };

  const filterNotifications = () => {
    switch (filter) {
      case 'unread':
        setFilteredNotifications(notifications.filter(n => !n.is_read));
        break;
      case 'read':
        setFilteredNotifications(notifications.filter(n => n.is_read));
        break;
      case 'new_sale':
        setFilteredNotifications(notifications.filter(n => n.type === "new_sale"));
        break;
      case 'change_request':
        setFilteredNotifications(notifications.filter(n => n.type === 'change_request'));
        break;
      case 'confirmed':
        setFilteredNotifications(notifications.filter(n => n.type === 'confirmed'));
        break;
      default:
        setFilteredNotifications(notifications);
    }
  };

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    if (!notification.is_read) {
      try {
        await axios.patch(`${process.env.BACKEND_URL}/notifications/${notification.id}/read`, {}, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`
          }
        });
        setNotifications(notifications.map(n =>
          n.id === notification.id ? { ...n, is_read: true } : n
        ));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    if (notification.type === 'new_sale') {
      fetchOrderDetails(notification.sale_id);
    }
  };

  const fetchOrderDetails = async (saleId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${process.env.BACKEND_URL}/sales/${saleId}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setOrderDetails(response.data);
      const allItems = response.data.sale_details.flatMap(detail => detail.box_items);
      setItems(allItems.map(item => ({ ...item, isConfirmed: undefined })));
      fetchUserPreferences(response.data.user_id);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to fetch order details. Please try again.');
      setLoading(false);
    }
  };

  const fetchUserPreferences = async (userId) => {
    setLoading(true)
    try {
      const response = await axios.get(`${process.env.BACKEND_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setUserPreferences(response.data);
      console.log(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      setError('Failed to fetch user preferences. Please try again.');
    }
  };

  const handleItemConfirmation = async (itemId, isConfirmed) => {

    setItems(items.map(item =>
      item.id === itemId ? { ...item, isConfirmed } : item
    ));

  };

  const handleItemChange = (item) => {
    setSelectedItemForChange(item);
    setShowChangeRequestForm(true);
  };

  const handleChangeRequestSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const changeRequestData = {
      box_item_id: selectedItemForChange.id,
      proposed_item_name: formData.get('proposed_item_name'),
      reason: formData.get('reason')
    };

    try {
      const response = await axios.post(`${process.env.BACKEND_URL}/notifications/change-request`, changeRequestData, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      alert('Change request sent successfully');
      setShowChangeRequestForm(false);
      fetchChangeRequests();
    } catch (error) {
      console.error('Error creating change request:', error);
      setError('Failed to create change request. Please try again.');
    }
  };

  const handleOrderConfirmation = async () => {
    try {
      const shipmentResponse = await axios.get(`${process.env.BACKEND_URL}/users/${orderDetails.user_id}/shipment`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setShippingDetails(shipmentResponse.data);
      alert('Order confirmed successfully!');
    } catch (error) {
      console.error('Error confirming order:', error);
      setError('Failed to confirm order. Please try again.');
    }
  };



  const generatePDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('Order Receipt', 105, 15, null, null, 'center');

    // Add order details
    doc.setFontSize(12);
    doc.text(`Order ID: ${orderDetails.id}`, 20, 30);
    doc.text(`Date: ${new Date(orderDetails.date).toLocaleString()}`, 20, 40);
    doc.text(`Total Amount: ${orderDetails.total_amount} €`, 20, 50);

    // Add shipping details
    doc.text('Shipping Details:', 20, 70);
    doc.text(`Name: ${shippingDetails.name} ${shippingDetails.surname}`, 30, 80);
    doc.text(`Email: ${shippingDetails.email}`, 30, 90);
    doc.text(`Address: ${shippingDetails.address}`, 30, 100);
    doc.text(`Postal Code: ${shippingDetails.postal_code}`, 30, 110);

    // Add items table
    const itemsData = items.map(item => [item.item_name]);
    doc.autoTable({
      startY: 130,
      head: [['Item']],
      body: itemsData,
    });

    // Save the PDF
    doc.save('order_receipt.pdf');
  };

  // Función auxiliar para capitalizar la primera letra
  const capitalize = (str) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
  };

  // Función auxiliar para formatear arrays
  const formatArray = (arr) => {
    return Array.isArray(arr) ? arr.map(capitalize).join(', ') : '';
  };

  const renderNotificationDetails = () => {
    if (!selectedNotification) return null;


    switch (selectedNotification.type) {
      case 'new_sale':
        if (loading) return <div>Loading...</div>;
        if (error) return <div className="error">{error}</div>;
        if (!orderDetails) return <div>No order details found.</div>;

        return (
          <div className="order-confirmation">
            <h2>Confirmación de la orden:</h2>
            <div className="order-details">
              <h3>Detalles de la orden</h3>
              <p>ID Orden: {orderDetails.id}</p>
              <p>Fecha de la compra: {new Date(orderDetails.date).toLocaleString()}</p>
              <p>Cantidad Total: {orderDetails.total_amount} €</p>
            </div>
            {userPreferences && (
              <div className="user-preferences">
                <h3>Preferencias del comprador:</h3>
                <Table striped bordered hover>
                  <tbody>
                    <tr><td>Género</td><td>{userPreferences.gender ? capitalize(userPreferences.gender) : 'No especificado por el usuario'}</td></tr>
                    <tr><td>Talla Superior</td><td>{userPreferences.upper_size ? userPreferences.upper_size.toUpperCase() : 'No especificada por el usuario'}</td></tr>
                    <tr><td>Talla Inferior</td><td>{userPreferences.lower_size || 'No especificada por el usuario'}</td></tr>
                    <tr><td>Talla de Gorra</td><td>{userPreferences.cap_size || 'No especificada por el usuario'}</td></tr>
                    <tr><td>Talla de Calzado</td><td>{userPreferences.shoe_size || 'No especificada por el usuario'}</td></tr>
                    <tr><td>Colores menos preferidos</td><td>{userPreferences.not_colors ? formatArray(userPreferences.not_colors) : 'No especificados por el usuario'}</td></tr>
                    <tr><td>Estampados en la ropa</td><td>{userPreferences.stamps ? capitalize(userPreferences.stamps) : 'No especificados por el usuario'}</td></tr>
                    <tr><td>Ajuste de la ropa</td><td>{userPreferences.fit ? capitalize(userPreferences.fit) : 'No especificado por el usuario'}</td></tr>
                    <tr><td>Prendas no deseadas</td><td>{userPreferences.not_clothes ? formatArray(userPreferences.not_clothes) : 'No especificadas por el usuario'}</td></tr>
                    <tr><td>Categorías</td><td>{userPreferences.categories ? formatArray(userPreferences.categories) : 'No especificadas por el usuario'}</td></tr>
                    <tr><td>Profesión</td><td>{userPreferences.profession ? capitalize(userPreferences.profession) : 'No especificada por el usuario'}</td></tr>
                  </tbody>
                </Table>
              </div>
            )}
            <div className="items-list">
              <h3>Artículos a incluir:</h3>
              {items.map(item => (
                <div key={item.id} className="item">
                  <span>{item.item_name}</span>
                  <div className="item-actions my-3">
                    <Button onClick={() => handleItemConfirmation(item.id, true)} disabled={item.isConfirmed === true}>
                      <FontAwesomeIcon icon={faCheck} /> Confirmar Stock
                    </Button>
                    <Button onClick={() => handleItemChange(item)} className='ms-3'>
                      <FontAwesomeIcon icon={faExchange} /> Cambiar por otro artículo
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              className="confirm-order my-3"
              onClick={handleOrderConfirmation}
              disabled={items.some(item => item.isConfirmed === undefined)}
            >
              <FontAwesomeIcon icon={faTruck} /> Confirm Order and Get Shipping Data
            </Button>
            {shippingDetails && (
              <div className="shipping-details">
                <h3>Shipping Details</h3>
                <p>Name: {shippingDetails.name} {shippingDetails.surname}</p>
                <p>Email: {shippingDetails.email}</p>
                <p>Address: {shippingDetails.address}</p>
                <p>Postal Code: {shippingDetails.postal_code}</p>
                <Button onClick={generatePDF}>
                  <FontAwesomeIcon icon={faPrint} /> Generate PDF Receipt
                </Button>
              </div>
            )}
          </div>
        );
      case 'change_request_result':
        return (
          <div>
            <h5>Change Request Result</h5>
            <p>{selectedNotification.content}</p>
            <p>Request ID: {selectedNotification.item_change_request_id}</p>
          </div>
        );
      default:
        return <p>{selectedNotification.content}</p>;
    }
  };

  return (
    <div className="shop-notifications container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Notifications</h2>
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faBell} className="mr-2" />
          <span className="badge bg-primary">
            {notifications.filter(n => !n.is_read).length} Unread
          </span>
        </div>
      </div>

      <div className="mb-4">
        <Button onClick={() => setFilter('all')} variant={filter === 'all' ? 'primary' : 'outline-primary'} className="mr-2">
          Todas
        </Button>
        <Button onClick={() => setFilter('unread')} variant={filter === 'unread' ? 'primary' : 'outline-primary'} className="mr-2">
          No Leídas
        </Button>
        <Button onClick={() => setFilter('read')} variant={filter === 'read' ? 'primary' : 'outline-primary'} className="mr-2">
          Leídas
        </Button>
        <Button onClick={() => setFilter('new_sale')} variant={filter === 'new_sale' ? 'primary' : 'outline-primary'} className="mr-2">
          Nueva Venta
        </Button>
        <Button onClick={() => setFilter('change_request')} variant={filter === 'change_request_result' ? 'primary' : 'outline-primary'}>
          Propuesta de cambio
        </Button>
        <Button onClick={() => setFilter('confirmed')} variant={filter === 'change_request_result' ? 'primary' : 'outline-primary'}>
          Ventas Confirmadas
        </Button>
      </div>

      <table className="table table-hover">
        <thead>
          <tr>
            <th>Type</th>
            <th>Content</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredNotifications.map((notification) => (
            <tr
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`cursor-pointer ${notification.type === 'change_request_result' ? 'table-warning' : ''}`}
            >
              <td>{notification.type}</td>
              <td>{notification.content}</td>
              <td>{new Date(notification.created_at).toLocaleString()}</td>
              <td>
                {notification.is_read ?
                  <FontAwesomeIcon icon={faEnvelopeOpen} className="text-muted" /> :
                  <FontAwesomeIcon icon={faEnvelope} className="text-primary" />
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Notification Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renderNotificationDetails()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showChangeRequestForm} onHide={() => setShowChangeRequestForm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Change Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleChangeRequestSubmit}>
            <Form.Group>
              <Form.Label>Original Item: {selectedItemForChange?.item_name}</Form.Label>
            </Form.Group>
            <Form.Group>
              <Form.Label>Proposed Item Name</Form.Label>
              <Form.Control type="text" name="proposed_item_name" required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Reason for Change</Form.Label>
              <Form.Control as="textarea" name="reason" required />
            </Form.Group>
            <Button type="submit">Submit Change Request</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ShopNotifications;
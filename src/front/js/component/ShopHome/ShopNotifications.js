import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faEnvelope, faEnvelopeOpen, faFilter, faCheck, faTimes, faExchange, faTruck, faPrint, faDownload, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Form, Table, Tabs, Tab, Dropdown } from 'react-bootstrap';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import '../../../styles/shops/shopnotifications.css';

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
  const [shopSaleStatus, setShopSaleStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('sales');
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationsPerPage] = useState(10);
  const [replyMessage, setReplyMessage] = useState('');
  const unreadNotifications = notifications.filter(n => !n.is_read);
  const hasUnreadNotifications = unreadNotifications.length > 0;

  const delay = ms => new Promise(res => setTimeout(res, ms));

  useEffect(() => {
    fetchNotifications();
    fetchChangeRequests();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, filter, activeTab]);

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
    let filtered = notifications.filter(n => {
      if (activeTab === 'sales') {
        return ['new_sale', 'item_change_approved', 'item_change_rejected', 'confirmed'].includes(n.type);
      } else {
        return ['contact_support', 'contact_shop', 'contact_user'].includes(n.type);
      }
    });

    switch (filter) {
      case 'unread':
        filtered = filtered.filter(n => !n.is_read);
        break;
      case 'read':
        filtered = filtered.filter(n => n.is_read);
        break;
      // Add more cases if needed
    }
    setFilteredNotifications(filtered);
  };

  const markNotificationAsRead = async (notificationId, isRead) => {
    try {
      await axios.patch(`${process.env.BACKEND_URL}/notifications/${notificationId}/read`,
        { is_read: isRead },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`
          }
        }
      );
      return true;
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as ${isRead ? 'read' : 'unread'}:`, error);
      return false;
    }
  };

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    if (!notification.is_read) {
      const success = await markNotificationAsRead(notification.id, true);
      if (success) {
        setNotifications(notifications.map(n =>
          n.id === notification.id ? { ...n, is_read: true } : n
        ));
      } else {
        console.error('Failed to mark notification as read');

      }
    }
    if (['new_sale', 'item_change_approved', 'item_change_rejected', 'confirmed'].includes(notification.type)) {
      fetchOrderDetails(notification.sale_id);
    }
  };

  const handleMarkAllRead = async () => {
    const results = await Promise.all(
      notifications.filter(n => !n.is_read).map(n => markNotificationAsRead(n.id, true))
    );
    if (results.every(result => result)) {
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } else {
      console.error('Some notifications could not be marked as read');
      // Optionally, refresh notifications from the server here
    }
    fetchNotifications();
  };

  const handleMarkSaleNotificationUnread = async (notificationId) => {
    const success = await markNotificationAsRead(notificationId, false);
    if (success) {
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, is_read: false } : n
      ));
    } else {
      console.error('Failed to mark notification as read');
      fetchNotifications();
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
      await delay(1000);
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

  const handleItemChange = async (item) => {
    setSelectedItemForChange(item);
    setLoading(true);
    await delay(2000);
    setLoading(false);
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
      // Obtener los detalles de envío
      const shipmentResponse = await axios.get(`${process.env.BACKEND_URL}/users/${orderDetails.user_id}/shipment`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setShippingDetails(shipmentResponse.data);

      // Confirmar el pedido
      const orderConfirmation = await axios.post(
        `${process.env.BACKEND_URL}/sales/shop/${orderDetails.id}/confirm`,
        {}, // Cuerpo vacío, ya que no estamos enviando datos
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`
          }
        }
      );

      if (orderConfirmation.status === 200) {
        // Actualizar el estado local
        setShopSaleStatus('confirmed');
        setSelectedNotification(prevNotification => ({
          ...prevNotification,
          type: 'confirmed'
        }));

        // Generar y descargar el PDF
        generatePDF(shipmentResponse.data);

        // Mostrar mensaje de éxito
        alert('¡Pedido confirmado con éxito!');

        // Opcionalmente, actualizar la lista de notificaciones
        fetchNotifications();
      } else {
        throw new Error('La confirmación del pedido no fue exitosa');
      }
    } catch (error) {
      console.error('Error al confirmar el pedido:', error);

      let errorMessage = 'No se pudo confirmar el pedido. Por favor, inténtalo de nuevo.';
      if (error.response) {
        // El servidor respondió con un estado fuera del rango de 2xx
        errorMessage = error.response.data.error || errorMessage;
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        errorMessage = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión.';
      }

      setError(errorMessage);
    }
  };


  const generatePDF = (shippingDetails) => {
    const doc = new jsPDF();

    // Establecer colores basados en variables CSS
    const primaryColor = '#6a8e7f';
    const secondaryColor = '#073b3a';
    const textColor = '#28112b';

    // Encabezado
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor('#ffffff');
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(`Recibo del pedido: ${orderDetails?.id || 'N/A'}`, 105, 25, null, null, 'center');

    // Restablecer color de texto
    doc.setTextColor(textColor);

    // Detalles del pedido
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID de Pedido: ${orderDetails?.id || 'N/A'}`, 20, 50);
    doc.text(`Fecha: ${orderDetails?.date ? new Date(orderDetails.date).toLocaleString('es-ES') : 'N/A'}`, 20, 60);
    doc.text(`Importe Total: ${orderDetails?.total_amount ? `${orderDetails.total_amount} €` : 'N/A'}`, 20, 70);

    // Detalles de envío
    doc.setFillColor(secondaryColor);
    doc.rect(20, 80, 170, 7, 'F');
    doc.setTextColor('#ffffff');
    doc.setFont('helvetica', 'bold');
    doc.text('Detalles de Envío', 25, 85);

    doc.setTextColor(textColor);
    doc.setFont('helvetica', 'normal');
    if (shippingDetails) {
      doc.text(`Nombre: ${shippingDetails.name || ''} ${shippingDetails.surname || ''}`, 25, 95);
      doc.text(`Correo Electrónico: ${shippingDetails.email || 'N/A'}`, 25, 105);
      doc.text(`Dirección: ${shippingDetails.address || 'N/A'}`, 25, 115);
      doc.text(`Código Postal: ${shippingDetails.postal_code || 'N/A'}`, 25, 125);
    } else {
      doc.text('Información de envío no disponible', 25, 95);
    }

    // Preferencias del usuario
    doc.setFillColor(secondaryColor);
    doc.rect(20, 135, 170, 7, 'F');
    doc.setTextColor('#ffffff');
    doc.setFont('helvetica', 'bold');
    doc.text('Preferencias del Usuario', 25, 140);

    doc.setTextColor(textColor);
    doc.setFont('helvetica', 'normal');
    let yPos = 150;
    if (userPreferences) {
      for (const [key, value] of Object.entries(userPreferences)) {
        doc.text(`${key}: ${value || 'N/A'}`, 25, yPos);
        yPos += 10;
      }
    } else {
      doc.text('Preferencias del usuario no disponibles', 25, yPos);
      yPos += 10;
    }

    // Tabla de artículos
    if (items && items.length > 0) {
      // Agrupar items y contar repeticiones
      const groupedItems = items.reduce((acc, item) => {
        acc[item.item_name] = (acc[item.item_name] || 0) + 1;
        return acc;
      }, {});

      const itemsData = Object.entries(groupedItems).map(([itemName, count]) =>
        count > 1 ? [itemName, count] : [itemName]
      );

      doc.autoTable({
        startY: yPos + 10,
        head: [['Artículo', 'Cantidad']],
        body: itemsData,
        styles: {
          textColor: [0, 0, 0], // Negro para mejor legibilidad
          cellPadding: 5,
        },
        headStyles: {
          fillColor: [primaryColor],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [230, 230, 230],
        },
        margin: { top: 10 },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 30, halign: 'center' },
        },
      });
    } else {
      doc.text('No hay artículos disponibles', 20, yPos + 20);
    }

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(10);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`Página ${i} de ${pageCount}`, 105, 290, null, null, 'center');
    }

    // Guardar el PDF
    doc.save(`recibo_pedido_${orderDetails?.id || 'N/A'}.pdf`);
  };

  const handlePDFDownload = () => {
    if (orderDetails && shippingDetails) {
      generatePDF(shippingDetails);
    } else {
      alert('No se pueden obtener los detalles necesarios para generar el PDF.');
    }
  };

  const capitalize = (str) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
  };

  const formatArray = (arr) => {
    return Array.isArray(arr) ? arr.map(capitalize).join(', ') : '';
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Recipient Type:', selectedNotification.sender_type);
      await axios.post(`${process.env.BACKEND_URL}/notifications/contactsupport/reply`, {
        subjectAffair: selectedNotification.extra_data.subject_affair,
        saleId: selectedNotification.sale_id || null,
        recipientId: selectedNotification.extra_data.user_id || selectedNotification.shop_id || null,
        recipientType: selectedNotification.sender_type,
        message: replyMessage
      }, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setReplyMessage('');
      setIsModalOpen(false);
      fetchNotifications();
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const renderNotificationDetails = () => {
    if (!selectedNotification) return null;

    switch (selectedNotification.type) {
      case 'new_sale':
      case 'item_change_approved':
      case 'item_change_rejected':
      case 'confirmed':
        if (loading) return <div className="loading-spinner">Cargando...</div>;
        if (error) return <div className="error-message">{error}</div>;
        if (!orderDetails) return <div className="no-data-message">No se encontraron detalles del pedido.</div>;

        return (
          <div className="order-confirmation">
            <h3 className="notification-title">
              {selectedNotification.type === 'new_sale' ? 'Nueva Venta' :
                selectedNotification.type === 'item_change_approved' ? 'Cambio de Artículo Aprobado' :
                  selectedNotification.type === 'item_change_rejected' ? 'Cambio de Artículo Rechazado' :
                    'Venta Confirmada'}
            </h3>
            <div className="order-details">
              <h4>Detalles de la orden</h4>
              <p><strong>ID Orden:</strong> {orderDetails.id}</p>
              <p><strong>Fecha de la compra:</strong> {new Date(orderDetails.date).toLocaleString()}</p>
              <p><strong>Cantidad Total:</strong> {orderDetails.total_amount} €</p>
            </div>
            {userPreferences && (
              <div className="user-preferences">
                <h4>Preferencias del comprador:</h4>
                <Table striped bordered hover>
                  <tbody>
                    {Object.entries(userPreferences).map(([key, value]) => (
                      <tr key={key}>
                        <td>{key}</td>
                        <td>{Array.isArray(value) ? value.join(', ') : value}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
            <div className="items-list">
              <h4>Artículos a incluir:</h4>
              {items.map(item => (
                <div key={item.id} className="item-card">
                  <span className="item-name">{item.item_name}</span>
                  {selectedNotification.type !== 'confirmed' && shopSaleStatus !== 'confirmed' && (
                    <div className="item-actions">
                      <Button
                        onClick={() => handleItemConfirmation(item.id, true)}
                        disabled={item.isConfirmed === true}
                        className={`action-button confirm-button ${item.isConfirmed ? 'confirmed' : ''}`}
                      >
                        <FontAwesomeIcon icon={faCheck} /> {item.isConfirmed ? 'Stock Confirmado' : 'Confirmar Stock'}
                      </Button>
                      {shopSaleStatus !== 'pending_confirmation' && (
                        <Button
                          onClick={() => handleItemChange(item)}
                          className="action-button change-button"
                          disabled={item.isConfirmed === true}
                        >
                          <FontAwesomeIcon icon={faExchange} /> Cambiar Artículo
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {selectedNotification.type !== 'confirmed' && shopSaleStatus !== 'confirmed' && (
              <Button
                className="confirm-order-button"
                onClick={handleOrderConfirmation}
                disabled={items.some(item => item.isConfirmed !== true) || shopSaleStatus === 'pending_confirmation'}
              >
                <FontAwesomeIcon icon={faTruck} /> Confirmar Pedido y Obtener Datos de Envío
              </Button>
            )}
            {selectedNotification.type === 'confirmed' && (
              <Button
                className="download-pdf-button"
                onClick={handlePDFDownload}
              >
                <FontAwesomeIcon icon={faDownload} /> Descargar PDF del Pedido
              </Button>
            )}
          </div>
        );
      case 'contact_support':
      case 'contact_shop':
      case 'contact_user':
        return (
          <div className="message-details">
            <h3 className="notification-title">
              {selectedNotification.type === 'contact_support' ? 'Mensaje de Soporte' : 'Mensaje del Usuario'}
            </h3>
            <p className="message-content">{selectedNotification.content}</p>
            <Form onSubmit={handleReplySubmit} className="message-reply-form">
              <Form.Group>
                <Form.Label>Responder:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                />
              </Form.Group>
              <Button type="submit" className="send-reply-button">
                <FontAwesomeIcon icon={faEnvelope} /> Enviar Respuesta
              </Button>
            </Form>
          </div>
        );
      default:
        return <p className="unknown-notification">Tipo de notificación desconocido.</p>;
    }
  };

  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
  const currentNotifications = filteredNotifications.slice(indexOfFirstNotification, indexOfLastNotification);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="shop-notifications container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Notificaciones</h2>
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faBell} className="mr-2 me-3" />
          {hasUnreadNotifications ? (
            <span className="badge bg-primary">
              {unreadNotifications.length} No leídas
            </span>
          ) : (
            <span className="text-muted">Nada nuevo por aquí</span>
          )}
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="sales" title="Ventas">
          <div className="mb-4">
            <Dropdown>
              <Dropdown.Toggle variant="secondary" id="dropdown-filter">
                <FontAwesomeIcon icon={faFilter} /> Filtrar
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setFilter('all')}>Todas</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilter('unread')}>No Leídas</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilter('read')}>Leídas</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <table className="notifications-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Contenido</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentNotifications.map((notification) => (
                <tr
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`cursor-pointer ${notification.type === 'item_change_approved' || notification.type === 'item_change_rejected' ? 'table-warning' : ''}`}
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
                  <td>
                    {notification.is_read && (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkSaleNotificationUnread(notification.id);
                        }}
                      >
                        Marcar como no leída
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Tab>

        <Tab eventKey="messages" title="Mensajes">
          <div className="mb-4">
            <Button onClick={handleMarkAllRead} variant="secondary">
              Marcar todos como leídos
            </Button>
          </div>

          <table className="notifications-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Contenido</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {currentNotifications.map((notification) => (
                <tr
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="cursor-pointer"
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
        </Tab>
      </Tabs>

      <div className="pagination">
        {[...Array(Math.ceil(filteredNotifications.length / notificationsPerPage)).keys()].map(number => (
          <button
            key={number + 1}
            onClick={() => paginate(number + 1)}
            className={currentPage === number + 1 ? 'active' : ''}
          >
            {number + 1}
          </button>
        ))}
      </div>

      <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} size="lg" className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>{
            selectedNotification?.type === 'new_sale' ? 'Nueva Venta' :
              selectedNotification?.type === 'item_change_approved' ? 'Cambio de Artículo Aprobado' :
                selectedNotification?.type === 'item_change_rejected' ? 'Cambio de Artículo Rechazado' :
                  selectedNotification?.type === 'confirmed' ? 'Venta Confirmada' :
                    selectedNotification?.type === 'contact_support' ? 'Mensaje de Soporte' :
                      selectedNotification?.type === 'contact_shop' || selectedNotification?.type === 'contact_user' ? 'Mensaje del Usuario' :
                        'Detalles de la Notificación'
          }</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renderNotificationDetails()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showChangeRequestForm} onHide={() => setShowChangeRequestForm(false)} className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Crear Solicitud de Cambio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleChangeRequestSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Artículo Original</Form.Label>
              <Form.Control type="text" value={selectedItemForChange?.item_name || ''} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Artículo Propuesto</Form.Label>
              <Form.Control type="text" name="proposed_item_name" required placeholder="Ingrese el nombre del nuevo artículo" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Razón del Cambio</Form.Label>
              <Form.Control as="textarea" name="reason" required rows={3} placeholder="Explique la razón del cambio" />
            </Form.Group>
            <Button type="submit" className="w-100">Enviar Solicitud de Cambio</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ShopNotifications;
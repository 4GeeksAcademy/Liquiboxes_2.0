import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faTrashCan, faEnvelope, faEnvelopeOpen, faCheck, faTimes, faExchange, faTruck, faDownload, faList, faShoppingCart, faComment, faUser, faQuestion } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Form, Table, Tabs, Tab } from 'react-bootstrap';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import '../../../styles/shops/shopnotifications.css';
import Spinner from '../../component/Spinner'
import ModalGlobal from '../../component/ModalGlobal';

const ShopNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [orderDetails, setOrderDetails] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingModal, setLoadingModal] = useState(true);
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
  const [salesWithPendingChanges, setSalesWithPendingChanges] = useState({});
  const [isPDFLoading, setIsPDFLoading] = useState(false);
  const [modalGlobalOpen, setModalGlobalOpen] = useState(false);
  const [modalGlobalContent, setModalGlobalContent] = useState({ title: '', body: '' });



  const delay = ms => new Promise(res => setTimeout(res, ms));

  useEffect(() => {
    fetchNotifications();
    fetchChangeRequests();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, filter, activeTab]);

  const showModalGlobal = (title, body) => {
    setModalGlobalContent({ title, body });
    setModalGlobalOpen(true);
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${process.env.BACKEND_URL}/notifications/shop`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setNotifications(response.data);
      updateSalesWithPendingChanges(response.data);
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
    finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications.filter(n => {
      if (activeTab === 'sales') {
        return ['new_sale', 'item_change_requested', 'item_change_approved', 'item_change_rejected', 'confirmed'].includes(n.type);
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
      case 'new_sale':
        filtered = filtered.filter(n => n.type === 'new_sale');
        break;
      case 'item_change_requested':
        filtered = filtered.filter(n => n.type === 'item_change_requested');
        break;
      case 'item_change_approved':
        filtered = filtered.filter(n => n.type === 'item_change_approved');
        break;
      case 'item_change_rejected':
        filtered = filtered.filter(n => n.type === 'item_change_rejected');
        break;
      case 'confirmed':
        filtered = filtered.filter(n => n.type === 'confirmed');
        break;
      case 'contact_support':
        filtered = filtered.filter(n => n.type === 'contact_support');
        break;
      case 'contact_shop':
        filtered = filtered.filter(n => n.type === 'contact_shop');
        break;
      case 'contact_user':
        filtered = filtered.filter(n => n.type === 'contact_user');
        break;
      case 'all':
      default:
        // No additional filtering needed
        break;
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
        setLoadingModal(false)
      }
    }
    if (['new_sale', 'item_change_requested', 'item_change_approved', 'item_change_rejected', 'confirmed'].includes(notification.type)) {
      fetchOrderDetails(notification.sale_id);
      setLoadingModal(false)
    }
    setLoadingModal(false)
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
    setLoadingModal(true);
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
      setLoadingModal(false)

    } catch (error) {
      showModalGlobal('Error', 'No se pudieron obtener los datos de la venta. Por favor, inténtelo de nuevo.');
      setError('Failed to fetch order details. Please try again.');
      setLoadingModal(false)
    }
  };

  const fetchUserPreferences = async (userId) => {
    setLoadingModal(true)
    try {
      const response = await axios.get(`${process.env.BACKEND_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setUserPreferences(response.data);
      console.log(response.data)
      setTimeout(() => setLoadingModal(false), 500);
    } catch (error) {
      showModalGlobal('Error', 'No se pudieron obtener las preferencias del usuario comprador. Por favor, inténtelo de nuevo.');
      setError('Failed to fetch user preferences. Please try again.');
      setLoadingModal(false)
    }
  };

  const handleItemConfirmation = async (itemId, isConfirmed, saleId) => {
    if (salesWithPendingChanges[saleId]) {
      alert('No puedes confirmar artículos mientras haya solicitudes de cambio pendientes para esta venta.');
      return;
    }
    setItems(items.map(item =>
      item.id === itemId ? { ...item, isConfirmed } : item
    ));
  };

  const handleItemChange = async (item) => {
    setSelectedItemForChange(item);
    setLoadingModal(true);
    await delay(1000);
    setLoadingModal(false);
    setShowChangeRequestForm(true);
    setIsModalOpen(false)
  };

  const updateSalesWithPendingChanges = (notificationsData) => {
    const pendingChanges = {};
    notificationsData.forEach(notification => {
      if (notification.type === 'item_change_requested') {
        pendingChanges[notification.sale_id] = true;
      }
    });
    setSalesWithPendingChanges(pendingChanges);
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
      showModalGlobal('Éxito', 'Solicitud de cambio enviada exitosamente');
      setShowChangeRequestForm(false);
      fetchChangeRequests();
      fetchNotifications();
    } catch (error) {
      showModalGlobal('Error', 'No se pudo crear la solicitud de cambio. Por favor, inténtelo de nuevo.');
      setError('No se pudo crear la solicitud de cambio. Por favor, inténtelo de nuevo.');
    }
  };

  const handleOrderConfirmation = async (saleId, shopSaleId) => {
    if (salesWithPendingChanges[saleId]) {
      alert('No puedes confirmar el pedido mientras haya solicitudes de cambio pendientes para esta venta.');
      return;
    }

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
        {},
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
        generatePDF(shipmentResponse.data, shopSaleId);

        setIsModalOpen(false)

        // Mostrar mensaje de éxito
        showModalGlobal('Éxito', '¡Pedido confirmado con éxito!');

        // Eliminar la notificación actual
        await handleDeleteNotificaction(selectedNotification.id);

        // Actualizar la lista de notificaciones
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


  const generatePDF = (shippingDetails, shopSaleId) => {
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
    doc.text(`Detalles de envío del pedido: ${orderDetails?.id || 'N/A'}`, 105, 25, null, null, 'center');

    // Restablecer color de texto
    doc.setTextColor(textColor);

    // Detalles del pedido
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID de Venta: ${shopSaleId || 'N/A'}`, 20, 50);
    doc.text(`ID de Pedido: ${orderDetails?.id || 'N/A'}`, 100, 50);
    doc.text(`Fecha: ${orderDetails?.date ? new Date(orderDetails.date).toLocaleString() : 'N/A'}`, 20, 60);
    doc.text(`Importe Total: ${orderDetails?.total_amount ? `${orderDetails.total_amount} €` : 'N/A'}`, 20, 70);

    // Detalles de envío
    doc.setFillColor(secondaryColor);
    doc.rect(20, 80, 170, 7, 'F');
    doc.setTextColor('#ffffff');
    doc.setFont('helvetica', 'bold');
    doc.text('Detalles de Envío', 25, 85);

    doc.setTextColor(textColor);
    doc.setFont('helvetica', 'normal');

    doc.text(`Nombre: ${shippingDetails.name || ''} ${shippingDetails.surname || ''}`, 25, 95);
    doc.text(`Correo Electrónico: ${shippingDetails.email || 'N/A'}`, 25, 105);
    doc.text(`Dirección: ${shippingDetails.address || 'N/A'}`, 25, 115);
    doc.text(`Código Postal: ${shippingDetails.postal_code || 'N/A'}`, 25, 125);


    // Preferencias del usuario
    doc.setFillColor(secondaryColor);
    doc.rect(20, 135, 170, 7, 'F');
    doc.setTextColor('#ffffff');
    doc.setFont('helvetica', 'bold');
    doc.text('Preferencias del Usuario', 25, 140);

    doc.setTextColor(textColor);
    doc.setFont('helvetica', 'normal');
    let yPos = 150;
    for (const [key, value] of Object.entries(userPreferences)) {
      doc.text(`${key}: ${value || 'N/A'}`, 25, yPos);
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
      doc.text('No hay artículos disponibles, pongase en contacto con soporte lo antes posible', 20, yPos + 20);
    }

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(10);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`Página ${i} de ${pageCount}`, 105, 290, null, null, 'center');
    }

    // Guardar el PDF
    doc.save(`Detalle de envio venta: ${shopSaleId || 'N/A'}#.pdf`);
  };

  const handlePDFDownload = async (shopSaleId) => {
    setIsPDFLoading(true);
    try {
      let currentOrderDetails = orderDetails;
      let currentShippingDetails = shippingDetails;

      if (!currentOrderDetails || !currentShippingDetails) {
        // Cargar los datos si no están disponibles
        const orderResponse = await axios.get(`${process.env.BACKEND_URL}/sales/${selectedNotification.sale_id}`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`
          }
        });
        currentOrderDetails = orderResponse.data;

        const shipmentResponse = await axios.get(`${process.env.BACKEND_URL}/users/${currentOrderDetails.user_id}/shipment`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`
          }
        });
        currentShippingDetails = shipmentResponse.data;
      }

      if (currentOrderDetails && currentShippingDetails) {
        generatePDF(currentShippingDetails, shopSaleId);
      } else {
        throw new Error('No se pueden obtener los detalles necesarios para generar el PDF.');
      }
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      showModalGlobal('Error', error.message || 'No se pueden obtener los detalles necesarios para generar el PDF.');

    } finally {
      setIsPDFLoading(false);
    }
  };


  const handleReplySubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Recipient Type:', selectedNotification.sender_type);
      await axios.post(`${process.env.BACKEND_URL}/notifications/reply`, {
        subjectAffair: selectedNotification.extra_data.subject_affair,
        saleId: selectedNotification.sale_id || null,
        recipientId: selectedNotification.extra_data.user_id || selectedNotification.shop_id || null,
        recipientType: selectedNotification.sender_type,
        type: selectedNotification.type,
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

    if (loadingModal) {
      return (
        <Spinner />
      );
    }

    const saleId = selectedNotification.sale_id;


    switch (selectedNotification.type) {
      case 'new_sale':
      case 'item_change_approved':
      case 'item_change_rejected':
      case 'confirmed':
        if (error) return <div className="error-message">{error}</div>;
        if (!orderDetails) return <div className="no-data-message">No se encontraron detalles del pedido.</div>;

        return (
          <div className="order-confirmation">
            <h3 className="notification-title">
              {translateNotificationType(selectedNotification.type)}
            </h3>
            <div className="order-details">
              <h4>Detalles de la orden</h4>
              <p><strong>ID Orden:</strong> {selectedNotification.extra_data.shop_sale_id}</p>
              <p><strong>ID venta:</strong> {orderDetails.id}</p>
              <p><strong>Fecha de la compra:</strong> {new Date(orderDetails.date).toLocaleString()}</p>
              <p><strong>Cantidad Total:</strong> {orderDetails.total_amount.toFixed(2)} €</p>
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
                  {selectedNotification.type !== 'confirmed' && !salesWithPendingChanges[saleId] && (
                    <div className="item-actions">
                      <Button
                        onClick={() => handleItemConfirmation(item.id, true, saleId)}
                        disabled={item.isConfirmed === true}
                        className={`action-button confirm-button ${item.isConfirmed ? 'confirmed' : ''}`}
                      >
                        <FontAwesomeIcon icon={faCheck} /> {item.isConfirmed ? 'Stock Confirmado' : 'Confirmar Stock'}
                      </Button>
                      <Button
                        onClick={() => handleItemChange(item)}
                        className="action-button change-button"
                        disabled={item.isConfirmed === true}
                      >
                        <FontAwesomeIcon icon={faExchange} /> Cambiar Artículo
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {selectedNotification.type !== 'confirmed' && !salesWithPendingChanges[saleId] && (
              <Button
                className="confirm-order-button"
                onClick={() => handleOrderConfirmation(saleId, selectedNotification.extra_data.shop_sale_id)}
                disabled={items.some(item => item.isConfirmed !== true)}
              >
                <FontAwesomeIcon icon={faTruck} /> Confirmar Pedido y Obtener Datos de Envío
              </Button>
            )}
            {salesWithPendingChanges[saleId] && (
              <p className="text-warning">Hay solicitudes de cambio pendientes para esta venta. No puedes confirmar el pedido hasta que se resuelvan.</p>
            )}
            {selectedNotification.type === 'confirmed' && (
              <Button
                className="confirm-order-button"
                onClick={() => handlePDFDownload(selectedNotification.extra_data.shop_sale_id)}
                disabled={isPDFLoading}
              >
                <>
                  <FontAwesomeIcon icon={faDownload} /> Descargar PDF de la orden
                </>
              </Button>
            )}
          </div>
        );
      case 'contact_support':
      case 'contact_shop':
      case 'contact_user':
      case 'welcome_notification':
        return (
          <div className="message-details">
            <h3 className="notification-title">
              {translateNotificationType(selectedNotification.type)}
            </h3>
            {selectedNotification.sale_id && (<h5> Venta con ID: {selectedNotification.sale_id}</h5>)}
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
      case 'item_change_requested':
        return (
          <div className="message-details">
            <h3 className="notification-title">
              {translateNotificationType(selectedNotification.type)}
            </h3>
            <h5> Venta con ID: {selectedNotification.extra_data.shop_sale_id}</h5>
            <p className="message-content">{selectedNotification.content}</p>
          </div>
        );
      default:
        return <p className="unknown-notification">Tipo de notificación desconocido.</p>;
    }
  };

  const notificationTypes = {
    new_sale: 'Nueva Venta',
    item_change_requested: 'Cambio de artículo solicitado',
    item_change_approved: 'Cambio de artículo aprobado',
    item_change_rejected: 'Cambio de artículo rechazado',
    confirmed: 'Venta Confirmada',
    contact_support: 'Mensaje de soporte',
    contact_shop: 'Mensaje de la tienda',
    contact_user: 'Mensaje del usuario',
    welcome_notification: 'Mensaje de Bienvenida'
  };

  const translateNotificationType = (type) => {
    return notificationTypes[type] || type;
  };

  const renderNotificationContent = (notification) => {
    switch (notification.type) {
      case 'new_sale':
        return `¡Nueva venta realizada! ID de venta: ${notification.extra_data.shop_sale_id}`;
      case 'item_change_requested':
        return `Se ha solicitado un cambio de artículo para la venta ${notification.extra_data.shop_sale_id}`;
      case 'item_change_approved':
        return `Se ha aprobado un cambio de artículo para la venta ${notification.extra_data.shop_sale_id}`;
      case 'item_change_rejected':
        return `Se ha rechazado un cambio de artículo para la venta ${notification.extra_data.shop_sale_id}`;
      case 'confirmed':
        return `La venta ${notification.extra_data.shop_sale_id} ha sido confirmada`;
      case 'contact_support':
      case 'contact_shop':
      case 'contact_user':
        return notification.content;
      default:
        return 'Notificación sin contenido específico';
    }
  };

  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
  const currentNotifications = filteredNotifications.slice(indexOfFirstNotification, indexOfLastNotification);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const FilterButtons = ({ currentFilter, setFilter, activeTab }) => {
    const filters = activeTab === 'sales'
      ? [
        { key: 'all', label: 'Todas', icon: faList },
        { key: 'unread', label: 'No leídas', icon: faEnvelope },
        { key: 'read', label: 'Leídas', icon: faEnvelopeOpen },
        { key: 'new_sale', label: 'Nuevas ventas', icon: faShoppingCart },
        { key: 'item_change_requested', label: 'Petición de cambio realizada', icon: faQuestion },
        { key: 'item_change_approved', label: 'Cambios aprobados', icon: faCheck },
        { key: 'item_change_rejected', label: 'Cambios rechazados', icon: faTimes },
        { key: 'confirmed', label: 'Ventas confirmadas', icon: faCheck },
      ]
      : [
        { key: 'all', label: 'Todos', icon: faList },
        { key: 'unread', label: 'No leídos', icon: faEnvelope },
        { key: 'read', label: 'Leídos', icon: faEnvelopeOpen },
        { key: 'contact_support', label: 'Soporte', icon: faComment },
        { key: 'contact_shop', label: 'Tienda', icon: faShoppingCart },
        { key: 'contact_user', label: 'Usuario', icon: faUser },
      ];

    return (
      <div className="filter-buttons mb-4">
        {filters.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`filter-button ${currentFilter === key ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={icon} className="me-2" />
            {label}
          </button>
        ))}
      </div>
    );
  };

  const handleDeleteNotificaction = async (notificationId) => { //BOTON ELIMINAR NOTIFICACIONES ////////////
    try {
      const response = await axios.delete(`${process.env.BACKEND_URL}/notifications/${notificationId}/delete`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (response.status === 200) {
        setNotifications(notifications.filter(n => n.id !== notificationId));
      } else {
        console.error('Error al eliminar la notificación:', response.data);
      }
    } catch (error) {
      console.error('Error al eliminar la notificación:', error);
    }
  };

  if (loading) {
    return (
      <Spinner />
    );
  }

  return (
    <div className="shop-notifications container">
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
        onSelect={(k) => {
          setActiveTab(k);
          setFilter('all');
        }}
        className="mb-3"
      >
        <Tab eventKey="sales" title="Ventas">
          <FilterButtons currentFilter={filter} setFilter={setFilter} activeTab={activeTab} />

          <div className="mb-4 d-flex justify-content-end">
            <Button onClick={handleMarkAllRead} variant="secondary">
              Marcar todas como leídas
            </Button>
          </div>

          <table className="notifications-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>ID Venta</th>
                <th>ID Pedido</th>
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
                  <td>{translateNotificationType(notification.type)}</td>
                  <td>{new Date(notification.created_at).toLocaleString()}</td>
                  <td>
                    {notification.is_read ?
                      <FontAwesomeIcon icon={faEnvelopeOpen} className="text-muted" /> :
                      <FontAwesomeIcon icon={faEnvelope} className="text-primary" />
                    }
                  </td>
                  <td>{notification.extra_data.shop_sale_id}</td>
                  <td>{notification.sale_id}</td>
                  <td>
                    <Button //BOTON ELIMINAR NOTIFICACIONES
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotificaction(notification.id);
                      }}
                    >
                      <FontAwesomeIcon icon={faTrashCan} /> Borrar
                    </Button>
                    {notification.is_read && (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkSaleNotificationUnread(notification.id);
                        }}
                        id="mark-as-unread-shops"
                      >
                        <FontAwesomeIcon icon={faEnvelope} /> Marcar como no léida
                      </Button>
                    )}
                  </td>


                </tr>
              ))}
            </tbody>
          </table>
        </Tab>

        <Tab eventKey="messages" title="Mensajes">
          <FilterButtons currentFilter={filter} setFilter={setFilter} activeTab={activeTab} />

          <div className="mb-4 d-flex justify-content-end">
            <Button onClick={handleMarkAllRead} variant="secondary">
              Marcar todas como leídas
            </Button>
          </div>

          <table className="notifications-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>ID Venta</th>
                <th>ID Pedido</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentNotifications.map((notification) => (
                <tr
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="cursor-pointer"
                >
                  <td>{translateNotificationType(notification.type)}</td>
                  <td>{new Date(notification.created_at).toLocaleString()}</td>
                  <td>
                    {notification.is_read ?
                      <FontAwesomeIcon icon={faEnvelopeOpen} className="text-muted" /> :
                      <FontAwesomeIcon icon={faEnvelope} className="text-primary" />
                    }
                  </td>
                  <td>{notification.extra_data.shop_sale_id || '-'}</td>
                  <td>{notification.sale_id || '-'}</td>
                  <td>
                    <Button //BOTON ELIMINAR NOTIFICACIONES
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotificaction(notification.id);
                      }}
                    >
                      <FontAwesomeIcon icon={faTrashCan} /> Borrar
                    </Button>
                    {notification.is_read && (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkSaleNotificationUnread(notification.id);
                        }}
                        id="mark-as-unread-shops"
                      >
                        <FontAwesomeIcon icon={faEnvelope} /> Marcar como no léida
                      </Button>
                    )}
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
          <Modal.Title>{translateNotificationType(selectedNotification?.type)}</Modal.Title>
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

      <ModalGlobal
        isOpen={modalGlobalOpen}
        onClose={() => setModalGlobalOpen(false)}
        title={modalGlobalContent.title}
        body={modalGlobalContent.body}
        buttonBody="Cerrar"
      />

    </div>
  );
};

export default ShopNotifications;
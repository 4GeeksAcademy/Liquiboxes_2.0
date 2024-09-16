import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faEnvelope, faEnvelopeOpen, faShoppingCart, faComment, faExclamationCircle, faFilter, faCheck , faTimes, faExchange, faTruck, faPrint, faDownload, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { Modal, Dropdown } from 'react-bootstrap';
import '../../../styles/usernotifications.css'
import axios from 'axios';



const UserNotifications = (data) => {
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [notificationsPerPage] = useState(10);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000); // Poll every 15 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        filterNotifications();
    }, [notifications, filter]);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${process.env.BACKEND_URL}/notifications/user`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const filterNotifications = () => {
        let filtered = notifications;
        switch (filter) {
            case 'unread':
                filtered = notifications.filter(n => !n.is_read);
                break;
            case 'read':
                filtered = notifications.filter(n => n.is_read);
                break;
            case 'purchase_confirmation':
                filtered = notifications.filter(n => n.type === 'purchase_confirmation');
                break;
            case 'confirmation':
                filtered = notifications.filter(n => n.type === 'confirmation');
                break;
            // Añadir más casos en futuros con más notificaciones.
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
            fetchNotifications();
        }
    };

    const handleMarkAllUnread = async () => {
        const results = await Promise.all(
            notifications.filter(n => n.is_read).map(n => markNotificationAsRead(n.id, false))
        );
        if (results.every(result => result)) {
            setNotifications(notifications.map(n => ({ ...n, is_read: false })));
        } else {
            console.error('Some notifications could not be marked as unread');
            // Optionally, refresh notifications from the server here
            fetchNotifications();
        }
    };

    const handleConfirmReceipt = async (notificationId) => {
        // TODO: Mandar recepción al backend para confirmar la recepción de la caja misteriosa.
        console.log(`Confirming receipt for notification ${notificationId}`);
        setIsModalOpen(false);
    };

    function formatearFechaPersonalizada(fecha) {
        const d = new Date(fecha);

        // Obtener componentes de la fecha
        const dia = d.getDate().toString().padStart(2, '0');
        const mes = (d.getMonth() + 1).toString().padStart(2, '0'); 
        const anio = d.getFullYear();
        const horas = d.getHours().toString().padStart(2, '0');
        const minutos = d.getMinutes().toString().padStart(2, '0');

        // Construir la cadena de fecha formateada
        return `Recibida a las ${horas}:${minutos} del día ${dia}/${mes}/${anio}`;
    }

    const renderNotificationDetails = () => {
        if (!selectedNotification) return null;

        return (
            <div className="notification-details">
                <h3>{selectedNotification.type === 'purchase_confirmation' ? 'Confirmación de Compra' : 'Mensaje'}</h3>
                <p>{selectedNotification.content}</p>
                <hr className='w-75 mx-auto' />
                <p className='text-center'>{formatearFechaPersonalizada(selectedNotification.created_at)}</p>
                {selectedNotification.type === 'sent_confirmation' && (
                    <button onClick={() => handleConfirmReceipt(selectedNotification.id)} className="confirm-button">
                        <FontAwesomeIcon icon={faCheck} /> Confirmar Recepción
                    </button>
                )}
            </div>
        );
    };

    // Configración de las notifiaciones según tipo:
    const notificationConfig = {
        purchase_confirmation: {
            label: 'Confirmación de compra',
            icon: faShoppingCart,
            // background: '.green' TODO: Realizar lista de cambios de colores del background según tipo de notificación y crear las clases de CSS para ello.
        },
        confirmation: {
            label: 'Confirmación',
            icon: faShoppingCart,
        },
        admin_message: {
            label: 'Mensaje de administrador',
            icon: faComment,
        },
        // Para agregar más tipos de notificaciones aquí
        default: {
            label: 'Notificación',
            icon: faExclamationCircle,
        }
    };

    const getNotificationConfig = (type) => {
        return notificationConfig[type] || notificationConfig.default;
    };


    // Paginación
    const indexOfLastNotification = currentPage * notificationsPerPage;
    const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
    const currentNotifications = filteredNotifications.slice(indexOfFirstNotification, indexOfLastNotification);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="user-notifications container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Notificaciones</h2>
                <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faBell} className="mr-2 me-2" />
                    <span className="badge">
                        {notifications.filter(n => !n.is_read).length} No leídas
                    </span>
                </div>
            </div>

            <div className="mb-4 d-flex justify-content-between">
                <Dropdown>
                    <Dropdown.Toggle id="dropdown-filter" className="custom-dropdown-toggle">
                        <FontAwesomeIcon icon={faFilter} /> Filtrar
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setFilter('all')}>Todas</Dropdown.Item>
                        <Dropdown.Item onClick={() => setFilter('unread')}>No leídas</Dropdown.Item>
                        <Dropdown.Item onClick={() => setFilter('read')}>Leídas</Dropdown.Item>
                        <Dropdown.Item onClick={() => setFilter('purchase_confirmation')}>Aprovación de compra</Dropdown.Item>
                        <Dropdown.Item onClick={() => setFilter('confirmation')}>Confirmación de pedido</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>

                <Dropdown>
                    <Dropdown.Toggle id="dropdown-actions" className="custom-dropdown-toggle">
                        <FontAwesomeIcon icon={faCaretDown} /> Acciones
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item onClick={handleMarkAllRead}>Marcar todas como leídas</Dropdown.Item>
                        <Dropdown.Item onClick={handleMarkAllUnread}>Marcar todas como no leídas</Dropdown.Item>
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
                    </tr>
                </thead>
                <tbody>
                    {notifications.map((notification) => {
                        const config = getNotificationConfig(notification.type);
                        return (
                            <tr
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className="cursor-pointer hover:bg-gray-100"
                            >
                                <td className="flex items-center">
                                    <FontAwesomeIcon icon={config.icon} className={`me-2 ${config.background}`} />
                                    {config.label}
                                </td>
                                <td>{notification.content}</td>
                                <td>{formatearFechaPersonalizada(notification.created_at)}</td>
                                <td>
                                    {notification.is_read ? (
                                        <FontAwesomeIcon icon={faEnvelopeOpen} className="text-gray-400" />
                                    ) : (
                                        <FontAwesomeIcon icon={faEnvelope} className="text-blue-500" />
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="pagination">
                {[...Array(Math.ceil(filteredNotifications.length / notificationsPerPage)).keys()].map(number => (
                    <button key={number + 1} className={number + 1 === currentPage ? 'active' : ''} onClick={() => paginate(number + 1)}>
                        {number + 1}
                    </button>
                ))}
            </div>

            <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Detalles de la Notificación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {renderNotificationDetails()}
                </Modal.Body>
                <Modal.Footer>
                    <button className="secondary-button" onClick={() => setIsModalOpen(false)}>Cerrar</button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserNotifications;
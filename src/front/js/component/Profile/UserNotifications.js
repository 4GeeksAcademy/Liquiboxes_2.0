import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faEnvelope, faEnvelopeOpen, faList, faShoppingCart, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Table } from 'react-bootstrap';
import '../../../styles/usernotifications.css';

const UserNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [notificationsPerPage] = useState(10);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
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
            setNotifications(response.data.filter(n => !['contact_support', 'contact_user', 'contact_shop'].includes(n.type)));
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
            case 'sale_sent':
                filtered = notifications.filter(n => n.type === 'sale_sent');
                break;
            default:
                filtered = notifications;
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
        }
        fetchNotifications();
    };


    const notificationConfig = {
        purchase_confirmation: {
            label: 'Nueva Compra',
            icon: faShoppingCart,
        },
        confirmation: {
            label: 'Confirmación de compra',
            icon: faCheck,
        },
        sale_sent: {
            label: 'Pedido enviado',
            icon: faShoppingCart,
        },
        // Add more types as needed
    };

    const getNotificationConfig = (type) => {
        return notificationConfig[type] || { label: 'Notificación', icon: faBell };
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    const indexOfLastNotification = currentPage * notificationsPerPage;
    const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
    const currentNotifications = filteredNotifications.slice(indexOfFirstNotification, indexOfLastNotification);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const FilterButtons = ({ currentFilter }) => {
        const filters = [
            { key: 'all', label: 'Todas', icon: faList },
            { key: 'unread', label: 'No leídas', icon: faEnvelope },
            { key: 'read', label: 'Leídas', icon: faEnvelopeOpen },
            { key: 'purchase_confirmation', label: 'Nueva compra', icon: faShoppingCart },
            { key: 'confirmation', label: 'Confirmaciones', icon: faCheck },
            { key: 'sale_sent', label: 'Pedidos enviados', icon: faShoppingCart },
        ];
        
        return (
            <div className="filter-buttons mb-4">
                {filters.map(({ key, label, icon }) => (
                    <Button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`filter-button ${currentFilter === key ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={icon} className="me-2" />
                        {label}
                    </Button>
                ))}
            </div>
        );
    };

    return (
        <div className="user-notifications container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Notificaciones</h2>
                <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faBell} className="mr-2 me-2" />
                    <span className="badge">
                        {notifications.filter(n => !n.is_read).length} No leídas
                    </span>
                </div>
            </div>

            <FilterButtons currentFilter={filter} />


            <Button onClick={handleMarkAllRead} variant="secondary" className="mb-4 custom-dropdown-toggle">
                Marcar todas como leídas
            </Button>

            <Table className="notifications-table">
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Contenido</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {currentNotifications.map((notification) => {
                        const config = getNotificationConfig(notification.type);
                        return (
                            <tr
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <td data-label="Tipo">
                                    <FontAwesomeIcon icon={config.icon} className="me-2" />
                                    {config.label}
                                </td>
                                <td data-label="Contenido">{notification.content}</td>
                                <td data-label="Fecha">{formatDate(notification.created_at)}</td>
                                <td data-label="Estado">
                                    {notification.is_read ? (
                                        <FontAwesomeIcon icon={faEnvelopeOpen} className="text-muted" />
                                    ) : (
                                        <FontAwesomeIcon icon={faEnvelope} className="text-primary" />
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>

            <div className="pagination">
                {[...Array(Math.ceil(filteredNotifications.length / notificationsPerPage)).keys()].map(number => (
                    <Button
                        key={number + 1}
                        onClick={() => paginate(number + 1)}
                        className={currentPage === number + 1 ? 'active' : ''}
                    >
                        {number + 1}
                    </Button>
                ))}
            </div>

            <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} className="custom-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Detalles de la Notificación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="notification-details">
                        <h3>
                            <FontAwesomeIcon icon={getNotificationConfig(selectedNotification?.type).icon} className="me-2" />
                            {getNotificationConfig(selectedNotification?.type).label}
                        </h3>
                        <p>{selectedNotification?.content}</p>
                        <p>{selectedNotification ? formatDate(selectedNotification.created_at) : ''}</p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserNotifications;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faEnvelope, faEnvelopeOpen, faList, faUser, faStore } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Form } from 'react-bootstrap';
import '../../../styles/usermessages.css';

const UserMessages = () => {
    const [messages, setMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [messagesPerPage] = useState(10);
    const [replyMessage, setReplyMessage] = useState('');

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        filterMessages();
    }, [messages, filter]);

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${process.env.BACKEND_URL}/notifications/user/messages`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            setMessages(response.data.filter(msg => ['contact_support', 'contact_shop', 'contact_user'].includes(msg.type)));
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const filterMessages = () => {
        let filtered = messages;
        switch (filter) {
            case 'unread':
                filtered = messages.filter(m => !m.is_read);
                break;
            case 'read':
                filtered = messages.filter(m => m.is_read);
                break;
            case 'contact_support':
                filtered = messages.filter(m => m.type === 'contact_support');
                break;
            case 'contact_shop':
                filtered = messages.filter(m => m.type === 'contact_shop');
                break;
            case 'contact_user':
                filtered = messages.filter(m => m.type === 'contact_user');
                break;
        }
        setFilteredMessages(filtered);
    };

    const markMessageAsRead = async (messageId, isRead) => {
        try {
            await axios.patch(`${process.env.BACKEND_URL}/notifications/${messageId}/read`,
                { is_read: isRead },
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('token')}`
                    }
                }
            );
            return true;
        } catch (error) {
            console.error(`Error marking message ${messageId} as ${isRead ? 'read' : 'unread'}:`, error);
            return false;
        }
    };

    const handleMessageClick = async (message) => {
        setSelectedMessage(message);
        setIsModalOpen(true);
        if (!message.is_read) {
            const success = await markMessageAsRead(message.id, true);
            if (success) {
                setMessages(messages.map(m =>
                    m.id === message.id ? { ...m, is_read: true } : m
                ));
            } else {
                console.error('Failed to mark message as read');
            }
        }
    };

    const handleMarkAllRead = async () => {
        const results = await Promise.all(
            messages.filter(m => !m.is_read).map(m => markMessageAsRead(m.id, true))
        );
        if (results.every(result => result)) {
            setMessages(messages.map(m => ({ ...m, is_read: true })));
        } else {
            console.error('Some messages could not be marked as read');
        }
        fetchMessages();
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.BACKEND_URL}/notifications/reply`, {
                messageId: selectedMessage.id,
                content: replyMessage
            }, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            setReplyMessage('');
            setIsModalOpen(false);
            fetchMessages();
        } catch (error) {
            console.error('Error sending reply:', error);
        }
    };

    const renderMessageDetails = () => {
        if (!selectedMessage) return null;

        return (
            <div className="message-details">
                <h3 className="message-title">{selectedMessage.type === 'contact_support' ? 'Mensaje de Soporte' : 'Mensaje'}</h3>
                <p className="message-content">{selectedMessage.content}</p>
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
    };

    const indexOfLastMessage = currentPage * messagesPerPage;
    const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
    const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const FilterButtons = ({ currentFilter, setFilter }) => {
        const filters = [
            { key: 'all', label: 'All', icon: faList },
            { key: 'unread', label: 'Unread', icon: faEnvelope },
            { key: 'read', label: 'Read', icon: faEnvelopeOpen },
            { key: 'contact_support', label: 'Support', icon: faBell },
            { key: 'contact_shop', label: 'Shop', icon: faStore },
            { key: 'contact_user', label: 'User', icon: faUser },
        ];

        return (
            <div className="filter-buttons mb-4">
                {filters.map(({ key, label, icon }) => (
                    <Button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`filter-button ${currentFilter === key ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={icon} className="mr-2 me-2" />
                        {label}
                    </Button>
                ))}
            </div>
        );
    };

    return (
        <div className="user-messages container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Messages</h2>
                <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faBell} className="mr-2 me-2" />
                    <span className="badge bg-primary">
                        {messages.filter(m => !m.is_read).length} Unread
                    </span>
                </div>
            </div>

            <FilterButtons currentFilter={filter} setFilter={setFilter} />

            <Button onClick={handleMarkAllRead} variant="secondary" className="mb-4">
                Mark all as read
            </Button>

            <table className="messages-table">
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Contenido</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {currentMessages.map((message) => (
                        <tr
                            key={message.id}
                            onClick={() => handleMessageClick(message)}
                            className="cursor-pointer"
                        >
                            <td>{message.type}</td>
                            <td>{message.content}</td>
                            <td>{new Date(message.created_at).toLocaleString()}</td>
                            <td>
                                {message.is_read ?
                                    <FontAwesomeIcon icon={faEnvelopeOpen} className="text-muted" /> :
                                    <FontAwesomeIcon icon={faEnvelope} className="text-primary" />
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                {[...Array(Math.ceil(filteredMessages.length / messagesPerPage)).keys()].map(number => (
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
                    <Modal.Title>Detalles del Mensaje</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {renderMessageDetails()}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserMessages;
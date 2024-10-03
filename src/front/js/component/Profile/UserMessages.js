import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faEnvelope, faEnvelopeOpen, faList, faUser, faStore, faHeadset, faComments } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Form, Table } from 'react-bootstrap';
import '../../../styles/usermessages.css';
import Spinner from '../Spinner';
import ModalGlobal from '../ModalGlobal';

const UserMessages = () => {
    const [messages, setMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [messagesPerPage] = useState(10);
    const [replyMessage, setReplyMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [modalGlobalOpen, setModalGlobalOpen] = useState(false);
    const [modalGlobalContent, setModalGlobalContent] = useState({ title: '', body: '' });

    const messageConfig = {
        contact_support: { label: 'Soporte', icon: faHeadset },
        contact_shop: { label: 'Tienda', icon: faStore },
        contact_user: { label: 'Usuario', icon: faUser },
    };

    const getMessageConfig = useCallback((type) => {
        return messageConfig[type] || { label: 'Mensaje', icon: faComments };
    }, []);

    const fetchMessages = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${process.env.BACKEND_URL}/notifications/user`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            setMessages(response.data.filter(msg => ['contact_support', 'contact_shop', 'contact_user'].includes(msg.type)));
        } catch (error) {
            showModalGlobal('Error', 'No se pudieron cargar los mensajes. Por favor, inténtalo de nuevo.');
        } finally {
            setTimeout(() => setIsLoading(false), 500);
        }
    }, []);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 30000);
        return () => clearInterval(interval);
    }, [fetchMessages]);

    useEffect(() => {
        filterMessages();
    }, [messages, filter]);

    const showModalGlobal = useCallback((title, body) => {
        setModalGlobalContent({ title, body });
        setModalGlobalOpen(true);
    }, []);

    const filterMessages = useCallback(() => {
        let filtered = messages;
        switch (filter) {
            case 'unread': filtered = messages.filter(m => !m.is_read); break;
            case 'read': filtered = messages.filter(m => m.is_read); break;
            case 'contact_support':
            case 'contact_shop':
            case 'contact_user': filtered = messages.filter(m => m.type === filter); break;
            default: filtered = messages;
        }
        setFilteredMessages(filtered);
    }, [messages, filter]);

    const markMessageAsRead = useCallback(async (messageId, isRead) => {
        try {
            await axios.patch(`${process.env.BACKEND_URL}/notifications/${messageId}/read`,
                { is_read: isRead },
                { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }
            );
            return true;
        } catch (error) {
            console.error(`Error marking message ${messageId} as ${isRead ? 'read' : 'unread'}:`, error);
            return false;
        }
    }, []);

    const handleMessageClick = useCallback(async (message) => {
        setSelectedMessage(message);
        setIsModalOpen(true);
        if (!message.is_read) {
            const success = await markMessageAsRead(message.id, true);
            if (success) {
                setMessages(prevMessages => prevMessages.map(m =>
                    m.id === message.id ? { ...m, is_read: true } : m
                ));
            }
        }
    }, [markMessageAsRead]);

    const handleMarkAllRead = useCallback(async () => {
        const results = await Promise.all(
            messages.filter(m => !m.is_read).map(m => markMessageAsRead(m.id, true))
        );
        if (results.every(result => result)) {
            setMessages(prevMessages => prevMessages.map(m => ({ ...m, is_read: true })));
        } else {
            showModalGlobal('Error', 'Algunos mensajes no se pudieron marcar como leídos. Por favor, inténtalo de nuevo.');
        }
        fetchMessages();
    }, [messages, markMessageAsRead, fetchMessages]);

    const handleReplySubmit = useCallback(async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.BACKEND_URL}/notifications/reply`, {
                messageId: selectedMessage.id,
                subjectAffair: selectedMessage.extra_data.subject_affair,
                content: replyMessage,
                saleId: selectedMessage.sale_id,
                recipientId: selectedMessage.shop_id,
                shopId: selectedMessage.shop_id,
                recipientType: selectedMessage.sender_type,
                type: selectedMessage.type,
                message: replyMessage
            }, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            setReplyMessage('');
            setIsModalOpen(false);
            fetchMessages();
        } catch (error) {
            showModalGlobal('Error', 'No se pudo enviar la respuesta. Por favor, inténtalo de nuevo.');
        }
    }, [selectedMessage, replyMessage, fetchMessages]);

    const renderMessageDetails = useCallback(() => {
        if (!selectedMessage) return null;
        const config = getMessageConfig(selectedMessage.type);
        return (
            <div className="message-details">
                <h3 className="message-title">
                    <FontAwesomeIcon icon={config.icon} className="me-2" />
                    {config.label}
                </h3>
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
    }, [selectedMessage, getMessageConfig, handleReplySubmit, replyMessage]);

    const FilterButtons = useCallback(({ currentFilter, setFilter }) => {
        const filters = [
            { key: 'all', label: 'Todos', icon: faList },
            { key: 'unread', label: 'No leídos', icon: faEnvelope },
            { key: 'read', label: 'Leídos', icon: faEnvelopeOpen },
            { key: 'contact_support', label: 'Soporte', icon: faHeadset },
            { key: 'contact_shop', label: 'Tienda', icon: faStore },
            { key: 'contact_user', label: 'Usuario', icon: faUser },
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
    }, []);

    if (isLoading) {
        return (
            <Spinner />
        );
    }

    return (
        <div className="user-messages container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Mensajes</h2>
                <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faBell} className="me-2" />
                    <span className="badge">
                        {messages.filter(m => !m.is_read).length} No leídos
                    </span>
                </div>
            </div>

            <FilterButtons currentFilter={filter} setFilter={setFilter} />

            <Button onClick={handleMarkAllRead} variant="secondary" className="mb-4 custom-dropdown-toggle">
                Marcar todos como leídos
            </Button>

            <Table className="messages-table">
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Contenido</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredMessages.slice((currentPage - 1) * messagesPerPage, currentPage * messagesPerPage).map((message) => {
                        const config = getMessageConfig(message.type);
                        return (
                            <tr key={message.id} onClick={() => handleMessageClick(message)}>
                                <td data-label="Tipo">
                                    <FontAwesomeIcon icon={config.icon} className="me-2" />
                                    {config.label}
                                </td>
                                <td data-label="Contenido">{message.content}</td>
                                <td data-label="Fecha">{new Date(message.created_at).toLocaleString()}</td>
                                <td data-label="Estado">
                                    {message.is_read ?
                                        <FontAwesomeIcon icon={faEnvelopeOpen} className="text-muted" /> :
                                        <FontAwesomeIcon icon={faEnvelope} className="text-primary" />
                                    }
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>

            <div className="pagination">
                {[...Array(Math.ceil(filteredMessages.length / messagesPerPage)).keys()].map(number => (
                    <Button
                        key={number + 1}
                        onClick={() => setCurrentPage(number + 1)}
                        className={currentPage === number + 1 ? 'active' : ''}
                    >
                        {number + 1}
                    </Button>
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

export default UserMessages;
import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { Modal, Button, Table, Badge, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEnvelope, faShoppingCart, faClock, faSort, faEuroSign } from '@fortawesome/free-solid-svg-icons';
import { ClimbingBoxLoader } from "react-spinners";
import ModalGlobal from '../ModalGlobal';
import '../../../styles/userpurchases.css';

const UserPurchases = ({ id }) => {
    const [purchases, setPurchases] = useState([]);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [showContactModal, setShowContactModal] = useState(false);
    const [contactForm, setContactForm] = useState({
        content: '',
        subjectAffair: '',
        shopId: null,
        saleId: null
    });
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const token = sessionStorage.getItem('token');

    const fetchUserPurchases = useCallback(async (userId) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${process.env.BACKEND_URL}/sales/user/${userId}`, {
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });
            if (response && response.data) {
                setPurchases(response.data);
            }
        } catch (error) {
            console.error("Error fetching user purchases:", error);
        } finally {
            setTimeout(() => setIsLoading(false), 500); // 500 ms delay
        }
    }, [token]);

    useEffect(() => {
        fetchUserPurchases(id);
    }, [id, fetchUserPurchases]);

    const handleShowDetails = useCallback((purchase) => {
        setSelectedPurchase(purchase);
        setShowModal(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        setSelectedPurchase(null);
    }, []);

    const handleContactSeller = useCallback((shopId, saleId) => {
        setContactForm(prev => ({ ...prev, shopId, saleId }));
        setShowContactModal(true);
    }, []);

    const handleContactFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setContactForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleContactFormSubmit = useCallback(async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.BACKEND_URL}/notifications/user/contactshop`, contactForm, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            setShowContactModal(false);
            setShowConfirmationModal(true);
            setContactForm({ content: '', subjectAffair: '', shopId: null, saleId: null });
        } catch (error) {
            console.error('Error sending message:', error);
            // Handle error (e.g., show error message to user)
        }
    }, [contactForm]);

    const translateStatus = useCallback((status) => {
        const statusTranslations = {
            'pending': 'Pendiente',
            'confirmed': 'Confirmado',
            'sent': 'Enviado',
            'delivered': 'Entregado',
            'canceled': 'Cancelado'
        };
        return statusTranslations[status] || status;
    }, []);

    const getStatusBadge = useCallback((status) => {
        const statusColors = {
            'pending': 'warning',
            'confirmed': 'info',
            'sent': 'primary',
            'delivered': 'success',
            'canceled': 'danger'
        };
        return <Badge bg={statusColors[status] || 'secondary'}>{translateStatus(status)}</Badge>;
    }, [translateStatus]);

    const requestSort = useCallback((key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
        }));
    }, []);

    const sortedPurchases = useMemo(() => {
        let sortablePurchases = [...purchases];
        if (sortConfig.key !== null) {
            sortablePurchases.sort((a, b) => {
                if (sortConfig.key === 'updated') {
                    return sortConfig.direction === 'ascending' 
                        ? new Date(a.updated) - new Date(b.updated)
                        : new Date(b.updated) - new Date(a.updated);
                }
                if (sortConfig.key === 'status') {
                    const statusA = a.shop_sales[0]?.status || '';
                    const statusB = b.shop_sales[0]?.status || '';
                    return sortConfig.direction === 'ascending'
                        ? statusA.localeCompare(statusB)
                        : statusB.localeCompare(statusA);
                }
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortablePurchases;
    }, [purchases, sortConfig]);

    const formatDate = useCallback((dateString) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }, []);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <ClimbingBoxLoader color="#6a8e7f" loading={true} size={40} speedMultiplier={1} />
            </div>
        );
    }

    return (
        <div className="user-purchases-container text-center">
            <h2 className="mb-4">
                <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                Historial de Compras
            </h2>
            <div className="table-responsive">
                <Table hover className="user-purchases-table">
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('id')}>
                                ID Pedido {sortConfig.key === 'id' && <FontAwesomeIcon icon={faSort} />}
                            </th>
                            <th onClick={() => requestSort('updated')}>
                                Última Actualización {sortConfig.key === 'updated' && <FontAwesomeIcon icon={faSort} />}
                            </th>
                            <th onClick={() => requestSort('total_amount')}>
                                Total {sortConfig.key === 'total_amount' && <FontAwesomeIcon icon={faSort} />}
                            </th>
                            <th onClick={() => requestSort('status')}>
                                Estado {sortConfig.key === 'status' && <FontAwesomeIcon icon={faSort} />}
                            </th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPurchases.map((purchase) => (
                            <tr key={purchase.id}>
                                <td data-label="ID Pedido">{purchase.id}</td>
                                <td data-label="Última Actualización">
                                    <FontAwesomeIcon icon={faClock} className="me-2" />
                                    {formatDate(purchase.updated)}
                                </td>
                                <td data-label="Total">
                                    {purchase.total_amount.toFixed(2)}
                                    <FontAwesomeIcon icon={faEuroSign} className="ms-2" />
                                </td>
                                <td data-label="Estado">
                                    {getStatusBadge(purchase.shop_sales[0]?.status || 'Desconocido')}
                                </td>
                                <td data-label="Acciones">
                                    <Button 
                                        variant="primary" 
                                        size="sm"
                                        onClick={() => handleShowDetails(purchase)}
                                    >
                                        <FontAwesomeIcon icon={faEye} className="me-2" />
                                        Ver Detalles
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Detalles del Pedido #{selectedPurchase?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPurchase && (
                        <div className="purchase-details">
                            <div className="mb-4">
                                <h5>Información General</h5>
                                <p><strong>Fecha de Compra:</strong> {formatDate(selectedPurchase.date)}</p>
                                <p><strong>Total:</strong> {selectedPurchase.total_amount.toFixed(2)} €</p>
                            </div>
                            <h5>Cajas Compradas</h5>
                            {selectedPurchase.sale_details.map((detail) => (
                                <div key={detail.id} className="mystery-box-detail mb-3 p-3 border rounded">
                                    <div className="row">
                                        <div className="col-md-4">
                                            <img src={detail.mystery_box.image_url} alt={detail.mystery_box.name} className="img-fluid rounded" />
                                        </div>
                                        <div className="col-md-8">
                                            <h5>{detail.mystery_box.name}</h5>
                                            <p><strong>Precio Unitario:</strong> {detail.price.toFixed(2)} €</p>
                                            <p><strong>Cantidad:</strong> {detail.quantity}</p>
                                            <p><strong>Subtotal:</strong> {detail.subtotal.toFixed(2)} €</p>
                                            <p><strong>Tienda:</strong> {detail.shop.name}</p>
                                            <p><strong>Estado:</strong> {getStatusBadge(selectedPurchase.shop_sales.find(ss => ss.shop_id === detail.shop_id)?.status || 'Desconocido')}</p>
                                            <Button 
                                                variant="primary" 
                                                size="sm" 
                                                onClick={() => handleContactSeller(detail.shop_id, detail.sale_id)}
                                            >
                                                <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                                                Contactar Vendedor
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={handleCloseModal}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showContactModal} onHide={() => setShowContactModal(false)} className='mt-5'>
                <Modal.Header closeButton>
                    <Modal.Title>Contactar al Vendedor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleContactFormSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Asunto</Form.Label>
                            <Form.Control
                                type="text"
                                name="subjectAffair"
                                value={contactForm.subjectAffair}
                                onChange={handleContactFormChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Mensaje</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="content"
                                value={contactForm.content}
                                onChange={handleContactFormChange}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Enviar Mensaje
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <ModalGlobal
                isOpen={showConfirmationModal}
                onClose={() => setShowConfirmationModal(false)}
                title="Mensaje Enviado"
                body="Su mensaje ha sido enviado exitosamente al vendedor."
                buttonBody="Cerrar"
                className="welcome-modal"
            />
        </div>
    );
};

export default UserPurchases;
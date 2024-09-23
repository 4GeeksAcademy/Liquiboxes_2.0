import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faEnvelope, faEnvelopeOpen, faList, faExchangeAlt, faUser, faStore, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Form, Table, Tabs, Tab } from 'react-bootstrap';
import '../../../styles/admins/adminnotifications.css'

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [supportNotifications, setSupportNotifications] = useState([]);
  const [filteredSupportNotifications, setFilteredSupportNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [supportFilter, setSupportFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [changeRequests, setChangeRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('notifications');
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchNotifications();
    fetchChangeRequests();
    fetchStats();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, filter]);

  useEffect(() => {
    filterSupportNotifications();
  }, [supportNotifications, supportFilter]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${process.env.BACKEND_URL}/notifications/admin`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setNotifications(response.data.filter(n => n.type !== 'contact_support'));
      setSupportNotifications(response.data.filter(n => n.type === 'contact_support'));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to fetch notifications. Please try again.');
      setLoading(false);
    }
  };

  const fetchChangeRequests = async () => {
    try {
      const response = await axios.get(`${process.env.BACKEND_URL}/admins/change-requests`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setChangeRequests(response.data);
    } catch (error) {
      console.error('Error fetching change requests:', error);
      setError(error.response?.data?.error || 'Failed to fetch change requests. Please try again.');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${process.env.BACKEND_URL}/admins/change-requests/stats`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
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
      case 'change_request':
        setFilteredNotifications(notifications.filter(n => n.type.includes('change_request')));
        break;
      default:
        setFilteredNotifications(notifications);
    }
  };

  const filterSupportNotifications = () => {
    switch (supportFilter) {
      case 'unread':
        setFilteredSupportNotifications(supportNotifications.filter(n => !n.is_read));
        break;
      case 'read':
        setFilteredSupportNotifications(supportNotifications.filter(n => n.is_read));
        break;
      case 'user':
        setFilteredSupportNotifications(supportNotifications.filter(n => n.sender_type === 'user'));
        break;
      case 'shop':
        setFilteredSupportNotifications(supportNotifications.filter(n => n.sender_type === 'shop'));
        break;
      default:
        setFilteredSupportNotifications(supportNotifications);
    }
  };

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    if (notification.recipient_type === 'admin' & !notification.is_read) {
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
  };

  const handleRequestClick = async (request) => {
    try {
      const response = await axios.get(`${process.env.BACKEND_URL}/admins/change-request/${request.id}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setSelectedRequest(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching request details:', error);
    }
  };

  const handleApproveReject = async (approved, comment) => {
    try {
      const response = await axios.post(`${process.env.BACKEND_URL}/admins/approve-change`, {
        requestId: selectedRequest.id,
        approved,
        comment
      }, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      console.log('Response:', response.data);
      setIsModalOpen(false);
      fetchChangeRequests();
      fetchStats();
      fetchNotifications();
    } catch (error) {
      console.error('Error processing change request:', error);
      alert(error.response?.data?.error || 'Error al procesar la solicitud de cambio. Por favor, inténtalo de nuevo.');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    // AQUÍ ES DONDE SE CREA LA NUEVA NOTIFICACIÓN DE RESPUESTA
    try {
      await axios.post(`${process.env.BACKEND_URL}/notifications/adminreply`, {
        subjectAffair: selectedNotification.extra_data.subject_affair,
        saleId: selectedNotification.sale_id || null,
        recipientId: selectedNotification.extra_data.user_id || selectedNotification.shop_id,
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
      case 'item_change_request':
        return (
          <div>
            <h5>Item Change Request</h5>
            <p>{selectedNotification.content}</p>
            <p>Request ID: {selectedNotification.item_change_request_id}</p>
            <Button onClick={() => handleRequestClick({ id: selectedNotification.item_change_request_id })}>
              View Change Request
            </Button>
          </div>
        );
      case 'contact_support':
        return (
          <div>
            <h5>{selectedNotification.extra_data.subject_affair}</h5>
            <p><strong>From:</strong> {selectedNotification.extra_data.shop_name || selectedNotification.extra_data.user_name}</p>
            <p><strong>Date:</strong> {new Date(selectedNotification.updated_at).toLocaleString()}</p>
            {selectedNotification.sale_id && <p><strong>Sale ID:</strong> {selectedNotification.sale_id}</p>}
            <p>{selectedNotification.content}</p>
            <Form onSubmit={handleReplySubmit}>
              <Form.Group>
                <Form.Label>Reply:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                />
              </Form.Group>
              <Button type="submit" className="mt-2">Send Reply</Button>
            </Form>
            {/* AQUÍ SE PUEDE AGREGAR MÁS INFORMACIÓN SI ES NECESARIO */}
          </div>
        );
      default:
        return <p>{selectedNotification.content}</p>;
    }
  };

  const renderChangeRequestDetails = () => {
    if (!selectedRequest) return null;

    return (
      <div>
        <p><strong>Original Item:</strong> {selectedRequest.original_item_name}</p>
        <p><strong>Proposed Item:</strong> {selectedRequest.proposed_item_name}</p>
        <p><strong>Reason:</strong> {selectedRequest.reason}</p>
        <p><strong>Status:</strong> {selectedRequest.status}</p>
        {selectedRequest.status === 'pending' && (
          <Form>
            <Form.Group>
              <Form.Label>Comment</Form.Label>
              <Form.Control as="textarea" rows={3} id="comment" />
            </Form.Group>
            <Button variant="success" className='me-2 my-2' onClick={() => handleApproveReject(true, document.getElementById('comment').value)}>
              Approve
            </Button>
            <Button variant="danger" className='ms-2 my-2' onClick={() => handleApproveReject(false, document.getElementById('comment').value)}>
              Reject
            </Button>
          </Form>
        )}
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const FilterButtons = ({ currentFilter, setFilter, filters }) => {
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

  const StatsButton = ({ onClick }) => (
    <Button onClick={onClick} className="stats-button mb-3">
      <FontAwesomeIcon icon={faChartBar} className="mr-2 me-2" />
      Show Statistics
    </Button>
  );

  const notificationFilters = [
    { key: 'all', label: 'All', icon: faList },
    { key: 'unread', label: 'Unread', icon: faEnvelope },
    { key: 'read', label: 'Read', icon: faEnvelopeOpen },
    { key: 'change_request', label: 'Item Change Requests', icon: faExchangeAlt },
  ];

  const supportFilters = [
    { key: 'all', label: 'All', icon: faList },
    { key: 'unread', label: 'Unread', icon: faEnvelope },
    { key: 'read', label: 'Read', icon: faEnvelopeOpen },
    { key: 'user', label: 'User', icon: faUser },
    { key: 'shop', label: 'Shop', icon: faStore },
  ];

  return (
    <div className="admin-notifications container mt-4">
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="notifications" title="Notifications">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Admin Notifications</h2>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faBell} className="mr-2 me-2" />
              <span className="badge bg-primary">
                {notifications.filter(n => !n.is_read).length} Unread
              </span>
            </div>
          </div>

          <FilterButtons currentFilter={filter} setFilter={setFilter} filters={notificationFilters} />


          <Table striped bordered hover>
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
          </Table>
        </Tab>
        <Tab eventKey="changeRequests" title="Change Requests">
          <h2>Change Requests</h2>

          <StatsButton onClick={() => setShowStatsModal(true)} />


          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Original Item</th>
                <th>Proposed Item</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {changeRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.id}</td>
                  <td>{request.original_item_name}</td>
                  <td>{request.proposed_item_name}</td>
                  <td>{request.reason}</td>
                  <td>{request.status}</td>
                  <td>
                    <Button onClick={() => handleRequestClick(request)}>View Details</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
        <Tab eventKey="supportNotifications" title="Support Notifications">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Support Notifications</h2>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faBell} className="mr-2" />
              <span className="badge bg-primary">
                {supportNotifications.filter(n => !n.is_read).length} Unread
              </span>
            </div>
          </div>

          <FilterButtons currentFilter={supportFilter} setFilter={setSupportFilter} filters={supportFilters} />

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Sender</th>
                <th>Date</th>
                <th>Sale ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSupportNotifications.map((notification) => (
                <tr
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`cursor-pointer ${notification.sender_type === 'shop' ? 'bg-light' : ''}`}
                >
                  <td>{notification.extra_data.subject_affair}</td>
                  <td>{notification.extra_data.shop_name || notification.extra_data.user_name}</td>
                  <td>{new Date(notification.updated_at).toLocaleString()}</td>
                  <td>{notification.sale_id || 'N/A'}</td>
                  <td>
                    {notification.is_read ?
                      <FontAwesomeIcon icon={faEnvelopeOpen} className="text-muted" /> :
                      <FontAwesomeIcon icon={faEnvelope} className="text-primary" />
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
      </Tabs>

      <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedNotification ? 'Notification Details' : 'Change Request Details'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNotification ? renderNotificationDetails() : renderChangeRequestDetails()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showStatsModal} onHide={() => setShowStatsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Request Statistics</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {stats && (
            <div className="stats">
              <p>Total Requests: {stats.total_requests}</p>
              <p>Pending Requests: {stats.pending_requests}</p>
              <p>Approved Requests: {stats.approved_requests}</p>
              <p>Rejected Requests: {stats.rejected_requests}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatsModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminNotifications;
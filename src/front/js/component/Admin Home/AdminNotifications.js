import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faEnvelope, faEnvelopeOpen, faFilter, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Form, Table, Tabs, Tab } from 'react-bootstrap';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [changeRequests, setChangeRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('notifications');

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

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${process.env.BACKEND_URL}/notifications/all`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setNotifications(response.data);
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
              <FontAwesomeIcon icon={faBell} className="mr-2" />
              <span className="badge bg-primary">
                {notifications.filter(n => !n.is_read).length} Unread
              </span>
            </div>
          </div>

          <div className="mb-4">
            <Button onClick={() => setFilter('all')} variant={filter === 'all' ? 'primary' : 'outline-primary'} className="mr-2">
              All
            </Button>
            <Button onClick={() => setFilter('unread')} variant={filter === 'unread' ? 'primary' : 'outline-primary'} className="mr-2">
              Unread
            </Button>
            <Button onClick={() => setFilter('read')} variant={filter === 'read' ? 'primary' : 'outline-primary'} className="mr-2">
              Read
            </Button>
            <Button onClick={() => setFilter('change_request')} variant={filter === 'change_request' ? 'primary' : 'outline-primary'}>
              Item Change Requests
            </Button>
          </div>

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
          
          {stats && (
            <div className="stats mb-4">
              <h3>Statistics</h3>
              <p>Total Requests: {stats.total_requests}</p>
              <p>Pending Requests: {stats.pending_requests}</p>
              <p>Approved Requests: {stats.approved_requests}</p>
              <p>Rejected Requests: {stats.rejected_requests}</p>
            </div>
          )}

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
    </div>
  );
};

export default AdminNotifications;
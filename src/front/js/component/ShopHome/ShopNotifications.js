import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faEnvelope, faEnvelopeOpen, faFilter } from '@fortawesome/free-solid-svg-icons';
import '../../../styles/shops/shopnotifications.css';

const ShopNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');

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

  const filterNotifications = () => {
    switch(filter) {
      case 'unread':
        setFilteredNotifications(notifications.filter(n => !n.is_read));
        break;
      case 'read':
        setFilteredNotifications(notifications.filter(n => n.is_read));
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
          n.id === notification.id ? {...n, is_read: true} : n
        ));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const renderNotificationDetails = () => {
    if (!selectedNotification) return null;

    switch (selectedNotification.type) {
      case 'new_sale':
        return (
          <div>
            <h5>New Sale Details</h5>
            <p>{selectedNotification.content}</p>
            <p>Sale ID: {selectedNotification.sale_id}</p>
            {/* Add more sale details here */}
          </div>
        );
      case 'change_request_result':
        return (
          <div>
            <h5>Change Request Result</h5>
            <p>{selectedNotification.content}</p>
            <p>Request ID: {selectedNotification.item_change_request_id}</p>
            {/* Add more change request details here */}
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
        <button onClick={() => setFilter('all')} className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'} mr-2`}>
          All
        </button>
        <button onClick={() => setFilter('unread')} className={`btn ${filter === 'unread' ? 'btn-primary' : 'btn-outline-primary'} mr-2`}>
          Unread
        </button>
        <button onClick={() => setFilter('read')} className={`btn ${filter === 'read' ? 'btn-primary' : 'btn-outline-primary'}`}>
          Read
        </button>
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

      {isModalOpen && (
        <div className="modal d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Notification Details</h5>
                <button type="button" className="close" onClick={() => setIsModalOpen(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {renderNotificationDetails()}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isModalOpen && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default ShopNotifications;
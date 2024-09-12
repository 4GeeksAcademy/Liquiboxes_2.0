import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form } from 'react-bootstrap';

const ChangeRequests = () => {
  const [changeRequests, setChangeRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChangeRequests();
    fetchStats();
  }, []);

  const fetchChangeRequests = async () => {
    try {
      const response = await axios.get(`${process.env.BACKEND_URL}/admins/change-requests`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setChangeRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching change requests:', error);
      setError('Failed to fetch change requests. Please try again.');
      setLoading(false);
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

  const handleRequestClick = async (request) => {
    try {
      const response = await axios.get(`${process.env.BACKEND_URL}/admins/change-request/${request.id}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setSelectedRequest(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching request details:', error);
    }
  };

  const handleApproveReject = async (approved, comment) => {
    try {
      await axios.post(`${process.env.BACKEND_URL}/admins/approve-change`, {
        requestId: selectedRequest.id,
        approved,
        comment
      }, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setShowModal(false);
      fetchChangeRequests();
      fetchStats();
    } catch (error) {
      console.error('Error processing change request:', error);
    }
  };

  if (loading) return <div>Loading change requests...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="change-requests container mt-4">
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

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
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
                  <Button variant="success" onClick={() => handleApproveReject(true, document.getElementById('comment').value)}>
                    Approve
                  </Button>
                  <Button variant="danger" onClick={() => handleApproveReject(false, document.getElementById('comment').value)}>
                    Reject
                  </Button>
                </Form>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ChangeRequests;
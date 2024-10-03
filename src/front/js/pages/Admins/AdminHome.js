import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Tab, Tabs } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faStar } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import AdminNotifications from '../../component/Admin Home/AdminNotifications';
import '../../../styles/admins/adminhome.css';
import ModalToken from '../../component/Modals/ModalToken';
import ModalType from '../../component/Modals/ModalType';
import ModalGlobal from '../../component/ModalGlobal';

const AdminHome = () => {
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [error, setError] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [modalGlobalOpen, setModalGlobalOpen] = useState(false);
  const [modalGlobalContent, setModalGlobalContent] = useState({
    title: '',
    body: '',
    buttonBody: 'Cerrar',
    onClick: null
  });

  useEffect(() => {
    checkAuthorization();
  }, []);

  const showModalGlobal = (title, body, buttonBody = 'Cerrar', onClick = null) => {
    setModalGlobalContent({ title, body, buttonBody, onClick });
    setModalGlobalOpen(true);
  };

  const checkAuthorization = () => {
    const token = sessionStorage.getItem('token');
    const userType = sessionStorage.getItem('userType');

    if (!token) {
      setShowTokenModal(true);
    } else if (userType !== 'SuperAdmin' && userType !== 'Admin') {
      setShowTypeModal(true);
    } else {
      setIsAuthorized(true);
      fetchAdmins();
    }
  };


  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${process.env.BACKEND_URL}/admins`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      if (Array.isArray(response.data)) {
        setAdmins(response.data);
      } else {
        console.error('The API response is not an array:', response.data);
        setAdmins([]);
      }
    } catch (error) {
      showModalGlobal('Error', 'Failed to fetch admins. Please try again.');
      setAdmins([]);
    }
  };

  const handleDelete = (adminId) => {
    showModalGlobal(
      'Confirm Delete',
      'Are you sure you want to delete this admin?',
      'Delete',
      async () => {
        try {
          await axios.delete(`${process.env.BACKEND_URL}/admins/${adminId}`, {
            headers: {
              'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
          });
          fetchAdmins();
          setModalGlobalOpen(false);
        } catch (error) {
          showModalGlobal('Error', 'No se pudo eliminar el administrador. Por favor, inténtalo de nuevo.');
        }
      }
    );
  };

  const handleToggleSuperuser = async (adminId) => {
    try {
      await axios.post(`${process.env.BACKEND_URL}/admins/${adminId}/toggle_superuser`, {}, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      fetchAdmins();
    } catch (error) {
      showModalGlobal('Error', 'Failed to toggle superuser status. Please try again.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const adminData = Object.fromEntries(formData.entries());

    // Convert checkbox value to boolean
    adminData.is_superuser = formData.get('is_superuser') === 'on';

    // Only include password if it's provided (for editing)
    if (!adminData.password) {
      delete adminData.password;
    }

    try {
      const url = currentAdmin
        ? `${process.env.BACKEND_URL}/admins/${currentAdmin.id}`
        : `${process.env.BACKEND_URL}/admins`;
      const method = currentAdmin ? 'put' : 'post';

      const response = await axios({
        method: method,
        url: url,
        data: adminData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      console.log('Server response:', response.data);
      setShowModal(false);
      fetchAdmins();
    } catch (error) {
      if (error.response) {
        showModalGlobal('Error', error.response.data.error || 'An unknown error occurred');
      } else if (error.request) {
        showModalGlobal('Error', 'No response received from the server. Please try again.');
      } else {
        showModalGlobal('Error', 'An error occurred while sending the request. Please try again.');
      }
    }
  };

  const handleEdit = (admin) => {
    setCurrentAdmin(admin);
    setShowModal(true);
  };

  if (showTokenModal) {
    return <ModalToken />;
  }

  if (showTypeModal) {
    return <ModalType />;
  }

  if (!isAuthorized) {
    return null; // No renderiza nada si el usuario no está autorizado
  }

  return (
    <div className="admin-home">
      <Tabs defaultActiveKey="notifications" id="admin-dashboard-tabs">
        <Tab eventKey="notifications" title="Notifications and Change Requests">
          <AdminNotifications />
        </Tab>
        <Tab eventKey="admins" title="Manage Admins">
          <Button variant="primary" onClick={() => { setCurrentAdmin(null); setShowModal(true); }}>
            Add New Admin
          </Button>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Surname</th>
                <th>Email</th>
                <th>Superuser</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td>{admin.name}</td>
                  <td>{admin.surname}</td>
                  <td>{admin.email}</td>
                  <td>
                    <FontAwesomeIcon
                      icon={faStar}
                      color={admin.is_superuser ? "gold" : "gray"}
                      onClick={() => handleToggleSuperuser(admin.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td>
                    <Button variant="info" onClick={() => handleEdit(admin)}>
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(admin.id)}>
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
      </Tabs>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentAdmin ? 'Edit Admin' : 'Add New Admin'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                defaultValue={currentAdmin?.name}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Surname</Form.Label>
              <Form.Control
                type="text"
                name="surname"
                defaultValue={currentAdmin?.surname}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                defaultValue={currentAdmin?.email}
                required
              />
            </Form.Group>
            {!currentAdmin && (
              <Form.Group>
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  required
                />
              </Form.Group>
            )}
            <Form.Group>
              <Form.Check
                type="checkbox"
                label="Superuser"
                name="is_superuser"
                defaultChecked={currentAdmin?.is_superuser}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <ModalGlobal
        isOpen={modalGlobalOpen}
        onClose={() => setModalGlobalOpen(false)}
        title={modalGlobalContent.title}
        body={modalGlobalContent.body}
        buttonBody={modalGlobalContent.buttonBody}
        onClick={modalGlobalContent.onClick}
      />
    </div>
  );
};

export default AdminHome;
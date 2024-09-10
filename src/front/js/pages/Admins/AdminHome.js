import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faStar } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '../../../styles/admins/adminhome.css';

const AdminHome = () => {
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);

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
      
      // Verifica si response.data es un array
      if (Array.isArray(response.data)) {
        setAdmins(response.data);
      } else {
        console.error('La respuesta de la API no es un array:', response.data);
        setAdmins([]);  // Asegúrate de establecer un array vacío en caso de error
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      setAdmins([]);  // Manejar el error estableciendo un array vacío
    }
  };

  const handleDelete = async (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await axios.delete(`${process.env.BACKEND_URL}/admins/${adminId}`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });
        fetchAdmins();
      } catch (error) {
        console.error('Error deleting admin:', error);
      }
    }
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
      console.error('Error toggling superuser status:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const adminData = Object.fromEntries(formData.entries());

    try {
      const url = currentAdmin 
        ? `${process.env.BACKEND_URL}/admins/${currentAdmin.id}`
        : `${process.env.BACKEND_URL}/admins`;
      const method = currentAdmin ? 'put' : 'post';
      await axios({
        method: method,
        url: url,
        data: adminData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setShowModal(false);
      fetchAdmins();
    } catch (error) {
      console.error('Error saving admin:', error);
    }
  };

  const handleEdit = (admin) => {
    // Establece el administrador seleccionado como el actual
    setCurrentAdmin(admin);
    // Muestra el modal para editar
    setShowModal(true);
  };

  return (
    <div className="admin-home">
      <h1>Admin Dashboard</h1>
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

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentAdmin ? 'Edit Admin' : 'Add New Admin'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
    </div>
  );
};

export default AdminHome;
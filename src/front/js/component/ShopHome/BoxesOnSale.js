import React, { useContext, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import "../../../styles/shops/boxesonsale.css";
import { useNavigate } from "react-router-dom";
import ModalGlobal from "../ModalGlobal";

function BoxesOnSale({ shopData, fetchData }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedBox, setSelectedBox] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [newItem, setNewItem] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);  // Estado para el modal que elimina la caja misteriosa
  const [boxToDelete, setBoxToDelete] = useState(null);  // Almacena la mystery box seleccionada para eliminar
  const [modalOpen, setModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState ({
    title: '',
    body: ''
  })

  const navigate = useNavigate();

  const showModalGlobal = (title, body) => {
    setModalContent({ title, body });
    setModalOpen(true);
  };

  const handleEditClick = async (box) => {
    try {
      const response = await axios.get(`${process.env.BACKEND_URL}/shops/mystery-box/${box.id}`);
      if (response.data) {
        console.log(response.data);
        setSelectedBox(response.data);
        setPreviewImage(response.data.image_url);
      }
    } catch (error) {
      console.log('error' + error);
    }
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setPreviewImage(null);
    setNewItem("");
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setSelectedBox(prevState => ({
      ...prevState,
      [name]: type === 'number' ? parseFloat(value) || '' : value
    }));
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItem.trim() !== "") {
      setSelectedBox(prevState => ({
        ...prevState,
        possible_items: [...prevState.possible_items, newItem.trim()]
      }));
      setNewItem("");
    }
  };

  const handleRemoveItem = (index) => {
    setSelectedBox(prevState => ({
      ...prevState,
      possible_items: prevState.possible_items.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedBox(prevState => ({
        ...prevState,
        image_url: file
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async (box) => {  //FUCION "GUARDAR CAMBIOS" CUANDO SE MODIFICAN
    const token = sessionStorage.getItem('token');
    const formData = new FormData();

    for (const key in selectedBox) {
      if (key === 'possible_items') {
        formData.append(key, selectedBox[key].join(','));
      } else if (key === 'image_url' && selectedBox[key] instanceof File) {
        formData.append(key, selectedBox[key], selectedBox[key].name);
      } else {
        formData.append(key, selectedBox[key]);
      }
    }

    try {
      const response = await axios.put(
        `${process.env.BACKEND_URL}/shops/mystery-box/${box.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      console.log('Caja misteriosa actualizada:', response.data);
      showModalGlobal('Caja misteriosa actualizada', 'Los datos de tu caja misteriosa se han actualizado correctamente')
      setShowModal(false);
    } catch (error) {
      console.error('Error al actualizar la caja misteriosa:', error);
      showModalGlobal('Vaya ha habido algún error', 'Hubo un error al actualizar la caja misteriosa. Por favor, inténtalo de nuevo.')
    }
  };

  const handleDelete = async () => {  //FUNCION PARA ELIMINAR MYSTERYBOX
    const token = sessionStorage.getItem('token');
    try {
      await axios.delete(`${process.env.BACKEND_URL}/shops/mystery-box/${boxToDelete.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      showModalGlobal('Eliminación exitosa', 'Tu caja misteriosa ha sido eliminada. ¡No dudes en crear otra!')
      setShowDeleteModal(false);  // Cierra el modal después de eliminar
      window.location.reload(); //actualiza la lista de mystery boxes después de la eliminación
      fetchData();
    } catch (error) {
      console.error('Error al eliminar la Mystery Box:', error);
      showModalGlobal('Vaya ha habido algún error', 'Hubo un error al eliminar la Mystery Box. Inténtalo de nuevo.')
    }
  };

  return (
    <>
      {shopData.mystery_boxes.map((box) => (
        <div
          key={box.id}
          className="custom-hover row align-items-center justify-content-between p-3 shadow-sm border rounded w-60 m-3 "
        >
          <div className="col-sm-12 col-md-6 text-center text-md-start">
            <h4 className="fw-bold">{box.name}</h4>
            {box.image_url ? (    //MUESTRA LA PREVISUALIZACION DE LA IMAGEN
              <img
                src={box.image_url}
                alt={`Imagen de ${box.name}`}
                className="img-fluid mb-2 rounded"
                style={{ maxWidth: "40%", height: "auto" }}
              />
            ) : (
              <p>No hay imagen disponible</p>
            )}
            <button type="button" className="btn btn-link"  //NAVIGATE PARA IR A MYSTERY BOX
              onClick={() => navigate(`/mysteryboxpreview/${box.id}`)}>Ir a mystery Box
            </button>
          </div>

          <div className="col-sm-12 col-md-6 text-center text-md-end">
            <button
              className="mb-2 mx-2"
              onClick={() => handleEditClick(box)}
            >
              <i className="fa-solid fa-pen"></i> Editar
            </button>
            <button
              onClick={() => {
                setShowDeleteModal(true);
                setBoxToDelete(box);
              }}
            >
              <i className="fa-regular fa-trash-can"></i> Eliminar
            </button>
          </div>
        </div>
      ))}

      {/* MODAL */}
      {showModal && (
        <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Editar {selectedBox?.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <div className="mb-3">   {/*INPUT DE LA IMAGEN*/}
                {previewImage && (
                  <img src={previewImage} className="img-fluid mb-2" alt="Preview" />
                )}
                <label htmlFor="mysteryboximg" className="form-label">
                  Imagen de la mystery Box
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="mysteryboximg"
                  onChange={handleImageChange}
                  name="image_url"
                  accept="image/*"
                />
              </div>

              <div className="mb-3">  {/*INPUT DEL NOMBRE DE LA CAJA*/}
                <label htmlFor="mysteryboxname" className="form-label">
                  Nombre de la caja
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="mysteryboxname"
                  value={selectedBox.name}
                  onChange={handleChange}
                  name="name"
                />
              </div>

              <div className="mb-3">  {/*INPUT DE NUMBER OF ITEMS*/}
                <label htmlFor="mysteryboxnumberofitems" className="form-label">
                  Numero de items
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="mysteryboxnumberofitems"
                  value={selectedBox.number_of_items}
                  onChange={handleChange}
                  name="number_of_items"
                />
              </div>

              <div className="mb-3"> {/*INPUT POSSIBLE ITEMS / AÑADIR ITEM*/}
                <label htmlFor="mysteryboxpossibleitems" className="form-label">
                  Items posibles
                </label>
                <div className="input-group mb-2 justify-content-center align-items-center">
                  <input
                    type="text"
                    className="form-control my-auto"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Añadir nuevo item"
                  />
                  <button type="button " onClick={handleAddItem}>
                    Añadir
                  </button>
                </div>
                <ul className="list-group">
                  {selectedBox.possible_items.map((item, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-3"> {/*INPUT DEL PRECIO*/}
                <label htmlFor="mysteryboxprice" className="form-label">
                  Precio de la caja
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    id="mysteryboxprice"
                    value={selectedBox.price}
                    onChange={handleChange}
                    name="price"
                    min="0"
                    step="0.01"
                  />
                  <span className="input-group-text">€</span>

                </div>
              </div>

              <div className="mb-3"> {/* INPUT DEL TAMAÑO */}
                <label htmlFor="mysteryboxsize" className="form-label">
                  Tamaño de la caja
                </label>
                <select
                  className="form-select"
                  id="mysteryboxsize"
                  value={selectedBox.size}
                  onChange={handleChange}
                  name="size"
                >
                  <option value="">Selecciona un tamaño</option>
                  <option value="Pequeño">Pequeño</option>
                  <option value="Mediano">Mediano</option>
                  <option value="Grande">Grande</option>
                </select>
              </div>

              <div className="mb-3"> {/*INPUT DE LA DESCRIPCION*/}
                <label htmlFor="mysteryboxdescription" className="form-label">
                  Descripcion de la Mystery Box
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="mysteryboxdescription"
                  value={selectedBox.description}
                  onChange={handleChange}
                  name="description"
                />
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cerrar
            </Button>
            <Button variant="primary" onClick={() => handleSave(selectedBox)}>
              Guardar cambios
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {showDeleteModal && (    //MODAL PARA ELIMINAR MYSTERY BOX
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirmar eliminación</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            ¿Estás seguro de que deseas eliminar la Mystery Box <strong>{boxToDelete?.name}</strong>? Esta acción no se puede deshacer.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Eliminar
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <ModalGlobal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalContent.title}
        body={modalContent.body}
        buttonBody="Cerrar"
      />
    </>
  );
}
export default BoxesOnSale;
import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function BoxesOnSale({ shopData }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedBox, setSelectedBox] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [newItem, setNewItem] = useState("");
  const navigate = useNavigate();

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

  const handleSave = async (box) => {
    const token = sessionStorage.getItem('token');
    const formData = new FormData();

    for (const key in selectedBox) {
      if (key === 'possible_items') {
        formData.append(key, JSON.stringify(selectedBox[key]));
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
      alert('Caja misteriosa actualizada con éxito!');
      setShowModal(false);
    } catch (error) {
      console.error('Error al actualizar la caja misteriosa:', error);
      alert('Hubo un error al actualizar la caja misteriosa. Por favor, inténtalo de nuevo.');
    }
  };


  return (
    <>
      {shopData.mystery_boxes.map((box) => (
        <div
          key={box.id}
          className="row align-items-center justify-content-between p-3 shadow-sm border rounded w-60 m-3"
        >
          <div className="col-sm-12 col-md-4 text-center text-md-start">
            <h4 className="fw-bold">{box.name}</h4>
            <p>Total de ventas: {box.total_sales}</p>
            <button type="button" className="btn btn-link"
              onClick={() => navigate(`/mysterybox/${box.id}`)}>Ir a mystery Box
            </button>
          </div>

          <div className="col-sm-12 col-md-4 text-center text-md-end">
            <button
              className="mb-2 mx-2"
              onClick={() => handleEditClick(box)}
            >
              <i className="fa-solid fa-pen"></i> Editar
            </button>
            <button className="">
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
              <div className="mb-3">
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

              <div className="mb-3">
                <label htmlFor="mysteryboxpossibleitems" className="form-label">
                  Items posibles
                </label>
                <div className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Añadir nuevo item"
                  />
                  <button className="btn btn-outline-secondary" type="button" onClick={handleAddItem}>
                    Añadir
                  </button>
                </div>
                <ul className="list-group">
                  {selectedBox.possible_items.map((item, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      {item}
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-3"> {/*INPUT DEL PRECIO*/}
                <label htmlFor="mysteryboxprice" className="form-label">
                  Precio de la caja
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="mysteryboxprice"
                  value={selectedBox.price}
                  onChange={handleChange}
                  name="price"
                />
              </div>

              <div className="mb-3"> {/*INPUT DEL TAMAÑO*/}
                <label htmlFor="mysteryboxsize" className="form-label">
                  Tamaño de la caja
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="mysteryboxsize"
                  value={selectedBox.size}
                  onChange={handleChange}
                  name="size"
                />
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
    </>
  );
}

export default BoxesOnSale;














// AQUÍ MICHELL!!!!

// {
//   
//   "mystery_boxes": [
//     {
//       "id": 1, 
//       "image_url": "https://res.cloudinary.com/dg7u2cizh/image/upload/v1726059679/jkkoqsyrsjkpigy43f9d.webp", 
//       "name": "Caja Misteriosa de Miguel", 
//       "price": 50.0, 
//       "shop_categories": [
//         "Moda", 
//         "Ropa de Trabajo", 
//         "Tecnolog\u00eda", 
//         "Carpinter\u00eda", 
//         "Outdoor", 
//         "Deporte", 
//         "Arte", 
//         "Cocina", 
//         "Jardiner\u00eda", 
//         "M\u00fasica", 
//         "Viajes", 
//         "Lectura", 
//         "Cine", 
//         "Fotograf\u00eda", 
//         "Yoga"
//       ], 
//       "shop_id": 1, 
//       "shop_name": "Tienda de Miguel", 
//       "total_sales": 10
//     }
// }


// PARA TRAERTE LOS DATOS =>
// const arrayMystery = shopData.mystery_boxes
// arrayMystery.map((mysterybox) => (
//   try { const response = await axios.get(`BACKEND_URL + /shops/shop_id/mysteryboxes)}
//  ))

// PARA MODIFICAR ESTOS DATOS MIRAR SHOPHOME =>
// const handleSave = async (field) => {
//   const token = sessionStorage.getItem('token');
//   try {
//     let value = shopData[field];
//     if (field === 'categories' && Array.isArray(value)) {
//       // Convertir el array de categorías a un formato que el backend pueda procesar
//       value = JSON.stringify(value.map(cat => `"${cat}"`));
//     }

//     const formData = new FormData();
//     formData.append(field, value);

//     await axios.patch(`${process.env.BACKEND_URL}/shops/profile`,
//       formData,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data'
//         }
//       }
//     );
//     setEditMode(prev => ({ ...prev, [field]: false }));
//     setError(null);
//   } catch (error) {
//     console.error("Error updating shop data:", error);
//     setError("Error al actualizar el perfil. Por favor, inténtalo de nuevo.");
//   }
// };

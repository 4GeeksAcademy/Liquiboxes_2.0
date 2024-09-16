import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function BoxesOnSale({ shopData }) {
  const [showModal, setShowModal] = useState(false); // Estado para mostrar/ocultar el modal
  const [selectedBox, setSelectedBox] = useState(null); // selecciona la caja a editar 
  const navigate = useNavigate();


  const handleEditClick = async (box) => {
    try {
      const response = await axios.get(`${process.env.BACKEND_URL}/shops/mystery-box/${box.id}`)
      if (response.data) {
        console.log(response.data)
        setSelectedBox(response.data);
      }
    }
    catch (error) {
      console.log('error' + error)
    }
    setShowModal(true);  // abre el modal cuando se da click en editar
  };

  const handleClose = () => { // cierra modal
    setShowModal(false);
  };

  if (!shopData || !shopData.mystery_boxes) {
    return <div>No hay cajas disponibles para mostrar</div>;
  }

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    if (type === 'file') {
      const file = e.target.files[0]
    console.log(file)
      setSelectedBox({
        ...selectedBox,
        [name]: file, // Guardamos el archivo como un objeto File
      });
    } else {
      setSelectedBox({
        ...selectedBox,
        [name]: value,
      });
    }
  };


  const handleSave = async (box) => {
    const token = sessionStorage.getItem('token');
    const formData = new FormData(); // Usamos FormData para enviar la imagen
    for (const key in selectedBox) {
      formData.append(key, selectedBox[key]);
    }

    try {
      const response = await axios.put(
        `${process.env.BACKEND_URL}/shops/mystery-box/${box.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data', // Importante para que el backend procese la imagen
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      console.log(response);
    } catch (error) {
      console.error(error);
    }
    setShowModal(false); // Cierra el modal al guardar cambios
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
                <img src={selectedBox.image_url} className="img-fluid" /> {/*INPUT DE LA IMAGEN*/}
                <label htmlFor="mysteryboximg" className="form-label">
                  Imagen de la mystery Box
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="mysteryboximg"
                  onChange={handleInputChange}
                  name="image_url" // Usa el nombre que tu backend espera
                  accept="image/*" // Solo acepta imágenes
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  name="number_of_items"
                />
              </div>

              <div className="mb-3">  {/*INPUT POSSIBLE ITEMS*/}
                <label htmlFor="mysteryboxpossibleitems" className="form-label">
                  Items posibles
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="mysteryboxpossibleitems"
                  value={selectedBox.possible_items}
                  onChange={handleInputChange}
                  name="possible_items"
                />
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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

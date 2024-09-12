import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

function BoxesOnSale({ shopData }) {
  const [showModal, setShowModal] = useState(false); // Estado para mostrar/ocultar el modal
  const [selectedBox, setSelectedBox] = useState(null); // Caja seleccionada para editar
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");

  const handleEditClick = (box) => {
    // Abre el modal y selecciona la caja a editar
    setSelectedBox(box);
    setInput1(box.name); // Asigna el valor de la caja al input
    setInput2(box.price); // Puedes adaptar esto según lo que necesites
    setShowModal(true); // Abre el modal
  };

  const handleClose = () => {
    setShowModal(false); // Oculta el modal
  };

  const handleSave = () => {
    console.log("Input 1 (Name):", input1);
    console.log("Input 2 (Price):", input2);
    setShowModal(false); // Oculta el modal después de guardar
  };

  if (!shopData || !shopData.mystery_boxes) {
    return <div>No hay cajas disponibles para mostrar</div>;
  }

  return (
    <>
      {shopData.mystery_boxes.map((box) => (
        <div
          key={box.id}
          className="row align-items-center justify-content-between p-3 shadow-sm border rounded w-60 m-3"
        >
          <div className="col-sm-12 col-md-4 text-center text-md-start mb-3 mb-md-0">
            <h4 className="fw-bold">{box.name}</h4>
            <p>Precio: ${box.price}</p>
            <p>Total de ventas: {box.total_sales}</p>
          </div>

          <div className="col-sm-12 col-md-4 text-center text-md-end">
            <button
              className="btn btn-primary me-2"
              onClick={() => handleEditClick(box)}
            >
              <i className="fa-solid fa-pen"></i> Editar
            </button>
            <button className="btn btn-danger">
              <i className="fa-regular fa-trash-can"></i> Eliminar
            </button>
          </div>
        </div>
      ))}

      {/* Modal */}
      {showModal && (
        <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Editar {selectedBox?.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <div className="mb-3">
                <label htmlFor="input1" className="form-label">
                  Nombre de la caja
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="input1"
                  value={input1}
                  onChange={(e) => setInput1(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="input2" className="form-label">
                  Precio de la caja
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="input2"
                  value={input2}
                  onChange={(e) => setInput2(e.target.value)}
                />
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cerrar
            </Button>
            <Button variant="primary" onClick={handleSave}>
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
  
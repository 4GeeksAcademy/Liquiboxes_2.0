import React from 'react'

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
  const handleSave = async (field) => {
    const token = sessionStorage.getItem('token');
    try {
      let value = shopData[field];
      if (field === 'categories' && Array.isArray(value)) {
        // Convertir el array de categorías a un formato que el backend pueda procesar
        value = JSON.stringify(value.map(cat => `"${cat}"`));
      }

      const formData = new FormData();
      formData.append(field, value);

      await axios.patch(`${process.env.BACKEND_URL}/shops/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setEditMode(prev => ({ ...prev, [field]: false }));
      setError(null);
    } catch (error) {
      console.error("Error updating shop data:", error);
      setError("Error al actualizar el perfil. Por favor, inténtalo de nuevo.");
    }
  };



function BoxesOnSale(sopData) {
  return (
    <div>BoxesOnSale</div>
  )
}

export default BoxesOnSale
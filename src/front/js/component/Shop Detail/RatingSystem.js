import React, { useState } from 'react';
import Ratings from './Ratings';

const RatingSystem = () => {
  const [ratings, setRatings] = useState([]); //guarda todas las calificaciones enviadas por el usuario
  const [comments, setComments] = useState(""); //almacena el comentario del usuario
  const [photos, setPhotos] = useState([]); //almacena las fotos subidas por el usuario
  const [currentRating, setCurrentRating] = useState(0);

  const handlePhotoUpload = (e) => {
    const selectedPhotos = Array.from(e.target.files);
    setPhotos(selectedPhotos);
  };

  const handleSubmit = () => {
    if (currentRating > 0) {
      const newRating = {
        rating: currentRating,
        comment: comments,
        photos: photos,
      };
      setRatings([...ratings, newRating]);
      setCurrentRating(0); // Restablece la calificación actual
      setComments(""); // Restablece el comentario
      setPhotos([]); // Restablece las fotos
    }
  };

  const getAverageRating = () => {
    const total = ratings.reduce((acc, { rating }) => acc + rating, 0);
    return (total / ratings.length).toFixed(1); // Calcula el promedio con un decimal
  };

  return (
    <div>
      <h2>Valora este comercio</h2>
      
      {/* Componente de estrellas */}
      <Ratings rating={currentRating} setRating={setCurrentRating} />
      
      {/* Campo de texto para comentario */}
      <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        placeholder="Escribe un comentario sobre tu experiencia..."
        rows={4}
        style={{ width: '100%', marginTop: '10px' }}
      />
      
      {/* Campo para subir fotos */}
      <input
        type="file"
        multiple
        onChange={handlePhotoUpload}
        style={{ marginTop: '10px' }}
      />
      
      <button onClick={handleSubmit} style={{ marginTop: '10px' }}>
        Enviar valoración
      </button>

      {ratings.length > 0 && (
        <div>
          <h3>Promedio de calificaciones: {getAverageRating()} estrellas</h3>
          {ratings.map((rating, index) => (
            <div key={index} style={{ marginTop: '10px' }}>
              <p><strong>Calificación:</strong> {rating.rating} estrellas</p>
              <p><strong>Comentario:</strong> {rating.comment}</p>
              {rating.photos.length > 0 && (
                <div>
                  <strong>Fotos:</strong>
                  {rating.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(photo)}
                      alt={`foto-${idx}`}
                      style={{ width: '100px', height: '100px', marginRight: '10px' }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default RatingSystem;

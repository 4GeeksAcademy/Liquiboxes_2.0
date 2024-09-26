import React, { useState } from 'react';
import RatingStar from './RatingStar';

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

  const renderStars = (rating) => {
    const totalStars = 5;
    const fullStars = Math.floor(rating);
    const emptyStars = totalStars - fullStars;

    return (
      <span>
        {/* Estrellas llenas */}
        {[...Array(fullStars)].map((_, idx) => (
          <i key={idx} className="bi bi-star-fill text-warning"></i>
        ))}
        {/* Estrellas vacías */}
        {[...Array(emptyStars)].map((_, idx) => (
          <i key={idx} className="bi bi-star text-warning" style={{ opacity: 0.5 }}></i>
        ))}
      </span>
    );
  };


  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Valora este comercio</h2>

      {/* Componente de estrellas */}
      <div className="d-flex justify-content-center mb-3">
        <RatingStar rating={currentRating} setRating={setCurrentRating} />
      </div>

      {/* Campo de texto para comentario */}
      <div className="form-group mb-3">
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="form-control"
          placeholder="Escribe un comentario sobre tu experiencia..."
          rows={4}
        />
      </div>

      {/* Campo para subir fotos */}
      <div className="form-group mb-3">
        <label className="form-label">Sube tus fotos (opcional):</label>
        <input
          type="file"
          multiple
          className="form-control"
          onChange={handlePhotoUpload}
        />
      </div>

      {/* Botón para enviar */}
      <button
        className="btn btn-primary w-100 mb-4"
        onClick={handleSubmit}
        disabled={currentRating === 0}
      >
        Enviar valoración
      </button>

      {ratings.length > 0 && (
        <div className="mt-4">
          <h3 className="text-center mb-4">
            Promedio de calificaciones: {getAverageRating()} estrellas
          </h3>
          {ratings.map((rating, index) => (
            <div key={index} className="card mb-3 p-3">
              <p><strong>Calificación:</strong> {rating.rating} estrellas</p>
              <p><strong>Comentario:</strong> {rating.comment}</p>
              
              {rating.photos.length > 0 && (
                <div className="mb-3">
                  <strong>Fotos:</strong>
                  <div className="d-flex flex-wrap mt-2">
                    {rating.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={URL.createObjectURL(photo)}
                        alt={`foto-${idx}`}
                        className="img-thumbnail me-2 mb-2"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                    ))}
                  </div>
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

import React, { useState } from 'react';
import RatingStar from './RatingStar';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const RatingSystem = () => {
  const [ratings, setRatings] = useState([
    {
      rating: 5,
      comment: "Excelente servicio, muy recomendado!",
      photos: [],
    },
    {
      rating: 4,
      comment: "Muy recomendable la experiencia! aunque todos los artículos eran sorpresa, tuvieron en cuenta mis preferencias.",
      photos: [],
    },
    {
      rating: 5,
      comment: "Genial!! Me llegaron cosas muy chulas!!! Me encantó todo, gracias!!!.",
      photos: [],
    }
  ]);
  const [comments, setComments] = useState("");
  const [photos, setPhotos] = useState([]);
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
      setCurrentRating(0);
      setComments("");
      setPhotos([]);
    }
  };

  const getAverageRating = () => {
    const total = ratings.reduce((acc, { rating }) => acc + rating, 0);
    return (total / ratings.length).toFixed(1);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          style={{ color: i <= rating ? 'gold' : 'lightgray' }}
          className="me-1"
        />
      );
    }
    return stars;
  };

  return (
    <div className="container my-5">
      {/* <div className="text-center mb-4">
        <h2 className="mb-3">Valora tu experiencia</h2>
        <RatingStar rating={currentRating} setRating={setCurrentRating} />
      </div> */}

      {/* <div className="form-group mb-3 w-50">
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="form-control"
          placeholder="Escribe un comentario sobre tu experiencia..."
          rows={4}
        />
      </div> */}

      {/* <div className="form-group mb-3 w-50"> 
        <label className="form-label">Sube tus fotos (opcional):</label>
        <input
          type="file"
          multiple
          className="form-control"
          onChange={handlePhotoUpload}
        />
      </div> */}

      {/* <div className="text-center mb-4"> 
        <button
          className="btn btn-primary btn-lg"
          onClick={handleSubmit}
          disabled={currentRating === 0}
        >
          Enviar valoración
        </button>
      </div> */}

      {ratings.length > 0 && (
        <div className="bg-light p-4 rounded shadow-lg">
          <div className="text-center d-flex mb-4">
            <h3>Promedio de valoraciones: {getAverageRating()} estrellas</h3>
            {renderStars(Math.round(getAverageRating()))}
          </div>
          <div className="row">
            {ratings.map((rating, index) => (
              <div key={index} className="col-lg-4 col-md-6 mb-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-2">
                      <p className="me-2 mb-0"><strong>Calificación:</strong></p>
                      {renderStars(rating.rating)}
                    </div>
                    <p className="mb-2"><strong>Comentario:</strong> {rating.comment}</p>
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
                              style={{ width: '100px', height: '100px', objectFit: 'cover', transition: 'transform 0.2s' }}
                              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingSystem;

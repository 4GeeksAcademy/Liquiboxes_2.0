import React from 'react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

const RatingStar = ({ rating, setRating }) => {
  const [hover, setHover] = useState(0);
  return (
    <div>
      {[...Array(5)].map((star, index) => {
        const ratingValue = index + 1;
        return (
          <label key={index}>
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => setRating(ratingValue)}
              style={{ display: 'none' }}
            />
            <span
              className="star"
              style={{
                color: ratingValue <= (hover || rating) ? '#ffc107' : '#e4e5e9',
                cursor: 'pointer',
                fontSize: '2rem',
              }}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(0)}
            >
              <FontAwesomeIcon key={index} icon={faStar} />

            </span>
          </label>
        );
      })}
    </div>
  );
};
export default RatingStar;
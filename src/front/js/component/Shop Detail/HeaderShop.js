import React from 'react';
import "../../../styles/headershop.css";

function HeaderShop({ data }) {
  const formatCategories = (categories) => {
    if (!Array.isArray(categories)) return [];
    return categories.map(category => category.replace(/[\[\]"\\]/g, '').trim()).filter(Boolean);
  };

  const categories = formatCategories(data.categories);

  return (
    <div className="header-shop-container mb-3">
      <div className="header-shop-card">
        <div className="header-shop-image">
          <img src={data.image_shop_url} alt={data.name} />
        </div>
        <div className="header-shop-content">
          <h1 className="shop-name">{data.name}</h1>
          <p className="shop-summary">{data.shop_summary}</p>

          <div className="shop-details">
            <div className="detail-item">
              <i className="fas fa-building"></i>
              <div>
                <strong>Actividad principal</strong>
                <p>{data.business_core}</p>
              </div>
            </div>
            <div className="detail-item">
              <i className="fas fa-user"></i>
              <div>
                <strong>Propietario</strong>
                <p>{data.owner_name} {data.owner_surname}</p>
              </div>
            </div>
            <div className="detail-item">
              <i className="fas fa-map-marker-alt"></i>
              <div>
                <strong>Dirección</strong>
                <p>{data.address}</p>
              </div>
            </div>
          </div>

          <div className="shop-categories">
            <strong>Categorías</strong>
            {categories.length > 0 ? (
              <ul className="category-list">
                {categories.map((category, index) => (
                  <li key={index}>{category}</li>
                ))}
              </ul>
            ) : (
              <p>No se han especificado categorías.</p>
            )}
          </div>

          <div className="shop-description">
            <strong>Descripción de la tienda</strong>
            <p>{data.shop_description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeaderShop;
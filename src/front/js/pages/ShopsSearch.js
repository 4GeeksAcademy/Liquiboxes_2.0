import React, { useContext, useEffect, useState } from 'react'
import SearchBar from '../component/Home/SearchBar'
import CardTienda from '../component/Home/CardTienda'
import axios from 'axios'
import { useLocation } from 'react-router-dom'
import '../../styles/shopssearch.css';
import { Context } from '../store/appContext'


function ShopsSearch() {
  const [shops, setShops] = useState([])
  const [filteredShops, setFilteredShops] = useState([])
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const {store} = useContext(Context)
  const categories = store.categories;


  useEffect(() => {
    const fetchShops = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const url = `${process.env.BACKEND_URL}/shops`;
        console.log('Fetching shops from:', url);

        const response = await axios.get(url);
        console.log('API response:', response);

        let shopsData;
        if (Array.isArray(response.data)) {
          shopsData = response.data;
        } else if (typeof response.data === 'object' && response.data !== null) {
          shopsData = response.data.shops || response.data.data || [];
        } else {
          shopsData = [];
        }

        console.log('Processed shops data:', shopsData);

        setShops(shopsData);
        setFilteredShops(shopsData);

        const searchParams = new URLSearchParams(location.search);
        const initialSearchTerm = searchParams.get('search');
        if (initialSearchTerm) {
          setSearchTerm(initialSearchTerm);
          handleSearch(initialSearchTerm, shopsData);
        }
      } catch (error) {
        console.error("Error fetching shops:", error);
        console.error("Error details:", error.response || error.message);
        setError("No se pudieron cargar las tiendas. Por favor, intente más tarde.");
        setShops([]);
        setFilteredShops([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShops();
  }, [location]);

  const normalizeString = (str) => {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const handleSearch = (searchTerm, shopsToFilter = shops) => {
    setSearchTerm(searchTerm);
    const normalizedSearchTerm = normalizeString(searchTerm);
    const filtered = shopsToFilter.filter(shop =>
      normalizeString(shop.name).includes(normalizedSearchTerm) ||
      (shop.address && normalizeString(shop.address).includes(normalizedSearchTerm))
    );
    setFilteredShops(filtered);
  };

  const handleCategoryChange = (selectedCategories) => {
    if (selectedCategories.length === 0) {
      setFilteredShops(shops);
    } else {
      const filtered = shops.filter(shop =>
        shop.categories && shop.categories.some(category =>
          selectedCategories.includes(category.replace(/[\[\]"]/g, ''))
        )
      );
      setFilteredShops(filtered);
    }
  };

  if (isLoading) {
    return <div className="loading">Cargando tiendas...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="shops-search">
      <div className="search-container">
        <SearchBar
          onSearch={(term) => handleSearch(term)}
          onCategoryChange={handleCategoryChange}
          initialSearchTerm={searchTerm}
          shops={shops}
          categories={categories}
        />
      </div>
      <div className="row">
        {filteredShops.length > 0 ? (
          filteredShops.map((shop) => (
            <div className="col-12 col-md-6 col-lg-4 col-xxl-3"
            >
              <CardTienda
                key={shop.id}
                id={shop.id}
                imageSrc={shop.image_shop_url}
                shopName={shop.name}
                shopSummary={shop.shop_summary}
                shopAddress={shop.address}
              />
            </div>
          ))
        ) : (
          <p>No se encontraron tiendas que coincidan con tu búsqueda.</p>
        )}
      </div>

    </div>
  )
}

export default ShopsSearch
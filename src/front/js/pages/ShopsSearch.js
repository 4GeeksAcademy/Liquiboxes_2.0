import React, { useContext, useEffect, useState } from 'react'
import SearchBar from '../component/Home/SearchBar'
import CardTienda from '../component/Home/CardTienda'
import axios from 'axios'
import { useLocation } from 'react-router-dom'
import '../../styles/shopssearch.css';
import { Context } from '../store/appContext'
import Spinner from '../component/Spinner'
import NotType from '../component/Utils/NotType'
import ModalGlobal from '../component/ModalGlobal'

function ShopsSearch() {
  const [shops, setShops] = useState([])
  const [filteredShops, setFilteredShops] = useState([])
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const { store } = useContext(Context)
  const categories = store.categories;

  // Nuevos estados para el ModalGlobal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', body: '' });

  const showModal = (title, body) => {
    setModalContent({ title, body });
    setModalOpen(true);
  };

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setIsLoading(true);

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
        showModal("Error", "No se pudieron cargar las tiendas. Por favor, intente más tarde.");
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
    
    if (filtered.length === 0) {
      showModal("Sin resultados", "No se encontraron tiendas que coincidan con tu búsqueda.");
    }
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
      
      if (filtered.length === 0) {
        showModal("Sin resultados", "No se encontraron tiendas en las categorías seleccionadas.");
      }
    }
  };

  if (isLoading) return <Spinner />

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
        {filteredShops.map((shop) => (
          <div className="col-12 col-md-6 col-lg-4 col-xxl-3" key={shop.id}>
            <CardTienda
              id={shop.id}
              imageSrc={shop.image_shop_url}
              shopName={shop.name}
              shopSummary={shop.shop_summary}
              shopAddress={shop.address}
            />
          </div>
        ))}
      </div>

      <NotType user_or_shop = 'user' />

      <ModalGlobal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalContent.title}
        body={modalContent.body}
        buttonBody="Cerrar"
      />
    </div>
  )
}

export default ShopsSearch
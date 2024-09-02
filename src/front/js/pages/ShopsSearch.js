import React, { useEffect, useState } from 'react'
import SearchBar from '../component/Home/SearchBar'
import CardTienda from '../component/Home/CardTienda'
import axios from 'axios'

function ShopsSearch() {
  const [shops, setShops] = useState([])
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(`${process.env.BACKEND_URL}/shops`);
        console.log('Datos recibidos:', response.data);
        setShops(response.data);
      } catch (error) {
        console.error("Error fetching shops:", error);
        setError("No se pudieron cargar las tiendas. Por favor, intente más tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchShops();
  }, []);

  useEffect(() => {
    console.log('Shops actualizadas:', shops);
  }, [shops]);

  if (isLoading) {
    return <div className="text-center py-5">Cargando tiendas...</div>;
  }

  if (error) {
    return <div className="alert alert-danger text-center" role="alert">{error}</div>;
  }

  return (
    <div className=" py-5 mx-5 px-3">
      <h1 className="text-center mb-5">Descubre Nuestras Tiendas</h1>
      
      <div className='row mb-5'>
        <div className='col-12 col-md-8 col-lg-6 mx-auto'>
          <SearchBar />
        </div>
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 row-cols-xxl-5 g-4">
        {shops.map((shop) => (
          <div className="col mx-auto" key={shop.id}>
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
    </div>
  )
}

export default ShopsSearch
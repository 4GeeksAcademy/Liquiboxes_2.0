import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import "../../styles/home.css";
import SearchBar from "../component/Home/SearchBar";
import ScrollHorizontalShops from "../component/Home/ScrollHorizontalShops";
import ScrollHorizontalMysteryBoxes from "../component/Home/ScrollHorizontalMysteryBoxes";
import CarruselTopSellers from "../component/Home/CarruselTopSellers";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Slide, Fade } from "react-awesome-reveal";
import Spinner from "../component/Spinner";
import NotType from "../component/Utils/NotType";

export const Home = () => {
    const { store, actions } = useContext(Context);
    const [recommendedShops, setRecommendedShops] = useState([]);
    const [recommendedMysteryBoxes, setRecommendedMysteryBoxes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [topSellingShops, setTopSellingShops] = useState([]); // Nueva variable para las tiendas más vendidas
    const token = sessionStorage.getItem('token')
    const navigate = useNavigate()


    useEffect(() => {

        const loadData = async () => {
            if (store.allShops.length === 0) {
                await actions.fetchShops();
            }
            await actions.fetchUserProfile();
            setLoading(false);
        };
        loadData();
    }, []);

    useEffect(() => {
        setLoading(true)

        if (store.userData && store.allShops.length > 0) {
            const userCategories = store.userData.categories.map(cat => cat.toLowerCase());
            const filtered = store.allShops.filter(shop =>
                shop.categories.some(category => userCategories.includes(category))
            );
            setRecommendedShops(filtered);
            fetchRecommendedMysteryBoxes(filtered);
            calculateTopSellingShops(store.allShops); // Calcular las tiendas más vendidas
            setTimeout(() => setLoading(false), 1000);

        }

    }, [store.userData, store.allShops]);

    const fetchRecommendedMysteryBoxes = async (shops) => {
        setLoading(true);
        try {
            const mysteryBoxesPromises = shops.map(shop =>
                axios.get(`${process.env.BACKEND_URL}/shops/${shop.id}/mysteryboxes`, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => {
                        if (response.headers['content-type'].includes('application/json')) {
                            return response.data;
                        } else {
                            console.error(`Received non-JSON response for shop ${shop.id}`);
                            return [];
                        }
                    })
                    .catch(error => {
                        console.error(`Error fetching mystery boxes for shop ${shop.id}:`, error.response || error);
                        return [];
                    })
            );
            const responses = await Promise.all(mysteryBoxesPromises);
            const allMysteryBoxes = responses.flatMap(response => response);
            if (allMysteryBoxes.length === 0) {
                console.error("No valid mystery boxes data received");
                setRecommendedMysteryBoxes([]);
            } else {
                const sortedMysteryBoxes = allMysteryBoxes
                    .sort((a, b) => b.total_sales - a.total_sales)
                    .slice(0, 10);
                setRecommendedMysteryBoxes(sortedMysteryBoxes);
            }


        } catch (error) {
            console.error("Error fetching recommended mystery boxes:", error);
            setRecommendedMysteryBoxes([]);
            setLoading(false);

        } finally {
            setTimeout(() => setLoading(false), 500);
        }
    };

    const calculateTopSellingShops = (shops) => {
        const sortedShops = shops
            .filter(shop => shop.total_sales) // Filtramos las tiendas con ventas
            .sort((a, b) => b.total_sales - a.total_sales) // Ordenamos por ventas descendente
            .slice(0, 5); // Limitar a las 5 más vendidas 
        setTopSellingShops(sortedShops); // Guardamos en el estado
    };

    if (loading) {
        return (
            <Spinner />
        )
    }

    return (
        <div className="text-center mt-2 mb-5 mx-5">
            <Fade >
                <header className="home-header mb-5 ms-0 ms-md-3 ms-lg-5" >
                    <h1 className="site-title  text-start">
                        <span className="title-highlight">Liqui</span>Boxes
                    </h1>
                </header>
            </Fade>
            <div className="row d-flex align-items-center mx-lg-5">


                <div className="col-12 col-lg-6 grid-2">
                    {store.userData && (
                        <div className="greeting-section">
                            <Slide triggerOnce>
                                <h2 className="greeting-text">¡Hola, {store.userData.name}!</h2>
                            </Slide>
                        </div>
                    )}
                    <SearchBar
                        onSearch={(term) => {
                            navigate(`/shopssearch?search=${encodeURIComponent(term)}`);
                        }}
                        shops={store.allShops}
                        categories={store.userData ? store.userData.categories : []}
                        initialSearchTerm=""
                        onCategoryChange={() => { }} // Esta función no se usa en la página de inicio, pero la pasamos para evitar errores
                    />
                </div>
                <div className="col-12 col-lg-6">

                    <CarruselTopSellers shopData={topSellingShops} />
                </div>
            </div>


            {token ? (
                <>
                    {loading ? (
                        <div>
                            <Spinner />
                        </div>
                    ) : recommendedMysteryBoxes.length > 0 ? (
                        <div className="my-5">
                            <ScrollHorizontalMysteryBoxes mysteryBoxes={recommendedMysteryBoxes} />
                        </div>
                    ) : (
                        <p>No hay mystery boxes recomendadas en este momento.</p>
                    )}
                    {loading ? (
                        <div>
                            <Spinner />
                        </div>
                    ) : recommendedShops.length > 0 ? (
                        <div>
                            <ScrollHorizontalShops cardsData={recommendedShops} className='mx-4 my-3' />
                        </div>
                    ) : (
                        <p>No hay tiendas recomendadas en este momento.</p>
                    )}
                </>
            ) : (
                <div className="my-5">
                    <h2>Inicia sesión para ver recomendaciones personalizadas</h2>
                    <button type="button" className="btn btn-secondary fs-5 my-2" onClick={() => { navigate('/', { state: { from: location.pathname } }) }}>Iniciar sesión</button>
                </div>
            )}

      <NotType user_or_shop='user' />

        </div>
    );
};

export default Home;

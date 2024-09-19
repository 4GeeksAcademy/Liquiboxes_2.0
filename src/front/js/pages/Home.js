import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import "../../styles/home.css";
import SearchBar from "../component/Home/SearchBar";
import ScrollHorizontalShops from "../component/Home/ScrollHorizontalShops";
import CarruselTopSellers from "../component/Home/CarruselTopSellers";
import { Fade, Slide, Zoom } from "react-awesome-reveal";

export const Home = () => {
    const { store, actions } = useContext(Context);
    const [recommendedShops, setRecommendedShops] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            if (store.allShops.length === 0) {
                await actions.fetchShops();
            }
            await actions.fetchUserProfile();
        };
        loadData();
    }, []);

    useEffect(() => {
        if (store.userData && store.allShops.length > 0) {
            const userCategories = store.userData.categories.map(cat => cat.toLowerCase());
            const filtered = store.allShops.filter(shop =>
                shop.categories.some(category => userCategories.includes(category))
            );
            setRecommendedShops(filtered);
        }
    }, [store.userData, store.allShops]);

    return (
        <div className="home-container">
            {store.userData && (
                <div className="greeting-section">
                    <Slide triggerOnce>
                        <h2 className="greeting-text">¡Hola, {store.userData.name}!</h2>
                    </Slide>
                </div>
            )}

            {/* Barra de búsqueda */}
            <div className="searchbar-container">
                <SearchBar 
                    onSearch={(term) => {
                        navigate(`/shopssearch?search=${encodeURIComponent(term)}`);
                    }} 
                />
            </div>

            {/* Carrusel de tiendas más vendidas (tamaño reducido) */}
            <div className="top-sellers-section">
                <Fade triggerOnce>
                    <h3 className="section-title">Top Tiendas Más Vendidas</h3>
                    <div className="compact-carousel">
                        <CarruselTopSellers />
                    </div>
                </Fade>
            </div>

            {/* Tiendas recomendadas */}
            <div className="recommended-section">
                <Zoom triggerOnce>
                    <h3 className="section-title">Tiendas Recomendadas para Ti</h3>
                </Zoom>

                {store.isLoading ? (
                    <p className="loading-text">Cargando tiendas recomendadas...</p>
                ) : recommendedShops.length > 0 ? (
                    <Slide triggerOnce>
                        <ScrollHorizontalShops cardsData={recommendedShops} className="shops-carousel" />
                    </Slide>
                ) : (
                    <p className="no-shops-text">No hay tiendas recomendadas en este momento.</p>
                )}
            </div>
        </div>
    );
};

export default Home;

import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import "../../styles/home.css";
import SearchBar from "../component/Home/SearchBar";
import ScrollHorizontalShops from "../component/Home/ScrollHorizontalShops";
import CarruselTopSellers from "../component/Home/CarruselTopSellers";

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
                shop.categories.some(category => userCategories.includes(category.toLowerCase()))
            );
            setRecommendedShops(filtered);
        }
    }, [store.userData, store.allShops]);

    return (
        <div className="text-center mt-5 mx-5">
            <h1>LiquiBoxes</h1>
            {store.userData && (
                <div>
                    <h3>Hola {store.userData.name}</h3>
                    <p>Aquí puedes buscar tiendas según su nombre o dirección:</p>
                </div>
            )}
            <div>
                <SearchBar onSearch={(term) => {
                    navigate(`/shopssearch?search=${encodeURIComponent(term)}`);
                }} />
            </div>
            <div>
                <h3>Estas son las tiendas más vendidas hasta el momento:</h3>
                <CarruselTopSellers />
            </div>
            <h2>Y aquí tienes als tiendas recomendadas para ti:</h2>
            {store.isLoading ? (
                <p>Cargando tiendas recomendadas...</p>
            ) : recommendedShops.length > 0 ? (
                <ScrollHorizontalShops cardsData={recommendedShops} className='mx-4' />
            ) : (
                <p>No hay tiendas recomendadas en este momento.</p>
            )}
            
        </div>
    );
};

export default Home;
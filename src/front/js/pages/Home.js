import React, { useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/home.css";
import SearchBar from "../component/Home/SearchBar";
import CardScroll from "../component/Home/CardScroll";

export const Home = () => {
    const { store, actions } = useContext(Context);

    // Ejemplo de datos para las tarjetas
    const cardsData = [
        {
            imageSrc: "https://images.pexels.com/photos/5872364/pexels-photo-5872364.jpeg?auto=compress&cs=tinysrgb&w=600",
            title: "Card 1",
            text: "Description for card 1",
            link: "/link1"
        },
        {
            imageSrc: "https://images.pexels.com/photos/157879/gift-jeans-fashion-pack-157879.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'",
            title: "Card 2",
            text: "Description for card 2",
            link: "/link2"
        },
        {
            imageSrc: "https://images.pexels.com/photos/1050283/pexels-photo-1050283.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            title: "Card 3",
            text: "Description for card 3",
            link: "/link3"
        }
        // Agrega más tarjetas según sea necesario
    ];

    return (
        <div className="text-center mt-5">
            <h1>LiquiBoxes</h1>
            <div>
                <SearchBar />
            </div>
            {/* Renderiza CardScroll y pasa los datos de las tarjetas */}
            <CardScroll cardsData={cardsData} />
        </div>
    );
};

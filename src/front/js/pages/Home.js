import React, { useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/home.css";
import SearchBar from "../component/Home/SearchBar";
import ScrollHorizontal from "../component/Home/ScrollHorizantal";

export const Home = () => {
    const { store, actions } = useContext(Context);
    const cardData = [
        {
            imageSrc: 'https://via.placeholder.com/150',
            title: 'Card 1',
            text: 'This is the first card.',
            link: '#',
        },
        {
            imageSrc: 'https://via.placeholder.com/150',
            title: 'Card 2',
            text: 'This is the second card.',
            link: '#',
        },
        {
            imageSrc: 'https://via.placeholder.com/150',
            title: 'Card 3',
            text: 'This is the third card.',
            link: '#',
        },
        // Puedes agregar más objetos aquí para más tarjetas
    ];

    return (
        <div className="text-center mt-5">
            <h1>LiquiBoxes</h1>
            <div>
                <SearchBar />

                {/* Contenedor de desplazamiento horizontal */}
                <div className="d-flex">
                    {cardData.map((card, index) => (
                        <ScrollHorizontal
                            key={index}
                            imageSrc={card.imageSrc}
                            title={card.title}
                            text={card.text}
                            link={card.link}
                        />
                    ))}
                </div>
                {/* Fin del contenedor de desplazamiento horizontal */}
            </div>
        </div>
    );
};

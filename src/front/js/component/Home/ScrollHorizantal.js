import React from 'react'; // Este componente muestra solo UN CARD TIENDA
import { useNavigate } from 'react-router-dom';

const ScrollHorizontal = ({ imageSrc, title, text, link }) => { //Recibe los props de Home para rellenar los campos//
    const navigate = useNavigate()

    return (
        <div className="card" style={{ width: '20rem' }}>
            <img src={imageSrc} className="card-img-top" alt={title} />
            <div className="card-body">
                <h5 className="card-title">{title}</h5>
                <p className="card-text">{text}</p>
                <button type="button" onClick={() => {navigate(`/shops/${link}`)}}>Ir a Tienda</button>
            </div>
        </div>
    );
};

export default ScrollHorizontal;

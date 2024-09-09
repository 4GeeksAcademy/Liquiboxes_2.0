import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen, faStar } from '@fortawesome/free-solid-svg-icons'; // Importa los íconos

export default function SwitchButtons({ boxVisible, setBoxVisible }) {
    return (
        <div>
            <div className="row">
                <div className="col text-center">
                    {/* Botón para mostrar las Cajas */}
                    <button 
                        type="button"
                        className="btn btn-primary mx-2"
                        onClick={() => setBoxVisible(true)}  // Muestra las Cajas
                    >
                        <FontAwesomeIcon icon={faBoxOpen} /> Cajas
                    </button>
                    
                    {/* Botón para mostrar las Valoraciones */}
                    <button
                        type="button"
                        className="btn btn-primary mx-2"
                        onClick={() => setBoxVisible(false)}  // Muestra las Valoraciones
                    >
                        <FontAwesomeIcon icon={faStar} /> Valoraciones
                    </button>
                </div>
            </div>
        </div>
    );
}

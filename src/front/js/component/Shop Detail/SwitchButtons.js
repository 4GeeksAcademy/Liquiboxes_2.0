import React, { useState } from 'react';

export default function SwitchButtons() {
    const [isArmarioVisible, setIsArmarioVisible] = useState(false);

    return (
        <div>
            {/* BOTONES PARA CAMBIAR ENTRE ARMARIO Y VALORACIONES */}
            <div className="row">
                <div className="col text-center">
                    {/* Botón para mostrar el Armario */}
                    <button
                        type="button"
                        className="fa-solid fa-table-cells-large"
                        onClick={() => setIsArmarioVisible(true)}
                    />
                    {/* Botón para mostrar las Valoraciones */}
                    <button
                        type="button"
                        className="fa-solid fa-align-justify"
                        onClick={() => setIsArmarioVisible(false)}
                    />
                </div>
            </div>

            {/* Contenido que cambia según el estado */}
            <div className="row mt-4">
                <div className="col text-center">
                    {isArmarioVisible ? (
                        <p>Aquí van las Boxes</p>
                    ) : (
                        <p>Aquí van las Valoraciones</p>
                    )}
                </div>
            </div>
        </div>
    );
}

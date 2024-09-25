import React, { useContext } from "react";
import ModalGlobal from "../ModalGlobal";
import { Context } from "../../store/appContext";
import { useNavigate } from "react-router-dom";


export default function ModalToken() {
    const {store, actions} = useContext(Context)
    const navigate = useNavigate ()

    const handleCloseModal = () => {
        actions.setModalToken(false);
        navigate('/')
    }

    return (
        <div>
            <ModalGlobal
                isOpen={true}
                onClose={() => { handleCloseModal() }}
                title="Inicio de Sesión no detectado"
                body="Vaya parece que todavía no has iniciado sesión, necesitamos que inicies sesión para poder acceder a este contenido."
                buttonBody="Iniciar sesión"
                className="welcome-modal"
            />        </div>
    )
}
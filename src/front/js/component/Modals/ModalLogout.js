import React, { useContext } from "react";
import ModalGlobal from "../ModalGlobal";
import { Context } from "../../store/appContext";
import { useNavigate } from "react-router-dom";


export default function ModalLogout() {
    const {actions} = useContext(Context)
    const navigate = useNavigate ()

    const handleCloseModal = ()=> {
        actions.setModalLogout(false)
    }

    const handleLogout = () => {
        actions.logout()
        navigate('/')
    }

    return (
        <div>
            <ModalGlobal
                isOpen={true}
                onClose={() => { handleCloseModal() }}
                title="Cerrar Sesión"
                body="¿Seguro que quieres cerrar sesión?. Si deseas continuar con tu sesión iniciada, cierra esta ventana."
                buttonBody="Cerrar Sesión"
                className="welcome-modal"
                onClick={() => {handleLogout()}}
            />        
        </div>
    )
}
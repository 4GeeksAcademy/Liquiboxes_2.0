import React, { useContext } from "react";
import ModalGlobal from "../ModalGlobal";
import { Context } from "../../store/appContext";
import { useNavigate } from "react-router-dom";


export default function ModalType() {
    const { store, actions } = useContext(Context)
    const userType = sessionStorage.getItem('userType')
    const navigate = useNavigate()

    const handleCloseModal = () => {
        actions.setModalType(false);
        if (userType === 'user') {
            navigate('/home')
        }
        else {
            navigate('/shophome')
        }
    }

    return (
        <div>


            <ModalGlobal
                isOpen={true}
                onClose={() => { handleCloseModal() }}
                title="¡NO PUEDES PASAR!"
                body="Vaya... parece que no tienes acceso a esta sección de la plataforma. Nuestro mago gris romperá el puente antes de dejarte pasar."
                buttonBody="Volver a un sitio seguro"
                className="welcome-modal"
                image='https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNGg5bHJuYTlma2c2cGVsMmNkZHEwMWhjc3lwbm56cmtvazFuN3l5aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9dg/BZMggpshzrPvbfQHIF/giphy.gif'
            />
        </div>
    )
}
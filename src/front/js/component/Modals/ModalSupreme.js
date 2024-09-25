import React from "react";
import ModalGlobal from "../ModalGlobal";
import { useNavigate } from "react-router-dom";


export default function ModalToken(title, body, buttonBody, navigate) {
    const navigate = useNavigate ()


    return (
        <div>
            <ModalGlobal
                isOpen={true}
                onClose={() => {navigate(`${navigate}`) }}
                title={title}
                body={body}
                buttonBody={buttonBody}
                className="welcome-modal"
            />        
        </div>
    )
}
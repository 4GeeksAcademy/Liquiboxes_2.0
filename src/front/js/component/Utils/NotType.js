import React, { useEffect, useState } from "react";
import ModalType from "../Modals/ModalType";

export default function NotType({ user_or_shop }) {
    const [type, setType] = useState(null);

    useEffect(() => {
        const userType = sessionStorage.getItem('userType');
        if (userType) {
            setType(userType);
        }
    }, []);

    return (
        <>
            {type && type !== user_or_shop && <ModalType />}
        </>
    );
}
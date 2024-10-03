import React, { useEffect, useState } from "react";
import ModalToken from "../Modals/ModalToken";

export default function NotToken() {
    const [hasToken, setHasToken] = useState(false);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        setHasToken(!!token);
    }, []);

    return (
        <>
            {!hasToken && <ModalToken />}
        </>
    );
}
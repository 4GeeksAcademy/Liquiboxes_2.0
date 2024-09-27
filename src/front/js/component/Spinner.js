import React from "react";
import { PulseLoader   } from "react-spinners";
import '../../styles/spinner.css'


export default function Spinner ()  {
    return (
        <div id="spinner">
            <PulseLoader   color="#6a8e7f" loading={true} size={40} speedMultiplier={1} />
        </div>
    );
}
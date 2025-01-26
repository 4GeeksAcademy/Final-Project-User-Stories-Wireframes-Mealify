import React, { useContext, useEffect } from "react";
import { SecondaryJumbotron } from "../component/secondaryJumbotron.jsx";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext.js";

export const MenuCreator = () => {
    const navigate = useNavigate();
    const { store } = useContext(Context);

    useEffect(() => {
        // Redirige al login si no hay un token válido
        if (!store.token) {
            navigate("/loginRegister");
        }
    }, [store.token, navigate]); // Asegura que se ejecute cuando cambie el token o navigate

    return (
        <>
            <SecondaryJumbotron />

            <div className="separator">
                <h2>Menu Creator</h2>
            </div>
        </>
    );
};
import React, { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Separator } from "./separator.jsx";
import { Context } from "../store/appContext.js";

export const SecondaryJumbotron = () => {
    const { store, actions } = useContext(Context);
    const location = useLocation(); // Obtiene la ubicación actual

    useEffect(() => {
        actions.getUserInfo();
    }, []);

       // Determina el contenido en función de la ruta actual
       const isProfile = location.pathname === "/profile";
       const isMenuCreator = location.pathname === "/menucreator";

       const title = isProfile
           ? `Welcome Back, ${store.user?.user || "Guest"}! Let’s Craft Your Perfect Plate.`
           : isMenuCreator
           ? "Create Your Personalized Menu"
           : `Your Culinary Creations Await ${store.user?.user} !`;
       const description = isProfile
           ? "Personalize your profile, fine-tune your goals, and celebrate every milestone on your journey."
           : isMenuCreator
           ? `Hi, ${store.user?.user}! Let AI craft the perfect meal plan for you. Simply share your preferences, and we’ll handle the rest.`
           : "Explore your saved menus, refine your recipes, and savor the journey of delicious possibilities.";
   
    return (
        <section className="banner__secondary" aria-labelledby="banner__title">
            <div className="banner__image-container">
                <img src="https://res.cloudinary.com/dfhhq651o/image/upload/v1737899711/2151201963_voda1n.jpg" alt="Fondo del banner mostrando un paisaje" className="banner__image" />
                <div className="banner__overlay" aria-hidden="true"></div>
            </div>

            <div className="banner__content container gap-3">
                <h2 className="banner__secondary--title">{title}</h2>
                <Separator />
                <p className="banner__description">{description}</p>
            </div>
        </section>
    );
};

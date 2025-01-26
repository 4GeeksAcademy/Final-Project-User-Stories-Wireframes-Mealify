import React from "react";
import { Separator } from "./separator.jsx";


export const Jumbotron = () => {

    const handleClick = () => {
        const section = document.getElementById("MenuCreator");
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section className="banner" aria-labelledby="banner__title">
            <div className="banner__image-container">
                <img src="https://res.cloudinary.com/dfhhq651o/image/upload/v1737888507/jumbotrom_p74p1h.png" alt="Fondo del banner mostrando un paisaje" className="banner__image" />
                <div className="banner__overlay" aria-hidden="true"></div>
            </div>

            <div className="banner__content container">
                <h1 id="banner__title" className="banner__title">What’s on your menu this week?</h1>

                <Separator />

                <h2 className="banner__subtitle">Smart Meal Planning With AI</h2>
                <p className="banner__description">Discover delicious recipes, optimize your shopping list, and create meal plans tailored to your lifestyle <br />
                    with AI-powered suggestions from ChatGPT. Start planning today!</p>

                <button href="#" onClick={handleClick} className="button button--medium" aria-label="Descubre más sobre nuestros destinos">
                    Get Started
                    <img src="https://res.cloudinary.com/dfhhq651o/image/upload/v1737893117/arrow-down-white-icon_uuodhm.svg" alt="arrow down" className="banner__icon" />
                </button>
            </div>
        </section>
    );
}


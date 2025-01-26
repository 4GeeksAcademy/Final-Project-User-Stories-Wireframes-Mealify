import React from "react";
import "../../styles/home.css";
import "../../styles/index.css";
import { Jumbotron } from "../component/jumbotron.jsx";
import { WhyChoose } from "../component/whyChoose.jsx";

export const Home = () => {

    return (
        <>
            <Jumbotron />
            
            <section id="MenuCreator" className="text-center mt-5 mb-5">
                <h2>MenuCreator</h2>
                {/* Contenido de la sección */}
                
            </section>

            <WhyChoose />
        </>
    );
};


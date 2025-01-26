import React from 'react';

export const WhyChoose = () => {

    return (
        <section className="why-choose">
            <h2>Why Choose Mealify?</h2>
            <p>Mealify es tu asistente personal de planificación de comidas, impulsado por IA, para ayudarte a comer mejor sin complicaciones. Aquí están los beneficios principales:</p>
            <div className="benefits">
                <div className="benefit">
                    <img src="path/to/icon1.svg" alt="Planificación de comidas" />
                    <h3>Planifica comidas semanales fácilmente con la ayuda de la IA</h3>
                    <p>Deja que nuestra tecnología inteligente genere menús semanales basados en tus preferencias y necesidades.</p>
                </div>
                <div className="benefit">
                    <img src="path/to/icon2.svg" alt="Recetas personalizadas" />
                    <h3>Descubre recetas personalizadas según tus preferencias</h3>
                    <p>Encuentra recetas deliciosas adaptadas a tu dieta, restricciones y objetivos de salud.</p>
                </div>
                <div className="benefit">
                    <img src="path/to/icon3.svg" alt="Listas de compras optimizadas" />
                    <h3>Crea listas de compras optimizadas para ahorrar tiempo y dinero</h3>
                    <p>Con Mealify, obtendrás listas de compras automáticas para que no pierdas tiempo ni dinero en el supermercado.</p>
                </div>
            </div>
        </section>
    );
};

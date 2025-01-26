import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext.js";
import { SecondaryJumbotron } from "../component/secondaryJumbotron.jsx";

export const MealPlan = () => {
    const navigate = useNavigate();
    const { store, actions } = useContext(Context);
    const [userPlans, setUserPlans] = useState(null); // Variable para guardar los planes

    useEffect(() => {
        // Redirige al login si no hay un token válido
        if (!store.token) {
            navigate("/loginRegister");
        }
        Obtener_planes();
    }, [store.token, navigate]);

    const Obtener_planes = async () => {
        await actions.getUserInfo();

        // Accede al objeto user en el store
        const user = store.user;

        if (user && user.id) {
            console.log("El id de usuario es (profile):", user.id);
        } else {
            console.log("No se encontró el id de usuario en la información del usuario:", user);
        }

        await actions.getPlans(user.id);

        // Accedemos a los datos del store
        const store_obtained = store.userPlans.data;

        console.log("Planes obtenidos:", JSON.stringify(store_obtained, null, 2));

        // Guardar los datos en el estado local
        setUserPlans(store_obtained);
    };

    const eliminarPlan = async (planId) => {
        const success = await actions.deletePlans(planId);
        if (success) {
            // Si la eliminación fue exitosa, actualiza la lista local de planes
            const planesActualizados = userPlans.filter((plan) => plan.id !== planId);
            setUserPlans(planesActualizados);
        } else {
            console.error("Error al eliminar el plan");
        }
    };

    return (
        <>
            <SecondaryJumbotron />

            <div className="separator">
                <h2>Meal Plan</h2>
            </div>

            <div className="accordion" id="mealPlanAccordion">
                {userPlans ? (
                    userPlans.map((plan, index) => (
                        <div key={index} className="accordion-item">
                            <h2 className="accordion-header" id={`heading${index}`}>
                                <button
                                    className="accordion-button d-flex justify-content-between align-items-center"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapse${index}`}
                                    aria-expanded="true"
                                    aria-controls={`collapse${index}`}
                                >
                                    {plan.name}
                                    <button
                                        className="btn btn-danger btn-sm rounded-circle ms-3"
                                        onClick={() => eliminarPlan(plan.id)} // Llama a la función eliminarPlan con el ID del plan
                                    >
                                        X
                                    </button>
                                </button>
                            </h2>
                            <div
                                id={`collapse${index}`}
                                className="accordion-collapse collapse"
                                aria-labelledby={`heading${index}`}
                                data-bs-parent="#mealPlanAccordion"
                            >
                                <div className="accordion-body">
                                    <p><strong>Creado en:</strong> {plan.create_at}</p>
                                    <ul>
                                        {plan.plan.map((detalle, idx) => (
                                            <li key={idx}>
                                                <strong>{detalle.day}:</strong> {detalle.calories || detalle.ingredients || detalle.mealType}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Cargando planes...</p>
                )}
            </div>
        </>
    );
};

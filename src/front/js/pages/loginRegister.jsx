import React, { useContext, useEffect, useState } from "react";
import { LoginForm } from "../component/loginForm.jsx";
import { UserForm } from "../component/userForm.jsx";
import { Context } from "../store/appContext.js";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../component/spinner.jsx";

export default function LoginRegister() {

    const { store, actions } = useContext(Context);
    const [isLogin, setIsLogin] = useState(true);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const navigate = useNavigate();
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    // Alternar entre Login y Register
    const toggleForm = () => setIsLogin(!isLogin);

    // Manejar el envío del formulario
    const handleSubmit = async (formData) => {
        let success;
        setLoading(true);
        if (isLogin) {
            // Intentar iniciar sesión
            success = await actions.login(formData);
            await actions.getUserInfo()
            const user_id = store.user.id;
            console.log("El usuario que acaba de iniciar sesión tiene el id de: " + user_id)

        } else {
            // Intentar registrar un nuevo usuario
            success = await actions.register(formData);
        }

        if (success) {
            // Actualizar el token si el login o registro fue exitoso
            setToken(localStorage.getItem("token"));

            // Si fue un registro exitoso, cambiar automáticamente a login
            if (!isLogin) {
                setIsLogin(true);
                console.log("Registro exitoso. Cambiando a formulario de login.");
            } else {
                console.log("Login exitoso.");
                navigate("/");
            }
        } else {
            // Si no fue exitoso, asegurarse de mantenerse en la página de registro
            if (!isLogin) {
                setMessage({ type: "success", text: response.message });
                console.log("Registro fallido. Permaneciendo en formulario de registro.");
                setIsLogin(false);
            } else {
                setMessage({ type: "error", text: response.message });
                console.log("Login fallido. Permaneciendo en formulario de login.");
            }
        }
        setLoading(false); // Detener el spinner al finalizar
    };

    useEffect(() => {
        console.log("Token actual:", token);
    }, [token]);

    return (
        <section className="banner__login" aria-labelledby="banner__title">

            {loading && <Spinner />}

            <div className="banner__image-container">
                <img src="https://res.cloudinary.com/dfhhq651o/image/upload/v1737888561/women-banner-2_aqfefy.png" alt="Fondo del banner mostrando un paisaje" className="banner__image-login" />
            </div>

            {/* Mostrar el formulario con la lógica de tipo login/register */}
            {isLogin ?
                <div className="banner__login-content container">
                    <div className="banner__column-login col-sm-12 col-md-12 col-lg-6">
                        <div className="login__text">
                            <h2 className="login__heading m-0">Join Us and Start Planning!</h2>
                        </div>
                        <LoginForm onSubmit={handleSubmit} />
                        <p className="login-form__text" onClick={toggleForm}>
                            Don't have an account? <span className="login-form__highlight">Register</span>
                        </p>
                    </div>
                </div>
                :
                <div className="banner__login-content container">
                    <div className="banner__column-login col-sm-12 col-md-12 col-lg-6">
                        <div className="login__text">
                            <h2 className="login__heading m-0">Welcome Back! <br /> Ready to Plan Your Next Meal?</h2>
                        </div>
                        <UserForm onSubmit={handleSubmit} />
                        <p className="login-form__text" onClick={toggleForm}>
                            Already have an account? <span className="login-form__highlight">Login</span>
                        </p>
                    </div>
                </div>
            }
        </section>
    );
}

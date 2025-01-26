import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";

import { Home } from "./pages/home";
import { Demo } from "./pages/demo";
import { Single } from "./pages/single";
import injectContext from "./store/appContext";

import { Navbar } from "./component/navbar.jsx";
import { Footer } from "./component/footer.jsx";
import SelectAllergiesPage from "./pages/alergias.jsx";
import LoginForm from "./pages/login.jsx";
import { File_test } from "./pages/testeo.jsx";
import ChatGPTComponent from "./gpt/gpt_component.jsx";
import WeeklyMenu from "./gpt/vista_menu_gpt.jsx";
import WeeklyMenu2 from "./gpt/vista_menu_gpt2.jsx";
import LoginRegister from "./pages/loginRegister.jsx";
import { Menu_GPT } from "./gpt/gpt_crear_menu.jsx";
import { Profile } from "./component/profile.jsx";
import { MealPlan } from "./pages/mealplan.jsx";
import { MenuCreator } from "./pages/menuCreator.jsx";



//create your first component
const Layout = () => {
    //the basename is used when your project is published in a subdirectory and not in the root of the domain
    // you can set the basename on the .env file located at the root of this project, E.g: BASENAME=/react-hello-webapp/
    const basename = process.env.BASENAME || "";

    if(!process.env.BACKEND_URL || process.env.BACKEND_URL == "") return <BackendURL/ >;

    return (
        <div>
            <BrowserRouter basename={basename}>
                <ScrollToTop>
                    <Navbar />
                    <Routes>
                        <Route element={<Home />} path="/" />
                        <Route element={<Demo />} path="/demo" />
                        <Route element={<Single />} path="/single/:theid" />
                        <Route element={<LoginForm />} path="/login" />
                        <Route element={<Profile />} path="/profile" />
                        <Route element={<MenuCreator />} path="/menuCreator" />
                        <Route element={<MealPlan />} path="/mealplan" />
                        <Route element={<LoginRegister />} path="/loginRegister" />
                        <Route element={<SelectAllergiesPage />} path="/alergias" />
                        <Route element={<File_test />} path="/test" />
                        <Route element={<Menu_GPT />} path="/generador-menu" />
                        <Route element={<h1>Not found!</h1>} />
                    </Routes>
                    <Footer />
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
};

export default injectContext(Layout);

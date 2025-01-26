const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			message: null,
			demo: [
				{
					title: "FIRST",
					background: "white",
					initial: "white"
				},
				{
					title: "SECOND",
					background: "white",
					initial: "white"
				}
			],
			token: localStorage.getItem("token") || null, // Cargar el token si existe
		},
		actions: {
			
			register: async (formData) => {
				try {
					console.log("Datos enviados al servidor:", formData);
			
					// Validación previa de los datos del formulario
					if (!formData.user || !formData.email || !formData.password) {
						return { success: false, message: "All fields are required!" };
					}
			
					// Validar que el campo user no esté vacío y tenga al menos 3 caracteres
					if (!formData.user) {
						return { success: false, message: "Username is required." };
					} else if (formData.user.length < 3) {
						return { success: false, message: "Username must be at least 3 characters long." };
					}
			
					// Validar que el campo 'email' no esté vacío y tenga el formato correcto
					const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			
					if (!formData.email) {
						return { success: false, message: "Email is required." };
					} else if (!emailRegex.test(formData.email)) {
						return { success: false, message: "Invalid email format." };
					}
			
					// Validar que el campo 'password' no esté vacío y tenga al menos 8 caracteres
					if (!formData.password) {
						return { success: false, message: "Password is required." };
					} else if (formData.password.length < 8) {
						return { success: false, message: "Password must be at least 8 characters long." };
					}
			
					const resp = await fetch(process.env.BACKEND_URL + '/api/register', {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(formData),
					});
			
					if (!resp.ok) {
						const errorMessage = await resp.text();
						const errorJson = JSON.parse(errorMessage);
			
						if (resp.status === 409) {
							if (errorJson.msg.includes("email")) {
								return { success: false, message: "This email is already registered. Please use another email or log in." };
							} else if (errorJson.msg.includes("username")) {
								return { success: false, message: "The username is already in use. Please choose another one." };
							}
						} else {
							console.error("Error details:", errorJson);
							throw new Error(`Error registering user: ${errorMessage}`);
						}
					}
			
					const data = await resp.json();
					console.log("Data received from the server:", data);
					return { success: true, message: "User successfully registered." };
			
				} catch (error) {
					console.error("Error registering user:", error.message);
			
					if (error.message.includes("email")) {
						return { success: false, message: "This email is already registered. Please use another email or log in." };
					} else if (error.message.includes("username")) {
						return { success: false, message: "The username is already in use. Please choose another one." };
					} else {
						return { success: false, message: "There was a problem registering you. Please try again." };
					}
				}
			},
			
			login: async (formData) => {
                try {
                    // Validación previa de los datos del formulario
                    if (!formData.identifier || !formData.password) {
                        return { success: false, message: "All fields are required!" };
                    }

                    // Validar que el campo 'identifier' no esté vacío
                    if (!formData.identifier) {
                        return { success: false, message: "Username or email is required." };
                    } else if (formData.identifier.length < 3) {
                        return { success: false, message: "Username must be at least 3 characters long." };
                    }

                    // Validar que el campo 'password' no esté vacío y tenga al menos 8 caracteres
                    if (!formData.password) {
                        return { success: false, message: "Password is required." };
                    } else if (formData.password.length < 8) {
                        return { success: false, message: "Password must be at least 8 characters long." };
                    }

                    const resp = await fetch(process.env.BACKEND_URL + '/api/login', {
                        method: 'POST',
                        body: JSON.stringify(formData),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
            
                    if (!resp.ok) {
                        const errorMessage = await resp.json();
                        console.error("Error en el login:", errorMessage);

                        if (resp.status === 404) {
                            return { success: false, message: "User not found. Please check your username or email." };
                        } else if (resp.status === 401) {
                            return { success: false, message: "Incorrect password. Please try again." };
                        } else {
                            return { success: false, message: errorMessage.message || 'There was a problem logging in. Please try again.' };
                        }
                    }
            
                    const data = await resp.json();
                    if (data.token) {
                        setStore({ token: data.token });
                        localStorage.setItem('token', data.token);
                        return { success: true, message: 'Login successful.' }; // Login exitoso
                    } else {
                        return { success: false, message: 'Token not received. Please try again.' };
                    }

                } catch (error) {
                    console.error("Login error:", error.message);
                    return { success: false, message: 'There was a problem logging in. Please try again.' };
                }
            },
			
			getUserInfo: async () => {
				try {
					console.log("Initiating request to retrieve user information...");

					const token = localStorage.getItem("token");
					if (!token) {
						throw new Error("Token not found in localStorage.");
					}

					console.log("Token obtained:", token);

					const resp = await fetch(process.env.BACKEND_URL + '/api/user_info',
						{
						method: "GET",
						headers: {
							Authorization: `Bearer ${token}`,
						},
						}
					);

				  	console.log("Complete response:", resp);

					if (!resp.ok) {
						console.error("Server response error:", resp.status, resp.statusText);
						if (resp.status === 401) {
						alert("The token has expired or is invalid. Please log in again.");
						} else if (resp.status === 404) {
						alert("User not found.");
						} else {
						alert("An error occurred while retrieving the user information.");
						}
						throw new Error(`Error retrieving user information: ${resp.status}`);
					}

					const data = await resp.json();
					console.log("Data retrieved:", data);

					setStore({ user: data.payload });
				} catch (error) {
					console.error("Error retrieving user information:", error.message);
					alert("Could not retrieve user information. Please check your connection.");
					return false;
				}
			},

			getUserProfile: async (userId) => {
				try {
					// Construimos la URL del endpoint
					const url = `${process.env.BACKEND_URL}api/perfil/pf/${userId}`;
					
					// Realizamos la solicitud GET al backend
					const response = await fetch(url, {
						method: "GET",
						headers: {
							"Content-Type": "application/json"
						}
					});
			
					// Validamos la respuesta
					if (!response.ok) {
						const errorData = await response.json();
						console.error("Error al obtener el perfil:", errorData);
						return { error: errorData.message || "Error desconocido" };
					}
			
					// Parseamos el cuerpo de la respuesta como JSON
					const data = await response.json();
					
					// Opcional: guarda el perfil en el store si necesitas usarlo en otros lugares
					const store = getStore();
					setStore({ ...store, userProfile: data });
			
					// Devuelve los datos obtenidos
					return data;
			
				} catch (error) {
					console.error("Error de conexión con el backend:", error);
					return { error: "Error de conexión con el servidor" };
				}
			},

			getPlans: async (userId) => {
				try {
					// Construimos la URL del endpoint
					const url = `${process.env.BACKEND_URL}api/plans/${userId}`;
					
					// Realizamos la solicitud GET al backend
					const response = await fetch(url, {
						method: "GET",
						headers: {
							"Content-Type": "application/json"
						}
					});
			
					// Validamos la respuesta
					if (!response.ok) {
						const errorData = await response.json();
						console.error("Error al obtener los planes:", errorData);
						return { error: errorData.message || "Error desconocido" };
					}
			
					// Parseamos el cuerpo de la respuesta como JSON
					const data = await response.json();
					
					// Opcional: guarda el perfil en el store si necesitas usarlo en otros lugares
					const store = getStore();
					setStore({ ...store, userPlans: data });
			
					// Devuelve los datos obtenidos
					return data;
			
				} catch (error) {
					console.error("Error de conexión con el backend:", error);
					return { error: "Error de conexión con el servidor" };
				}
			},

			deletePlans: async (planId) => {
				try {
					const token = localStorage.getItem("token"); // Obtén el token si es necesario
					if (!token) {
						console.error("No token found. User might not be logged in.");
						return;
					}
			
					const response = await fetch(`${process.env.BACKEND_URL}/api/plan/${planId}`, {
						method: "DELETE",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}` // Si tu API requiere un token de autorización
						}
					});
			
					if (!response.ok) {
						const errorData = await response.json();
						console.error("Error eliminando el plan:", errorData.msg || "Unknown error");
						return false;
					}
			
					const data = await response.json();
					console.log("Plan eliminado correctamente:", data.msg);
			
					// Opcional: actualiza el estado global de planes en el store
					const store = getStore();
					const updatedPlans = store.userPlans.data.filter(plan => plan.id !== planId);
					setStore({ ...store, userPlans: { ...store.userPlans, data: updatedPlans } });
			
					return true; // Retorna true si la eliminación fue exitosa
				} catch (error) {
					console.error("Unexpected error while deleting the plan:", error);
					return false;
				}
			},

			// Use getActions to call a function within a fuction
			exampleFunction: () => {
				getActions().changeColor(0, "green");
			},

			uploadProfile: async (id, formData) => {
				try {
					const resp = await fetch(process.env.BACKEND_URL + 'api/perfil/edit/' + id, {
						method: 'PUT',
						body: JSON.stringify(formData),
						headers: {
							'Content-Type': 'application/json'
						}
					});
			
					if (!resp.ok) {
						const errorData = await resp.json();
						console.error("Error response from server:", errorData);
						return { success: false, message: errorData.msg || "Failed to update profile." };
					}
			
					const data = await resp.json();
					console.log("Data received from the server:", data);
					return { success: true, message: data.msg || "Profile successfully updated.", data: data.perfil };
				} catch (error) {
					console.error("Error while updating profile:", error);
					return { success: false, message: "An unexpected error occurred. Please try again later." };
				}
			},

			uploadPlan: async (user_id, formData) => {
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/plans`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							user_id: user_id,
							plan: formData.plan,
							create_at: formData.create_at,
							name: formData.name
						}),
					});
			
					if (!response.ok) {
						const errorData = await response.json();
						console.error("Error al subir el plan:", errorData);
						return { success: false, error: errorData.msg || "Error desconocido" };
					}
			
					const data = await response.json();
					console.log("Plan subido correctamente:", data);
					return { success: true, data: data };
				} catch (error) {
					console.error("Error en la solicitud:", error);
					return { success: false, error: "Error en la conexión con el servidor" };
				}
			},

			editProfile: async (id, formData) => {
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/user/${id}`, {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(formData),
					});
			
					if (!response.ok) {
						const errorData = await response.json();
						return { success: false, message: errorData.error || "Failed to update profile." };
					}
			
					const data = await response.json();
					return { success: true, message: data.message, data };
				} catch (error) {
					return { success: false, message: "An error occurred. Please try again later." };
				}
			},
			
			
			getMessage: async () => {
				try{
					// fetching data from the backend
					const resp = await fetch(process.env.BACKEND_URL + "/api/hello")
					const data = await resp.json()
					setStore({ message: data.message })
					// don't forget to return something, that is how the async resolves
					return data;
				}catch(error){
					console.log("Error loading message from backend", error)
				}
			},
			changeColor: (index, color) => {
				//get the store
				const store = getStore();

				//we have to loop the entire demo array to look for the respective index
				//and change its color
				const demo = store.demo.map((elm, i) => {
					if (i === index) elm.background = color;
					return elm;
				});

				//reset the global store
				setStore({ demo: demo });
			},
			fetchMenu: async () => {
				try {
					// Realiza la solicitud al backend
					const resp = await fetch(process.env.BACKEND_URL + "/api/static-data");
					if (!resp.ok) throw new Error("Error retrieving the menu.");

					// Procesa la respuesta del backend
					const data = await resp.json();
					console.log("Data received from the server:", data);

					// Extrae la información relevante del menú
					const menu = data.choices[0].message.content;

					// Guarda el menú en el store
					setStore({ menu });
				} catch (error) {
					console.error("Error retrieving the menu:", error.message);
					alert("Could not retrieve the weekly menu. Please try again later.");
				}
			},
			
			deleteUser: async (id) => {
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/user/${id}`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json();
                        return { success: false, message: errorData.error || "Failed to delete user." };
                    }
            
                    const data = await response.json();
                    return { success: true, message: data.msg };
                } catch (error) {
                    return { success: false, message: "An error occurred. Please try again later." };
                }
            },
		}
	};
};

export default getState;

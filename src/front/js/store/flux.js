import axios from "axios";

const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            message: null,
            cart: JSON.parse(localStorage.getItem("cart")) || [],
            categories: ['Moda', 'Ropa de Trabajo', 'Tecnología', 'Carpintería', 'Outdoor', 'Deporte', 'Arte', 'Cocina', 'Jardinería', 'Música', 'Viajes', 'Lectura', 'Cine', 'Fotografía', 'Yoga'],
            mysteryBoxDetail: {},
            isLoading: true,
            error: null,
            allShops: [],
            filteredShops: [],
            searchTerm: "",
            userData: null,
            shopDetail: {},
        },
        actions: {
            getMessage: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/hello");
                    const data = await resp.json();
                    setStore({ message: data.message });
                    return data;
                } catch (error) {
                    console.error("Error loading message from backend", error);
                }
            },


            fetchShops: async () => {
                try {
                    setStore({ isLoading: true, error: null });
                    const url = `${process.env.BACKEND_URL}/shops`;
                    const response = await axios.get(url);
                    const shopsData = response.data || [];

                    const processedShops = shopsData.map(shop => ({
                        ...shop,
                        categories: shop.categories.map(cat => {
                            try {
                                // Intenta parsear la categoría si es un string JSON
                                const parsed = JSON.parse(cat);
                                return parsed.replace(/["\[\]]/g, '').trim().toLowerCase();
                            } catch (e) {
                                // Si no se puede parsear, simplemente limpia y devuelve la cadena
                                return cat.replace(/["\[\]]/g, '').trim().toLowerCase();
                            }
                        })
                    }));

                    setStore({
                        allShops: processedShops,
                        filteredShops: processedShops,
                        isLoading: false
                    });
                } catch (error) {
                    console.error("Error fetching shops:", error);
                    setStore({
                        error: "No se pudieron cargar las tiendas. Por favor, intente más tarde.",
                        isLoading: false
                    });
                }
            },

            fetchUserProfile: async () => {
                try {
                    const token = sessionStorage.getItem('token');
                    if (!token) {
                        console.log("No token found");
                        getActions().logout();
                        return;
                    }
                    const response = await axios.get(`${process.env.BACKEND_URL}/users/profile`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data && typeof response.data === 'object') {
                        setStore({
                            userData: response.data,
                            userCategories: response.data.categories
                        });
                    } else {
                        throw new Error("Invalid response format");
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    if (error.response && error.response.status === 401) {
                        getActions().logout();
                    } else {
                        setStore({ error: "No se pudo cargar el perfil del usuario. Por favor, intente más tarde." });
                    }
                }
            },

            logout: () => {
                sessionStorage.removeItem('token');
                setStore({
                    userData: null,
                    error: null
                });
            },

            addToCart: (id) => {
                const getLatestCart = () => {
                    const store = getStore();
                    console.log("Estado del carrito en el store:", store.cart);
                    
                    let storedCart = [];
                    try {
                        const storedCartString = localStorage.getItem("cart");
                        console.log("Carrito en localStorage (raw):", storedCartString);
                        storedCart = JSON.parse(storedCartString || "[]");
                    } catch (error) {
                        console.error("Error parsing cart from localStorage:", error);
                    }
                    console.log("Carrito en localStorage (parsed):", storedCart);
                    
                    if (Array.isArray(store.cart) && store.cart.length > 0 && storedCart.length === 0) {
                        console.log("Usando carrito del store porque localStorage está vacío");
                        return store.cart;
                    }
                    
                    const combinedCart = [...storedCart];
                    store.cart.forEach(storeItem => {
                        const existingIndex = combinedCart.findIndex(item => item.id === storeItem.id);
                        if (existingIndex !== -1) {
                            combinedCart[existingIndex].quantity = Math.max(combinedCart[existingIndex].quantity, storeItem.quantity);
                        } else {
                            combinedCart.push(storeItem);
                        }
                    });
                    
                    console.log("Carrito combinado:", combinedCart);
                    return combinedCart;
                };
            
                const latestCart = getLatestCart();
                console.log("Estado inicial del carrito (más actualizado):", latestCart);
            
                let updatedCart;
                const existingItemIndex = latestCart.findIndex(item => item.id === id);
                if (existingItemIndex !== -1) {
                    console.log("El item ya existe en el carrito. Incrementando cantidad.");
                    updatedCart = latestCart.map((item, index) => 
                        index === existingItemIndex 
                            ? { ...item, quantity: item.quantity + 1 } 
                            : item
                    );
                } else {
                    console.log("Agregando nuevo item al carrito");
                    updatedCart = [...latestCart, { id, quantity: 1 }];
                }
            
                console.log("Actualizando el carrito:", updatedCart);
                
                setStore({ cart: updatedCart });
                localStorage.setItem("cart", JSON.stringify(updatedCart));
            
                console.log("Estado final del store después de setStore:", getStore().cart);
                console.log("Estado final en localStorage:", localStorage.getItem("cart"));
            
                return updatedCart;
            },

            removeFromCart: (id) => {
                const store = getStore();
                const updatedCart = store.cart.filter(item => item.id !== id);
                setStore({ cart: updatedCart });
                localStorage.setItem("cart", JSON.stringify(updatedCart));
            },



            getMysteryBoxDetail: async (id) => {
                try {
                    const response = await axios.get(process.env.BACKEND_URL + `/shops/mystery-box/${id}`)
                    if (response.data) {
                        console.log("La API devuelve datos")
                        setStore({ mysteryBoxDetail: response.data })
                    }
                } catch (error) {
                    console.log("ha habido un error" + error)

                }
            },

            getShopDetail: async (id) => {
                try {
                    const response = await axios.get(process.env.BACKEND_URL + `/shops/${id}`)
                    if (response.data) {
                        console.log(response.data)
                        setStore({ shopDetail: response.data })
                    }
                } catch (error) {
                    console.log("ha habido un error" + error)

                }
            },
        }
    };
};

export default getState;
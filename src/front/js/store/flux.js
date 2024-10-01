import axios from "axios";

const getState = ({ getStore, getActions, setStore }) => {


    return {
        store: {
            message: null,
            cart: JSON.parse(localStorage.getItem("cart")) || {},
            cartWithDetails: JSON.parse(localStorage.getItem("cartWithDetails")) || {},
            categories: ['Moda', 'Ropa de Trabajo', 'Tecnología', 'Carpintería', 'Outdoor', 'Deporte', 'Arte', 'Cocina', 'Jardinería', 'Música', 'Viajes', 'Lectura', 'Cine', 'Fotografía', 'Yoga'],
            mysteryBoxDetail: {},
            isLoading: true,
            error: null,
            allShops: [],
            filteredShops: [],
            searchTerm: "",
            userData: null,
            shopDetail: {},
            showError: true,
            token: sessionStorage.getItem('token') || "",
            modalToken: false,
            modalType: false,
            modalLogout: false
        },
        actions: {
            setModalToken: (boolean) => {
                let trueOrFalse = boolean
                setStore({ modalToken: trueOrFalse })
            },

            setModalType: (boolean) => {
                let trueOrFalse = boolean
                setStore({ modalType: trueOrFalse })
            },

            setModalLogout: (boolean) => {
                let trueOrFalse = boolean
                setStore({ modalLogout: trueOrFalse })
            },

            setLogin: (boolean) => {
                let trueOrFalse = boolean
                setStore({ login: trueOrFalse })
            },


            fetchShops: async () => {
                try {
                    setStore({ isLoading: true, error: null });
                    const url = process.env.BACKEND_URL + "/shops";
                    const response = await axios.get(url);
                    const shopsData = response.data || [];

                    const processedShops = shopsData.map(shop => ({
                        ...shop,
                        categories: shop.categories.map(cat => {
                            try {
                                const parsed = JSON.parse(cat);
                                return parsed.replace(/["\[\]]/g, '').trim().toLowerCase();
                            } catch (e) {
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
                    const response = await axios.get(process.env.BACKEND_URL + "/users/profile", {
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
                sessionStorage.removeItem('userType');
                setStore({
                    userData: null,
                    token: "",
                    error: null,
                    modalLogout: false
                });
            },

            addToCart: (id) => {
                const store = getStore();
                let cart = store.cart;

                if (cart[id]) {
                    cart[id] = {
                        ...cart[id],
                        quantity: cart[id].quantity + 1,
                        added_at: new Date().getTime()
                    };
                } else {
                    cart[id] = {
                        mysterybox_id: id,
                        quantity: 1,
                        added_at: new Date().getTime()
                    };
                }

                setStore({ cart });
                localStorage.setItem("cart", JSON.stringify(cart));
                return cart;
            },

            removeFromCart: (id) => {
                const store = getStore();
                let newCart = store.cart;
                let newCartWithDetails = store.cartWithDetails;

                delete newCart[id];
                delete newCartWithDetails[id];

                setStore({
                    cart: newCart,
                    cartWithDetails: newCartWithDetails
                });
                localStorage.setItem("cart", JSON.stringify(newCart));
                localStorage.setItem("cartWithDetails", JSON.stringify(newCartWithDetails));
                return newCart;
            },

            decreaseQuantity: (id) => {
                const store = getStore();
                let newCart = store.cart;

                if (newCart[id]) {
                    if (newCart[id].quantity > 1) {
                        newCart[id].quantity = newCart[id].quantity - 1;
                    }
                    else {
                        delete newCart[id];
                        delete newCartWithDetails[id];
                    }
                    setStore({
                        cart: newCart,
                    });
                    localStorage.setItem("cart", JSON.stringify(newCart));
                }

                return newCart;
            },

            startCartExpirationCheck: () => {
                //  revisión periódica del carrito cada minuto
                setInterval(() => {
                    const actions = getActions();
                    actions.removeExpiredCartItems();
                }, 5000);
            },

            getCartItemDetails: async (id) => {
                try {
                    const response = await axios.get(`${process.env.BACKEND_URL}/shops/mystery-box/${id}`);
                    if (response.data) {
                        return [];
                    }
                } catch (error) {
                    console.log("Error al obtener detalles del item del carrito:", error);
                    return null;
                }
            },

            fetchSingleItemDetail: async (id) => {
                try {
                    const response = await axios.get(process.env.BACKEND_URL + `/shops/mystery-box/${id}`);
                    if (response.data) {
                        return response.data;
                    }
                } catch (error) {
                    console.log("Error al obtener detalles del item:", error);
                    return null;
                }
            },

            getCartTotal: async () => {
                const actions = getActions();
                const cartItems = await actions.getCartItemsDetails();
                return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
            },

            removeExpiredCartItems: () => {
                const store = getStore();
                const currentTime = new Date().getTime();
                const TIME_LIMIT = 10000; //10 segundos

                let updatedCart = {};
                let updatedCartWithDetails = {};

                Object.entries(store.cart).forEach(([id, item]) => {
                    const timeElapsed = currentTime - item.added_at;
                    if (timeElapsed <= TIME_LIMIT) {
                        updatedCart[id] = item;
                        if (store.cartWithDetails[id]) {
                            updatedCartWithDetails[id] = store.cartWithDetails[id];
                        }
                    }
                });

                setStore({ cart: updatedCart, cartWithDetails: updatedCartWithDetails });
                localStorage.setItem("cart", JSON.stringify(updatedCart));
                localStorage.setItem("cartWithDetails", JSON.stringify(updatedCartWithDetails));
            },

            updateCartWithDetails: (data) => {
                setStore({
                    cartWithDetails: data
                });
                localStorage.setItem("cartWithDetails", JSON.stringify(data));
            },

            clearCart: () => {
                console.log("Iniciando limpieza del carrito");

                // Obtener el estado actual del store
                const store = getStore();
                console.log("Esto es store", store);
                console.log("Esto es cart", store.cart);
                console.log("Esto es cartWithDetails", store.cartWithDetails);

                // Limpiar el localStorage
                localStorage.removeItem("cart");
                localStorage.removeItem("cartWithDetails");

                // Actualizar el estado del carrito, vaciando cart y cartWithDetails
                setStore({
                    cart: {},           // Si tu carrito es un objeto, lo vacías con {}
                    cartWithDetails: {} // Lo mismo para cartWithDetails
                });

                // Forzar actualización del store (si es necesario)
                setStore(prevStore => ({
                    ...prevStore,   // Mantén el resto del estado del store
                    cart: {},       // Vuelve a asegurar que el cart esté vacío
                    cartWithDetails: {}
                }));

                // Verificar el estado inmediatamente después de la actualización
                const updatedStore = getStore();
                console.log("Estado del cart después de limpiar:", updatedStore.cart);
                console.log("Estado de cartWithDetails después de limpiar:", updatedStore.cartWithDetails);
            },

            syncCartWithLocalStorage: () => {
                const store = getStore();
                localStorage.setItem("cart", JSON.stringify(store.cart));
                localStorage.setItem("cartWithDetails", JSON.stringify(store.cartWithDetails));
            },

            getMysteryBoxDetail: async (id) => {
                setStore({ showError: true, isLoading: true });
                try {
                    const response = await axios.get(`${process.env.BACKEND_URL}/shops/mystery-box/${id}`);
                    setStore({ mysteryBoxDetail: response.data, showError: false, isLoading: false });
                } catch (error) {
                    console.log("Error al obtener la Mystery Box:", error);
                    if (error.response && error.response.status === 404) {
                        setStore({ showError: true, isLoading: false });

                    } else {
                        setStore({ showError: true, isLoading: false });
                    }
                }
            },

            getShopDetail: async (id) => {
                setStore({ showError: true, isLoading: true });
                try {
                    const response = await axios.get(process.env.BACKEND_URL + `/shops/${id}`)
                    if (response.data) {
                        setStore({ shopDetail: response.data, showError: false, isLoading: false })
                    }
                } catch (error) {
                    console.log("Error al obtener la Tienda:", error);
                    if (error.response && error.response.status === 404) {
                        setStore({ showError: true, isLoading: false });

                    } else {
                        setStore({ showError: true, isLoading: false });
                    }
                }
            },

        }
    };
};

export default getState;
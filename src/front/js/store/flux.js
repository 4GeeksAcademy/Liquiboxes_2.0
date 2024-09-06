const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            message: null,
            cart: JSON.parse(localStorage.getItem("cart")) || [],
            categories: ['Moda', 'Ropa de Trabajo', 'Tecnología', 'Carpintería', 'Outdoor', 'Deporte', 'Arte', 'Cocina', 'Jardinería', 'Música', 'Viajes', 'Lectura', 'Cine', 'Fotografía', 'Yoga'],
            shops: [
                {
                    id: 1,
                    name: "Vintage Vogue",
                    description: "Descubre tesoros de moda vintage en cada caja.",
                    rating: 4.7,
                    image: "/api/placeholder/300/200",
                    totalSales: 1254,
                    activeBoxes: 5
                },
                {
                    id: 2,
                    name: "Tech Treasures",
                    description: "Gadgets y accesorios tecnológicos sorpresa.",
                    rating: 4.5,
                    image: "/api/placeholder/300/200",
                    totalSales: 987,
                    activeBoxes: 3
                },
                {
                    id: 3,
                    name: "Gourmet Delights",
                    description: "Explora sabores gourmet de todo el mundo.",
                    rating: 4.8,
                    image: "/api/placeholder/300/200",
                    totalSales: 1532,
                    activeBoxes: 4
                },
                {
                    id: 4,
                    name: "Fitness Fanatic",
                    description: "Equipo y accesorios sorpresa para entusiastas del fitness.",
                    rating: 4.6,
                    image: "/api/placeholder/300/200",
                    totalSales: 756,
                    activeBoxes: 2
                },
                {
                    id: 5,
                    name: "Book Worm's Paradise",
                    description: "Libros de diversos géneros para lectores ávidos.",
                    rating: 4.9,
                    image: "/api/placeholder/300/200",
                    totalSales: 2103,
                    activeBoxes: 6
                }
            ],
            mysteryBoxes: [
                {
                    id: 101,
                    storeId: 1,
                    name: "Retro Glam Box",
                    description: "Una selección de accesorios y ropa vintage de los años 50 y 60.",
                    price: 49.99,
                    size: "Medium",
                    possibleItems: ["Vestido vintage", "Gafas de sol retro", "Broche antiguo", "Pañuelo de seda"],
                    image: "https://i.imgur.com/FGi5Wug.jpeg"
                },
                {
                    id: 102,
                    storeId: 2,
                    name: "Gadget Surprise",
                    description: "Accesorios tech innovadores y útiles para tu día a día.",
                    price: 79.99,
                    size: "Small",
                    possibleItems: ["Auriculares inalámbricos", "Powerbank", "Soporte para smartphone", "Cable multiusos"],
                    image: "https://i.imgur.com/OZdivIs.jpeg"
                },
                {
                    id: 103,
                    storeId: 3,
                    name: "World Flavors Box",
                    description: "Descubre sabores exóticos de diferentes partes del mundo.",
                    price: 59.99,
                    size: "Large",
                    possibleItems: ["Salsa picante artesanal", "Mezcla de especias exóticas", "Snacks internacionales", "Té gourmet"],
                    image: "https://i.imgur.com/P0yKQDg.jpeg"
                },
                {
                    id: 104,
                    storeId: 4,
                    name: "Workout Wonder",
                    description: "Equipamiento sorpresa para potenciar tus entrenamientos.",
                    price: 69.99,
                    size: "Medium",
                    possibleItems: ["Bandas de resistencia", "Botella de agua inteligente", "Toalla de microfibra", "Suplementos deportivos"],
                    image: "https://i.imgur.com/NuomJvP.jpeg"
                },
                {
                    id: 105,
                    storeId: 5,
                    name: "Literary Adventure",
                    description: "Una selección cuidadosa de libros de diversos géneros.",
                    price: 39.99,
                    size: "Large",
                    possibleItems: ["Novela bestseller", "Libro de poesía", "Cómic o novela gráfica", "Marcapáginas artesanal"],
                    image: "https://i.imgur.com/x0rZvRf.jpeg"
                }
            ],
            mysteryBoxDetail: {}
        },
        actions: {
            getMessage: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/hello");
                    const data = await resp.json();
                    setStore({ message: data.message });
                    return data;
                } catch (error) {
                    console.error("Error loading message from backend", error);
                }
            },
            // Funciones originales para el backend (comentadas)
            /*
            fetchMysteryBoxDetails: async (id) => {
                try {
                    const resp = await fetch(`${process.env.BACKEND_URL}/api/mystery_box/${id}`);
                    if (!resp.ok) throw new Error("Failed to fetch mystery box details");
                    const data = await resp.json();
                    return data;
                } catch (error) {
                    console.error("Error fetching mystery box details:", error);
                    return null;
                }
            },

            getCartItemsDetails: async () => {
                const store = getStore();
                const actions = getActions();
                const detailedItems = await Promise.all(
                    store.cart.map(async (cartItem) => {
                        const details = await actions.fetchMysteryBoxDetails(cartItem.id);
                        return details ? { ...details, quantity: cartItem.quantity } : null;
                    })
                );
                return detailedItems.filter(item => item !== null);
            },

            getCartTotal: async () => {
                const actions = getActions();
                const cartItems = await actions.getCartItemsDetails();
                return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
            },
            */

            // Funciones para datos hardcodeados
            getHardcodedMysteryBoxDetails: (id) => {
                const store = getStore();
                const mysteryBox = store.mysteryBoxes.find(box => box.id === id);
                if (mysteryBox) {
                    const shop = store.shops.find(shop => shop.id === mysteryBox.storeId);
                    return {
                        ...mysteryBox,
                        storeName: shop ? shop.name : 'Unknown Shop'
                    };
                }
                return null;
            },

            getHardcodedCartItemsDetails: () => {
                const store = getStore();
                const actions = getActions();
                return store.cart.map(cartItem => {
                    const details = actions.getHardcodedMysteryBoxDetails(cartItem.id);
                    return details ? { ...details, quantity: cartItem.quantity } : null;
                }).filter(item => item !== null);
            },

            getHardcodedCartTotal: () => {
                const actions = getActions();
                const cartItems = actions.getHardcodedCartItemsDetails();
                return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
            },

            // Funciones comunes (no cambian)
            addToCart: (id) => {
                const store = getStore();
                const existingItem = store.cart.find(item => item.id === id);

                if (existingItem) {
                    const updatedCart = store.cart.map(item =>
                        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
                    );
                    setStore({ cart: updatedCart });
                } else {
                    const updatedCart = [...store.cart, { id, quantity: 1 }];
                    setStore({ cart: updatedCart });
                }

                localStorage.setItem("cart", JSON.stringify(getStore().cart));
            },

            removeFromCart: (id) => {
                const store = getStore();
                const updatedCart = store.cart.filter(item => item.id !== id);
                setStore({ cart: updatedCart });
                localStorage.setItem("cart", JSON.stringify(updatedCart));
            },

            getMysteryBoxDetail: async (id) => {
                try {
                    const response = await axios.get(process.env.BACKEND_URL + `/shops/mystery - box / ${ id }`)
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
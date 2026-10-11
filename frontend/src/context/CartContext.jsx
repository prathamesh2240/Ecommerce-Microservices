
import React, {
    createContext,
    useContext,
    useState,
    useEffect
} from "react";

import toast from "react-hot-toast";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {

    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem("cart");

        try {
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error("Invalid cart data:", error);
            return [];
        }
    });

    // Save cart to localStorage
    useEffect(() => {
        localStorage.setItem(
            "cart",
            JSON.stringify(cartItems)
        );
    }, [cartItems]);


    // ==========================================
    // ADD TO CART
    // ==========================================
    const addToCart = (product, quantity = 1) => {

        const existingItem = cartItems.find(
            (item) => item.sku === product.sku
        );

        if (existingItem) {

            const newQuantity =
                existingItem.quantity + quantity;

            setCartItems((prevItems) =>
                prevItems.map((item) =>
                    item.sku === product.sku
                        ? {
                            ...item,
                            quantity: newQuantity
                        }
                        : item
                )
            );

            toast.success(
                `Updated ${product.name} quantity in cart (${newQuantity})`
            );

        } else {

            const newItem = {
                id: product.id,
                sku: product.sku,
                name: product.name,
                price: product.price,
                currency: product.currency || "USD",
                imageUrl:
                    product.imageUrl ||
                    product.thumbnailUrl,
                brand: product.brand,
                quantity: quantity
            };

            setCartItems((prevItems) => [
                ...prevItems,
                newItem
            ]);

            toast.success(
                `Added ${product.name} to cart`
            );
        }
    };


    // ==========================================
    // REMOVE FROM CART
    // ==========================================
    const removeFromCart = (sku) => {

        const item = cartItems.find(
            (item) => item.sku === sku
        );

        setCartItems((prevItems) =>
            prevItems.filter(
                (item) => item.sku !== sku
            )
        );

        if (item) {
            toast.success(
                `Removed ${item.name} from cart`
            );
        }
    };


    // ==========================================
    // UPDATE QUANTITY
    // ==========================================
    const updateQuantity = (sku, quantity) => {

        if (quantity <= 0) {
            removeFromCart(sku);
            return;
        }

        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.sku === sku
                    ? {
                        ...item,
                        quantity: quantity
                    }
                    : item
            )
        );
    };


    // ==========================================
    // CLEAR CART
    // ==========================================
    const clearCart = () => {

        setCartItems([]);

        localStorage.removeItem("cart");

        toast.success("Cart cleared");
    };


    // ==========================================
    // CART COUNT
    // ==========================================
    const cartCount = cartItems.reduce(
        (acc, item) =>
            acc + Number(item.quantity),
        0
    );


    // ==========================================
    // CART TOTAL
    // ==========================================
    const cartTotal = cartItems.reduce(
        (acc, item) =>
            acc +
            Number(item.price) *
            Number(item.quantity),
        0
    );


    // ==========================================
    // CONTEXT PROVIDER
    // ==========================================
    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal
            }}
        >
            {children}
        </CartContext.Provider>
    );
};


// ==============================================
// CUSTOM HOOK
// ==============================================
export const useCart = () => {

    const context = useContext(CartContext);

    if (!context) {
        throw new Error(
            "useCart must be used within a CartProvider"
        );
    }

    return context;
};

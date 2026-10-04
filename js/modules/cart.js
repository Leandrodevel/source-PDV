// js/modules/cart.js
import { formatCurrency } from '../utils/formatters.js';

export function createCartManager(onCartChange) {
    let cart = [];

    function getCart() {
        return cart;
    }

    function addToCart(product) {
        if (product.stock <= 0) {
            alert('Produto sem estoque disponível!');
            return false;
        }

        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            if (existingItem.quantity >= product.stock) {
                alert('Quantidade excede o estoque disponível!');
                return false;
            }
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        if (onCartChange) onCartChange(cart);
        return true;
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        if (onCartChange) onCartChange(cart);
    }

    function clearCart() {
        cart = [];
        if (onCartChange) onCartChange(cart);
    }

    function getTotal() {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    return {
        getCart,
        addToCart,
        removeFromCart,
        clearCart,
        getTotal
    };
}
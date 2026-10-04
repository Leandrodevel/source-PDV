// js/modules/products.js
export const initialProducts = [
    { id: 1, name: 'Café Expresso', price: 5.50, category: 'Bebidas', stock: 50 },
    { id: 2, name: 'Pão de Queijo', price: 4.00, category: 'Salgados', stock: 30 },
    { id: 3, name: 'Água Mineral 500ml', price: 4.50, category: 'Bebidas', stock: 100 },
    { id: 4, name: 'Misto Quente', price: 8.50, category: 'Lanches', stock: 20 },
    { id: 5, name: 'Refrigerante Lata', price: 6.00, category: 'Bebidas', stock: 45 }
];

export function getProducts() {
    const saved = localStorage.getItem('lp_pdv_products');
    if (!saved) {
        localStorage.setItem('lp_pdv_products', JSON.stringify(initialProducts));
        return initialProducts;
    }
    return JSON.parse(saved);
}

export function saveProducts(products) {
    localStorage.setItem('lp_pdv_products', JSON.stringify(products));
}

export function updateStockAfterSale(cartItems) {
    let products = getProducts();
    cartItems.forEach(cartItem => {
        const prod = products.find(p => p.id === cartItem.id);
        if (prod) {
            prod.stock = Math.max(0, prod.stock - cartItem.quantity);
        }
    });
    saveProducts(products);
    return products;
}
export function saveNewProduct(productData) {
    const products = getProducts();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = { id: newId, ...productData };
    products.push(newProduct);
    localStorage.setItem('lp_pdv_products', JSON.stringify(products));
    return newProduct;
}

export function updateProduct(id, updatedData) {
    let products = getProducts();
    products = products.map(p => p.id === id ? { ...p, ...updatedData } : p);
    localStorage.setItem('lp_pdv_products', JSON.stringify(products));
}

export function deleteProduct(id) {
    let products = getProducts();
    products = products.filter(p => p.id !== id);
    localStorage.setItem('lp_pdv_products', JSON.stringify(products));
}
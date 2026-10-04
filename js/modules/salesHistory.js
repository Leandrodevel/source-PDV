// js/modules/salesHistory.js
export function getSalesHistory() {
    const saved = localStorage.getItem('lp_pdv_sales');
    return saved ? JSON.parse(saved) : [];
}

export function saveSale(saleData) {
    const sales = getSalesHistory();
    const newSale = {
        id: Date.now(),
        date: new Date().toISOString(),
        ...saleData
    };
    sales.unshift(newSale); // Insere no topo
    localStorage.setItem('lp_pdv_sales', JSON.stringify(sales));
    return newSale;
}
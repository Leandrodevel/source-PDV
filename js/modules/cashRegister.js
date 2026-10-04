

// js/modules/cashRegister.js
export function getCashStatus() {
    const saved = localStorage.getItem('lp_pdv_cash');
    if (!saved) {
        // Estado padrão inicial (Caixa fechado)
        const defaultState = {
            isOpen: false,
            openingBalance: 0,
            openTime: null,
            salesTotal: 0,
            cashSales: 0,
            cardSales: 0,
            pixSales: 0,
            sangriaTotal: 0,
            suprimentoTotal: 0
        };
        localStorage.setItem('lp_pdv_cash', JSON.stringify(defaultState));
        return defaultState;
    }
    return JSON.parse(saved);
}

export function openCash(openingBalance) {
    const cash = {
        isOpen: true,
        openingBalance: Number(openingBalance) || 0,
        openTime: new Date().toISOString(),
        salesTotal: 0,
        cashSales: 0,
        cardSales: 0,
        pixSales: 0,
        sangriaTotal: 0,
        suprimentoTotal: 0
    };
    localStorage.setItem('lp_pdv_cash', JSON.stringify(cash));
    return cash;
}

export function registerCashMovement(type, amount) {
    let cash = getCashStatus();
    if (!cash.isOpen) return false;

    const val = Number(amount) || 0;
    if (type === 'sangria') {
        cash.sangriaTotal += val;
    } else if (type === 'suprimento') {
        cash.suprimentoTotal += val;
    }
    localStorage.setItem('lp_pdv_cash', JSON.stringify(cash));
    return cash;
}

export function updateCashSales(amount, method) {
    let cash = getCashStatus();
    if (!cash.isOpen) return;

    cash.salesTotal += amount;
    if (method === 'Dinheiro') {
        cash.cashSales += amount;
    } else if (method.includes('Cartão')) {
        cash.cardSales += amount;
    } else if (method === 'Pix') {
        cash.pixSales += amount;
    }
    localStorage.setItem('lp_pdv_cash', JSON.stringify(cash));
}

export function closeCash() {
    let cash = getCashStatus();
    cash.isOpen = false;
    localStorage.setItem('lp_pdv_cash', JSON.stringify(cash));
    return cash;
}   
// Adicione esta função para salvar movimentações extras
export function addCashMovement(movement) {
    let cashData = getCashStatus();
    if (!cashData.movements) cashData.movements = [];
    
    cashData.movements.push(movement);
    
    // Atualiza o saldo em dinheiro conforme a operação
    if (movement.type === 'SUPRIMENTO') {
        cashData.cashTotal = (cashData.cashTotal || 0) + movement.value;
    } else if (movement.type === 'SANGRIA') {
        cashData.cashTotal = (cashData.cashTotal || 0) - movement.value;
    }

    localStorage.setItem('lp_pdv_cash', JSON.stringify(cashData));
}
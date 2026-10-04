// js/main.js
import { createIcons, icons } from 'https://esm.sh/lucide@latest';
import { getProducts, updateStockAfterSale } from './modules/products.js';
import { formatCurrency } from './utils/formatters.js';
import { createCartManager } from './modules/cart.js';
import { openCheckoutModal } from './modules/checkout.js';
import { saveSale } from './modules/salesHistory.js';
import { updateCashSales, getCashStatus } from './modules/cashRegister.js';
import { openReportsModal } from './modules/reportsModal.js';
import { openCashModal } from './modules/cashModal.js';
import { printReceipt } from './modules/printer.js';
import { openProductManagerModal } from './modules/productModal.js';
import { openCashControlModal } from './modules/cashControlModal.js';

window.openSuprimento = () => openCashControlModal('suprimento');
window.openSangria = () => openCashControlModal('sangria');
let products = getProducts();

// Inicializa o gerenciador de carrinho modular
const cartManager = createCartManager((cart) => {
    updateCartUI(cart);
});

document.addEventListener('DOMContentLoaded', () => {
    createIcons({ icons });
    renderProducts(products);
    setupEvents();
    setupHotkeys();
    
    // Relógio em tempo real
    setInterval(() => {
        const clockEl = document.getElementById('live-clock');
        if (clockEl) {
            clockEl.textContent = new Date().toLocaleTimeString('pt-BR');
        }
    }, 1000);
});

function renderProducts(productsList) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    if (productsList.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center text-emerald-800/50 py-12 text-sm">Nenhum produto encontrado.</p>`;
        return;
    }

    // Garante que o container se comporte como uma lista vertical tradicional
    grid.className = "flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-230px)] p-1";

    grid.innerHTML = productsList.map(product => `
        <button data-id="${product.id}" class="product-card bg-white hover:bg-emerald-50/80 border border-emerald-200 hover:border-emerald-600 px-4 py-2.5 rounded-md flex items-center justify-between transition cursor-pointer shadow-xs text-left group">
            <div class="flex items-center gap-3">
                <span class="text-xs font-mono bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-200">#${product.id}</span>
                <div>
                    <span class="font-medium text-sm text-emerald-950 group-hover:text-emerald-900 block">${product.name}</span>
                    <span class="text-[10px] text-emerald-700">Estoque: ${product.stock} un.</span>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <span class="text-xs text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-100">${product.category}</span>
                <span class="text-emerald-800 font-bold text-sm min-w-[80px] text-right">${formatCurrency(product.price)}</span>
            </div>
        </button>
    `).join('');

    createIcons({ icons });
}

function setupEvents() {
    // Clique nos produtos para adicionar ao carrinho
    document.getElementById('products-grid').addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (!card) return;
        const productId = Number(card.dataset.id);
        const product = products.find(p => p.id === productId);
        if (product) {
            cartManager.addToCart(product);
        }
    });

    document.getElementById('clear-cart').addEventListener('click', () => cartManager.clearCart());
    document.getElementById('btn-checkout').addEventListener('click', handleCheckout);

    // Barra de pesquisa
    document.getElementById('search-product').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = products.filter(p => p.name.toLowerCase().includes(query) || p.id.toString() === query);
        renderProducts(filtered);
    });

    // Botão de Relatórios na barra superior (corretamente escopado)
    const reportBtn = document.getElementById('menu-reports');
    if (reportBtn) {
        reportBtn.addEventListener('click', () => {
            openReportsModal();
        });
    }

    // Botão de Caixa na barra superior (corretamente escopado)
    const cashBtn = document.getElementById('menu-cash');
    if (cashBtn) {
        cashBtn.addEventListener('click', () => {
            openCashModal(() => {
                // Callback ao alterar estado do caixa, se necessário
            });
        });
    }
    const prodBtn = document.getElementById('menu-products'); // ou adicione o botão no HTML superior
if (prodBtn) {
    prodBtn.addEventListener('click', () => {
        openProductManagerModal(() => {
            products = getProducts();
            renderProducts(products);
        });
    });
}
}

// js/main.js (Substitua a função setupHotkeys existente por esta)

function setupHotkeys() {
    window.addEventListener('keydown', (e) => {
        // F2: Focar na barra de pesquisa de produtos
        if (e.key === 'F2') {
            e.preventDefault();
            const searchInput = document.getElementById('search-product');
            if (searchInput) searchInput.focus();
        } 
        // F4: Limpar o carrinho
        else if (e.key === 'F4') {
            e.preventDefault();
            cartManager.clearCart();
        } 
        // F10: Finalizar Venda (Checkout)
        else if (e.key === 'F10') {
            e.preventDefault();
            handleCheckout();
        }
        // ESC: Fechar qualquer modal aberto na tela (Relatório, Caixa ou Checkout)
        else if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.fixed.inset-0');
            if (openModals.length > 0) {
                e.preventDefault();
                // Remove o modal mais recente da tela
                openModals[openModals.length - 1].remove();
            }
        }
    });
}
// Expõe remoção global para os botões do carrinho
window.removeFromCart = function(productId) {
    cartManager.removeFromCart(productId);
};

function updateCartUI(cart) {
    const cartContainer = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('subtotal-value');
    const totalEl = document.getElementById('total-value');
    if (!cartContainer || !totalEl || !subtotalEl) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = `<p class="text-emerald-800/50 text-xs text-center py-12">Nenhum item lançado</p>`;
        subtotalEl.textContent = formatCurrency(0);
        totalEl.textContent = formatCurrency(0);
        return;
    }

    let total = 0;

    cartContainer.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <div class="flex items-center justify-between bg-white p-2.5 rounded border border-emerald-200 shadow-2xs">
                <div class="flex flex-col flex-1 pr-2">
                    <span class="text-xs font-medium text-emerald-950 line-clamp-1">${item.name}</span>
                    <span class="text-[11px] text-emerald-700">${item.quantity}x ${formatCurrency(item.price)}</span>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs font-bold text-emerald-900">${formatCurrency(itemTotal)}</span>
                    <button onclick="window.removeFromCart(${item.id})" class="text-rose-600 hover:text-rose-800 transition cursor-pointer" title="Remover item">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    subtotalEl.textContent = formatCurrency(total);
    totalEl.textContent = formatCurrency(total);
    createIcons({ icons });
}

function handleCheckout() {
    const cashStatus = getCashStatus();
    if (!cashStatus.isOpen) {
        alert('O caixa está fechado! Abra o caixa no menu superior antes de realizar vendas.');
        openCashModal();
        return;
    }

    const cart = cartManager.getCart();
    if (cart.length === 0) {
        alert('Adicione itens ao carrinho antes de finalizar a venda.');
        return;
    }

    const total = cartManager.getTotal();

    openCheckoutModal(total, (paymentData) => {
        // Salva a venda
        const saleData = {
            items: [...cart],
            total,
            ...paymentData
        };
        saveSale(saleData);

        // Atualiza estoque e caixa
        products = updateStockAfterSale(cart);
        updateCashSales(total, paymentData.method);

        // Limpa carrinho e atualiza tela
        cartManager.clearCart();
        renderProducts(products);

        alert(`Venda finalizada com sucesso! Troco: ${formatCurrency(paymentData.change)}`);
    });

    openCheckoutModal(total, (paymentData) => {
        // Salva a venda
        const saleData = {
            id: Date.now(),
            items: [...cart],
            total,
            ...paymentData,
            date: new Date().toISOString()
        };
        saveSale(saleData);

        // Atualiza estoque e caixa
        products = updateStockAfterSale(cart);
        updateCashSales(total, paymentData.method);

        // Limpa carrinho e atualiza tela
        cartManager.clearCart();
        renderProducts(products);

        // Pergunta se deseja imprimir o cupom
        if (confirm(`Venda finalizada com sucesso! Troco: ${formatCurrency(paymentData.change)}\nDeseja imprimir o cupom não fiscal agora?`)) {
            printReceipt(saleData);
        }
    });
}
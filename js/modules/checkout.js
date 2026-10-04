// js/modules/checkout.js
import { formatCurrency } from '../utils/formatters.js';

export function openCheckoutModal(totalAmount, onComplete) {
    // Remove modal anterior se existir
    const existingModal = document.getElementById('checkout-modal');
    if (existingModal) existingModal.remove();

    const modalHTML = `
        <div id="checkout-modal" class="fixed inset-0 bg-emerald-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div class="bg-white border border-emerald-300 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                <div class="bg-emerald-900 text-white px-4 py-3 flex items-center justify-between">
                    <h3 class="font-bold text-sm flex items-center gap-2">
                        <i data-lucide="credit-card" class="w-4 h-4"></i> Finalizar Pagamento
                    </h3>
                    <button id="close-modal" class="text-emerald-200 hover:text-white cursor-pointer">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>

                <div class="p-5 flex flex-col gap-4">
                    <div class="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex justify-between items-center">
                        <span class="text-xs font-semibold text-emerald-800">TOTAL A PAGAR</span>
                        <span class="text-xl font-black text-emerald-950">${formatCurrency(totalAmount)}</span>
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <label class="text-xs font-medium text-emerald-900">Forma de Pagamento</label>
                        <select id="pay-method" class="w-full bg-white border border-emerald-300 rounded px-3 py-2 text-sm text-emerald-950 focus:outline-none focus:border-emerald-600">
                            <option value="Dinheiro">Dinheiro</option>
                            <option value="Cartão de Crédito">Cartão de Crédito</option>
                            <option value="Cartão de Débito">Cartão de Débito</option>
                            <option value="Pix">Pix</option>
                        </select>
                    </div>

                    <div id="cash-fields" class="flex flex-col gap-1.5">
                        <label class="text-xs font-medium text-emerald-900">Valor Recebido (Dinheiro)</label>
                        <input type="number" id="cash-received" step="0.01" placeholder="0,00" class="w-full bg-white border border-emerald-300 rounded px-3 py-2 text-sm text-emerald-950 focus:outline-none focus:border-emerald-600 font-bold">
                        
                        <div class="flex justify-between items-center mt-2 p-2 bg-emerald-50/50 border border-emerald-200 rounded">
                            <span class="text-xs font-bold text-emerald-800">TROCO:</span>
                            <span id="change-due" class="text-base font-black text-emerald-700">R$ 0,00</span>
                        </div>
                    </div>
                </div>

                <div class="bg-emerald-50 border-t border-emerald-200 px-4 py-3 flex justify-end gap-2">
                    <button id="btn-cancel-pay" class="px-4 py-2 bg-white hover:bg-emerald-100 border border-emerald-300 rounded text-xs font-medium text-emerald-900 transition cursor-pointer">
                        Cancelar (Esc)
                    </button>
                    <button id="btn-confirm-pay" class="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold transition shadow-xs cursor-pointer">
                        Confirmar Pagamento (Enter)
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', htmlToFragment(modalHTML));
    
    // Ativa ícones no modal
    if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons();
    }

    const methodSelect = document.getElementById('pay-method');
    const cashFields = document.getElementById('cash-fields');
    const cashInput = document.getElementById('cash-received');
    const changeEl = document.getElementById('change-due');

    cashInput.value = totalAmount.toFixed(2);
    calculateChange();

    methodSelect.addEventListener('change', (e) => {
        if (e.target.value === 'Dinheiro') {
            cashFields.style.display = 'flex';
        } else {
            cashFields.style.display = 'none';
        }
    });

    cashInput.addEventListener('input', calculateChange);

    function calculateChange() {
        const received = parseFloat(cashInput.value) || 0;
        const change = received - totalAmount;
        changeEl.textContent = formatCurrency(change >= 0 ? change : 0);
    }

    const closeModal = () => {
        document.getElementById('checkout-modal').remove();
    };

    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('btn-cancel-pay').addEventListener('click', closeModal);

    document.getElementById('btn-confirm-pay').addEventListener('click', () => {
        const method = methodSelect.value;
        const received = method === 'Dinheiro' ? parseFloat(cashInput.value) || 0 : totalAmount;
        
        if (method === 'Dinheiro' && received < totalAmount) {
            alert('Valor recebido é menor que o total a pagar!');
            return;
        }

        const change = method === 'Dinheiro' ? received - totalAmount : 0;
        closeModal();
        onComplete({ method, received, change });
    });
}

function htmlToFragment(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    template.content.firstChild;
    return template.innerHTML;
}
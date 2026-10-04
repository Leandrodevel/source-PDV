// js/modules/cashControlModal.js
import { formatCurrency } from '../utils/formatters.js';
import { getCashStatus, addCashMovement } from './cashRegister.js';

export function openCashControlModal(type, onComplete) {
    const existing = document.getElementById('cash-control-modal');
    if (existing) existing.remove();

    const isSuprimento = type === 'suprimento';
    const title = isSuprimento ? 'Registrar Suprimento (Entrada de Caixa)' : 'Registrar Sangria (Retirada de Caixa)';
    const colorTheme = isSuprimento ? 'emerald' : 'amber';

    const modalHTML = `
        <div id="cash-control-modal" class="fixed inset-0 bg-emerald-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div class="bg-white border border-${colorTheme}-300 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                
                <!-- Cabeçalho -->
                <div class="bg-${colorTheme}-900 text-white px-4 py-3 flex items-center justify-between">
                    <h3 class="font-bold text-sm flex items-center gap-2">
                        <i data-lucide="${isSuprimento ? 'arrow-down-circle' : 'arrow-up-circle'}" class="w-4 h-4"></i> ${title}
                    </h3>
                    <button id="close-ctrl-modal" class="text-${colorTheme}-200 hover:text-white cursor-pointer">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>

                <!-- Formulário -->
                <form id="cash-control-form" class="p-5 flex flex-col gap-4">
                    <div class="flex flex-col gap-1.5">
                        <label class="text-xs font-semibold text-emerald-900">Valor da Operação (R$)</label>
                        <input type="number" id="ctrl-value" step="0.01" min="0.01" required placeholder="0.00" class="bg-emerald-50/50 border border-emerald-300 rounded-lg px-3 py-2 text-sm font-bold text-emerald-950 focus:outline-none">
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <label class="text-xs font-semibold text-emerald-900">Motivo / Descrição</label>
                        <input type="text" id="ctrl-reason" required placeholder="${isSuprimento ? 'Ex: Troco inicial para gaveta' : 'Ex: Pagamento de motoboy / Troco para banco'}" class="bg-emerald-50/50 border border-emerald-300 rounded-lg px-3 py-2 text-xs text-emerald-950 focus:outline-none">
                    </div>

                    <div class="flex justify-end gap-2 mt-2">
                        <button type="button" id="btn-cancel-ctrl" class="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-xs font-bold transition cursor-pointer">Cancelar</button>
                        <button type="submit" class="px-5 py-2 bg-${colorTheme}-700 hover:bg-${colorTheme}-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer">Confirmar ${isSuprimento ? 'Suprimento' : 'Sangria'}</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons();
    }

    const closeModal = () => {
        document.getElementById('cash-control-modal').remove();
    };

    document.getElementById('close-ctrl-modal').addEventListener('click', closeModal);
    document.getElementById('btn-cancel-ctrl').addEventListener('click', closeModal);

    document.getElementById('cash-control-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const value = Number(document.getElementById('ctrl-value').value);
        const reason = document.getElementById('ctrl-reason').value;

        if (value <= 0) {
            alert('Insira um valor válido.');
            return;
        }

        // Adiciona a movimentação no registrador de caixa
        addCashMovement({
            type: isSuprimento ? 'SUPRIMENTO' : 'SANGRIA',
            value,
            reason,
            date: new Date().toISOString()
        });

        alert(`${isSuprimento ? 'Suprimento' : 'Sangria'} registrado com sucesso!`);
        closeModal();
        if (onComplete) onComplete();
    });
}
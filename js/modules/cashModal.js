// js/modules/cashModal.js
import { formatCurrency } from '../utils/formatters.js';
import { getCashStatus, openCash, registerCashMovement, closeCash } from './cashRegister.js';

export function openCashModal(onStatusChange) {
    const existing = document.getElementById('cash-modal');
    if (existing) existing.remove();

    const cash = getCashStatus();

    const modalHTML = `
        <div id="cash-modal" class="fixed inset-0 bg-emerald-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div class="bg-white border border-emerald-300 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                
                <div class="bg-emerald-900 text-white px-4 py-3 flex items-center justify-between">
                    <h3 class="font-bold text-sm flex items-center gap-2">
                        <i data-lucide="vault" class="w-4 h-4"></i> Gestão de Caixa
                    </h3>
                    <button id="close-cash-modal" class="text-emerald-200 hover:text-white cursor-pointer">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>

                <div class="p-5 flex flex-col gap-4">
                    <div class="p-3 rounded-lg border ${cash.isOpen ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'} flex justify-between items-center">
                        <span class="text-xs font-bold uppercase">Status Atual:</span>
                        <span class="text-xs font-black px-2.5 py-1 rounded ${cash.isOpen ? 'bg-emerald-700 text-white' : 'bg-rose-600 text-white'}">
                            ${cash.isOpen ? 'CAIXA ABERTO' : 'CAIXA FECHADO'}
                        </span>
                    </div>

                    ${!cash.isOpen ? `
                        <!-- ABRIR CAIXA -->
                        <div class="flex flex-col gap-3">
                            <label class="text-xs font-medium text-emerald-900">Valor de Abertura (Fundo de Troco em Dinheiro)</label>
                            <input type="number" id="opening-val" step="0.01" value="100.00" class="w-full bg-white border border-emerald-300 rounded px-3 py-2 text-sm text-emerald-950 focus:outline-none focus:border-emerald-600 font-bold">
                            <button id="btn-do-open" class="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-xs transition cursor-pointer shadow-xs">
                                Abrir Caixa Agora
                            </button>
                        </div>
                    ` : `
                        <!-- CAIXA ABERTO: OPÇÕES DE SANGRIA / SUPRIMENTO / FECHAMENTO -->
                        <div class="flex flex-col gap-3">
                            <div class="grid grid-cols-2 gap-2 text-xs bg-emerald-50/50 p-2.5 rounded border border-emerald-200">
                                <div>Fundo Inicial: <b>${formatCurrency(cash.openingBalance)}</b></div>
                                <div>Vendas Totais: <b>${formatCurrency(cash.salesTotal)}</b></div>
                                <div>Sangrias (Retiradas): <b>${formatCurrency(cash.sangriaTotal)}</b></div>
                                <div>Dinheiro em Caixa: <b>${formatCurrency(cash.openingBalance + cash.cashSales + cash.suprimentoTotal - cash.sangriaTotal)}</b></div>
                            </div>

                            <div class="border-t border-emerald-200 pt-3 flex flex-col gap-2">
                                <label class="text-xs font-medium text-emerald-900">Operação Rápida (Sangria ou Suprimento)</label>
                                <div class="flex gap-2">
                                    <input type="number" id="mov-amount" step="0.01" placeholder="Valor R$" class="flex-1 bg-white border border-emerald-300 rounded px-3 py-1.5 text-sm text-emerald-950 focus:outline-none">
                                    <button id="btn-sangria" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold transition cursor-pointer">Sangria</button>
                                    <button id="btn-suprimento" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition cursor-pointer">Suprimento</button>
                                </div>
                            </div>

                            <button id="btn-do-close" class="w-full mt-2 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded font-bold text-xs transition cursor-pointer shadow-xs">
                                Fechar Caixa (Conferência de Turno)
                            </button>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons();
    }

    const closeModal = () => document.getElementById('cash-modal').remove();
    document.getElementById('close-cash-modal').addEventListener('click', closeModal);

    if (!cash.isOpen) {
        document.getElementById('btn-do-open').addEventListener('click', () => {
            const val = document.getElementById('opening-val').value;
            openCash(val);
            closeModal();
            if (onStatusChange) onStatusChange();
            alert('Caixa aberto com sucesso!');
        });
    } else {
        document.getElementById('btn-sangria').addEventListener('click', () => {
            const val = document.getElementById('mov-amount').value;
            if (!val || val <= 0) { alert('Informe um valor válido.'); return; }
            registerCashMovement('sangria', val);
            closeModal();
            alert('Sangria realizada com sucesso!');
        });

        document.getElementById('btn-suprimento').addEventListener('click', () => {
            const val = document.getElementById('mov-amount').value;
            if (!val || val <= 0) { alert('Informe um valor válido.'); return; }
            registerCashMovement('suprimento', val);
            closeModal();
            alert('Suprimento adicionado com sucesso!');
        });

        document.getElementById('btn-do-close').addEventListener('click', () => {
            if (confirm('Deseja realmente fechar o caixa e encerrar o turno?')) {
                closeCash();
                closeModal();
                if (onStatusChange) onStatusChange();
                alert('Caixa fechado com sucesso!');
            }
        });
    }
}
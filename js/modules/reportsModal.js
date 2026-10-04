// js/modules/reportsModal.js
import { formatCurrency } from '../utils/formatters.js';
import { getSalesHistory } from './salesHistory.js';
import { getCashStatus } from './cashRegister.js';
import { printReceipt } from './printer.js';

// Expõe a função de reimpressão globalmente para os botões da tabela
window.reprintSale = function(saleId) {
    const sales = getSalesHistory();
    const sale = sales.find(s => s.id === saleId);
    if (sale) {
        printReceipt(sale);
    } else {
        alert('Venda não encontrada.');
    }
};

export function openReportsModal() {
    const existingModal = document.getElementById('reports-modal');
    if (existingModal) existingModal.remove();

    const sales = getSalesHistory();
    const cash = getCashStatus();

    const totalSalesValue = sales.reduce((sum, sale) => sum + sale.total, 0);

    const modalHTML = `
        <div id="reports-modal" class="fixed inset-0 bg-emerald-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div class="bg-white border border-emerald-300 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
                
                <!-- Cabeçalho do Modal -->
                <div class="bg-emerald-900 text-white px-4 py-3 flex items-center justify-between">
                    <h3 class="font-bold text-sm flex items-center gap-2">
                        <i data-lucide="file-text" class="w-4 h-4"></i> Relatório de Vendas e Fechamento de Caixa
                    </h3>
                    <button id="close-reports-modal" class="text-emerald-200 hover:text-white cursor-pointer">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>

                <!-- Corpo do Relatório -->
                <div class="p-5 flex flex-col gap-4 overflow-y-auto">
                    
                    <!-- Resumo Financeiro -->
                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex flex-col">
                            <span class="text-xs font-semibold text-emerald-800">Total Faturado Hoje</span>
                            <span class="text-lg font-black text-emerald-950 mt-1">${formatCurrency(totalSalesValue)}</span>
                        </div>
                        <div class="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex flex-col">
                            <span class="text-xs font-semibold text-emerald-800">Total de Cupons Emitidos</span>
                            <span class="text-lg font-black text-emerald-950 mt-1">${sales.length} vendas</span>
                        </div>
                    </div>

                    <!-- Lista de Vendas Realizadas -->
                    <div class="flex flex-col gap-2">
                        <h4 class="text-xs font-bold text-emerald-900 uppercase tracking-wider">Últimas Vendas Registradas</h4>
                        
                        <div class="border border-emerald-200 rounded-lg overflow-hidden bg-emerald-50/30 max-h-[300px] overflow-y-auto">
                            ${sales.length === 0 ? `
                                <p class="text-emerald-800/50 text-xs text-center py-8">Nenhuma venda registrada ainda hoje.</p>
                            ` : `
                                <table class="w-full text-left border-collapse text-xs">
                                    <thead class="bg-emerald-100 text-emerald-900 border-b border-emerald-200 sticky top-0">
                                        <tr>
                                            <th class="p-2.5">ID / Hora</th>
                                            <th class="p-2.5">Pagamento</th>
                                            <th class="p-2.5 text-right">Total</th>
                                            <th class="p-2.5 text-right">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-emerald-200">
                                        ${sales.map(sale => `
                                            <tr class="hover:bg-white transition">
                                                <td class="p-2.5 font-mono text-emerald-900">
                                                    #${sale.id.toString().slice(-4)} 
                                                    <span class="text-[10px] text-emerald-700 block">${new Date(sale.date).toLocaleTimeString('pt-BR')}</span>
                                                </td>
                                                <td class="p-2.5 font-medium text-emerald-950">${sale.method}</td>
                                                <td class="p-2.5 text-right font-bold text-emerald-800">${formatCurrency(sale.total)}</td>
                                                <td class="p-2.5 text-right">
                                                    <button onclick="window.reprintSale(${sale.id})" class="text-emerald-700 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition">
                                                        Imprimir
                                                    </button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            `}
                        </div>
                    </div>
                </div>

                <!-- Rodapé -->
                <div class="bg-emerald-50 border-t border-emerald-200 px-4 py-3 flex justify-end">
                    <button id="btn-close-rep" class="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold transition shadow-xs cursor-pointer">
                        Fechar Relatório
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons();
    }

    const closeModal = () => {
        const modal = document.getElementById('reports-modal');
        if (modal) modal.remove();
        window.removeEventListener('keydown', handleEsc);
    };

    // Função para escutar a tecla ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEsc);

    // Fechar ao clicar no fundo escuro (backdrop)
    document.getElementById('reports-modal').addEventListener('click', (e) => {
        if (e.target.id === 'reports-modal') {
            closeModal();
        }
    });

    document.getElementById('close-reports-modal').addEventListener('click', closeModal);
    document.getElementById('btn-close-rep').addEventListener('click', closeModal);
}
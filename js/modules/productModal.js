// js/modules/productModal.js
import { formatCurrency } from '../utils/formatters.js';
import { getProducts, saveNewProduct, updateProduct, deleteProduct } from './products.js';

export function openProductManagerModal(onProductsUpdated) {
    const existing = document.getElementById('product-manager-modal');
    if (existing) existing.remove();

    let products = getProducts();

    const modalHTML = `
        <div id="product-manager-modal" class="fixed inset-0 bg-emerald-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div class="bg-white border border-emerald-300 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
                
                <!-- Cabeçalho -->
                <div class="bg-emerald-900 text-white px-4 py-3 flex items-center justify-between">
                    <h3 class="font-bold text-sm flex items-center gap-2">
                        <i data-lucide="package" class="w-4 h-4"></i> Gerenciamento de Produtos e Estoque
                    </h3>
                    <button id="close-prod-modal" class="text-emerald-200 hover:text-white cursor-pointer">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>

                <!-- Corpo -->
                <div class="p-5 flex flex-col gap-5 overflow-y-auto">
                    
                    <!-- Formulário de Cadastro / Edição -->
                    <form id="product-form" class="bg-emerald-50/70 border border-emerald-200 p-4 rounded-lg flex flex-col gap-3">
                        <h4 id="form-title" class="text-xs font-bold text-emerald-900 uppercase">Cadastrar Novo Produto</h4>
                        <input type="hidden" id="prod-edit-id" value="">
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div class="flex flex-col gap-1">
                                <label class="text-[11px] font-medium text-emerald-900">Nome do Produto</label>
                                <input type="text" id="prod-name" required placeholder="Ex: Cabo HDMI 1.8m" class="bg-white border border-emerald-300 rounded px-3 py-1.5 text-xs text-emerald-950 focus:outline-none">
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-[11px] font-medium text-emerald-900">Categoria</label>
                                <input type="text" id="prod-category" required placeholder="Ex: Cabos / Eletrônicos" class="bg-white border border-emerald-300 rounded px-3 py-1.5 text-xs text-emerald-950 focus:outline-none">
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div class="flex flex-col gap-1">
                                    <label class="text-[11px] font-medium text-emerald-900">Preço (R$)</label>
                                    <input type="number" id="prod-price" step="0.01" required placeholder="0.00" class="bg-white border border-emerald-300 rounded px-3 py-1.5 text-xs text-emerald-950 focus:outline-none">
                                </div>
                                <div class="flex flex-col gap-1">
                                    <label class="text-[11px] font-medium text-emerald-900">Estoque</label>
                                    <input type="number" id="prod-stock" required placeholder="0" class="bg-white border border-emerald-300 rounded px-3 py-1.5 text-xs text-emerald-950 focus:outline-none">
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end gap-2 mt-1">
                            <button type="button" id="btn-cancel-edit" class="hidden px-3 py-1.5 bg-emerald-200 hover:bg-emerald-300 text-emerald-900 rounded text-xs font-bold transition cursor-pointer">Cancelar Edição</button>
                            <button type="submit" id="btn-save-prod" class="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold transition shadow-xs cursor-pointer">Salvar Produto</button>
                        </div>
                    </form>

                    <!-- Lista de Produtos Cadastrados -->
                    <div class="flex flex-col gap-2">
                        <h4 class="text-xs font-bold text-emerald-900 uppercase">Produtos Cadastrados</h4>
                        <div class="border border-emerald-200 rounded-lg overflow-hidden bg-emerald-50/30 max-h-[250px] overflow-y-auto">
                            <table class="w-full text-left border-collapse text-xs">
                                <thead class="bg-emerald-100 text-emerald-900 border-b border-emerald-200 sticky top-0">
                                    <tr>
                                        <th class="p-2.5">ID / Nome</th>
                                        <th class="p-2.5">Categoria</th>
                                        <th class="p-2.5">Estoque</th>
                                        <th class="p-2.5 text-right">Preço</th>
                                        <th class="p-2.5 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody id="products-table-body" class="divide-y divide-emerald-200">
                                    ${renderProductRows(products)}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                <!-- Rodapé -->
                <div class="bg-emerald-50 border-t border-emerald-200 px-4 py-3 flex justify-end">
                    <button id="btn-close-modal" class="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold transition shadow-xs cursor-pointer">
                        Concluir / Fechar
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
        document.getElementById('product-manager-modal').remove();
        if (onProductsUpdated) onProductsUpdated();
    };

    document.getElementById('close-prod-modal').addEventListener('click', closeModal);
    document.getElementById('btn-close-modal').addEventListener('click', closeModal);

    // Evento de Submissão do Formulário (Salvar / Editar)
    const form = document.getElementById('product-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('prod-edit-id').value;
        const name = document.getElementById('prod-name').value;
        const category = document.getElementById('prod-category').value;
        const price = Number(document.getElementById('prod-price').value);
        const stock = Number(document.getElementById('prod-stock').value);

        if (id) {
            // Atualizar produto existente
            updateProduct(Number(id), { name, category, price, stock });
            alert('Produto atualizado com sucesso!');
        } else {
            // Cadastrar novo
            saveNewProduct({ name, category, price, stock });
            alert('Produto cadastrado com sucesso!');
        }

        form.reset();
        document.getElementById('prod-edit-id').value = '';
        document.getElementById('form-title').textContent = 'Cadastrar Novo Produto';
        document.getElementById('btn-cancel-edit').classList.add('hidden');
        document.getElementById('btn-save-prod').textContent = 'Salvar Produto';

        products = getProducts();
        document.getElementById('products-table-body').innerHTML = renderProductRows(products);
        if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
    });

    // Cancelar Edição
    document.getElementById('btn-cancel-edit').addEventListener('click', () => {
        form.reset();
        document.getElementById('prod-edit-id').value = '';
        document.getElementById('form-title').textContent = 'Cadastrar Novo Produto';
        document.getElementById('btn-cancel-edit').classList.add('hidden');
        document.getElementById('btn-save-prod').textContent = 'Salvar Produto';
    });

    // Ações globais da tabela (Editar / Excluir)
    window.editProductRow = function(id) {
        const p = getProducts().find(prod => prod.id === id);
        if (!p) return;
        document.getElementById('prod-edit-id').value = p.id;
        document.getElementById('prod-name').value = p.name;
        document.getElementById('prod-category').value = p.category;
        document.getElementById('prod-price').value = p.price;
        document.getElementById('prod-stock').value = p.stock;

        document.getElementById('form-title').textContent = `Editando Produto #${p.id}`;
        document.getElementById('btn-cancel-edit').classList.remove('hidden');
        document.getElementById('btn-save-prod').textContent = 'Atualizar Produto';
        document.getElementById('prod-name').focus();
    };

    window.deleteProductRow = function(id) {
        if (confirm('Deseja realmente excluir este produto?')) {
            deleteProduct(id);
            products = getProducts();
            document.getElementById('products-table-body').innerHTML = renderProductRows(products);
            if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
        }
    };
}

function renderProductRows(productsList) {
    if (productsList.length === 0) {
        return `<tr><td colspan="5" class="text-center text-emerald-800/50 py-6">Nenhum produto cadastrado.</td></tr>`;
    }
    return productsList.map(p => `
        <tr class="hover:bg-white transition">
            <td class="p-2.5 font-mono text-emerald-900">
                #${p.id} <span class="font-medium text-emerald-950 block">${p.name}</span>
            </td>
            <td class="p-2.5 text-emerald-800">${p.category}</td>
            <td class="p-2.5 font-bold text-emerald-900">${p.stock} un.</td>
            <td class="p-2.5 text-right font-bold text-emerald-950">${formatCurrency(p.price)}</td>
            <td class="p-2.5 text-center flex items-center justify-center gap-2">
                <button onclick="window.editProductRow(${p.id})" class="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-1.5 rounded cursor-pointer" title="Editar">
                    <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                </button>
                <button onclick="window.deleteProductRow(${p.id})" class="text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 p-1.5 rounded cursor-pointer" title="Excluir">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
            </td>
        </tr>
    `).join('');
}
// js/modules/printer.js
import { formatCurrency } from '../utils/formatters.js';

export function printReceipt(saleData) {
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) {
        alert('Permita pop-ups no navegador para imprimir o cupom.');
        return;
    }

    const saleDate = new Date(saleData.date || Date.now()).toLocaleString('pt-BR');
    const storeName = "LP SOLUÇÕES - PDV";
    const storeCNPJ = "CNPJ: 00.000.000/0001-00";

    const itemsHTML = saleData.items.map(item => `
        <tr>
            <td style="text-align: left; padding: 3px 0;">${item.name}</td>
            <td style="text-align: center; padding: 3px 0;">${item.quantity}x</td>
            <td style="text-align: right; padding: 3px 0;">${formatCurrency(item.price * item.quantity)}</td>
        </tr>
    `).join('');

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Cupom Não Fiscal - #${saleData.id ? saleData.id.toString().slice(-4) : '0000'}</title>
            <style>
                body {
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 12px;
                    color: #000;
                    background: #fff;
                    margin: 0;
                    padding: 10px;
                    width: 280px; /* Padrão aproximado bobina térmica 58mm/80mm */
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .bold { font-weight: bold; }
                .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
                table { width: 100%; border-collapse: collapse; }
                th { font-size: 11px; border-bottom: 1px solid #000; padding-bottom: 4px; }
            </style>
        </head>
        <body>
            <div class="text-center bold" style="font-size: 14px;">${storeName}</div>
            <div class="text-center" style="font-size: 10px;">${storeCNPJ}</div>
            <div class="divider"></div>
            
            <div>Data: ${saleDate}</div>
            <div>Cupom: #${saleData.id ? saleData.id.toString().slice(-4) : '9999'}</div>
            
            <div class="divider"></div>
            
            <table>
                <thead>
                    <tr>
                        <th style="text-align: left;">Item</th>
                        <th style="text-align: center;">Qtd</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
            
            <div class="divider"></div>
            
            <div>Subtotal: <span style="float: right;">${formatCurrency(saleData.total)}</span></div>
            <div>Forma de Pagamento: <span style="float: right;">${saleData.method}</span></div>
            ${saleData.amountPaid ? `<div>Dinheiro Recebido: <span style="float: right;">${formatCurrency(saleData.amountPaid)}</span></div>` : ''}
            ${saleData.change > 0 ? `<div>Troco: <span style="float: right;">${formatCurrency(saleData.change)}</span></div>` : ''}
            
            <div class="divider"></div>
            <div class="text-center bold" style="margin-top: 10px;">OBRIGADO PELA PREFERÊNCIA!</div>
            <div class="text-center" style="font-size: 10px; margin-top: 5px;">LP Soluções - Automação Comercial</div>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();

    // Aguarda carregar e dispara a janela de impressão
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 300);
}
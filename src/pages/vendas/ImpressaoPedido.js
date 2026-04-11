import React, { useState } from 'react';
// Outros imports...
import { BluetoothEscposPrinter, BluetoothManager } from 'react-native-bluetooth-escpos-printer';

// --- ADICIONE ESTA NOVA FUNÇÃO NO SEU ARQUIVO NovaVenda.js ---

const formatarAndImprimirCupom = async (vendaRealizada) => {
  try {
    // 1. Verificar se há impressora conectada (Exemplo genérico)
    // Se você ainda não tem a lógica de conexão Bluetooth,
    // o app tentará usar a impressora padrão conectada ao sistema.
    // console.log("Impressora conectada:", await BluetoothManager.getConnectedDeviceAddress());

    // 2. Definir parâmetros de layout (Assumindo impressora de 80mm - aprox. 48 colunas de texto)
    const larguraTotal = 48; // Número estimado de colunas para 80mm. Ajuste se necessário.
    const paddingDescricao = 25; // Coluna para o nome do produto
    const paddingQuantidade = 7;   // Coluna para a quantidade
    const paddingPreco = 8;        // Coluna para o preço/total

    // 3. Montar a string do cupom (REPLICANDO O LAYOUT DA IMAGEM)
    let cupom = "";

    // --- CABEÇALHO (Centralizado) ---
    // Você precisa criar uma função auxiliar para centralizar se desejar, ou usar espaços.
    // Usarei espaços para simplificar a replicação exata.
    cupom += "       VASOLANDIA PLANTAS & CIA        \n";
    cupom += "         FONE: (19)3481-6299          \n";
    cupom += "          SEM VALOR FISCAL            \n";
    cupom += "----------------------------------------------\n"; // 48 traços

    // --- DADOS DA VENDA (Esquerda) ---
    const dataHoraStr = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    cupom += `${dataHoraStr.padEnd(larguraTotal)}\n`;
    cupom += `PEDIDO: ${vendaRealizada.idVenda.toString().padEnd(30)}\n`;
    cupom += `CONDICAO: PAGAMENTO A VISTA.padEnd(larguraTotal)}\n`;
    cupom += `PARCELAS: 0.padEnd(larguraTotal)}\n`;
    cupom += `VENDEDOR: ${AsyncStorage.getItem('codigoVendedor') || 'SEM VENDEDOR'}\n`;
    cupom += `CLIENTE: ${vendaRealizada.cliente.NOME ||'1, CLIENTE'}\n`;
    // Outros campos como FANTASIA, ENDERECO, FONE podem ser adicionados aqui...
    // cupom += `FANTASIA:\n`;
    // cupom += `ENDERECO:\n`;
    cupom += "----------------------------------------------\n";

    // --- CABEÇALHO DA TABELA (Colunas Alinhadas) ---
    // PRODUTO / COD / UN / QUANT / VALOR / TOTAL
    cupom += "PRODUTO                                     \n";
    // Alinhamento manual: COD (10), UN (5), QUANT (8), VALOR (10), TOTAL (10)
    cupom += "COD       UN    QUANT.      VALOR      TOTAL \n";
    cupom += "----------------------------------------------\n";

    // --- ITENS (Replicando o formato da imagem) ---
    vendaRealizada.itens.forEach(item => {
      // Linha 1: Descrição e Unidade
      const descricaoCurta = item.produto.nome.substring(0, 30);
      cupom += `${descricaoCurta} UN\n`;

      // Linha 2: Código, Quantidade, Valor Unitário, Subtotal
      const cod = item.produto.codigo.toString().padEnd(10);
      const qtd = item.quantidade.toString().padEnd(8);
      const valorUni = item.precoUnitario.toFixed(2).padEnd(10);
      const totalItem = item.subtotal.toFixed(2).padEnd(10);

      cupom += ` ${cod} ${qtd} ${valorUni} ${totalItem}\n`;
    });

    cupom += "----------------------------------------------\n";

    // --- RODAPÉ (Alinhado à Direita) ---
    const totalSemFrete = vendaRealizada.totalFinal - (parseFloat(frete) || 0);
    const descTotalStr = (parseFloat(descontoTotal) || 0).toFixed(2);
    const totalPagarStr = vendaRealizada.totalFinal.toString();

    cupom += `QUANT. DE PRODUTOS: ${vendaRealizada.itens.length}\n`;
    cupom += "----------------------------------------------\n";
    cupom += `${"PRODUTOS:".padStart(larguraTotal - 8)} ${totalSemFrete.toFixed(2).padStart(8)}\n`;
    cupom += `${"DESCONTO:".padStart(larguraTotal - 8)} ${descTotalStr.padStart(8)}\n`;
    cupom += `${"TOTAL A PAGAR:".padStart(larguraTotal - 8)} ${totalPagarStr.padStart(8)}\n`;
    cupom += "----------------------------------------------\n";

    // --- ASSINATURA ---
    cupom += "\n\n";
    cupom += "          ______________________            \n";
    cupom += "               ASSINATURA                  \n";
    cupom += "\n";

    // --- MENSAGEM FINAL ---
    cupom += "       * OBRIGADO VOLTE SEMPRE * \n";
    cupom += "\n\n\n"; // Espaço para corte

    // 4. Enviar para a impressora Bluetooth Escpos
    // console.log(cupom); // Para depuração no console do Metro
    await BluetoothEscposPrinter.printText(cupom, {});

  } catch (error) {
    console.error("Erro na impressão:", error);
    Alert.alert("Erro de Impressão", "Não foi possível imprimir o cupom. Verifique a conexão Bluetooth.");
  }
};

// --- COMO CHAMAR A IMPRESSÃO ---
// Você deve chamar essa função dentro da sua lógica de finalizar venda (ex: `GerarVenda`)
// após receber a confirmação de sucesso da API.

const handleFinalizarEImprimir = async () => {
  if (itens.length === 0) {
    Alert.alert("Erro", "Adicione itens antes de finalizar.");
    return;
  }

  // Primeiro, chama sua API para registrar a venda e obter o IDVenda
  try {
    // Exemplo genérico da chamada da sua API:
    // const response = await axios.post('http://192.168.1.243:3000/api/vendas/nova/venda', {
    //   CLIENTE: clienteSelecionado,
    //   ITENS: itens, // Envia todos os itens
    //   DESCONTO_TOTAL: descontoTotal,
    //   FRETE: frete
    // });

    // Se o backend retornou sucesso e o ID da venda...
    // const vendaRealizada = response.data; // Supondo que retorne { idVenda: 055129, cliente: {...}, itens: [...] }
    const vendaRealizada = { // Exemplo estático para teste
      idVenda: "055129",
      cliente: clienteSelecionado,
      itens: itens,
      totalFinal: parseFloat(totalFinal), // O estado `totalFinal` que calculamos no JSX
    };

    // Agora, disparamos a impressão
    Alert.alert("Sucesso", "Venda gerada! Imprimindo cupom...", [
      { text: "OK", onPress: () => formatarAndImprimirCupom(vendaRealizada) }
    ]);

  } catch (error) {
    console.error(error);
    Alert.alert("Erro", "Falha ao registrar a venda.");
  }
};

// --- No seu JSX, substitua o botão de finalizar ---
/*
<TouchableOpacity style={styles.btnFinalizar} onPress={GerarVenda}>
  <Ionicons name="checkmark-circle" size={24} color="#FFF" />
  <Text style={styles.btnFinalizarText}>FINALIZAR VENDA</Text>
</TouchableOpacity>
*/
// Por:
/*
<TouchableOpacity style={styles.btnFinalizar} onPress={handleFinalizarEImprimir}>
  <Ionicons name="checkmark-circle" size={24} color="#FFF" />
  <Text style={styles.btnFinalizarText}>FINALIZAR E IMPRIMIR</Text>
</TouchableOpacity>
*/
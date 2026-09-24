import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, Alert,
  TouchableOpacity, Modal, KeyboardAvoidingView,
  Platform, ActivityIndicator, SafeAreaView
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useVendedor } from '../../components/context/VendedorContext';

const API_BASE_URL = 'http://192.168.1.243:3000/api';

export default function NovoPedido({ navigation }) {
  // Estados de Cliente
  const [clienteNome, setClienteNome] = useState('');
  const [clienteCodigo, setClienteCodigo] = useState('');
  const [sugestoesClientes, setSugestoesClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [loadingClientes, setLoadingClientes] = useState(false);

  // Estados de Produto
  const [nomeProduto, setNomeProduto] = useState('');
  const [codigoProduto, setCodigoProduto] = useState('');
  const [sugestoesProdutos, setSugestoesProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [loadingProdutos, setLoadingProdutos] = useState(false);

  // Estados da Venda
  const [itens, setItens] = useState([]);
  const [quantidade, setQuantidade] = useState('1');
  const [desconto, setDesconto] = useState('0');
  const [observacao, setObservacao] = useState('');
  const [descontoTotal, setDescontoTotal] = useState('0');
  const [frete, setFrete] = useState('0');
  const [observacaoGeral, setObservacaoGeral] = useState('');

  // Estados de Câmera
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraActive, setCameraActive] = useState(false);
  const [scanned, setScanned] = useState(false);

  // Dados do vendedor
  const { vendedor, loading: loadingVendedor } = useVendedor();
  const [vendedorNome, setVendedorNome] = useState('');
  const [vendedorCodigo, setVendedorCodigo] = useState('');

  const quantidadeRef = useRef();

  const carregarDadosVendedor = async () => {
    try {
      if (vendedor) {
        setVendedorNome(vendedor.nome || '');
        setVendedorCodigo(vendedor.codigo || '');
      } else {
        const vendedorData = await AsyncStorage.getItem('vendedorLogado');
        if (vendedorData) {
          const vendedorObj = JSON.parse(vendedorData);
          setVendedorNome(vendedorObj.nome || '');
          setVendedorCodigo(vendedorObj.codigo || '');
        } else if (navigation) {
          Alert.alert(
            'Sessão expirada',
            'Por favor, faça login novamente.',
            [{ text: 'OK', onPress: () => navigation.replace('Login') }]
          );
        }
      }
    } catch (error) {
      console.error('Erro ao carregar vendedor:', error);
    }
  };

  useEffect(() => {
    carregarDadosVendedor();
  }, [vendedor]);

  // --- FUNÇÕES DE BUSCA DE CLIENTE ---
  const buscarClientesPorNome = async () => {
    if (!clienteNome.trim()) return;
    setLoadingClientes(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/clientes/seguro/buscar/nome?nome=${encodeURIComponent(clienteNome)}`);
      const data = response.data.data || response.data;
      setSugestoesClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert("Erro", "Falha ao buscar clientes por nome.");
    } finally {
      setLoadingClientes(false);
    }
  };

  const buscarClientePorCodigo = async () => {
    if (!clienteCodigo.trim()) return;
    setLoadingClientes(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/clientes/seguro/busca/organizada/codigo?codigo=${clienteCodigo}`);
      const data = response.data.data || response.data;
      setSugestoesClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert("Erro", "Código de cliente inválido ou erro de conexão.");
    } finally {
      setLoadingClientes(false);
    }
  };

  // --- FUNÇÕES DE BUSCA DE PRODUTO ---
  const buscarProdutosPorNome = async () => {
    if (!nomeProduto.trim()) return;
    setLoadingProdutos(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/produto/seguro/buscar/nome?nome=${encodeURIComponent(nomeProduto)}`);
      const data = response.data.data || response.data;
      setSugestoesProdutos(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert("Erro", "Falha ao buscar produtos.");
    } finally {
      setLoadingProdutos(false);
    }
  };

  const buscarProdutoPorCodigo = async (codigo = codigoProduto) => {
    if (!codigo.trim()) return;
    setLoadingProdutos(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/produto/busca/segura/estruturada/codigo?codigo=${codigo}`);
      const data = response.data.data?.[0] || response.data;
      
      if (data && (data.nome || data.NOME)) {
        selecionarProduto(data);
      } else {
        Alert.alert("Aviso", "Produto não encontrado.");
      }
    } catch (error) {
      Alert.alert("Erro", "Produto não encontrado para este código.");
    } finally {
      setLoadingProdutos(false);
    }
  };

  // --- SELEÇÃO ---
  const selecionarCliente = (cliente) => {
    setClienteSelecionado(cliente);
    setSugestoesClientes([]);
    setClienteNome('');
  };

  const selecionarProduto = (produto) => {
    setProdutoSelecionado(produto);
    setSugestoesProdutos([]);
    setNomeProduto('');
    setTimeout(() => quantidadeRef.current?.focus(), 100);
  };

  // --- LÓGICA DE ITENS ---
  const handleAdicionarItem = () => {
    if (!produtoSelecionado) return Alert.alert("Erro", "Selecione um produto.");
    const qtd = parseInt(quantidade);
    if (isNaN(qtd) || qtd <= 0) return Alert.alert("Erro", "Quantidade inválida.");

    const preco = produtoSelecionado.preco || produtoSelecionado.PRECO || 0;
    const descPerc = parseFloat(desconto) || 0;

    const novoItem = {
      id: Date.now().toString(),
      CODIGO: produtoSelecionado.CODIGO || produtoSelecionado.codigo || produtoSelecionado.id,
      PRODUTO: produtoSelecionado.NOME,
      QUANTIDADE: qtd,
      PRECOUNITARIO: preco,
      desconto: descPerc,
      subtotal: (preco * qtd) * (1 - descPerc / 100),
      observacao
    };

    setItens([...itens, novoItem]);
    setProdutoSelecionado(null);
    setQuantidade('1');
    setDesconto('0');
    setObservacao('');
  };

  // --- CÁLCULOS ---
  const subtotalItens = itens.reduce((acc, item) => acc + item.subtotal, 0);
  const valorDescontoGeral = subtotalItens * (parseFloat(descontoTotal) / 100 || 0);
  const totalFinal = (subtotalItens - valorDescontoGeral + (parseFloat(frete) || 0)).toFixed(2);

  // --- SCANNER ---
  const handleBarCodeScanned = ({ data }) => {
    if (!scanned) {
      setScanned(true);
      setCameraActive(false);
      buscarProdutoPorCodigo(data);
      setScanned(false);
    }
  };

  const abrirCamera = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        return Alert.alert("Permissão necessária", "É preciso conceder permissão de acesso à câmera.");
      }
    }
    setCameraActive(true);
  };

   // Função para gerar HTML do cupom
      const gerarCupomHTML = (dadosVenda) => {
          const dataHora = new Date().toLocaleString('pt-BR');
          
          let produtosHTML = '';
          dadosVenda.itens.forEach(item => {
              produtosHTML += `
                  <tr>
                      <td style="padding: 5px 0;">${item.nome.substring(0, 30)}</td>
                      <td style="text-align: center;">${item.quantidade}</td>
                      <td style="text-align: right;">R$ ${item.precoUnitario.toFixed(2)}</td>
                      <td style="text-align: right;">R$ ${item.subtotal.toFixed(2)}</td>
                  </tr>
              `;
          });
  
          return `
              <!DOCTYPE html>
              <html>
              <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                      * {
                          margin: 0;
                          padding: 0;
                          box-sizing: border-box;
                      }
                      body {
                          font-family: 'Courier New', monospace;
                          width: 300px;
                          margin: 0 auto;
                          padding: 20px 10px;
                          font-size: 12px;
                          background: white;
                      }
                      .header {
                          text-align: center;
                          margin-bottom: 15px;
                          border-bottom: 1px dashed #000;
                          padding-bottom: 10px;
                      }
                      .title {
                          font-size: 16px;
                          font-weight: bold;
                          margin-bottom: 5px;
                      }
                      .subtitle {
                          font-size: 11px;
                          margin-bottom: 3px;
                      }
                      .info {
                          margin: 10px 0;
                          line-height: 1.5;
                      }
                      .info-line {
                          margin-bottom: 3px;
                      }
                      table {
                          width: 100%;
                          border-collapse: collapse;
                          margin: 10px 0;
                      }
                      th, td {
                          text-align: left;
                          padding: 5px 0;
                      }
                      th {
                          border-bottom: 1px solid #000;
                          font-weight: bold;
                      }
                      .total {
                          border-top: 1px dashed #000;
                          margin-top: 10px;
                          padding-top: 10px;
                          text-align: right;
                      }
                      .total-line {
                          margin-bottom: 5px;
                      }
                      .total-value {
                          font-size: 14px;
                          font-weight: bold;
                          margin-top: 5px;
                      }
                      .footer {
                          text-align: center;
                          margin-top: 20px;
                          padding-top: 10px;
                          border-top: 1px dashed #000;
                      }
                      .divider {
                          border-top: 1px dashed #000;
                          margin: 10px 0;
                      }
                      .text-center {
                          text-align: center;
                      }
                      .bold {
                          font-weight: bold;
                      }
                  </style>
              </head>
              <body>
                  <div class="header">
                      <div class="title">VASOLANDIA PLANTAS & CIA</div>
                      <div class="subtitle">FONE: (19)3481-6299</div>
                      <div class="subtitle">CNPJ: 00.000.000/0001-00</div>
                      <div class="subtitle">SEM VALOR FISCAL</div>
                  </div>
                  
                  <div class="info">
                      <div class="info-line">DATA: ${dataHora}</div>
                      <div class="info-line">PEDIDO: ${String(dadosVenda.id).padStart(6, '0')}</div>
                      <div class="info-line">CONDIÇÃO: PAGAMENTO A VISTA</div>
                      <div class="info-line">VENDEDOR: ${vendedorNome || 'N/A'} (Cód: ${vendedorCodigo || 'N/A'})</div>
                      <div class="info-line">CLIENTE: ${dadosVenda.clienteNome}</div>
                  </div>
                  
                  <div class="divider"></div>
                  
                  <table>
                      <thead>
                          <tr>
                              <th>PRODUTO</th>
                              <th width="40">QTD</th>
                              <th width="60">VL</th>
                              <th width="70">TOTAL</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${produtosHTML}
                      </tbody>
                  </table>
                  
                  <div class="divider"></div>
                  
                  <div class="info">
                      <div class="info-line">QUANT. DE ITENS: ${dadosVenda.itens.length}</div>
                      <div class="info-line">TOTAL DE PRODUTOS: ${dadosVenda.itens.reduce((sum, item) => sum + item.quantidade, 0)}</div>
                  </div>
                  
                  <div class="divider"></div>
                  
                  <div class="total">
                      <div class="total-line">SUBTOTAL: R$ ${dadosVenda.total.toFixed(2)}</div>
                      <div class="total-line">DESCONTO: R$ 0.00</div>
                      <div class="total-value">TOTAL A PAGAR: R$ ${dadosVenda.total.toFixed(2)}</div>
                  </div>
                  
                  <div class="footer">
                      <div>______________________</div>
                      <div>ASSINATURA DO CLIENTE</div>
                      <div style="margin-top: 10px;">* OBRIGADO PELA PREFERÊNCIA *</div>
                      <div style="margin-top: 5px;">VOLTE SEMPRE!</div>
                  </div>
              </body>
              </html>
          `;
      };
  
      // Função de impressão
      const imprimirCupom = async (dadosVenda) => {
          try {
              setLoading(true);
              const htmlContent = gerarCupomHTML(dadosVenda);
              
              await Print.printAsync({
                  html: htmlContent,
              });
              
              return true;
          } catch (error) {
              console.error("Erro na impressão:", error);
              Alert.alert("Erro", "Falha ao imprimir: " + error.message);
              return false;
          } finally {
              setLoading(false);
          }
      };
  
    const finalizarVendaCompleta = async () => {
        console.log("Finalizando venda com os seguintes dados:", { clienteSelecionado, itens, totalFinal, vendedorCodigo, vendedorNome });
  if (!clienteSelecionado) {
    Alert.alert("Aviso", "Por favor, selecione um cliente.");
    return;
  }
  
  if (itens.length === 0) {
    Alert.alert("Aviso", "Adicione pelo menos um produto à venda.");
    return;
  }
  
  if (!vendedorCodigo) {
    Alert.alert("Erro", "Vendedor não identificado. Faça login novamente.");
    navigation.replace('Login');
    return;
  }

  //setLoadingVenda(true); // FIX: Usando o estado correto de loading
  try {
    const valorTotalNum = parseFloat(totalFinal); // FIX: Convertendo totalFinal para número

    const payload = {
        VALOR: totalFinal,
        CODIGO: clienteSelecionado.CODIGO || clienteSelecionado.id,
        NOME:clienteSelecionado.NOME || clienteSelecionado.nome,
       // DATA_PAGO: new Date().toLocaleString('pt-BR'),
       // VENCIMENTO: new Date().toLocaleString('pt-BR'),
        PAGO: 'N',
        VENDEDOR: vendedorCodigo,
        GASTO: 0,
        LUCRO: 0,
        ADIANTADO: 0,
        NOTA: 'N',       
        PRODUTOS: itens,
        CANCELADO: null,
        CUPOM: null,
        NNOTA: 'N',
        NOME_TERMINAL: "APP ANDROID",
        OBSERVACAO: observacaoGeral,
    };

    console.log('Enviando venda:', payload);

    const response = await axios.post(`${API_BASE_URL}/pedidos/novo/pedido`, payload);
    console.log('Resposta da API:', response.status);

    if (response.status === 200) {
      const dadosParaCupom = {
        valor: valorTotalNum,
        codigo: clienteSelecionado.CODIGO || clienteSelecionado.id,
        nome:clienteSelecionado.NOME || clienteSelecionado.nome,
        data_pago: new Date().toLocaleString('pt-BR'),        
        pago: 'N',
        vendedor: vendedorCodigo,
        gasto: 0,
        lucro: 0,
        adiantado: 0,
        nota: 'N',
        condicao: 1,
        produtos: itens,
        cancelado: null,
        cupom: null,
        nnota: 'N',
        nome_terminal: "APP ANDROID",
        observacao: observacaoGeral,
      };
      console.log('Dados para cupom:', dadosParaCupom);

      const impresso = await imprimirCupom(dadosParaCupom);

      if (impresso) {
        Alert.alert(
          "Sucesso!", 
          `Venda finalizada com sucesso!\nVendedor: ${vendedorNome}\nTotal: R$ ${valorTotalNum.toFixed(2)}`,
          [
            { 
              text: "OK", 
              onPress: () => {
                setItens([]);
                setClienteSelecionado(null);
                setClienteNome('');
                setFrete('0');
                setDescontoTotal('0');
              }
            }
          ]
        );
      } else {
        Alert.alert("Aviso", "Venda salva, mas houve falha na impressão.");
      }
    }
  } catch (error) {
    console.error("Erro ao finalizar venda:", error);
    Alert.alert("Erro", "Erro ao salvar venda. Tente novamente.");
  } finally {
    setLoadingVenda(false);
  }
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
          
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Nova Venda</Text>
            <Text style={styles.totalText}>Total: R$ {totalFinal}</Text>
          </View>

          {/* SEÇÃO CLIENTE */}
          <View style={styles.section}>
            {/* Ícone ASCII: 👤 */}
            <Text style={styles.sectionTitle}>👤 Cliente</Text>
            
            {clienteSelecionado ? (
              <View style={styles.cardSelecionado}>
                <View>
                  <Text style={styles.nomeSelecionado}>{clienteSelecionado.NOME || clienteSelecionado.nome}</Text>
                  <Text>Cód: {clienteSelecionado.CODIGO || clienteSelecionado.id}</Text>
                </View>
                <TouchableOpacity onPress={() => setClienteSelecionado(null)}>
                  <Text style={styles.btnAlterar}>Alterar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={styles.rowSearch}>
                  <TextInput
                    style={styles.inputFlex}
                    placeholder="Nome do cliente..."
                    value={clienteNome}
                    onChangeText={setClienteNome}
                  />
                  <TouchableOpacity style={styles.btnSearch} onPress={buscarClientesPorNome}>
                    {/* Ícone ASCII: 🔍 */}
                    {loadingClientes ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnIconAscii}>🔍</Text>}
                  </TouchableOpacity>
                </View>

                {sugestoesClientes.map((item) => (
                  <TouchableOpacity key={item.id || item.CODIGO} style={styles.itemSugestao} onPress={() => selecionarCliente(item)}>
                    <Text>{item.NOME || item.nome}</Text>
                  </TouchableOpacity>
                ))}

                <View style={[styles.rowSearch, { marginTop: 10 }]}>
                  <TextInput
                    style={styles.inputFlex}
                    placeholder="Código do cliente..."
                    keyboardType="numeric"
                    value={clienteCodigo}
                    onChangeText={setClienteCodigo}
                    onSubmitEditing={buscarClientePorCodigo}
                  />
                  <TouchableOpacity style={styles.btnSearch} onPress={buscarClientePorCodigo}>
                    <Text style={{color: '#fff', fontWeight: 'bold'}}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* SEÇÃO PRODUTO */}
          <View style={styles.section}>
            {/* Ícone ASCII: 📦 */}
            <Text style={styles.sectionTitle}>📦 Produto</Text>
            
            {produtoSelecionado ? (
              <View style={styles.cardSelecionado}>
                <View style={{flex: 1}}>
                  <Text style={styles.nomeSelecionado}>{produtoSelecionado.nome || produtoSelecionado.NOME}</Text>
                  <Text>R$ {(produtoSelecionado.preco || produtoSelecionado.PRECO)?.toFixed(2)}</Text>
                </View>
                <TouchableOpacity onPress={() => setProdutoSelecionado(null)}>
                  <Text style={styles.btnAlterar}>Trocar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={styles.rowSearch}>
                  <TextInput
                    style={styles.inputFlex}
                    placeholder="Nome do produto..."
                    value={nomeProduto}
                    onChangeText={setNomeProduto}
                  />
                  <TouchableOpacity style={styles.btnSearch} onPress={buscarProdutosPorNome}>
                    {/* Ícone ASCII: 🔍 */}
                    {loadingProdutos ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnIconAscii}>🔍</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btnSearch, {backgroundColor: '#555'}]} onPress={abrirCamera}>
                    {/* Ícone ASCII: 📷 */}
                    <Text style={styles.btnIconAscii}>📷</Text>
                  </TouchableOpacity>
                </View>

                {sugestoesProdutos.map((item) => (
                  <TouchableOpacity key={item.codigo || item.id} style={styles.itemSugestao} onPress={() => selecionarProduto(item)}>
                    <Text>{item.nome || item.NOME} - R$ {item.preco || item.PRECO}</Text>
                  </TouchableOpacity>
                ))}

                <View style={[styles.rowSearch, { marginTop: 10 }]}>
                  <TextInput
                    style={styles.inputFlex}
                    placeholder="Código de barras..."
                    value={codigoProduto}
                    onChangeText={setCodigoProduto}
                    onSubmitEditing={() => buscarProdutoPorCodigo()}
                  />
                  <TouchableOpacity style={styles.btnSearch} onPress={() => buscarProdutoPorCodigo()}>
                    <Text style={{color: '#fff', fontWeight: 'bold'}}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {produtoSelecionado && (
              <View style={{marginTop: 15}}>
                <View style={styles.row}>
                  <View style={{flex: 1, marginRight: 10}}>
                    <Text>Qtd</Text>
                    <TextInput ref={quantidadeRef} style={styles.input} keyboardType="numeric" value={quantidade} onChangeText={setQuantidade}/>
                  </View>
                  <View style={{flex: 1}}>
                    <Text>Desc %</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={desconto} onChangeText={setDesconto}/>
                  </View>
                </View>
                <TouchableOpacity style={styles.btnAdd} onPress={handleAdicionarItem}>
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>+ ADICIONAR ITEM</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* LISTA DE ITENS */}
          {itens.map((item) => (
            <View key={item.id} style={styles.itemVenda}>
              <Text style={{fontWeight: 'bold'}}>{item.produto.nome || item.produto.NOME}</Text>
              <Text>{item.quantidade}x R$ {item.precoUnitario.toFixed(2)} | Sub: R$ {item.subtotal.toFixed(2)}</Text>
            </View>
          ))}

          {/* RODAPÉ E FINALIZAÇÃO */}
          {itens.length > 0 && (
            <View style={styles.section}>
               <Text>Frete R$</Text>
               <TextInput style={styles.input} keyboardType="numeric" value={frete} onChangeText={setFrete}/>
               <TouchableOpacity style={styles.btnFinalizar} onPress={finalizarVendaCompleta}>
                  <Text style={styles.btnFinalizarText}>FINALIZAR VENDA</Text>
               </TouchableOpacity>
            </View>
          )}

          <View style={{height: 100}} />
        </ScrollView>

        {/* MODAL CÂMERA */}
        <Modal visible={cameraActive} animationType="slide">
          <View style={{ flex: 1, backgroundColor: '#000' }}>
            <CameraView 
              style={StyleSheet.absoluteFillObject} 
              onBarcodeScanned={handleBarCodeScanned}
              facing="back"
            />
            <View style={styles.cameraOverlay} pointerEvents="box-none">
              <TouchableOpacity style={styles.btnCloseCamera} onPress={() => setCameraActive(false)}>
                {/* Ícone ASCII: ✖ (Fechar) */}
                <Text style={styles.asciiCloseText}>✖</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  container: { flex: 1, padding: 10 },
  header: { backgroundColor: '#2D5A3D', padding: 20, borderRadius: 10, marginBottom: 15 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  totalText: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 5 },
  section: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
  sectionTitle: { fontWeight: 'bold', color: '#2D5A3D', marginBottom: 10, fontSize: 16 },
  rowSearch: { flexDirection: 'row', alignItems: 'center' },
  inputFlex: { flex: 1, borderBottomWidth: 1, borderColor: '#ccc', padding: 8 },
  btnSearch: { backgroundColor: '#2D5A3D', padding: 10, borderRadius: 5, marginLeft: 5, justifyContent: 'center', alignItems: 'center' },
  btnIconAscii: { color: '#fff', fontSize: 16 },
  itemSugestao: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  cardSelecionado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e8f5e9', padding: 10, borderRadius: 5 },
  nomeSelecionado: { fontWeight: 'bold', color: '#2D5A3D' },
  btnAlterar: { color: 'red', fontWeight: 'bold' },
  row: { flexDirection: 'row' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginTop: 5 },
  btnAdd: { backgroundColor: '#2D5A3D', padding: 15, borderRadius: 5, marginTop: 15, alignItems: 'center' },
  itemVenda: { backgroundColor: '#fff', padding: 10, borderLeftWidth: 5, borderLeftColor: '#2D5A3D', marginBottom: 5 },
  btnFinalizar: { backgroundColor: '#2D5A3D', padding: 20, borderRadius: 10, marginTop: 20, alignItems: 'center' },
  btnFinalizarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  cameraOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-start', alignItems: 'flex-end', padding: 20 },
  btnCloseCamera: { marginTop: 30, marginRight: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  asciiCloseText: { color: '#fff', fontSize: 22, fontWeight: 'bold' }
});
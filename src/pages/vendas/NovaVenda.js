import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, Alert,
  FlatList, TouchableOpacity, Modal, KeyboardAvoidingView,
  Platform, ActivityIndicator, Dimensions, SafeAreaView
} from 'react-native';
import { CameraView, Camera, useCameraPermissions } from 'expo-camera';
import { FontAwesome5, MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://54.232.216.121:3000/api';

export default function NovaVenda() {
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
  const [flash, setFlash] = useState("off");

  const quantidadeRef = useRef();

  // --- FUNÇÕES DE BUSCA DE CLIENTE ---
  const buscarClientesPorNome = async () => {
    if (!clienteNome.trim()) return;
    setLoadingClientes(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/clientes/seguro/buscar/nome?nome=${encodeURIComponent(clienteNome)}`);
      const data = response.data.data || response.data;
      setSugestoesClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao buscar clientes por nome.");
    } finally {
      setLoadingClientes(false);
    }
  };

  const buscarClientePorCodigo = async () => {
    if (!clienteCodigo.trim()) return;
    setLoadingClientes(true);
    try {
      // Ajuste o endpoint conforme sua API real
      const response = await axios.get(`${API_BASE_URL}/clientes/seguro/codigo?codigo=${clienteCodigo}`);
      const data = response.data.data || response.data;
      
      if (data && (data.NOME || data.nome)) {
        selecionarCliente(data);
        setClienteCodigo('');
      } else {
        Alert.alert("Aviso", "Cliente não encontrado.");
      }
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
      const data = response.data.data[0] || response.data;
      console.log(data);
      
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
      produto: produtoSelecionado,
      quantidade: qtd,
      precoUnitario: preco,
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
            <Text style={styles.sectionTitle}><Ionicons name="person" size={18}/> Cliente</Text>
            
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
                    {loadingClientes ? <ActivityIndicator color="#fff"/> : <Feather name="search" size={20} color="#fff"/>}
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
                    <Text style={{color: '#fff'}}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* SEÇÃO PRODUTO */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}><MaterialIcons name="inventory" size={18}/> Produto</Text>
            
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
                    <Feather name="search" size={20} color="#fff"/>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btnSearch, {backgroundColor: '#555'}]} onPress={() => setCameraActive(true)}>
                    <MaterialIcons name="qr-code-scanner" size={20} color="#fff"/>
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
                    <Text style={{color: '#fff'}}>OK</Text>
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
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>ADICIONAR ITEM</Text>
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
               <TouchableOpacity style={styles.btnFinalizar} onPress={() => Alert.alert("Sucesso", "Venda Gerada!")}>
                  <Text style={styles.btnFinalizarText}>FINALIZAR VENDA</Text>
               </TouchableOpacity>
            </View>
          )}

          <View style={{height: 100}} />
        </ScrollView>

        {/* MODAL CAMERA */}
        <Modal visible={cameraActive} animationType="slide">
          <CameraView 
            style={StyleSheet.absoluteFill} 
            onBarcodeScanned={handleBarCodeScanned}
            facing="back"
          >
            <TouchableOpacity style={styles.btnCloseCamera} onPress={() => setCameraActive(false)}>
              <Ionicons name="close-circle" size={40} color="#fff" />
            </TouchableOpacity>
          </CameraView>
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
  btnSearch: { backgroundColor: '#2D5A3D', padding: 10, borderRadius: 5, marginLeft: 5 },
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
  btnCloseCamera: { position: 'absolute', top: 50, right: 20 }
});
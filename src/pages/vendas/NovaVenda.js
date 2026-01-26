import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  FlatList,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { CameraView, Camera, useCameraPermissions } from 'expo-camera';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import axios from 'axios';
import { debounce } from 'lodash';
import { Button } from '@react-navigation/elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GerarVenda from './GerarVenda';

export default function NovaVenda() {
  const codigoVendedor = AsyncStorage.getItem ('codigoVendedor');
  let API_URL = 'http://192.168.1.243:3000/api/';
  // Estados para Cliente  
  const [buscaCliente, setBuscaCliente] = useState('');
  const [sugestoesClientes, setSugestoesClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [modalClienteVisible, setModalClienteVisible] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [clienteNome, setClienteNome] = useState('');
  const [clienteCodigo, setClienteCodigo] = useState('');
  // permissao para camera
  const [permission, requestPermission] = useCameraPermissions();

  // Estados para Produto
  const [codigoProduto, setCodigoProduto] = useState('');
  const [buscaProduto, setBuscaProduto] = useState('');
  const [sugestoesProdutos, setSugestoesProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [nomeProduto, setNomeProduto] = useState('');

  // Estados da Venda
  const [quantidade, setQuantidade] = useState('1');
  const [desconto, setDesconto] = useState('0');
  const [observacao, setObservacao] = useState('');
  const [itens, setItens] = useState([]);

  // Estados da Câmera
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [flash, setFlash] = useState("off");

  // Referências
  const quantidadeRef = useRef();
  const buscaClienteRef = useRef();
  const buscaProdutoRef = useRef();
  // Estados gerais da venda
const [descontoTotal, setDescontoTotal] = useState('0'); // %
const [frete, setFrete] = useState('0'); // R$
const [observacaoGeral, setObservacaoGeral] = useState('');


  // Debounced search functions/*
  const buscarClientesDebounced = useCallback(
    debounce(async (termo) => {
      if (!termo || termo.length < 2) {
        setSugestoesClientes([]);
        return;
      }

      setLoadingClientes(true);
      try {
        const response = await axios.get(`http://192.168.1.243:3000/api/clientes/seguro/buscar/nome?nome=${encodeURIComponent(clienteNome)}`)
        setSugestoesClientes(response.data.data || []);
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        setSugestoesClientes([]);
      } finally {
        setLoadingClientes(false);
      }
    }, 300),
    []
  );
  const calcularSubtotalItens = () => {
  return itens.reduce((total, item) => total + item.subtotal, 0);
};

const calcularDescontoGeral = () => {
  const subtotal = calcularSubtotalItens();
  const desconto = parseFloat(descontoTotal) || 0;
  return subtotal * (desconto / 100);
};

const calcularTotalFinal = () => {
  const subtotal = calcularSubtotalItens();
  const descontoGeral = calcularDescontoGeral();
  const valorFrete = parseFloat(frete) || 0;

  return (subtotal - descontoGeral + valorFrete).toFixed(2);
};


  const buscarProdutosDebounced = useCallback(
    debounce(async (termo) => {
      if (!termo || termo.length < 2) {
        setSugestoesProdutos([]);
        return;
      }

      setLoadingProdutos(true);
      try {
        const response = await axios.get(`http://192.168.1.243:3000/api/produto/seguro/buscar/nome?nome=${encodeURIComponent(nomeProduto)}` );
      /*  const response = await fetch(`http://192.168.1.14:3000/api/produto/seguro/buscar/nome?=${encodeURIComponent(buscaProduto)}`);*/
        setSugestoesProdutos(response.data.data || []);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        setSugestoesProdutos([]);
      } finally {
        setLoadingProdutos(false);
      }
    }, 300),
    []
  );

function buscarProdutoCodigo(){
  axios.get(`http://192.168.1.243:3000/api/produto/${codigoProduto}`)
  .then(response => {
    setProdutoSelecionado(response.data.data);
  })
  .catch(error => {
    console.error('Erro ao buscar produto:', error);
  })
}

  // Efeitos para busca/*
  /*
  useEffect(() => {
    buscarClientesDebounced(buscaCliente);
  }, [buscaCliente, buscarClientesDebounced]);

  useEffect(() => {
    buscarProdutosDebounced(nomeProduto);
  }, [nomeProduto, buscarProdutosDebounced]);*/

  function buscarProdutoCodigo() {
    axios.get(`http://192.168.1.243:3000/api/produto/${codigoProduto}`)
      .then(response => {
        setProdutoSelecionado(response.data.data);
      })
      .catch(error => {
        console.error('Erro ao buscar produto:', error);
      });
  }
  function buscarProdutoNome() {
    axios.get(`${API_URL}produto/seguro/buscar/nome?nome=${encodeURIComponent(nomeProduto)}`)
      .then(response => {
        setSugestoesProdutos(response.data.data);
      })
      .catch(error => {
        console.error('Erro ao buscar produto:', error);
      });
  }
  function buscarClientesNome() {
    axios.get(`http://192.168.1.243:3000/api/clientes/seguro/buscar/nome?nome=${clienteNome}`)
      .then(response => {
        setSugestoesClientes(response.data.data);
      })
      .catch(error => {
        console.error('Erro ao buscar clientes:', error);
      });
  }

  function bucarClienteCodigo(){
    axios.get(`http://localhost:3000/api/produto/busca/segura/estruturada/codigo?codigo=${clienteCodigo}`)
    .then(response => {
      setClienteSelecionado(response.data.data);
    })
    .catch(error => {
      console.error('Erro ao buscar clientes:', error);
    });
  }

  // Timer da câmera
  useEffect(() => {
    if (cameraActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0) {
      setCameraActive(false);
    }
  }, [timeLeft, cameraActive]);

  // Selecionar cliente
  const selecionarCliente = (cliente) => {
    setClienteSelecionado(cliente);
    setBuscaCliente('');
    setSugestoesClientes([]);
    Alert.alert('Cliente Selecionado', `${cliente.NOME}\n${cliente.cpf || ''}`);
  };

  const finalizarVenda = () => {
   // alert('Venda finalizada com sucesso!');
    axios.post('http://192.168.1.243:3000/api/vendas/nova/venda', {
      CLIENTE: clienteSelecionado,
      PRODUTO: produtoSelecionado,
      QUANTIDADE: quantidade
    })
  }

  // Selecionar produto
  const selecionarProduto = (produto) => {
    setProdutoSelecionado(produto);
    setCodigoProduto(produto.codigo);
    setBuscaProduto('');
    setSugestoesProdutos([]);
    quantidadeRef.current?.focus();
  };

  // Buscar por código (fallback)
  const buscarPorCodigo = async (codigo, tipo) => {
    if (!codigo.trim()) return;

    try {
      if (tipo === 'cliente') {
      /*  const response = await axios.get(`http://192.168.1.14:3000/api/clientes/seguro/busca/organizada/codigo?codigo=${clienteCodigo}`);*/
      const response = await fetch(`http://192.168.1.243:3000/api/clientes/seguro/busca/organizada/codigo?codigo=${codigo}`);
        if (response.data.data) {
          selecionarCliente(response.data.data);
        }
      } else {
        const response = await axios.get(`http://192.168.1.243:3000/api/produto/${codigo}`);
        if (response.data.data) {
          selecionarProduto(response.data.data);
        }
      }
    } catch (error) {
      Alert.alert('Erro', `${tipo === 'cliente' ? 'Cliente' : 'Produto'} não encontrado`);
    }
  };

 /* const LocalizarClientePorNome =() =>{
    try {
     const response = axios.get(`${API_URL}/nome?nome=${encodeURIComponent(clienteNome)}`);
 
     if (response.data && response.data.data) {
       setCliente(response.data.data);
       setClienteNome(response.data.data.NOME);
       
     }
    } catch (error) {
     console.log(error);
    }
 } */

 const LocalizarProdutoNome =() =>{
  try {
   const response = axios.get(`${API_URL}/nome?nome=${encodeURIComponent(nomeProduto)}`);
 
   if (response.data && response.data.data) {
     setProduto(response.data.data);
    //setNomeProduto(response.data.data.NOME);
     
   }
  } catch (error) {
   console.log(error);
  }
 }

 function GerarVenda(){
  axios.post('http://192.168.1.243:3000/api/vendas/nova/venda', {
    CLIENTE: clienteSelecionado,
    PRODUTO: produtoSelecionado,
    QUANTIDADE: quantidade
  })
 }

  // Scanner de código de barras
  const askForCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    if (status === 'granted') {
      setCameraActive(true);
      setScanned(false);
      setTimeLeft(15);
    }
  };

  const handleBarCodeScanned = ({ data }) => {
    if (!scanned) {
      setScanned(true);
      setCodigoProduto(data);
      buscarPorCodigo(data, 'produto');
      setCameraActive(false);
    }
    else {
      setCodigoProduto(data);
    }
  };

  const toggleFlash = () => {
    setFlash(flash === 'off' ? 'torch' : 'off');
  };

  // Adicionar item à venda
  const handleAdicionar = () => {
    if (!produtoSelecionado) {
      Alert.alert('Erro', 'Selecione um produto primeiro');
      return;
    }

    if (!quantidade || parseInt(quantidade) <= 0) {
      Alert.alert('Erro', 'Informe uma quantidade válida');
      return;
    }

    const novoItem = {
      id: Date.now().toString(),
      produto: produtoSelecionado,
      quantidade: parseInt(quantidade),
      desconto: parseFloat(desconto) || 0,
      observacao,
      precoUnitario: produtoSelecionado.preco,
      subtotal: (produtoSelecionado.preco * parseInt(quantidade)) * (1 - (parseFloat(desconto) || 0) / 100)
    };

    setItens([...itens, novoItem]);
    setProdutoSelecionado(null);
    setCodigoProduto('');
    setBuscaProduto('');
    setQuantidade('1');
    setDesconto('0');
    setObservacao('');
  };

  // Remover item
  const handleRemover = (id) => {
   setItens(prevItens => prevItens.filter(item => item.id !== id));
  };

  // Alterar quantidade
const handleAlterarQuantidade = (id, novaQtd) => {
  setItens(prevItens =>
    prevItens.map(item => {
      if (item.id === id) {
        const qtd = parseInt(novaQtd) || 0;
        return {
          ...item,
          quantidade: qtd,
          subtotal:
            item.precoUnitario *
            qtd *
            (1 - item.desconto / 100),
        };
      }
      return item;
    })
  );
};



  // Calcular total
  const calcularTotal = () => {
    return itens.reduce((total, item) => total + item.subtotal, 0).toFixed(2);
  };

  // Render item cliente
  const renderClienteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.sugestaoItem}
      onPress={() => selecionarCliente(item)}
    >
      <View style={styles.sugestaoIcon}>
        <Ionicons name="person" size={20} color="#2D5A3D" />
      </View>
      <View style={styles.sugestaoInfo}>
        <Text style={styles.sugestaoNome}>{item.NOME}</Text>
        <Text style={styles.sugestaoDetalhes}>
          {item.cpf ? `CPF: ${formatarCPF(item.cpf)}` : ''}
          {item.cpf && item.telefone ? ' • ' : ''}
          {item.telefone ? `Tel: ${item.telefone}` : ''}
        </Text>
        <Text style={styles.sugestaoCodigo}>Cód: {item.CODIGO}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#999" />
    </TouchableOpacity>
  );

  // Render item produto
  const renderProdutoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.sugestaoItem}
      onPress={() => selecionarProduto(item)}
    >
      <View style={styles.sugestaoIcon}>
        <MaterialIcons name="inventory" size={20} color="#2196F3" />
      </View>
      <View style={styles.sugestaoInfo}>
        <Text style={styles.sugestaoNome}>{item.nome}</Text>
        <Text style={styles.sugestaoDetalhes}>
          Cód: {item.codigo} • Estoque: {item.estoque || 0}
        </Text>
        <Text style={styles.sugestaoPreco}>R$ {item.preco?.toFixed(2)}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#999" />
    </TouchableOpacity>
  );

  // Formatadores
  const formatarCPF = (cpf) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <SafeAreaView style={{flex: 1, marginBottom: 50}}>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Nova Venda</Text>
          {itens.length > 0 && (
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total: R$ {calcularTotal()}</Text>
              <Text style={styles.itemCount}>{itens.length} ite{itens.length === 1 ? 'm' : 'ns'}</Text>
            </View>
          )}
        </View>

        {/* Seção Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="person" size={20} color="#2D5A3D" /> Cliente
          </Text>
          
          {clienteSelecionado ? (
            <View style={styles.selecionadoCard}>
              <View style={styles.selecionadoInfo}>
                <Text style={styles.selecionadoNome}>{clienteSelecionado.NOME}</Text>
                <View style={styles.selecionadoDetalhes}>
                  {clienteSelecionado.cpf && (
                    <Text style={styles.selecionadoCPF}>{formatarCPF(clienteSelecionado.cpf)}</Text>
                  )}
                  <Text style={styles.selecionadoCodigo}>Cód: {clienteSelecionado.CODIGO}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.btnAlterar}
                onPress={() => setClienteSelecionado(null)}
              >
                <Text style={styles.btnAlterarText}>Alterar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.buscaContainer}>
                <View style={styles.inputWrapper}>
                  <Feather name="search" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    ref={buscaClienteRef}
                    style={styles.inputWithIcon}
                    placeholder="Digite nome do cliente"
                    value={clienteNome}
                    onChangeText={setClienteNome}
                    autoCapitalize="words"
                  />{/* <Button
                    title="Buscar"
                    backgroundColor="#2D5A3D"
                    onPress={buscarClientesNome}
                    color="#030e07ff"
                    style={styles.buscarButton}
                  />*/}
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#2D5A3D',
                      borderRadius: 8,
                      padding: 10,
                      marginLeft: 10,
                    }}
                    onPress={buscarClientesNome}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Buscar</Text>
                  </TouchableOpacity>            
                  {loadingClientes && (
                    <ActivityIndicator size="small" color="#2D5A3D" style={styles.inputLoading} />
                  )}
                </View>
                
                {/* Sugestões de Clientes */}
                {sugestoesClientes.length > 0 && (
                 
                       <View style={styles.sugestoesContainer}>
                  
                    <FlatList
                      data={sugestoesClientes}
                      keyExtractor={(item) => item.id?.toString() || item.codigo}
                      renderItem={renderClienteItem}
                      scrollEnabled={true}
                      nestedScrollEnabled={true}
                    />
                    
                   
                  </View>

                

                
                )}
                
                {buscaCliente && sugestoesClientes.length === 0 && !loadingClientes && (
                  <View style={styles.semResultados}>
                    <Text style={styles.semResultadosText}>
                      Nenhum cliente encontrado para "{buscaCliente}"
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.buscaAlternativa}>
                <Text style={styles.buscaAlternativaLabel}>Ou busque por código:</Text>
                <View style={styles.codigoContainer}>
                  <TextInput
                    style={[styles.input, styles.codigoInput]}
                    placeholder="Código do cliente"
                    keyboardType="numeric"
                    value={clienteCodigo}
                    onChangeText={setClienteCodigo }
                    onSubmitEditing={() => buscarPorCodigo(clienteCodigo, 'cliente')}
                  />
                  <TouchableOpacity
                    style={styles.btnBuscarCodigo}
                    onPress={() => buscarPorCodigo(clienteCodigo, 'cliente')}
                  >
                    <Text style={styles.btnBuscarCodigoText}>Buscar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Seção Produto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MaterialIcons name="shopping-cart" size={20} color="#2D5A3D" /> Produto
          </Text>

          {produtoSelecionado ? (
            <View style={styles.selecionadoCard}>
              <View style={styles.selecionadoInfo}>
                <Text style={styles.selecionadoNome}>{produtoSelecionado.nome}</Text>
                <View style={styles.selecionadoDetalhes}>
                  <Text style={styles.selecionadoPreco}>R$ {produtoSelecionado.preco?.toFixed(2)}</Text>
                  <Text style={styles.selecionadoEstoque}>
                    Estoque: {produtoSelecionado.estoque || 0}
                  </Text>
                </View>
                <Text style={styles.selecionadoCodigo}>Cód: {produtoSelecionado.codigo}</Text>
              </View>
              <TouchableOpacity
                style={styles.btnAlterar}
                onPress={() => setProdutoSelecionado(null)}
              >
                <Text style={styles.btnAlterarText}>Alterar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.buscaContainer}>
                <View style={styles.codigoBarrasContainer}>
                  <View style={styles.inputWrapper}>
                    <Feather name="search" size={20} color="#999" style={styles.inputIcon} />
                    <TextInput
                      ref={buscaProdutoRef}
                      style={[styles.inputWithIcon, styles.inputFlex]}
                      placeholder="Digite nome ou código do produto"
                      value={nomeProduto}
                      onChangeText={setNomeProduto}
                      autoCapitalize="none"
                    />
                    {/* <Button
                      title="Buscar"
                      backgroundColor="#2D5A3D"
                      onPress={buscarProdutoNome}
                      color="#030e07ff"
                      style={styles.buscarButton}
                    />*/}
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#2D5A3D',
                      borderRadius: 8,
                      padding: 10,
                      marginLeft: 10,
                    }}
                    onPress={buscarProdutoNome}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Buscar</Text>
                  </TouchableOpacity>
                  
                    {loadingProdutos && (
                      <ActivityIndicator size="small" color="#2D5A3D" style={styles.inputLoading} />
                    )}
                  </View>
                  
                  <TouchableOpacity
                    style={styles.btnScanner}
                    onPress={askForCameraPermission}
                  >
                    <MaterialIcons name="qr-code-scanner" size={24} color="#2D5A3D" />
                  </TouchableOpacity>
                </View>

                {/* Sugestões de Produtos */}
                {sugestoesProdutos.length > 0 && (
                  <View style={styles.sugestoesContainer}>
                    <FlatList
                      data={sugestoesProdutos}
                      keyExtractor={(item) => item.id?.toString() || item.codigo}
                      renderItem={renderProdutoItem}
                      scrollEnabled={true}
                      nestedScrollEnabled={true}
                    />
                  </View>
                )}
                
                {nomeProduto && sugestoesProdutos.length === 0 && !loadingProdutos && (
                  <View style={styles.semResultados}>
                    <Text style={styles.semResultadosText}>
                      Nenhum produto encontrado para "{nomeProduto}"
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>

        {/* Campos de detalhes do item */}
        {produtoSelecionado && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalhes do Item</Text>
            
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Quantidade</Text>
                <TextInput
                  ref={quantidadeRef}
                  style={styles.input}
                  placeholder="Qtd"
                  keyboardType="numeric"
                  value={quantidade}
                  onChangeText={setQuantidade}
                />
              </View>
              
              <View style={styles.col}>
                <Text style={styles.label}>Desconto %</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={desconto}
                  onChangeText={setDesconto}
                />
              </View>
            </View>

            <Text style={styles.label}>Observação</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Observações do item"
              value={observacao}
              onChangeText={setObservacao}
              multiline
              numberOfLines={2}
            />

            <TouchableOpacity
              style={styles.btnAdicionar}
              onPress={handleAdicionar}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFF" />
              <Text style={styles.btnAdicionarText}>Adicionar à Venda</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Scanner Modal */}
        {cameraActive && hasPermission && (
          <Modal
            animationType="slide"
            transparent={false}
            visible={cameraActive}
            onRequestClose={() => setCameraActive(false)}
          >
            <View style={styles.cameraContainer}>
              <View style={styles.cameraHeader}>
                <Text style={styles.cameraTitle}>Escaneie o código</Text>
                <Text style={styles.cameraTimer}>Fechando em {timeLeft}s</Text>
              </View>
              
              <CameraView
                style={styles.scanner}
                facing="back"
                flash={flash}
                onBarcodeScanned={handleBarCodeScanned}
              />
              
              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.cameraBtn} onPress={toggleFlash}>
                  <Ionicons 
                    name={flash === 'off' ? 'flash-outline' : 'flash'} 
                    size={28} 
                    color="#FFF" 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.cameraBtn, styles.cameraBtnClose]} 
                  onPress={() => setCameraActive(false)}
                >
                  <Ionicons name="close-circle" size={28} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* Lista de Itens */}
        {itens.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Itens da Venda</Text>
              <Text style={styles.itemCount}>{itens.length}</Text>
            </View>
            <FlatList
  data={itens}
  keyExtractor={item => item.id}
  scrollEnabled={false}
  renderItem={({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemProduto} numberOfLines={1}>
          {item.produto.nome}
        </Text>

        {/* ✅ PASSANDO item.id */}
        <TouchableOpacity onPress={() => handleRemover(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <View style={styles.itemDetalhes}>
        <View style={styles.itemQuantidade}>
          <Text style={styles.itemLabel}>Qtd:</Text>
          <TextInput
            style={styles.qtdInput}
            keyboardType="numeric"
            value={item.quantidade.toString()}
            onChangeText={text =>
              handleAlterarQuantidade(item.id, text)
            }
          />
        </View>

        <View style={styles.itemValores}>
          <Text style={styles.itemPreco}>
            R$ {item.precoUnitario.toFixed(2)} uni
          </Text>
          <Text style={styles.itemSubtotal}>
            R$ {item.subtotal.toFixed(2)}
          </Text>
        </View>
      </View>

      {(item.desconto > 0 || item.observacao) && (
        <View style={styles.itemInfo}>
          {item.desconto > 0 && (
            <Text style={styles.itemDesconto}>
              Desc: {item.desconto}%
            </Text>
          )}
          {item.observacao && (
            <Text
              style={styles.itemObservacao}
              numberOfLines={1}
            >
              {item.observacao}
            </Text>
          )}
        </View>
      )}
    </View>
  )}
/>
{/* Resumo da Venda */}
{itens.length > 0 && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Resumo da Venda</Text>

    <View style={styles.row}>
      <View style={styles.col}>
        <Text style={styles.label}>Desconto total (%)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={descontoTotal}
          onChangeText={setDescontoTotal}
          placeholder="0"
        />
      </View>

      <View style={styles.col}>
        <Text style={styles.label}>Frete (R$)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={frete}
          onChangeText={setFrete}
          placeholder="0,00"
        />
      </View>
    </View>

    <Text style={styles.label}>Observações da venda</Text>
    <TextInput
      style={[styles.input, styles.textArea]}
      value={observacaoGeral}
      onChangeText={setObservacaoGeral}
      placeholder="Observações gerais da venda"
      multiline
      numberOfLines={3}
    />

    <View style={styles.totalResumo}>
      <Text style={styles.resumoLinha}>
        Subtotal: R$ {calcularSubtotalItens().toFixed(2)}
      </Text>
      <Text style={styles.resumoLinha}>
        Desconto geral: - R$ {calcularDescontoGeral().toFixed(2)}
      </Text>
      <Text style={styles.resumoLinha}>
        Frete: R$ {(parseFloat(frete) || 0).toFixed(2)}
      </Text>
      <Text style={styles.totalFinal}>
        Total Final: R$ {calcularTotalFinal()}
      </Text>
    </View>
  </View>
)}

            
            
          </View>
        )}

        {/* Botão Finalizar */}
        {/*
        {itens.length > 0 && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.btnFinalizar}
              onPress={handleFinalizarVenda}
            >
              <Ionicons name="checkmark-circle" size={24} color="#FFF" />
              <Text style={styles.btnFinalizarText}>Finalizar Venda</Text>
            </TouchableOpacity>
          </View>
        )}
          */}
          <TouchableOpacity
            style={styles.btnFinalizar}
            onPress={GerarVenda}
          >
            <Ionicons name="checkmark-circle" size={24} color="#FFF" />
            <Text style={styles.btnFinalizarText}>Finalizar Venda</Text>
          </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2D5A3D',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 10,
  },
  totalContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 12,
  },
  totalText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFF',
  },
  itemCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D5A3D',
    marginBottom: 15,
  },
  selecionadoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 12,
  },
  selecionadoInfo: {
    flex: 1,
  },
  selecionadoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5A3D',
    marginBottom: 5,
  },
  selecionadoDetalhes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 5,
  },
  selecionadoCPF: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  selecionadoCodigo: {
    fontSize: 14,
    color: '#666',
  },
  selecionadoPreco: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D5A3D',
    marginRight: 15,
  },
  selecionadoEstoque: {
    fontSize: 14,
    color: '#666',
  },
  btnAlterar: {
    backgroundColor: '#FFA000',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  btnAlterarText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  buscaContainer: {
    position: 'relative',
    zIndex: 1,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: 17,
    zIndex: 1,
  },
  inputWithIcon: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 15,
    paddingLeft: 45,
    fontSize: 16,
  },
  inputLoading: {
    position: 'absolute',
    right: 15,
    top: 17,
  },
  sugestoesContainer: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginTop: 5,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sugestaoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sugestaoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sugestaoInfo: {
    flex: 1,
  },
  sugestaoNome: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  sugestaoDetalhes: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  sugestaoCodigo: {
    fontSize: 12,
    color: '#999',
  },
  sugestaoPreco: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2196F3',
  },
  semResultados: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginTop: 5,
  },
  semResultadosText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buscaAlternativa: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  buscaAlternativaLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  codigoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codigoInput: {
    flex: 1,
    marginRight: 10,
  },
  btnBuscarCodigo: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    minWidth: 100,
  },
  btnBuscarCodigoText: {
    color: '#FFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  codigoBarrasContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputFlex: {
    flex: 1,
  },
  btnScanner: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    marginLeft: 10,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -5,
    marginBottom: 15,
  },
  col: {
    flex: 1,
    paddingHorizontal: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  btnAdicionar: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  btnAdicionarText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  cameraTitle: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: '600',
    marginBottom: 10,
  },
  cameraTimer: {
    fontSize: 16,
    color: '#FFF',
  },
  scanner: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cameraBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
    borderRadius: 30,
    marginHorizontal: 10,
  },
  cameraBtnClose: {
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
  },
  itemCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemProduto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  itemDetalhes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantidade: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  qtdInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 60,
    textAlign: 'center',
    fontSize: 16,
  },
  itemValores: {
    alignItems: 'flex-end',
  },
  itemPreco: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  itemSubtotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D5A3D',
  },
  itemInfo: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  itemDesconto: {
    fontSize: 12,
    color: '#FF9800',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  itemObservacao: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  btnFinalizar: {
    backgroundColor: '#2D5A3D',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFinalizarText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 18,
    marginLeft: 10,
  },
  totalResumo: {
  marginTop: 15,
  paddingTop: 15,
  borderTopWidth: 1,
  borderTopColor: '#EEE',
},

resumoLinha: {
  fontSize: 14,
  color: '#555',
  marginBottom: 4,
},

totalFinal: {
  fontSize: 20,
  fontWeight: '700',
  color: '#2D5A3D',
  marginTop: 8,
},
});
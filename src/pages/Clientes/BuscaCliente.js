import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const BuscaCliente = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [estatisticas, setEstatisticas] = useState(null);
  const [timestamp, setTimestamp] = useState(null);

  // URL base da API
  const API_URL = 'http://192.168.1.15:3000/api/clientes/seguro/buscar/nome';

  // Função para buscar produtos
  const buscarProdutos = async (nome = '') => {
    // Se o nome estiver vazio, não faz a busca
    if (nome.trim() === '') {
      setProdutos([]);
      setEstatisticas(null);
      setTimestamp(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}?nome=${encodeURIComponent(nome)}`);
      
      // Processa a resposta conforme a nova estrutura
      if (response.data && response.data.data) {
        setProdutos(response.data.data);
        setEstatisticas(response.data.estatisticas);
        setTimestamp(response.data.timestamp);
        
        if (response.data.data.length === 0) {
          Alert.alert('Aviso', 'Nenhum cliente encontrado');
        }
      } else {
        setProdutos([]);
        setEstatisticas(null);
        setTimestamp(null);
        Alert.alert('Aviso', 'Nenhum cliente encontrado');
      }
    } catch (err) {
      setError('Erro ao buscar cliente');
      console.error('Erro na requisição:', err);
      
      // Mensagens de erro específicas
      if (err.response) {
        Alert.alert('Erro', `Servidor retornou: ${err.response.status}`);
      } else if (err.request) {
        Alert.alert('Erro', 'Não foi possível conectar ao servidor');
      } else {
        Alert.alert('Erro', 'Erro ao fazer a requisição');
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar ao pressionar Enter ou botão de busca
  const handleSearch = () => {
    Keyboard.dismiss();
    buscarProdutos(searchTerm);
  };

  // Função para atualizar a lista
  const onRefresh = () => {
    setRefreshing(true);
    buscarProdutos(searchTerm).finally(() => setRefreshing(false));
  };

  // Formatar data/hora
  const formatarData = (dataString) => {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
  };

  // Função para renderizar o status do produto
  const renderStatus = (produto) => {
    if (!produto.ativo) {
      return (
        <View style={[styles.statusTag, styles.statusInativo]}>
          <Icon name="block" size={12} color="#fff" />
          <Text style={styles.statusText}>Inativo</Text>
        </View>
      );
    }
    
    if (!produto.disponivel) {
      return (
        <View style={[styles.statusTag, styles.statusIndisponivel]}>
          <Icon name="close" size={12} color="#fff" />
          <Text style={styles.statusText}>Indisponível</Text>
        </View>
      );
    }
    
    return (
      <View style={[styles.statusTag, styles.statusDisponivel]}>
        <Icon name="check-circle" size={12} color="#fff" />
        <Text style={styles.statusText}>Disponível</Text>
      </View>
    );
  };

  // Renderizar cada item do produto
  const renderProdutoItem = ({ item }) => (
    <View style={styles.produtoCard}>
      <View style={styles.produtoHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.produtoNome}>{item.NOME || 'Nome não disponível'}</Text>
          
        </View>
        
        <View style={styles.headerRight}>
          <Text style={styles.produtoPreco}>
            {item.CODIGO || `R$ ${item.preco?.toFixed(2) || '0,00'}`}
          </Text>
          {item.precoSugerido > 0 && (
            <></>
           
          )}
        </View>
      </View>
      
      {/* Descrição */}
      {item.descricao && (
        <Text style={styles.produtoDescricao} numberOfLines={2}>
          {item.descricao}
        </Text>
      )}
      
      {/* Informações principais */}
      <View style={styles.infoRow}>
        {(item.grupo || item.categoria) && (
          <View style={styles.infoItem}>
            <Icon name="category" size={14} color="#666" />
            <Text style={styles.infoText}>
              {item.CIDADE || item.CIDADE}
            </Text>
          </View>
        )}
        
        {item.unidade && item.unidade !== 'UN' && (
          <View style={styles.infoItem}>
            <Icon name="straighten" size={14} color="#666" />
            <Text style={styles.infoText}>
              {item.CIDADE}
            </Text>
          </View>
        )}
      </View>
      
      {/* Estoque */}
      <View style={styles.estoqueContainer}>
        <View style={styles.estoqueItem}>
          <Entypo name="location" size={16} color="#2517e6ff" />
          <Text style={styles.estoqueLabel}>cidade:</Text>
          <Text style={styles.estoqueValue}>{item.CIDADE || 0}</Text>
        </View>
        
        <View style={styles.estoqueItem}>
         
          <Text style={styles.estoqueLabel}>uf:</Text>
          <Text style={styles.estoqueValue}>{item.UF || 'Não Cadastrado'}</Text>
        </View>
      </View>
      
      {/* Telefone */}
      <View style={styles.codigosContainer}>
       <MaterialCommunityIcons name="phone" size={16} color="#2517e6ff" />
        <Text style={styles.estoqueLabel}>Telefone:</Text>
        <Text style={styles.estoqueValue}>{item.TELEFONE || 'Nao Cadastrado'}</Text>
      </View>
      
      {/* EMAIL */}
      <View style={styles.adicionaisContainer}>
        <MaterialCommunityIcons name="email" size={16} color="#2517e6ff" />
        <Text style={styles.estoqueLabel}>Email:</Text>
        <Text style={styles.estoqueValue}>{item.EMAIL || 'Nao Cadastrado'}</Text>

    
      </View>
    </View>
  );

  // Renderizar estatísticas
  const renderEstatisticas = () => (
    <View style={styles.estatisticasContainer}>
      <View style={styles.estatisticasHeader}>
        <Icon name="analytics" size={20} color="#007AFF" />
        <Text style={styles.estatisticasTitle}>Estatísticas da Busca</Text>
      </View>
      
      <View style={styles.estatisticasContent}>
        <View style={styles.estatisticaItem}>
          <Text style={styles.estatisticaLabel}>Termo pesquisado:</Text>
          <Text style={styles.estatisticaValue}>{estatisticas.termoPesquisado}</Text>
        </View>
        
        <View style={styles.estatisticaItem}>
          <Text style={styles.estatisticaLabel}>Total encontrado:</Text>
          <Text style={[styles.estatisticaValue, styles.totalEncontrado]}>
            {estatisticas.totalEncontrado}
          </Text>
        </View>
        
        {timestamp && (
          <View style={styles.estatisticaItem}>
            <Text style={styles.estatisticaLabel}>Última atualização:</Text>
            <Text style={styles.estatisticaValue}>
              {formatarData(timestamp)}
            </Text>
          </View>
        )}
      </View>
      
      {estatisticas.sugestoes && estatisticas.sugestoes.length > 0 && (
        <View style={styles.sugestoesContainer}>
          <Text style={styles.sugestoesTitle}>Sugestões:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {estatisticas.sugestoes.map((sugestao, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.sugestaoTag}
                onPress={() => {
                  setSearchTerm(sugestao);
                  buscarProdutos(sugestao);
                }}
              >
                <Text style={styles.sugestaoText}>{sugestao}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  // Renderizar lista vazia
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="search-off" size={80} color="#ccc" />
      <Text style={styles.emptyText}>
        {searchTerm.trim() === '' 
          ? 'Digite um termo para buscar clientes cadastrados' 
          : estatisticas 
            ? 'Nenhum cliente encontrado para esta busca'
            : 'Digite um termo e clique em buscar'}
      </Text>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>Buscar Cliente</Text>
          <Text style={styles.subtitle}>Encontre clientes pelo nome</Text>
        </View>

        {/* Barra de busca */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={24} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Digite o nome do Cliente..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <Icon name="clear" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading}
          >
            <Icon name="search" size={20} color="#fff" />
            <Text style={styles.searchButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {/* Indicador de loading */}
        {loading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Buscando Clientes...</Text>
          </View>
        )}

        {/* Mensagem de erro */}
        {error && !loading && (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={50} color="#ff3b30" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => buscarProdutos(searchTerm)}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Estatísticas */}
        {estatisticas && !loading && !error && (
          renderEstatisticas()
        )}

        {/* Lista de produtos */}
        {!loading && !error && (
          <FlatList
            data={produtos}
            renderItem={renderProdutoItem}
            keyExtractor={(item, index) => `${item.codigoBarras || index}_${item.nome || ''}`}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={renderEmptyList}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListHeaderComponent={
              estatisticas && produtos.length > 0 ? (
                <Text style={styles.resultadosHeader}>
                  {produtos.length} de {estatisticas.totalEncontrado} produto(s) mostrados
                </Text>
              ) : null
            }
          />
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  estatisticasContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  estatisticasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  estatisticasTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  estatisticasContent: {
    marginBottom: 12,
  },
  estatisticaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  estatisticaLabel: {
    fontSize: 14,
    color: '#666',
  },
  estatisticaValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  totalEncontrado: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  sugestoesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  sugestoesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  sugestaoTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  sugestaoText: {
    fontSize: 12,
    color: '#007AFF',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resultadosHeader: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  produtoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  produtoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
    marginRight: 10,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  produtoNome: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
  },
  statusDisponivel: {
    backgroundColor: '#34C759',
  },
  statusIndisponivel: {
    backgroundColor: '#FF9500',
  },
  statusInativo: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  produtoPreco: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  precoSugerido: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  produtoDescricao: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  estoqueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  estoqueItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estoqueLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    marginRight: 4,
  },
  estoqueValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  codigosContainer: {
    marginBottom: 12,
  },
  codigoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codigoText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
    marginLeft: 4,
  },
  adicionaisContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  adicionaisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  adicionalText: {
    fontSize: 11,
    color: '#999',
  },
  precoSai: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: 20,
  },
});

export default BuscaCliente;
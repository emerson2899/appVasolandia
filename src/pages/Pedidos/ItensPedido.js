import React, { useEffect, useState } from "react";
import { 
  SafeAreaView, 
  ScrollView, 
  View, 
  StyleSheet, 
  Text, 
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity 
} from "react-native";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons"; // ou outra biblioteca de ícones

function ItensPedido() {
  const route = useRoute();
  const [pedido, setPedido] = useState(null);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Extrai o parâmetro da rota - use desestruturação com valor padrão
  const { pedido: pedidoParam } = route.params || {};
  const codigoPedido = pedidoParam?.id;

  // Função para buscar dados
  const fetchItensPedido = async () => {
    if (!codigoPedido) {
      setError("ID do pedido não encontrado");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await axios.get(
        `http://192.168.1.243:3000/api/pedidos/listar/relacao/pedido?pedido=${codigoPedido}`
      );
      
      console.log("Dados recebidos:", response.data.data);
      
      // Ajuste conforme a estrutura da sua API
      if (response.data.pedido) {
        setPedido(response.data.pedido);
      }
      
      if (response.data.itens) {
        setItens(response.data.itens);
      } else if (Array.isArray(response.data.data)) {
        setItens(response.data.data);
      }
      
    } catch (error) {
      console.error('Erro ao buscar itens do pedido:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        "Erro ao carregar itens do pedido"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Carregar dados inicialmente
  useEffect(() => {
    fetchItensPedido();
  }, [codigoPedido]);

  // Função para recarregar
  const onRefresh = () => {
    setRefreshing(true);
    fetchItensPedido();
  };

  // Função para calcular total
  const calcularTotal = () => {
    return itens.reduce((total, item) => {
      const quantidade = item.QUANTIDADE || 1;
      const preco = item.VALOR || item.valor || 0;
      return total + (quantidade * preco);
    }, 0).toFixed(2);
  };

  // Renderização condicional
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando itens...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={64} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchItensPedido}
        >
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!codigoPedido) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>Pedido não especificado</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007AFF"]}
          />
        }
      >
        {/* Cabeçalho do Pedido */}
        <View style={styles.header}>
          <Text style={styles.title}>Itens do Pedido #{codigoPedido}</Text>
          
          {pedido && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cliente:</Text>
                <Text style={styles.infoValue}>{pedido.CODIGO || "Não informado"}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Data:</Text>
                <Text style={styles.infoValue}>
                  {pedido.DATA ? new Date(pedido.DATA).toLocaleDateString('pt-BR') : "Não informada"}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(pedido.status) }
                ]}>
                  <Text style={styles.statusText}>
                    {pedido.status || "Pendente"}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Lista de Itens */}
        {itens.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="shopping-cart" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>Nenhum item encontrado</Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Itens ({itens.length})</Text>
            </View>
            
            {itens.map((item, index) => (
              <View key={item.id || index} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.NOME || item.produto || `Item ${index + 1}`}
                  </Text>
                  <Text style={styles.itemPrice}>
                    R$ {(item.VALOR || item.valor || 0).toFixed(2)}
                  </Text>
                </View>
                
                <View style={styles.itemDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Quantidade:</Text>
                    <Text style={styles.detailValue}>{item.QUANTIDADE || 1}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Código:</Text>
                    <Text style={styles.detailValue}>{item.CODIGO || "N/A"}</Text>
                  </View>
                  
                  {item.descricao && (
                    <Text style={styles.itemDescription} numberOfLines={2}>
                      {item.descricao}
                    </Text>
                  )}
                </View>
                
                <View style={styles.itemTotal}>
                  <Text style={styles.totalLabel}>Subtotal:</Text>
                  <Text style={styles.totalValue}>
                    R$ {((item.QUANTIDADE || 1) * (item.VALOR || item.valor || 0)).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
            
            {/* Resumo Total */}
            <View style={styles.totalContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total do Pedido:</Text>
                <Text style={styles.grandTotal}>R$ {calcularTotal()}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Função auxiliar para cores do status
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'finalizado':
    case 'concluído':
      return '#34C759';
    case 'cancelado':
      return '#FF3B30';
    case 'pendente':
      return '#FF9500';
    case 'processando':
      return '#007AFF';
    default:
      return '#C7C7CC';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 10,
    borderRadius: 10,
    marginHorizontal: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  infoValue: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 10,
    marginBottom: 10,
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 10,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  itemDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  itemDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    fontStyle: 'italic',
  },
  itemTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  totalLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  totalContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 10,
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34C759',
  },
});

export default ItensPedido;
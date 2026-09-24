import { Button } from "@react-navigation/elements";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  PanResponder,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Modal
} from "react-native";
import axios from "axios";
import { set } from "lodash";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85;

// URL base da API
const API_URL = "http://192.168.1.243:3000/api";

export default function PedidoAberto() {
  const [pedidos, setPedidos] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  // ================================
  // 📌 FUNÇÃO PARA BUSCAR PEDIDOS
  // ================================
  const fetchPedidos = async () => {

    try {
      setError(null);
      const response = await axios.get(`${API_URL}/pedidos/listar/todos/debito`);
      
      if (response.data && response.data) {
        // Formatar os dados da API para o formato esperado pelo componente
        const pedidosFormatados = response.data.map(pedido => ({
          cliente: pedido.NOME || "Cliente não informado",
          codigoCliente: pedido.CODIGO,
          endereco: `${pedido.endereco || ''} ${pedido.numero || ''} - ${pedido.bairro || ''}`.trim(),
          valor: pedido.VALOR || 0,
          data: formatarData(pedido.VENCIMENTO || new Date().toISOString()),
          itens: pedido.itens ? pedido.itens.map(item => `${item.quantidade}x ${item.produto_nome}`) : ["Itens não disponíveis"],
          id: pedido.PEDIDO,
          status: pedido.PAGO,
          observacao: pedido.OBSERVACAO
        }));
        
        setPedidos(pedidosFormatados);
      }
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
      setError("Erro ao carregar pedidos. Verifique sua conexão.");
      
      // Dados de fallback em caso de erro
      setPedidos([
        {
          cliente: "João Pedro Martins",
          endereco: "Rua das Flores, 120 - Centro",
          valor: 142.9,
          data: "12/12/2025",
          itens: ["2x Rosas Vermelhas", "1x Buquê Primavera"],
          id: 1,
          status: "pendente",
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  function handleDarBaixa(id) {
    return(alert("Dar baixa no pedido " + id))
  
  }

  const localizarDetalhesPedido = (id) => {
    navigation.navigate("ItensPedido", { id: id });
    let pedido = id;
    alert(pedido);
  };


  // ================================
  // 📌 FORMATAR DATA
  // ================================
  const formatarData = (dataString) => {
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR');
    } catch {
      return new Date().toLocaleDateString('pt-BR');
    }
  };

  // ================================
  // 📌 BUSCAR PEDIDOS AO MONTAR COMPONENTE
  // ================================
  useEffect(() => {
    fetchPedidos();
  }, []);

  // ================================
  // 📌 FUNÇÃO DE ATUALIZAR
  // ================================
  const onRefresh = () => {
    setRefreshing(true);
    fetchPedidos();
  };

  // ================================
  // 📌 ANIMAÇÕES
  // ================================
  const animateBack = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const animateNext = () => {
    Animated.timing(translateX, {
      toValue: -width,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      translateX.setValue(0);
    });
  };

  const animatePrev = () => {
    Animated.timing(translateX, {
      toValue: width,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      translateX.setValue(0);
    });
  };

  // ================================
  // 📌 PAN RESPONDER (SWIPE)
  // ================================
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 10,

      onPanResponderMove: (_, gesture) => {
        translateX.setValue(gesture.dx);
      },

      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -120 && index < pedidos.length - 1) {
          animateNext();
          setIndex(index + 1);
        } else if (gesture.dx > 120 && index > 0) {
          animatePrev();
          setIndex(index - 1);
        } else {
          animateBack();
        }
      },
    })
  ).current;

  // ================================
  // 📌 RENDERIZAÇÃO
  // ================================
  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00994d" />
        <Text style={styles.loadingText}>Carregando pedidos...</Text>
      </SafeAreaView>
    );
  }

  if (error && pedidos.length === 0) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button onPress={fetchPedidos} title="Tentar novamente" />
      </SafeAreaView>
    );
  }

  if (pedidos.length === 0) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.emptyText}>Nenhum pedido em débito encontrado</Text>
        <Button onPress={onRefresh} title="Atualizar" />
      </SafeAreaView>
    );
  }

  const pedido = pedidos[index];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {openModal && (
          <Modal
            visible={openModal}
            animationType="slide"
            onRequestClose={() => setOpenModal(false)}
          >
            <Text>Detalhes do Pedido</Text>
          </Modal>
        )}
        <View style={styles.container}>
          <Text style={styles.header}>
            Pedido {index + 1} de {pedidos.length}
          </Text>

          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(pedido.status) }]}>
              <Text style={styles.statusText}>
                {pedido.status?.toUpperCase() || "PENDENTE"}
              </Text>
            </View>
          </View>

          <Animated.View
            {...panResponder.panHandlers}
            style={[styles.card, { transform: [{ translateX }] }]}
          >
            <Text style={styles.cliente}>{pedido.cliente} - {pedido.codigoCliente}</Text>
            <Text style={styles.pedidoId}>Codigo do Pedido: {pedido.id}</Text>

            <Text style={styles.label}>Valor total:</Text>
            <Text style={styles.valor}>R$ {pedido.valor.toFixed(2).replace('.', ',')}</Text>

            <Text style={styles.label}>Data do pedido:</Text>
            <Text style={styles.value}>{pedido.data}</Text>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleDarBaixa(pedido.id)}>
                <Text style={styles.actionButtonText}>Dar Baixa</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => navigation.navigate('Itens do Pedido', { pedido })} style={[styles.actionButton, styles.secondaryButton]}>
                <Text style={styles.secondaryButtonText}>Ver Detalhes</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* BOTÕES DE NAVEGAÇÃO */}
          <View style={styles.nav}>
            <TouchableOpacity
              onPress={() => {
                if (index > 0) {
                  animatePrev();
                  setIndex(index - 1);
                }
              }}
              disabled={index === 0}
              style={[styles.arrowBtn, index === 0 && styles.disabled]}
            >
              <Text style={styles.arrow}>◀</Text>
            </TouchableOpacity>

            <View style={styles.pageInfo}>
              <Text style={styles.pageText}>
                {index + 1} / {pedidos.length}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                if (index < pedidos.length - 1) {
                  animateNext();
                  setIndex(index + 1);
                }
              }}
              disabled={index === pedidos.length - 1}
              style={[
                styles.arrowBtn,
                index === pedidos.length - 1 && styles.disabled,
              ]}
            >
              <Text style={styles.arrow}>▶</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ================================
// 📌 FUNÇÃO AUXILIAR PARA STATUS
// ================================
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pendente':
      return '#FFA726';
    case 'preparando':
      return '#29B6F6';
    case 'entregue':
      return '#66BB6A';
    case 'cancelado':
      return '#EF5350';
    default:
      return '#78909C';
  }
};

// ================================
// 📌 ESTILOS
// ================================
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f5",
    padding: 20,
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: "#f0f0f5",
  },
  header: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "center",
  },
  statusText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 12,
  },
  card: {
    width: CARD_WIDTH,
    padding: 25,
    borderRadius: 18,
    backgroundColor: "#FFF",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 20,
  },
  cliente: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 5,
    color: "#2C3E50",
  },
  pedidoId: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 20,
  },
  label: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: "600",
    color: "#34495E",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#2C3E50",
    marginBottom: 4,
  },
  valor: {
    fontSize: 24,
    fontWeight: "700",
    color: "#00994d",
    marginBottom: 4,
  },
  item: {
    fontSize: 15,
    marginLeft: 10,
    marginBottom: 4,
    color: "#2C3E50",
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 30,
    marginTop: 10,
  },
  arrowBtn: {
    padding: 15,
    backgroundColor: "#00994d",
    borderRadius: 50,
    elevation: 3,
  },
  arrow: {
    fontSize: 22,
    color: "#FFF",
    fontWeight: "bold",
  },
  disabled: {
    backgroundColor: "#BDC3C7",
  },
  pageInfo: {
    minWidth: 80,
    alignItems: "center",
  },
  pageText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
  },
  buttonsContainer: {
    marginTop: 25,
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#00994d",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#00994d",
  },
  secondaryButtonText: {
    color: "#00994d",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#7F8C8D",
  },
  errorText: {
    fontSize: 16,
    color: "#E74C3C",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#7F8C8D",
    textAlign: "center",
    marginBottom: 20,
  },
  
});
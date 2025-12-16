import { Button } from "@react-navigation/elements";
import React, { useState, useRef, use } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  PanResponder,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85;

export default function PedidoAberto() {
    const [Pedido, setPedido] = useState(null);
  // ================================
  // 📌 DADOS FAKE (NO MESMO ARQUIVO)
  // ================================
  const pedidos = [
    {
      cliente: "João Pedro Martins",
      endereco: "Rua das Flores, 120 - Centro",
      valor: 142.9,
      data: "12/12/2025",
      itens: ["2x Rosas Vermelhas", "1x Buquê Primavera", "1x Cartão Mensagem"],
    },
    {
      cliente: "Maria Fernanda Silva",
      endereco: "Av. Brasil, 980 - Jardim Novo",
      valor: 89.5,
      data: "12/12/2025",
      itens: ["1x Orquídea Branca", "1x Vaso Decorado"],
    },
    {
      cliente: "Pedro Henrique Costa",
      endereco: "Rua São Paulo, 55 - Vila Rica",
      valor: 230,
      data: "11/12/2025",
      itens: ["Arranjo Premium", "Cesta de Chocolates", "Cartão Luxo"],
    },
  ];

  // ================================
  // 📌 ESTADO CARROSSEL
  // ================================
  const [index, setIndex] = useState(0);

  const translateX = useRef(new Animated.Value(0)).current;

  const animateBack = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
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
          // Swipe para esquerda → próximo
          animateNext();
          setIndex(index + 1);
        } else if (gesture.dx > 120 && index > 0) {
          // Swipe para direita → anterior
          animatePrev();
          setIndex(index - 1);
        } else {
          animateBack();
        }
      },
    })
  ).current;

  const pedido = pedidos[index];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.header}>
          Pedido {index + 1} de {pedidos.length}
        </Text>

        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.card, { transform: [{ translateX }] }]}
        >
          <Text style={styles.cliente}>{pedido.cliente}</Text>

          <Text style={styles.label}>Endereço:</Text>
          <Text style={styles.value}>{pedido.endereco}</Text>

          <Text style={styles.label}>Valor total:</Text>
          <Text style={styles.valor}>R$ {pedido.valor.toFixed(2)}</Text>

          <Text style={styles.label}>Data:</Text>
          <Text style={styles.value}>{pedido.data}</Text>

          <Text style={styles.label}>Itens:</Text>
          {pedido.itens.map((item, i) => (
            <Text key={i} style={styles.item}>
              • {item}
            </Text>
            
          ))}
        </Animated.View>

        {/* BOTÕES */}
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
    </SafeAreaView>
  );
}

// ================================
// 📌 ESTILOS
// ================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 30,
    backgroundColor: "#f0f0f5",
  },
  header: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
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
  },
  cliente: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
  },
  valor: {
    fontSize: 20,
    fontWeight: "700",
    color: "#00994d",
  },
  item: {
    fontSize: 15,
    marginLeft: 10,
  },
  nav: {
    flexDirection: "row",
    gap: 40,
    marginTop: 30,
  },
  arrowBtn: {
    padding: 15,
    backgroundColor: "#333",
    borderRadius: 50,
  },
  arrow: {
    fontSize: 22,
    color: "#FFF",
  },
  disabled: {
    backgroundColor: "#999",
  },
});

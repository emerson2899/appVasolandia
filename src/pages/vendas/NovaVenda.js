import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, Button, FlatList, TouchableOpacity } from 'react-native';
import { CameraView, Camera } from 'expo-camera';

export default function NovaVenda() {
  const [cliente, setCliente] = useState('');
  const [produto, setProduto] = useState('');
  const [quantidade, setQuantidade] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const [observacao, setObservacao] = useState('');

  const [hasPermission, setHasPermission] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [flash, setFlash] = useState("off");

  const [itens, setItens] = useState([]);

  // Pede permissão da câmera
  const askForCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    if (status === 'granted') {
      setCameraActive(true);
      setScanned(false);
      setTimeLeft(15);
    }
  };

  // Timer para fechar a câmera
  useEffect(() => {
    if (cameraActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0) {
      setCameraActive(false);
    }
  }, [timeLeft, cameraActive]);

  // Quando o código for lido
  const handleBarCodeScanned = ({ data }) => {
    if (!scanned) {
      setScanned(true);
      setProduto(data);
      setCameraActive(false);
      Alert.alert('Código detectado', data);
    }
  };

  // Adicionar item à lista
  const handleAdicionar = () => {
    if (cliente && produto && quantidade > 0) {
      const novoItem = {
        id: Date.now().toString(),
        produto,
        quantidade,
        desconto,
        observacao,
      };
      setItens([...itens, novoItem]);
      setProduto('');
      setQuantidade(0);
      setDesconto(0);
      setObservacao('');
    } else {
      Alert.alert('Erro', 'Preencha todos os campos corretamente!');
    }
  };

  // Remover item
  const handleRemover = (id) => {
    setItens(itens.filter(item => item.id !== id));
  };

  // Alterar quantidade
  const handleAlterarQuantidade = (id, novaQtd) => {
    setItens(itens.map(item =>
      item.id === id ? { ...item, quantidade: novaQtd } : item
    ));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Nova Venda</Text>

      <Text>Cliente</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o nome do cliente"
        value={cliente}
        onChangeText={setCliente}
      />

      <Text>Produto</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o nome ou código do produto"
        value={produto}
        onChangeText={setProduto}
      />

      <Button title="Escanear Código de Barras" onPress={askForCameraPermission} />

      {cameraActive && hasPermission && (
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <CameraView
            style={styles.scanner}
            facing="back"
            flash={flash}
            onBarcodeScanned={handleBarCodeScanned}
          />
          <Text style={{ marginTop: 10 }}>Fechando em {timeLeft}s</Text>

          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <Button title="Fechar câmera" onPress={() => setCameraActive(false)} />
            <View style={{ width: 10 }} />
            <Button
              title={flash === "off" ? "Ligar Flash" : "Desligar Flash"}
              onPress={() => setFlash(flash === "off" ? "on" : "off")}
            />
          </View>
        </View>
      )}

      <Text>Quantidade</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a quantidade do produto"
        keyboardType="numeric"
        value={quantidade.toString()}
        onChangeText={text => setQuantidade(parseInt(text, 10) || 0)}
      />

      <Text>Desconto</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o desconto"
        keyboardType="numeric"
        value={desconto.toString()}
        onChangeText={text => setDesconto(parseInt(text, 10) || 0)}
      />

      <Text>Observação</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a observação"
        value={observacao}
        onChangeText={setObservacao}
      />

      <Button title="Adicionar" onPress={handleAdicionar} />

      {/* Lista de itens */}
      <Text style={{ fontSize: 20, marginVertical: 15 }}>Itens da Venda</Text>
      <FlatList
        data={itens}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Text style={{ fontWeight: 'bold' }}>{item.produto}</Text>
            <Text>Qtd: {item.quantidade}</Text>
            <Text>Desc: {item.desconto}</Text>
            <Text>Obs: {item.observacao}</Text>

            <View style={{ flexDirection: 'row', marginTop: 5 }}>
              <TextInput
                style={styles.qtdInput}
                keyboardType="numeric"
                value={item.quantidade.toString()}
                onChangeText={text =>
                  handleAlterarQuantidade(item.id, parseInt(text, 10) || 0)
                }
              />
              <TouchableOpacity onPress={() => handleRemover(item.id)} style={styles.btnRemove}>
                <Text style={{ color: 'white' }}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
  scanner: {
    height: 300,
    width: 300,
    borderRadius: 10,
    overflow: 'hidden',
  },
  itemCard: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  qtdInput: {
    borderWidth: 1,
    borderColor: 'gray',
    width: 60,
    marginRight: 10,
    textAlign: 'center',
  },
  btnRemove: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
    justifyContent: 'center',
  },
});


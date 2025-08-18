import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, Button } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import {BarCodeReader} from '../../components/barcode';

export default function NovaVenda() {
  const [cliente, setCliente] = useState('');
  const [produto, setProduto] = useState('');
  const [quantidade, setQuantidade] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const [observacao, setObservacao] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  const askForCameraPermission = () => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  };

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    setProduto(data);
  };

  const handleAdicionar = () => {
    if (cliente && produto && quantidade > 0) {
      Alert.alert(
        'Adicionar produto',
        `Cliente: ${cliente}\nProduto: ${produto}\nQuantidade: ${quantidade}\nDesconto: ${desconto}\nObservação: ${observacao}`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Adicionar',
            onPress: () => {
              // adicionar produto ao carrinho
              Alert.alert('Produto adicionado com sucesso!');
            },
          },
        ],
      );
    } else {
      Alert.alert('Erro', 'Por favor, preencha todos os campos corretamente!');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Nova Venda</Text>

      <Text>Cliente</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o nome do cliente"
        value={cliente}
        onChangeText={text => setCliente(text)}
      />
     a

      <Text>Produto</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o nome ou código do produto"
        value={produto}
        onChangeText={text => setProduto(text)}
      />

      <Button title='Escanear Código de Barras' mode="contained" onPress={askForCameraPermission} style={styles.button}/> 
  

      {hasPermission && (
        <CameraView
          style={styles.scanner}
          onBarCodeScanned={handleBarCodeScanned}
        />
      )}

      <Text>Quantidade</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a quantidade do produto"
        keyboardType="numeric"
        value={quantidade.toString()}
        onChangeText={text => setQuantidade(parseInt(text, 10))}
      />

      <Text>Desconto</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o desconto em dinheiro ou porcentagem"
        value={desconto.toString()}
        onChangeText={text => setDesconto(parseInt(text, 10))}
      />

      <Text>Observação</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a observação"
        value={observacao}
        onChangeText={text => setObservacao(text)}
      />

      <Button title="Adicionar" mode="contained" onPress={handleAdicionar} style={styles.button}/>
    
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
  button: {
    marginBottom: 20,
  },
  scanner: {
    height: 300,
    width: 300,
  },
});

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';

export default function NovoOrcamento() {
  const [cliente, setCliente] = useState('');
  const [produto, setProduto] = useState('');
  const [quantidade, setQuantidade] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const [observacao, setObservacao] = useState('');

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
              // adicionar produto ao orçamento
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
      <Text style={styles.title}>Novo Orçamento</Text>

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
        placeholder="Digite o nome do produto"
        value={produto}
        onChangeText={setProduto}
      />

      <Text>Quantidade</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a quantidade"
        value={quantidade}
        onChangeText={text => setQuantidade(parseInt(text, 10))}
        keyboardType="numeric"
      />

      <Text>Desconto</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o desconto"
        value={desconto}
        onChangeText={text => setDesconto(parseInt(text, 10))}
        keyboardType="numeric"
      />

      <Text>Observação</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a observação"
        value={observacao}
        onChangeText={setObservacao}
        multiline
        numberOfLines={4}
      />

      <Button title="Adicionar" onPress={handleAdicionar} />
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
});

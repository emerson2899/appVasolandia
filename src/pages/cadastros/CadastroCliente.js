import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';

export default function CadastroCliente() {
  const [nome, setNome] = useState('');
  const [telefone1, setTelefone1] = useState('');
  const [telefone2, setTelefone2] = useState('');
  const [endereco, setEndereco] = useState('');

  const handleCadastro = () => {
    if (nome && telefone1 && endereco) {
      Alert.alert('Cadastro realizado com sucesso!');
    } else {
      Alert.alert('Por favor, preencha todos os campos obrigatórios!');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cadastro de Cliente</Text>
      
      <Text>Nome</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o nome do cliente"
        value={nome}
        onChangeText={setNome}
      />

      <Text>Telefone 1</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o telefone de contato 1"
        value={telefone1}
        onChangeText={setTelefone1}
      />

      <Text>Telefone 2</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o telefone de contato 2"
        value={telefone2}
        onChangeText={setTelefone2}
      />

      <Text>Endereço</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o endereço"
        value={endereco}
        onChangeText={setEndereco}
      />

      <Button title="Cadastrar" onPress={handleCadastro} />
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


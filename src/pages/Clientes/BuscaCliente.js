import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import axios from 'axios';
import { Button } from '@react-navigation/elements';

export default function BuscaCliente() {
  const [codigo, setCodigo] = useState('');
  const [cliente, setCliente] = useState(null);
  const [nome, setNome] = useState('');
  const [telefone1, setTelefone1] = useState('');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [carregado, setCarregado] = useState(false);
  const [erro, setErro] = useState('');

  function Buscar() {
    setErro('');
    
    if (!codigo.trim()) {
      setErro('Digite um código para buscar');
      return;
    }

    axios.get(`http://192.168.1.13:3000/api/clientes/seguro/busca/?CODIGO=${codigo}`)
      .then(response => {
        setCarregado(true);
        
        // Verifica se a resposta tem a estrutura esperada
        if (response.data && response.data.data && response.data.data.CODIGO) {
          const dados = response.data.data.CODIGO;
          
          setCliente(dados);
          setNome(dados[1]?.trim() || '');
          setEndereco(dados[3] || '');
          setBairro(dados[4] || '');
          setCidade(dados[5] || '');
          setTelefone1(dados[8] || '');
        } else {
          setErro('Estrutura de dados inválida na resposta');
          setCliente(null);
        }
      })
      .catch(error => {
        console.error('Erro na busca:', error);
        setErro('Erro ao buscar cliente. Verifique a conexão.');
        setCarregado(false);
        setCliente(null);
      });
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Buscar Cliente</Text>
        </View>
        
        <View style={styles.buscaContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite o código do cliente"
            value={codigo}
            onChangeText={text => setCodigo(text)}
            keyboardType="numeric"
            returnKeyType="search"
            onSubmitEditing={Buscar}
          />
          
          <View style={styles.buttonContainer}>
            <Button 
              title="Buscar" 
              color='#34d2ec' 
              onPress={Buscar} 
            />
          </View>
        </View>

        {erro ? (
          <View style={styles.erroContainer}>
            <Text style={styles.erroTexto}>{erro}</Text>
          </View>
        ) : null}

        {carregado && cliente ? (
          <View style={styles.resultadoContainer}>
            <Text style={styles.sectionTitle}>Dados do Cliente</Text>
            
            <View style={styles.clienteCard}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Código:</Text>
                <Text style={styles.valor}>{cliente[0] || 'Não informado'}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Nome:</Text>
                <Text style={[styles.valor, styles.valorDestaque]}>{nome || 'Não informado'}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Endereço:</Text>
                <Text style={styles.valor}>{endereco || 'Não informado'}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Bairro:</Text>
                <Text style={styles.valor}>{bairro || 'Não informado'}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Cidade:</Text>
                <Text style={styles.valor}>{cidade || 'Não informado'}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>CEP:</Text>
                <Text style={styles.valor}>{cliente[6] || 'Não informado'}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>UF:</Text>
                <Text style={styles.valor}>{cliente[7] || 'Não informado'}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Telefone 1:</Text>
                <Text style={styles.valor}>{telefone1 || 'Não informado'}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Celular:</Text>
                <Text style={styles.valor}>{cliente[10] || 'Não informado'}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Data Cadastro:</Text>
                <Text style={styles.valor}>
                  {cliente[14] ? new Date(cliente[14]).toLocaleDateString('pt-BR') : 'Não informado'}
                </Text>
              </View>
            </View>
          </View>
        ) : carregado ? (
          <View style={styles.semResultadoContainer}>
            <Text style={styles.semResultadoTexto}>Cliente não encontrado</Text>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40, // Espaço extra no final
  },
  header: {
    marginBottom: 25,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  buscaContainer: {
    marginBottom: 25,
  },
  input: {
    height: 55,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  resultadoContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  clienteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
    flex: 1,
  },
  valor: {
    fontSize: 15,
    color: '#333',
    flex: 1.5,
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  valorDestaque: {
    fontWeight: 'bold',
    color: '#34d2ec',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  semResultadoContainer: {
    padding: 30,
    alignItems: 'center',
  },
  semResultadoTexto: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  erroContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  erroTexto: {
    color: '#d32f2f',
    fontSize: 14,
  },
});
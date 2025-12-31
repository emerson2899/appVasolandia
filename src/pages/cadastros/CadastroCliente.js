import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';
import axios from 'axios';

export default function CadastroCliente() {
  const API_BASE_URL = 'http://192.168.1.133000/api';
  
  // Estados dos campos
  const [nome, setNome] = useState('');
  const [telefone1, setTelefone1] = useState('');
  const [telefone2, setTelefone2] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [email, setEmail] = useState('');
  //const [observacoes, setObservacoes] = useState('');
  
  // Estados adicionais
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoCliente, setTipoCliente] = useState('PF'); // PF ou PJ

  // Validação de campos obrigatórios
  const camposValidos = nome.trim() !== '' && telefone1.trim() !== '' && endereco.trim() !== '';

  // Formatar telefone
  const formatarTelefone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  // Formatar CPF/CNPJ
  const formatarCpfCnpj = (value, tipo) => {
    const numbers = value.replace(/\D/g, '');
    if (tipo === 'PF') {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const handleCadastro = async () => {
    if (!camposValidos) {
      Alert.alert(
        'Campos obrigatórios',
        'Preencha pelo menos:\n• Nome\n• Telefone 1\n• Endereço',
        [{ text: 'OK' }]
      );
      return;
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('E-mail inválido', 'Digite um e-mail válido');
      return;
    }

    setLoading(true);

    const clienteData = {
      nome: nome.trim(),
      tipo: tipoCliente,
      documento: cpfCnpj.replace(/\D/g, ''),
      telefone1: telefone1.replace(/\D/g, ''),
      telefone2: telefone2.replace(/\D/g, ''),
      email: email.trim() || null,
      endereco: endereco.trim(),
     // observacoes: observacoes.trim() || null,
      data_cadastro: new Date().toISOString().split('T')[0]
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/cliente`,
        clienteData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.success) {
        setModalVisible(true);
      } else {
        Alert.alert('Erro', response.data?.message || 'Erro ao cadastrar cliente');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Não foi possível conectar ao servidor'
      );
    } finally {
      setLoading(false);
    }
  };

  const limparFormulario = () => {
    setNome('');
    setTelefone1('');
    setTelefone2('');
    setEndereco('');
    setCpfCnpj('');
    setEmail('');
    setObservacoes('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Cadastro de Cliente</Text>
          <Text style={styles.subtitle}>Preencha os dados do novo cliente</Text>
        </View>

        {/* Tipo de Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="person-circle" size={20} color="#2D5A3D" />
            Tipo de Cliente
          </Text>
          
          <View style={styles.tipoContainer}>
            <TouchableOpacity
              style={[
                styles.tipoButton,
                tipoCliente === 'PF' && styles.tipoButtonActive
              ]}
              onPress={() => setTipoCliente('PF')}
            >
              <Ionicons
                name="person"
                size={24}
                color={tipoCliente === 'PF' ? '#2D5A3D' : '#999'}
              />
              <Text
                style={[
                  styles.tipoButtonText,
                  tipoCliente === 'PF' && styles.tipoButtonTextActive
                ]}
              >
                Pessoa Física
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tipoButton,
                tipoCliente === 'PJ' && styles.tipoButtonActive
              ]}
              onPress={() => setTipoCliente('PJ')}
            >
              <Ionicons
                name="business"
                size={24}
                color={tipoCliente === 'PJ' ? '#2D5A3D' : '#999'}
              />
              <Text
                style={[
                  styles.tipoButtonText,
                  tipoCliente === 'PJ' && styles.tipoButtonTextActive
                ]}
              >
                Pessoa Jurídica
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dados Principais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <FontAwesome5 name="user-alt" size={18} color="#2D5A3D" />
            Dados Principais
          </Text>

          <Text style={styles.label}>
            Nome Completo <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <Feather name="user" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Digite o nome completo"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
            />
          </View>

          <Text style={styles.label}>
            {tipoCliente === 'PF' ? 'CPF' : 'CNPJ'}
          </Text>
          <View style={styles.inputContainer}>
            <Feather name="file-text" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={tipoCliente === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
              value={cpfCnpj}
              onChangeText={(text) => setCpfCnpj(formatarCpfCnpj(text, tipoCliente))}
              keyboardType="numeric"
              maxLength={tipoCliente === 'PF' ? 14 : 18}
            />
          </View>

          <Text style={styles.label}>E-mail</Text>
          <View style={styles.inputContainer}>
            <Feather name="mail" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="exemplo@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Contatos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Feather name="phone" size={20} color="#2D5A3D" />
            Contatos
          </Text>

          <Text style={styles.label}>
            Telefone 1 <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <Feather name="phone-call" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              value={telefone1}
              onChangeText={(text) => setTelefone1(formatarTelefone(text))}
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>

          <Text style={styles.label}>Telefone 2</Text>
          <View style={styles.inputContainer}>
            <Feather name="phone" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              value={telefone2}
              onChangeText={(text) => setTelefone2(formatarTelefone(text))}
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>
        </View>

        {/* Endereço */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <FontAwesome5 name="map-marker-alt" size={18} color="#2D5A3D" />
            Endereço
          </Text>

          <Text style={styles.label}>
            Endereço Completo <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <Feather name="map-pin" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Rua, número, bairro, cidade"
              value={endereco}
              onChangeText={setEndereco}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Observações */}
        {/*
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Feather name="edit-2" size={18} color="#2D5A3D" />
            Observações
          </Text>
          <View style={styles.inputContainer}>
            <Feather name="message-square" size={20} color="#999" style={[styles.inputIcon, styles.textAreaIcon]} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Observações importantes sobre o cliente"
              value={observacoes}
              onChangeText={setObservacoes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
*/}

        {/* Botões */}
        <View style={styles.footer}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={limparFormulario}
            >
              <MaterialIcons name="clear" size={20} color="#666" />
              <Text style={styles.cancelButtonText}>Limpar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton, !camposValidos && styles.buttonDisabled]}
              onPress={handleCadastro}
              disabled={!camposValidos || loading}
            >
              {loading ? (
                <Text style={styles.submitButtonText}>Processando...</Text>
              ) : (
                <>
                  <MaterialIcons name="save" size={20} color="#FFF" />
                  <Text style={styles.submitButtonText}>Cadastrar Cliente</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {!camposValidos && (
            <Text style={styles.requiredFieldsText}>
              * Preencha os campos obrigatórios
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Modal de Confirmação */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            </View>
            <Text style={styles.modalTitle}>Cliente Cadastrado!</Text>
            <Text style={styles.modalText}>
              O cliente <Text style={styles.modalHighlight}>{nome}</Text> foi cadastrado com sucesso no sistema.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  setModalVisible(false);
                  limparFormulario();
                }}
              >
                <Text style={styles.modalButtonSecondaryText}>Novo Cadastro</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonPrimaryText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2D5A3D',
    padding: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D5A3D',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipoContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tipoButton: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginHorizontal: 5,
  },
  tipoButtonActive: {
    borderColor: '#2D5A3D',
    backgroundColor: '#E8F5E9',
  },
  tipoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginTop: 8,
  },
  tipoButtonTextActive: {
    color: '#2D5A3D',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginLeft: 5,
  },
  required: {
    color: '#FF3B30',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: 17,
    zIndex: 1,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 15,
    paddingLeft: 45,
    fontSize: 16,
    minHeight: 50,
  },
  textAreaIcon: {
    top: 20,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#2D5A3D',
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  requiredFieldsText: {
    color: '#FF3B30',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D5A3D',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  modalHighlight: {
    fontWeight: '700',
    color: '#2D5A3D',
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  modalButtonPrimary: {
    backgroundColor: '#2D5A3D',
  },
  modalButtonPrimaryText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalButtonSecondaryText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});
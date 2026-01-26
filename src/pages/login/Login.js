import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function LoginVendedor({ navigation }) {
  const [codigoVendedor, setCodigoVendedor] = useState('');
  const [loading, setLoading] = useState(false);
  const [lembrarUsuario, setLembrarUsuario] = useState(false);

  useEffect(() => {
    // Verificar se há código salvo
    const carregarCodigoSalvo = async () => {
      try {
        const codigoSalvo = await AsyncStorage.getItem('codigoVendedor');
        if (codigoSalvo) {
          setCodigoVendedor(codigoSalvo);
          setLembrarUsuario(true);
        }
      } catch (error) {
        console.error('Erro ao carregar código salvo:', error);
      }
    };
    
    carregarCodigoSalvo();
  }, []);

  const handleLogin = async () => {
    if (!codigoVendedor.trim()) {
      Alert.alert('Código obrigatório', 'Digite o código do vendedor');
      return;
    }

    setLoading(true);

    try {
      // Aqui você faria a verificação na API
      // const response = await axios.post('http://localhost:3000/api/vendedor/login', {
    //  codigo: codigoVendedor
      // });

      // Simulação de verificação
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Verificação mock - substitua pela sua lógica real
      const vendedores ={        
        '1': 'Erica',
        '2': 'Marcio',
        '4': 'Kayo',
        '5': 'Alice',
        '6': 'Denis',
        '7': 'Wellington',
      }
      const vendedoresValidos = ['1', '2', '4', '5', '6','8'];
      const codigoNumerico = codigoVendedor.trim();
      
      if (vendedoresValidos.includes(codigoNumerico)) {
        // Salvar código se "lembrar" estiver ativado
        if (lembrarUsuario) {
          await AsyncStorage.setItem('codigoVendedor', codigoNumerico);
        } else {
          await AsyncStorage.removeItem('codigoVendedor');
        }
        
        // Salvar sessão
        await AsyncStorage.setItem('vendedorLogado', JSON.stringify({
          codigo: codigoNumerico,
          nome: vendedores[codigoNumerico],
          dataLogin: new Date().toISOString()
        }));
        
        // Navegar para a tela principal
        navigation.replace('Menu');
        
        Alert.alert(
          'Login realizado!',
          `Bem-vindo, Vendedor ${codigoNumerico} - ${vendedores[codigoNumerico]}!`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Código inválido',
          'O código do vendedor não foi reconhecido. Tente novamente.'
        );
      }
    } catch (error) {
      console.error('Erro no login:', error);
      Alert.alert(
        'Erro de conexão',
        'Não foi possível conectar ao servidor. Verifique sua conexão.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLimpar = () => {
    setCodigoVendedor('');
    AsyncStorage.removeItem('codigoVendedor');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo/Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="storefront" size={80} color="#2D5A3D" />
            <Text style={styles.logoText}>Sistema de Vendas</Text>
          </View>
          <Text style={styles.welcomeText}>Acesso do Vendedor</Text>
        </View>

        {/* Card de Login */}
        <View style={styles.loginCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="key" size={28} color="#2D5A3D" />
            <Text style={styles.cardTitle}>Digite seu código</Text>
            <Text style={styles.cardSubtitle}>
              Informe o código do vendedor para acessar o sistema
            </Text>
          </View>

          {/* Campo de Código */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <FontAwesome5 
                name="user-tag" 
                size={22} 
                color="#999" 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="000"
                value={codigoVendedor}
                onChangeText={setCodigoVendedor}
                keyboardType="numeric"
                maxLength={10}
                autoFocus={true}
                editable={!loading}
                onSubmitEditing={handleLogin}
              />
              {codigoVendedor ? (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleLimpar}
                  disabled={loading}
                >
                  <Ionicons name="close-circle" size={22} color="#999" />
                </TouchableOpacity>
              ) : null}
            </View>
            
            <Text style={styles.inputLabel}>
              Código do Vendedor
            </Text>
          </View>

          {/* Opção Lembrar */}
          <TouchableOpacity
            style={styles.rememberContainer}
            onPress={() => setLembrarUsuario(!lembrarUsuario)}
            disabled={loading}
          >
            <View style={[
              styles.checkbox,
              lembrarUsuario && styles.checkboxChecked
            ]}>
              {lembrarUsuario && (
                <Ionicons name="checkmark" size={16} color="#FFF" />
              )}
            </View>
            <Text style={styles.rememberText}>Lembrar meu código</Text>
          </TouchableOpacity>

          {/* Botão de Login */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              (!codigoVendedor.trim() || loading) && styles.loginButtonDisabled
            ]}
            onPress={handleLogin}
            disabled={!codigoVendedor.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Ionicons name="log-in" size={22} color="#FFF" />
                <Text style={styles.loginButtonText}>Entrar no Sistema</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Informações de Ajuda */}
          <View style={styles.helpContainer}>
            <TouchableOpacity style={styles.helpLink}>
              <Ionicons name="help-circle" size={18} color="#666" />
              <Text style={styles.helpText}>Esqueceu o código?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.helpLink}>
              <Ionicons name="person-add" size={18} color="#666" />
              <Text style={styles.helpText}>Novo vendedor?</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Sistema de Vendas v1.0</Text>
          <Text style={styles.footerSubtext}>© 2024 - Todos os direitos reservados</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
    </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D5A3D',
  },
  content: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 80,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D5A3D',
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  loginCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D5A3D',
    marginTop: 10,
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 20,
    top: 19,
    zIndex: 1,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 15,
    padding: 18,
    paddingLeft: 60,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 2,
    color: '#2D5A3D',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  clearButton: {
    position: 'absolute',
    right: 20,
    top: 19,
    zIndex: 1,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    alignSelf: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#999',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2D5A3D',
    borderColor: '#2D5A3D',
  },
  rememberText: {
    fontSize: 14,
    color: '#666',
  },
  loginButton: {
    backgroundColor: '#2D5A3D',
    padding: 18,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 18,
    marginLeft: 10,
  },
  helpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 6,
  },
  footer: {
    padding: 30,
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
  },
});
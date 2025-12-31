import React, {useState, useEffect} from "react";
import { SafeAreaView, ScrollView, View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Modal, TouchableOpacity } from "react-native";
import { Camera, CameraView } from "expo-camera";
import  MaterialIcons  from '@expo/vector-icons/MaterialIcons';
import Feather from "@expo/vector-icons";
import axios from "axios";
import { Button } from "@react-navigation/elements";
import { set } from "lodash";
import { FlatList } from "react-native-gesture-handler";



function GerarVenda() {
     const formatarCPF = (cpf) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };
    const [itens, setItens] = useState([]);
    const [total, setTotal] = useState(0);
    const [venda, setVenda] = useState({});
    const [loading, setLoading] = useState(false);
    const [clienteNome, setClienteNome] = useState('');
    const [clienteSelecionado, setClienteSelecionado] = useState(false);
    const [cliente, setCliente] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [opcoesClientes, setOpcoesClientes] = useState([]);
    const [telefoneCliente, setTelefoneCliente] = useState('');
    const [codigoCliente, setCodigoCliente] = useState('');
    const [modalClienteVisible, setModalClienteVisible] = useState(false);
    const [modalProdutoVisible, setModalProdutoVisible] = useState(false);
    const [modalFinalizarPedido, setModalFinalizarPedido] = useState(false);
    const [codigoPedido, setCodigoPedido] = useState('');
    let API_URL = 'http://192.168.1.13:3000/api/clientes/seguro/buscar';

    function ModalCliente() {
        setModalClienteVisible(true);
    }
    
    function ModalProduto() {
        setModalProdutoVisible(true);
    }
    
    function FecharModalCliente() {
        setModalClienteVisible(false);
    }

    function FecharModalProduto() {
        setModalProdutoVisible(false);
    }

    function ModalFinalizarPedido() {
        setModalFinalizarPedido(true);
    }

    function FecharModalFinalizarPedido() {
        setModalFinalizarPedido(false);
    }
const LocalizarClientePorNome =() =>{
   try {
    const response = axios.get(`${API_URL}/nome?nome=${encodeURIComponent(clienteNome)}`);

    if (response.data && response.data.data) {
      setCliente(response.data.data);
      setClienteNome(response.data.data.NOME);
      
    }
   } catch (error) {
    console.log(error);
   }
}
    function LocalizarProduto(){
        
    }


    return (
    <KeyboardAvoidingView
    style={styles.container}
    >
        <ScrollView showsVerticalScrollIndicator={false}>
            {/* HEADER */}

            {/*Modal Busca Cliente*/}
            <Modal
            transparent={true}
            animationType="slide"
            visible={modalClienteVisible}
            onRequestClose={FecharModalCliente}
            >
                <View style={{flex: 1, marginTop: 22, backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
                <View style={{flex: 1, backgroundColor: '#fff', borderRadius: 20, width: '80%', alignItems: 'center', height:'80%', marginBottom: 150, alignItems: 'center', alignContent: 'center', marginStart: 50}}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Buscar Cliente</Text>
                    </View>
                    <View>
                                <Text>Buscar por Nome</Text>
                                <TextInput
                                style={styles.input}
                                placeholder="Nome do Cliente"
                                value={clienteNome}
                                onChangeText={(text) => setClienteNome(text)}
                                />
                                <TouchableOpacity style={styles.button} onPress={LocalizarClientePorNome}>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
                                        <MaterialIcons name="search" size={20} color="#00059fff" />
                                        <Text style={styles.buttonText}>Buscar</Text>
                                    </View>
                                    
                                </TouchableOpacity>


                              
                                    
                            </View>
                            <TouchableOpacity style={{alignSelf: 'center', backgroundColor: '#fff', borderRadius: 20, marginBottom: 20}} onPress={FecharModalCliente}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10, marginLeft: 20, height: 50, width: 100}}>
                        <MaterialIcons name="close" size={30} color="#dd0b0bff" onPress={FecharModalCliente} />
                    <Text style={{fontSize: 20, color: '#000000ff', textAlign: 'center'}}>Fechar</Text>

                    </View>
                </TouchableOpacity>
                    
                        

                </View>
        
                </View>

            </Modal>
            {/* MODAL BUSCAR PRODUTO* */}
            <View style={styles.header}>
                <Text style={styles.title}>Gerar Venda</Text>

                {/* ITENS DA VNDA*/}
                {itens.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Itens da Venda</Text>
                        </View>

                    </View>
                )}
                {clienteSelecionado ? (
                    <>
                    <View style={styles.section}>
                        <Text>Cliente Selecionado</Text>
                        <Text>{clienteNome}</Text>
                    </View>
                    </>
                ) : (
                    <>
                    <View style={styles.section}>
                        <TouchableOpacity onPress={ModalCliente}>
                            <Text style={styles.sectionTitle}>Selecionar Cliente</Text>
                          
                             </TouchableOpacity>
                            
                        
                    </View>
                    </>
                )
                }
                {/** FIM DE ITENS DA VENDA */}
                {/** TOTAL DA VENDA */}




            </View>

        </ScrollView>
    
        
        
    </KeyboardAvoidingView>
    );
}

export default GerarVenda

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2D5A3D',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 10,
  },
  totalContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 12,
  },
  totalText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFF',
  },
  itemCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D5A3D',
    marginBottom: 15,
  },
  selecionadoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 12,
  },
  selecionadoInfo: {
    flex: 1,
  },
  selecionadoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5A3D',
    marginBottom: 5,
  },
  selecionadoDetalhes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 5,
  },
  selecionadoCPF: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  selecionadoCodigo: {
    fontSize: 14,
    color: '#666',
  },
  selecionadoPreco: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D5A3D',
    marginRight: 15,
  },
  selecionadoEstoque: {
    fontSize: 14,
    color: '#666',
  },
  btnAlterar: {
    backgroundColor: '#FFA000',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  btnAlterarText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  buscaContainer: {
    position: 'relative',
    zIndex: 1,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: 17,
    zIndex: 1,
  },
  inputWithIcon: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 15,
    paddingLeft: 45,
    fontSize: 16,
  },
  inputLoading: {
    position: 'absolute',
    right: 15,
    top: 17,
  },
  sugestoesContainer: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginTop: 5,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sugestaoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sugestaoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sugestaoInfo: {
    flex: 1,
  },
  sugestaoNome: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  sugestaoDetalhes: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  sugestaoCodigo: {
    fontSize: 12,
    color: '#999',
  },
  sugestaoPreco: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2196F3',
  },
  semResultados: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginTop: 5,
  },
  semResultadosText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buscaAlternativa: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  buscaAlternativaLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  codigoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codigoInput: {
    flex: 1,
    marginRight: 10,
  },
  btnBuscarCodigo: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    minWidth: 100,
  },
  btnBuscarCodigoText: {
    color: '#FFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  codigoBarrasContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputFlex: {
    flex: 1,
  },
  btnScanner: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    marginLeft: 10,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -5,
    marginBottom: 15,
  },
  col: {
    flex: 1,
    paddingHorizontal: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  btnAdicionar: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  btnAdicionarText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  cameraTitle: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: '600',
    marginBottom: 10,
  },
  cameraTimer: {
    fontSize: 16,
    color: '#FFF',
  },
  scanner: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cameraBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
    borderRadius: 30,
    marginHorizontal: 10,
  },
  cameraBtnClose: {
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
  },
  itemCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemProduto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  itemDetalhes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantidade: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  qtdInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 60,
    textAlign: 'center',
    fontSize: 16,
  },
  itemValores: {
    alignItems: 'flex-end',
  },
  itemPreco: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  itemSubtotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D5A3D',
  },
  itemInfo: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  itemDesconto: {
    fontSize: 12,
    color: '#FF9800',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  itemObservacao: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  btnFinalizar: {
    backgroundColor: '#2D5A3D',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFinalizarText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 18,
    marginLeft: 10,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
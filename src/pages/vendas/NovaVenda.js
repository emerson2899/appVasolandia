// screens/GerarVenda.js
import React, { useState, useEffect } from "react";
import {
    SafeAreaView, ScrollView, View, Text, TextInput, StyleSheet,
    KeyboardAvoidingView, Modal, TouchableOpacity, ActivityIndicator, Alert,
    Platform
} from "react-native";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useVendedor } from '../contexts/VendedorContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

function GerarVenda({ navigation }) {
    // Estados
    const [itens, setItens] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [clienteNome, setClienteNome] = useState('');
    const [clienteSelecionado, setClienteSelecionado] = useState(null);
    const [modalClienteVisible, setModalClienteVisible] = useState(false);
    const [produtoNome, setProdutoNome] = useState('');
    const [produtoPreco, setProdutoPreco] = useState('');
    const [produtoQuantidade, setProdutoQuantidade] = useState('1');
    const [modalProdutoVisible, setModalProdutoVisible] = useState(false);
    
    // Dados do vendedor
    const { vendedor, loading: loadingVendedor } = useVendedor();
    const [vendedorNome, setVendedorNome] = useState('');
    const [vendedorCodigo, setVendedorCodigo] = useState('');

    // API URL
    const API_URL = 'http://191.252.185.78:3000/api';

    // Carregar dados do vendedor
    useEffect(() => {
        carregarDadosVendedor();
    }, [vendedor]);

    useEffect(() => {
        calcularTotal();
    }, [itens]);

    const carregarDadosVendedor = async () => {
        try {
            if (vendedor) {
                setVendedorNome(vendedor.nome || '');
                setVendedorCodigo(vendedor.codigo || '');
                console.log('Vendedor carregado do contexto:', vendedor);
            } else {
                // Fallback: tentar carregar diretamente do AsyncStorage
                const vendedorData = await AsyncStorage.getItem('vendedorLogado');
                if (vendedorData) {
                    const vendedorObj = JSON.parse(vendedorData);
                    setVendedorNome(vendedorObj.nome || '');
                    setVendedorCodigo(vendedorObj.codigo || '');
                    console.log('Vendedor carregado do storage:', vendedorObj);
                } else {
                    console.warn('Nenhum vendedor encontrado!');
                    // Redirecionar para o login se não tiver vendedor
                    Alert.alert(
                        'Sessão expirada',
                        'Por favor, faça login novamente.',
                        [{ text: 'OK', onPress: () => navigation.replace('Login') }]
                    );
                }
            }
        } catch (error) {
            console.error('Erro ao carregar vendedor:', error);
        }
    };

    const calcularTotal = () => {
        const soma = itens.reduce((sum, item) => sum + (item.subtotal || 0), 0);
        setTotal(soma);
    };

    const adicionarProduto = () => {
        if (!produtoNome || !produtoPreco) {
            Alert.alert('Erro', 'Preencha o nome e preço do produto');
            return;
        }

        const quantidade = parseFloat(produtoQuantidade) || 1;
        const preco = parseFloat(produtoPreco);
        const subtotal = preco * quantidade;

        const novoItem = {
            nome: produtoNome,
            precoUnitario: preco,
            quantidade: quantidade,
            subtotal: subtotal
        };

        setItens([...itens, novoItem]);
        setProdutoNome('');
        setProdutoPreco('');
        setProdutoQuantidade('1');
        setModalProdutoVisible(false);
    };

    const removerItem = (index) => {
        const novosItens = [...itens];
        novosItens.splice(index, 1);
        setItens(novosItens);
    };

    const LocalizarClientePorNome = async () => {
        if (!clienteNome) {
            Alert.alert('Aviso', 'Digite o nome do cliente');
            return;
        }
        
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/clientes/seguro/buscar/nome?nome=${encodeURIComponent(clienteNome)}`);
            const data = response.data.data || response.data;
            
            if (data) {
                const cli = Array.isArray(data) ? data[0] : data;
                setClienteSelecionado(cli);
                setClienteNome(cli.NOME || cli.nome);
                setModalClienteVisible(false);
                Alert.alert('Sucesso', `Cliente ${cli.NOME || cli.nome} localizado!`);
            } else {
                Alert.alert('Erro', 'Cliente não encontrado.');
            }
        } catch (error) {
            console.error('Erro ao buscar cliente:', error);
            Alert.alert('Erro', 'Cliente não encontrado ou erro na conexão.');
        } finally {
            setLoading(false);
        }
    };

    // Função para gerar HTML do cupom
    const gerarCupomHTML = (dadosVenda) => {
        const dataHora = new Date().toLocaleString('pt-BR');
        
        let produtosHTML = '';
        dadosVenda.itens.forEach(item => {
            produtosHTML += `
                <tr>
                    <td style="padding: 5px 0;">${item.nome.substring(0, 30)}</td>
                    <td style="text-align: center;">${item.quantidade}</td>
                    <td style="text-align: right;">R$ ${item.precoUnitario.toFixed(2)}</td>
                    <td style="text-align: right;">R$ ${item.subtotal.toFixed(2)}</td>
                </tr>
            `;
        });

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: 'Courier New', monospace;
                        width: 300px;
                        margin: 0 auto;
                        padding: 20px 10px;
                        font-size: 12px;
                        background: white;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 15px;
                        border-bottom: 1px dashed #000;
                        padding-bottom: 10px;
                    }
                    .title {
                        font-size: 16px;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    .subtitle {
                        font-size: 11px;
                        margin-bottom: 3px;
                    }
                    .info {
                        margin: 10px 0;
                        line-height: 1.5;
                    }
                    .info-line {
                        margin-bottom: 3px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 10px 0;
                    }
                    th, td {
                        text-align: left;
                        padding: 5px 0;
                    }
                    th {
                        border-bottom: 1px solid #000;
                        font-weight: bold;
                    }
                    .total {
                        border-top: 1px dashed #000;
                        margin-top: 10px;
                        padding-top: 10px;
                        text-align: right;
                    }
                    .total-line {
                        margin-bottom: 5px;
                    }
                    .total-value {
                        font-size: 14px;
                        font-weight: bold;
                        margin-top: 5px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        padding-top: 10px;
                        border-top: 1px dashed #000;
                    }
                    .divider {
                        border-top: 1px dashed #000;
                        margin: 10px 0;
                    }
                    .text-center {
                        text-align: center;
                    }
                    .bold {
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title">VASOLANDIA PLANTAS & CIA</div>
                    <div class="subtitle">FONE: (19)3481-6299</div>
                    <div class="subtitle">CNPJ: 00.000.000/0001-00</div>
                    <div class="subtitle">SEM VALOR FISCAL</div>
                </div>
                
                <div class="info">
                    <div class="info-line">DATA: ${dataHora}</div>
                    <div class="info-line">PEDIDO: ${String(dadosVenda.id).padStart(6, '0')}</div>
                    <div class="info-line">CONDIÇÃO: PAGAMENTO A VISTA</div>
                    <div class="info-line">VENDEDOR: ${vendedorNome || 'N/A'} (Cód: ${vendedorCodigo || 'N/A'})</div>
                    <div class="info-line">CLIENTE: ${dadosVenda.clienteNome}</div>
                </div>
                
                <div class="divider"></div>
                
                <table>
                    <thead>
                        <tr>
                            <th>PRODUTO</th>
                            <th width="40">QTD</th>
                            <th width="60">VL</th>
                            <th width="70">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${produtosHTML}
                    </tbody>
                </table>
                
                <div class="divider"></div>
                
                <div class="info">
                    <div class="info-line">QUANT. DE ITENS: ${dadosVenda.itens.length}</div>
                    <div class="info-line">TOTAL DE PRODUTOS: ${dadosVenda.itens.reduce((sum, item) => sum + item.quantidade, 0)}</div>
                </div>
                
                <div class="divider"></div>
                
                <div class="total">
                    <div class="total-line">SUBTOTAL: R$ ${dadosVenda.total.toFixed(2)}</div>
                    <div class="total-line">DESCONTO: R$ 0.00</div>
                    <div class="total-value">TOTAL A PAGAR: R$ ${dadosVenda.total.toFixed(2)}</div>
                </div>
                
                <div class="footer">
                    <div>______________________</div>
                    <div>ASSINATURA DO CLIENTE</div>
                    <div style="margin-top: 10px;">* OBRIGADO PELA PREFERÊNCIA *</div>
                    <div style="margin-top: 5px;">VOLTE SEMPRE!</div>
                </div>
            </body>
            </html>
        `;
    };

    // Função de impressão
    const imprimirCupom = async (dadosVenda) => {
        try {
            setLoading(true);
            const htmlContent = gerarCupomHTML(dadosVenda);
            
            await Print.printAsync({
                html: htmlContent,
            });
            
            return true;
        } catch (error) {
            console.error("Erro na impressão:", error);
            Alert.alert("Erro", "Falha ao imprimir: " + error.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const finalizarVendaCompleta = async () => {
        if (!clienteSelecionado) {
            Alert.alert("Aviso", "Por favor, selecione um cliente.");
            return;
        }
        
        if (itens.length === 0) {
            Alert.alert("Aviso", "Adicione pelo menos um produto à venda.");
            return;
        }
        
        if (!vendedorCodigo) {
            Alert.alert("Erro", "Vendedor não identificado. Faça login novamente.");
            navigation.replace('Login');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                cliente_id: clienteSelecionado.ID || clienteSelecionado.CODIGO,
                cliente_nome: clienteNome,
                itens: itens,
                total: total,
                vendedor_codigo: vendedorCodigo,
                vendedor_nome: vendedorNome,
                data_venda: new Date().toISOString()
            };

            console.log('Enviando venda:', payload);

            // Comentar a chamada da API se não estiver disponível
            // const response = await axios.post(`${API_URL}/vendas/gerar`, payload);
            
            // Simulação de resposta da API
            await new Promise(resolve => setTimeout(resolve, 1000));
            const response = { data: { id_venda: Math.floor(Math.random() * 100000) } };

            if (response.data) {
                const dadosParaCupom = {
                    id: response.data.id_venda || Math.floor(Math.random() * 100000),
                    clienteNome: clienteNome,
                    itens: itens,
                    total: total
                };

                const impresso = await imprimirCupom(dadosParaCupom);

                if (impresso) {
                    Alert.alert(
                        "Sucesso!", 
                        `Venda finalizada com sucesso!\nVendedor: ${vendedorNome}\nTotal: R$ ${total.toFixed(2)}`,
                        [
                            { 
                                text: "OK", 
                                onPress: () => {
                                    setItens([]);
                                    setClienteSelecionado(null);
                                    setClienteNome('');
                                    setTotal(0);
                                }
                            }
                        ]
                    );
                } else {
                    Alert.alert("Aviso", "Venda salva, mas houve falha na impressão.");
                }
            }
        } catch (error) {
            console.error("Erro ao finalizar venda:", error);
            Alert.alert("Erro", "Erro ao salvar venda. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={{ flex: 1 }}
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Nova Venda</Text>
                        {vendedorNome && (
                            <Text style={styles.vendedorInfo}>
                                Vendedor: {vendedorNome} (Cód: {vendedorCodigo})
                            </Text>
                        )}
                        <View style={styles.totalContainer}>
                            <Text style={styles.totalText}>R$ {total.toFixed(2)}</Text>
                            <Text style={styles.itemCount}>{itens.length} itens no carrinho</Text>
                        </View>
                    </View>

                    {/* Seção Cliente */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Cliente</Text>
                        {clienteSelecionado ? (
                            <View style={styles.selecionadoCard}>
                                <View style={styles.selecionadoInfo}>
                                    <Text style={styles.selecionadoNome}>{clienteNome}</Text>
                                    <Text style={styles.selecionadoCodigo}>
                                        Cód: {clienteSelecionado.ID || clienteSelecionado.CODIGO}
                                    </Text>
                                </View>
                                <TouchableOpacity 
                                    onPress={() => {
                                        setClienteSelecionado(null);
                                        setClienteNome('');
                                    }} 
                                    style={styles.btnAlterar}
                                >
                                    <Text style={styles.btnAlterarText}>Alterar</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity 
                                style={styles.btnAdicionar} 
                                onPress={() => setModalClienteVisible(true)}
                            >
                                <Ionicons name="person-search" size={24} color="#FFF" />
                                <Text style={styles.btnAdicionarText}>Buscar Cliente</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Seção Produtos */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Produtos</Text>
                        <TouchableOpacity 
                            style={styles.btnAdicionarProduto} 
                            onPress={() => setModalProdutoVisible(true)}
                        >
                            <Ionicons name="add-circle" size={24} color="#FFF" />
                            <Text style={styles.btnAdicionarText}>Adicionar Produto</Text>
                        </TouchableOpacity>
                        
                        {itens.length > 0 ? (
                            itens.map((item, index) => (
                                <View key={index} style={styles.itemCard}>
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemProduto}>{item.nome}</Text>
                                        <Text style={styles.itemDetalhe}>
                                            {item.quantidade}x R$ {item.precoUnitario.toFixed(2)} = R$ {item.subtotal.toFixed(2)}
                                        </Text>
                                    </View>
                                    <TouchableOpacity 
                                        onPress={() => removerItem(index)} 
                                        style={styles.btnRemover}
                                    >
                                        <Ionicons name="trash" size={20} color="#FF5252" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>Nenhum produto adicionado</Text>
                        )}
                    </View>
                </ScrollView>

                {/* Rodapé Fixo */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.btnFinalizar, 
                            (loading || !clienteSelecionado || itens.length === 0) && styles.btnDisabled
                        ]}
                        onPress={finalizarVendaCompleta}
                        disabled={loading || !clienteSelecionado || itens.length === 0}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="print" size={24} color="#FFF" />
                                <Text style={styles.btnFinalizarText}>FINALIZAR E IMPRIMIR</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Modal Buscar Cliente */}
                <Modal visible={modalClienteVisible} animationType="slide" transparent={true}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Localizar Cliente</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite o nome do cliente"
                                value={clienteNome}
                                onChangeText={setClienteNome}
                                autoFocus={true}
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity 
                                    style={[styles.modalButton, styles.modalButtonCancel]} 
                                    onPress={() => {
                                        setModalClienteVisible(false);
                                        setClienteNome('');
                                    }}
                                >
                                    <Text style={styles.modalButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.modalButton, styles.modalButtonConfirm]} 
                                    onPress={LocalizarClientePorNome}
                                >
                                    <Text style={styles.modalButtonText}>Buscar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Modal Adicionar Produto */}
                <Modal visible={modalProdutoVisible} animationType="slide" transparent={true}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Adicionar Produto</Text>
                            
                            <Text style={styles.inputLabel}>Nome do Produto</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Rosa Vermelha"
                                value={produtoNome}
                                onChangeText={setProdutoNome}
                            />
                            
                            <Text style={styles.inputLabel}>Preço Unitário (R$)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0,00"
                                value={produtoPreco}
                                onChangeText={setProdutoPreco}
                                keyboardType="numeric"
                            />
                            
                            <Text style={styles.inputLabel}>Quantidade</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="1"
                                value={produtoQuantidade}
                                onChangeText={setProdutoQuantidade}
                                keyboardType="numeric"
                            />
                            
                            <View style={styles.modalButtons}>
                                <TouchableOpacity 
                                    style={[styles.modalButton, styles.modalButtonCancel]} 
                                    onPress={() => setModalProdutoVisible(false)}
                                >
                                    <Text style={styles.modalButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.modalButton, styles.modalButtonConfirm]} 
                                    onPress={adicionarProduto}
                                >
                                    <Text style={styles.modalButtonText}>Adicionar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F5F5F5' 
    },
    header: { 
        backgroundColor: '#2D5A3D', 
        padding: 20, 
        borderBottomLeftRadius: 20, 
        borderBottomRightRadius: 20 
    },
    title: { 
        fontSize: 24, 
        fontWeight: '700', 
        color: '#FFF' 
    },
    vendedorInfo: {
        fontSize: 14,
        color: '#FFF',
        opacity: 0.9,
        marginTop: 5
    },
    totalContainer: { 
        marginTop: 10 
    },
    totalText: { 
        fontSize: 32, 
        fontWeight: 'bold', 
        color: '#FFF' 
    },
    itemCount: { 
        color: '#FFF', 
        opacity: 0.8 
    },
    section: { 
        backgroundColor: '#FFF', 
        margin: 15, 
        padding: 20, 
        borderRadius: 16, 
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    sectionTitle: { 
        fontSize: 18, 
        fontWeight: '600', 
        color: '#2D5A3D', 
        marginBottom: 15 
    },
    input: { 
        backgroundColor: '#F8F9FA', 
        borderWidth: 1, 
        borderColor: '#E9ECEF', 
        borderRadius: 12, 
        padding: 12, 
        fontSize: 16,
        marginBottom: 15
    },
    inputLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
        fontWeight: '500'
    },
    btnAdicionar: { 
        backgroundColor: '#4CAF50', 
        padding: 15, 
        borderRadius: 12, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    btnAdicionarProduto: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15
    },
    btnAdicionarText: { 
        color: '#FFF', 
        fontWeight: 'bold', 
        marginLeft: 8,
        fontSize: 16
    },
    btnFinalizar: { 
        backgroundColor: '#2D5A3D', 
        padding: 18, 
        borderRadius: 12, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    btnDisabled: {
        backgroundColor: '#999',
        opacity: 0.6
    },
    btnFinalizarText: { 
        color: '#FFF', 
        fontWeight: '700', 
        fontSize: 18, 
        marginLeft: 10 
    },
    footer: { 
        padding: 20, 
        backgroundColor: '#FFF', 
        borderTopWidth: 1, 
        borderTopColor: '#EEE',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 5
    },
    selecionadoCard: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#E8F5E9', 
        padding: 15, 
        borderRadius: 12 
    },
    selecionadoInfo: { 
        flex: 1 
    },
    selecionadoNome: { 
        fontWeight: 'bold', 
        color: '#2D5A3D',
        fontSize: 16
    },
    selecionadoCodigo: { 
        fontSize: 12, 
        color: '#666', 
        marginTop: 2 
    },
    btnAlterar: { 
        backgroundColor: '#FFA000', 
        padding: 8, 
        borderRadius: 8,
        paddingHorizontal: 15
    },
    btnAlterarText: { 
        color: '#FFF', 
        fontSize: 12, 
        fontWeight: 'bold' 
    },
    itemCard: { 
        backgroundColor: '#FFF', 
        padding: 15, 
        marginBottom: 10, 
        borderRadius: 10, 
        borderLeftWidth: 5, 
        borderLeftColor: '#4CAF50',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2
    },
    itemInfo: {
        flex: 1
    },
    itemProduto: { 
        fontWeight: 'bold', 
        fontSize: 16,
        marginBottom: 5
    },
    itemDetalhe: {
        fontSize: 14,
        color: '#666'
    },
    btnRemover: {
        padding: 8
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        padding: 20
    },
    modalOverlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        justifyContent: 'center', 
        padding: 20 
    },
    modalContent: { 
        backgroundColor: '#FFF', 
        padding: 20, 
        borderRadius: 20,
        elevation: 5
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2D5A3D',
        marginBottom: 20,
        textAlign: 'center'
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        alignItems: 'center'
    },
    modalButtonCancel: {
        backgroundColor: '#666'
    },
    modalButtonConfirm: {
        backgroundColor: '#4CAF50'
    },
    modalButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16
    }
});

export default GerarVenda;
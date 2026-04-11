import React, { useState, useEffect } from "react";
import { 
    SafeAreaView, ScrollView, View, Text, TextInput, StyleSheet, 
    KeyboardAvoidingView, Modal, TouchableOpacity, ActivityIndicator, Alert 
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import axios from "axios";
import { BluetoothEscposPrinter } from 'react-native-bluetooth-escpos-printer';

function GerarVenda() {
    // --- ESTADOS ---
    const [itens, setItens] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [clienteNome, setClienteNome] = useState('');
    const [clienteSelecionado, setClienteSelecionado] = useState(null);
    const [modalClienteVisible, setModalClienteVisible] = useState(false);
    
    const API_URL = 'http://54.232.216.121:3000/api';

    // --- LÓGICA DE IMPRESSÃO (LAYOUT VASOLANDIA) ---
    const imprimirCupom = async (dadosVenda) => {
        try {
            const largura = 48; // Ajuste para 32 se for impressora de 58mm
            let c = "";

            c += "       VASOLANDIA PLANTAS & CIA        \n";
            c += "         FONE: (19)3481-6299          \n";
            c += "          SEM VALOR FISCAL            \n";
            c += "-".repeat(largura) + "\n";

            const dataHora = new Date().toLocaleString('pt-BR');
            c += `${dataHora.padEnd(largura)}\n`;
            c += `PEDIDO: ${String(dadosVenda.id).padStart(6, '0')}\n`;
            c += `CONDICAO: PAGAMENTO A VISTA\n`;
            c += `VENDEDOR: KAYO\n`; 
            c += `CLIENTE: ${dadosVenda.clienteNome}\n`;
            c += "-".repeat(largura) + "\n";

            c += "PRODUTO                                     \n";
            c += "COD       UN    QUANT.      VALOR      TOTAL \n";
            c += "-".repeat(largura) + "\n";

            dadosVenda.itens.forEach(item => {
                c += `${item.nome.substring(0, 35)} UN\n`;
                const cod = String(item.codigo || '000').padEnd(10);
                const qtd = String(item.quantidade).padEnd(10);
                const val = parseFloat(item.precoUnitario).toFixed(2).padEnd(10);
                const tot = parseFloat(item.subtotal).toFixed(2).padEnd(10);
                c += ` ${cod} ${qtd} ${val} ${tot}\n`;
            });

            c += "-".repeat(largura) + "\n";
            c += `QUANT. DE PRODUTOS: ${dadosVenda.itens.length}\n`;
            c += "-".repeat(largura) + "\n";
            c += `${"PRODUTOS:".padStart(largura - 10)} ${dadosVenda.total.toFixed(2).padStart(10)}\n`;
            c += `${"DESCONTO:".padStart(largura - 10)} ${"0.00".padStart(10)}\n`;
            c += `${"TOTAL A PAGAR:".padStart(largura - 10)} ${dadosVenda.total.toFixed(2).padStart(10)}\n`;

            c += "\n          ______________________            \n";
            c += "               ASSINATURA                  \n";
            c += "\n       * OBRIGADO VOLTE SEMPRE * \n\n\n\n";

            await BluetoothEscposPrinter.printText(c, {});
        } catch (error) {
            Alert.alert("Erro", "Falha ao imprimir. Verifique o Bluetooth.");
        }
    };

    // --- LÓGICA DE NEGÓCIO ---
    const LocalizarClientePorNome = async () => {
        if (!clienteNome) return;
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/clientes/seguro/buscar/nome?nome=${encodeURIComponent(clienteNome)}`);
            const data = response.data.data || response.data;
            if (data) {
                // Se retornar array, pega o primeiro
                const cli = Array.isArray(data) ? data[0] : data;
                setClienteSelecionado(cli);
                setClienteNome(cli.NOME || cli.nome);
                setModalClienteVisible(false);
            }
        } catch (error) {
            Alert.alert("Erro", "Cliente não encontrado.");
        } finally {
            setLoading(false);
        }
    };

    const finalizarVendaCompleta = async () => {
        if (!clienteSelecionado || itens.length === 0) {
            Alert.alert("Aviso", "Selecione o cliente e adicione itens.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                cliente_id: clienteSelecionado.ID || clienteSelecionado.CODIGO,
                itens: itens,
                total: total
            };

            const response = await axios.post(`${API_URL}/vendas/gerar`, payload);

            if (response.status === 200 || response.status === 201) {
                const dadosParaCupom = {
                    id: response.data.id_venda || "055129",
                    clienteNome: clienteNome,
                    itens: itens,
                    total: total
                };

                await imprimirCupom(dadosParaCupom);
                
                // Resetar estados
                setItens([]);
                setClienteSelecionado(null);
                setClienteNome('');
                Alert.alert("Sucesso", "Venda realizada e cupom enviado!");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Erro ao salvar venda no servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    
                    {/* HEADER */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Nova Venda</Text>
                        <View style={styles.totalContainer}>
                            <Text style={styles.totalText}>R$ {total.toFixed(2)}</Text>
                            <Text style={styles.itemCount}>{itens.length} itens no carrinho</Text>
                        </View>
                    </View>

                    {/* SEÇÃO CLIENTE */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Cliente</Text>
                        {clienteSelecionado ? (
                            <View style={styles.selecionadoCard}>
                                <View style={styles.selecionadoInfo}>
                                    <Text style={styles.selecionadoNome}>{clienteNome}</Text>
                                    <Text style={styles.selecionadoCodigo}>Cód: {clienteSelecionado.ID || clienteSelecionado.CODIGO}</Text>
                                </View>
                                <TouchableOpacity onPress={() => setClienteSelecionado(null)} style={styles.btnAlterar}>
                                    <Text style={styles.btnAlterarText}>Alterar</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.btnAdicionar} onPress={() => setModalClienteVisible(true)}>
                                <MaterialIcons name="person-search" size={24} color="#FFF" />
                                <Text style={styles.btnAdicionarText}>Buscar Cliente</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* LISTA DE ITENS (SIMPLIFICADA) */}
                    {itens.map((item, index) => (
                        <View key={index} style={styles.itemCard}>
                            <Text style={styles.itemProduto}>{item.nome}</Text>
                            <Text>{item.quantidade}x R$ {item.precoUnitario.toFixed(2)} = R$ {item.subtotal.toFixed(2)}</Text>
                        </View>
                    ))}

                </ScrollView>

                {/* RODAPÉ FIXO */}
                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={[styles.btnFinalizar, loading && { opacity: 0.7 }]} 
                        onPress={finalizarVendaCompleta}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <MaterialIcons name="print" size={24} color="#FFF" />
                                <Text style={styles.btnFinalizarText}>FINALIZAR E IMPRIMIR</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* MODAL BUSCA CLIENTE */}
                <Modal visible={modalClienteVisible} animationType="slide" transparent={true}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.sectionTitle}>Localizar Cliente</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nome do cliente"
                                value={clienteNome}
                                onChangeText={setClienteNome}
                            />
                            <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                <TouchableOpacity style={[styles.btnAdicionar, { flex: 1, backgroundColor: '#666', marginRight: 10 }]} onPress={() => setModalClienteVisible(false)}>
                                    <Text style={styles.btnAdicionarText}>Voltar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.btnAdicionar, { flex: 1 }]} onPress={LocalizarClientePorNome}>
                                    <Text style={styles.btnAdicionarText}>Buscar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default GerarVenda;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    header: { backgroundColor: '#2D5A3D', padding: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    title: { fontSize: 24, fontWeight: '700', color: '#FFF' },
    totalContainer: { marginTop: 10 },
    totalText: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
    itemCount: { color: '#FFF', opacity: 0.8 },
    section: { backgroundColor: '#FFF', margin: 15, padding: 20, borderRadius: 16, elevation: 3 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2D5A3D', marginBottom: 10 },
    input: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E9ECEF', borderRadius: 12, padding: 15, fontSize: 16 },
    btnAdicionar: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    btnAdicionarText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8 },
    btnFinalizar: { backgroundColor: '#2D5A3D', padding: 18, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    btnFinalizarText: { color: '#FFF', fontWeight: '700', fontSize: 18, marginLeft: 10 },
    footer: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE' },
    selecionadoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', padding: 15, borderRadius: 12 },
    selecionadoInfo: { flex: 1 },
    selecionadoNome: { fontWeight: 'bold', color: '#2D5A3D' },
    btnAlterar: { backgroundColor: '#FFA000', padding: 8, borderRadius: 8 },
    btnAlterarText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    itemCard: { backgroundColor: '#FFF', padding: 15, marginHorizontal: 15, marginBottom: 10, borderRadius: 10, borderLeftWidth: 5, borderLeftColor: '#4CAF50' },
    itemProduto: { fontWeight: 'bold', fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#FFF', padding: 20, borderRadius: 20 }
});
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

function Menu() {
    const logo = require('./icon.png');
    const navigation = useNavigation();
    
    // Array de itens do menu para melhor organização
    const menuItems = [
        {
            id: 1,
            title: "Cadastrar Cliente",
            icon: <FontAwesome5 name="user" size={32} color="#2D5A3D" />,
            screen: 'Cadastro de Clientes',
            bgColor: "#E8F5E9"
        },
        {
            id: 2,
            title: "Orçamentos",
            icon: <Entypo name="open-book" size={32} color="#2D5A3D" />,
            screen: 'Orcamentos',
            bgColor: "#F1F8E9"
        },
        {
            id: 3,
            title: "Nova Venda",
            icon: <MaterialCommunityIcons name="point-of-sale" size={32} color="#2D5A3D" />,
            screen: 'Novo Pedido de Venda',
            bgColor: "#E8F5E9"
        },
        {
            id: 4,
            title: "Pedidos Abertos",
            icon: <AntDesign name="book" size={32} color="#2D5A3D" />,
            screen: 'Pedidos Abertos',
            bgColor: "#F1F8E9"
        },
        {
            id: 5,
            title: "Procurar Cliente",
            icon: <MaterialIcons name="person-search" size={32} color="#2D5A3D" />,
            screen: 'Buscar Cliente',
            bgColor: "#E8F5E9"
        },
        {
            id: 6,
            title: "Procurar Produto",
            icon: <MaterialCommunityIcons name="tag-search" size={32} color="#2D5A3D" />,
            screen: 'Localizar Produto',
            bgColor: "#F1F8E9"
        }
    ];

    // Agrupa os itens em pares para o layout de grid
    const groupedItems = [];
    for (let i = 0; i < menuItems.length; i += 2) {
        groupedItems.push(menuItems.slice(i, i + 2));
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header com logo */}
                <View style={styles.header}>
                    <Image 
                        source={logo} 
                        style={styles.logo} 
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>Menu Principal</Text>                    
                </View>

                {/* Grid de botões */}
                <View style={styles.gridContainer}>
                    {groupedItems.map((row, rowIndex) => (
                        <View key={`row-${rowIndex}`} style={styles.row}>
                            {row.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.menuButton, { backgroundColor: item.bgColor }]}
                                    onPress={() => navigation.navigate(item.screen)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.iconContainer}>
                                        {item.icon}
                                    </View>
                                    <Text style={styles.buttonText}>{item.title}</Text>
                                </TouchableOpacity>
                            ))}
                            {/* Espaço vazio para manter alinhamento quando número ímpar */}
                            {row.length === 1 && <View style={styles.emptySpace} />}
                        </View>
                    ))}
                </View>

                {/* Footer ou informações adicionais */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Sistema de Vendas v1.0
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default Menu;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#2D5A3D',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
    },
    gridContainer: {
        padding: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    menuButton: {
        flex: 1,
        marginHorizontal: 8,
        borderRadius: 16,
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#E8F5E9',
        minHeight: 140,
    },
    iconContainer: {
        marginBottom: 12,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2D5A3D',
        textAlign: 'center',
        paddingHorizontal: 8,
        lineHeight: 20,
    },
    emptySpace: {
        flex: 1,
        marginHorizontal: 8,
    },
    footer: {
        padding: 20,
        alignItems: 'center',
        marginTop: 10,
    },
    footerText: {
        fontSize: 14,
        color: '#888888',
        textAlign: 'center',
    },
});
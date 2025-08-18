import React from "react";
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

function Menu() {
    const navigation = useNavigation();
    return (
        <SafeAreaView>
            <ScrollView>
                <View style={styles.container}>
                    <TouchableOpacity onPress={() => navigation.navigate('Cadastro de Clientes')}>
                        <Text style={styles.button}>Cadastro de Clientes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Orcamentos')}>
                        <Text style={styles.button}>Orcamentos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Novo Pedido de Venda')}>
                        <Text style={styles.button}>Novo Pedido de Venda</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
export default Menu

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        fontSize: 20,
        margin: 10,
    },
});
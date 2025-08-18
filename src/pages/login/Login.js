/*************  ✨ Windsurf Command ⭐  *************/
import React, { useState } from 'react';
import { Button, SafeAreaView, ScrollView, View, Text, StyleSheet, Image, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

import logo from './icon.png';

export default function Login() {
    const [codigoUsuario, setCodigoUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const navigation = useNavigation();
// obs o código de usuário deve ser armazenado para geração de pedidos de vendas e orçamentos
function handleLogin() {
    // implementar logica de login
    if (codigoUsuario && senha) {
        navigation.navigate('Novo Pedido de Venda');
    } else {
        alert('Por favor, preencha todos os campos corretamente!');
    }
}
return (
<SafeAreaView>
    <ScrollView>
        <View style={styles.container}>
        <View>
            <Image source={logo} style={styles.logo} />
        </View>
        <View style={styles.container}>
        </View>
        <View>
            <Text>Código de Usuário</Text>
            <TextInput
                style={{ height: 40 }}
                placeholder="Digite seu código de usuário"
                onChangeText={text => setCodigoUsuario(text)}
                value={codigoUsuario}
            />
        </View>
        <View>
            <Text>Senha</Text>
            <TextInput
                style={{ height: 40 }}
                placeholder="Digite sua senha"
                onChangeText={text => setSenha(text)}
                value={senha}
            />
        </View>
        <Button
                title="Login"
                color="green"
                onPress={() => handleLogin()}
            />

        </View>
    </ScrollView>
</SafeAreaView>
    
);
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
},
logo: {
    width: 300,
    height: 210,
    marginTop:30,
    marginBottom:30,
    
},
});
/*******  ec227793-990a-43e3-bc1c-41260331a791  *******/
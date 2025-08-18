import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './src/pages/login/Login';
import NovaVenda from './src/pages/vendas/NovaVenda';
import CadastroCliente from './src/pages/cadastros/CadastroCliente';
import NovoOrcamento from './src/pages/orcamentos/NovoOrcamento';
import Menu from './src/pages/menu/Menu';
export default function App() {
  const Stack = createNativeStackNavigator();
  return (
   <NavigationContainer>
     <Stack.Navigator>
       <Stack.Screen name="Menu" component={Menu} />
       <Stack.Screen name="Cadastro de Clientes" component={CadastroCliente} />
       <Stack.Screen name="Orcamentos" component={NovoOrcamento} />
       <Stack.Screen name="Login" component={Login} />
       <Stack.Screen name="Novo Pedido de Venda" component={NovaVenda} />
     </Stack.Navigator>
   </NavigationContainer>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

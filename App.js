import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './src/pages/login/Login';
import NovaVenda from './src/pages/vendas/NovaVenda';
import CadastroCliente from './src/pages/cadastros/CadastroCliente';
import NovoOrcamento from './src/pages/orcamentos/NovoOrcamento';
import Menu from './src/pages/menu/Menu';
import ContagemProduto from './src/pages/produto/ContagemProduto';
import BuscaCliente from './src/pages/Clientes/BuscaCliente';
import PedidoAberto from './src/pages/vendas/PedidoAberto';
import LocalizarProduto from './src/pages/produto/LocalizarProduto';
import ItensPedido from './src/pages/Pedidos/ItensPedido';
import ContorleOPrcamento from './src/pages/orcamentos/ControleOrcamento';
import MenuOrcamento from './src/pages/orcamentos/MenuOrcamento';
//import NovoOrcamento from './src/pages/orcamentos/NovoOrcamento';

import { head } from 'lodash';
import GerarVenda from './src/pages/vendas/GerarVenda';
export default function App() {
  const Stack = createNativeStackNavigator();
  return (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Login" component={Login}  screenOptions={{
      headerStyle:{
      
        headerShown: false,
      },
      
    }} />
      <Stack.Screen name="Menu" component={Menu} />
      <Stack.Screen name="Cadastro de Clientes" component={CadastroCliente} />
      <Stack.Screen name="Orcamentos" component={NovoOrcamento} />
      <Stack.Screen name="Gerar Venda" component={GerarVenda} />
      <Stack.Screen name="Novo Pedido de Venda" component={NovaVenda} />
      <Stack.Screen name="Contagem de Produto" component={ContagemProduto} />
      <Stack.Screen name="Buscar Cliente" component={BuscaCliente} />
      <Stack.Screen name="Pedidos Abertos" component={PedidoAberto} />
    <Stack.Screen name="Localizar Produto" component={LocalizarProduto} />
    <Stack.Screen name="Itens do Pedido" component={ItensPedido} />
    <Stack.Screen name="Controle Orcamentos" component={ContorleOPrcamento} />
    <Stack.Screen name="Menu Orcamentos" component={MenuOrcamento} />
    <Stack.Screen name="Novo Orcamento" component={NovoOrcamento} />
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

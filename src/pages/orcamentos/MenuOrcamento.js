import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Opcional - remova se não quiser usar ícones
import { SafeAreaView } from 'react-native';
import ControleOrcamento from './ControleOrcamento';
import NovoOrcamento from './NovoOrcamento';

const Tab = createBottomTabNavigator();

const MenuOrcamento = () => {
  return (
    <SafeAreaView style={{ flex: 1, marginBottom: 12 }}>
    <Tab.Navigator
      initialRouteName="NovoOrcamento"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          // Se estiver usando ícones
          if (route.name === 'NovoOrcamento') {
            return (
              <Ionicons
                name={focused ? 'add-circle' : 'add-circle-outline'}
                size={size}
                color={color}
              />
            );
          } else if (route.name === 'ControleOrcamentos') {
            return (
              <Ionicons
                name={focused ? 'list-circle' : 'list-circle-outline'}
                size={size}
                color={color}
              />
            );
          }
        },
        // Configurações de estilo
        tabBarActiveTintColor: '#00ff00',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          paddingBottom: 1,
          marginBottom: 10,
        },
        tabBarStyle: {
          height: 56,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0.5,
          borderTopColor: '#C6C6C8',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerStyle: {
          backgroundColor: '#0fdc31',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen
        name="NovoOrcamento"
        component={NovoOrcamento}
        options={{
          title: 'Novo Orçamento',
          headerTitle: 'Criar Novo Orçamento',
        }}
      />
      <Tab.Screen
        name="ControleOrcamentos"
        component={ControleOrcamento}
        options={{
          title: 'Controle',
          headerTitle: 'Controle de Orçamentos',
        }}
      />
    </Tab.Navigator>
    </SafeAreaView>
  );
};

export default MenuOrcamento;
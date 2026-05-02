// contexts/VendedorContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VendedorContext = createContext({});

export const useVendedor = () => {
    const context = useContext(VendedorContext);
    if (!context) {
        throw new Error('useVendedor must be used within VendedorProvider');
    }
    return context;
};

export const VendedorProvider = ({ children }) => {
    const [vendedor, setVendedor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarVendedor();
    }, []);

    const carregarVendedor = async () => {
        try {
            const vendedorData = await AsyncStorage.getItem('vendedorLogado');
            if (vendedorData) {
                setVendedor(JSON.parse(vendedorData));
                console.log('Vendedor carregado do storage:', JSON.parse(vendedorData));
            }
        } catch (error) {
            console.error('Erro ao carregar vendedor:', error);
        } finally {
            setLoading(false);
        }
    };

    const atualizarVendedor = async (novoVendedor) => {
        try {
            if (novoVendedor) {
                await AsyncStorage.setItem('vendedorLogado', JSON.stringify(novoVendedor));
                setVendedor(novoVendedor);
                console.log('Vendedor salvo no storage:', novoVendedor);
            } else {
                await AsyncStorage.removeItem('vendedorLogado');
                setVendedor(null);
                console.log('Vendedor removido do storage');
            }
        } catch (error) {
            console.error('Erro ao atualizar vendedor:', error);
        }
    };

    const logout = async () => {
        await atualizarVendedor(null);
    };

    return (
        <VendedorContext.Provider value={{ vendedor, loading, atualizarVendedor, carregarVendedor, logout }}>
            {children}
        </VendedorContext.Provider>
    );
};
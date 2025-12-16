

import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import axios from 'axios';

const ContagemProduto = () => {
  const [contagem, setContagem] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('http://192.168.1.13:3000/api/produto/seguro/contar');
      setContagem(response.data.data.total[0]);
    };
    fetchData();
  }, []);

  return (
    <View>
      <Text>Existem {contagem} produtos</Text>
    </View>
  );
};

export default ContagemProduto;

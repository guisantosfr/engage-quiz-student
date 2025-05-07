import { useState } from 'react';
import { useTheme, Button, Text, TextInput } from 'react-native-paper';
import api from '../services/api';
import GradientBackground from '../components/GradientBackground';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export default function InitialScreen({ navigation }) {
  const [numMatricula, setNumMatricula] = useState('');
  const [quizCode, setQuizCode] = useState('');
  const [loading, setLoading] = useState(false);

  const theme = useTheme();

  const storeMatricula = async (value) => {
    try {
      await AsyncStorage.setItem('matricula', value);
    } catch (e) {
      console.error(e);
    }
  };

  const storeQuizCode = async (value) => {
    try {
      await AsyncStorage.setItem('codigo', value);
    } catch (e) {
      console.error(e);
    }
  };


  async function connect() {
    if (numMatricula === '' || quizCode === '') {
      Toast.show({
        type: 'error',
        text1: 'Informe matrícula e código para continuar'
      });

      return;
    }

    setLoading(true);

    await api.post('/conectarAluno', JSON.stringify({
      matricula: Number(numMatricula),
      codigo: quizCode
    }))
      .then(response => {
        storeMatricula(numMatricula);
        storeQuizCode(quizCode);

        navigation.navigate('Waiting');
      })
      .catch(error => {
        Toast.show({
          type: 'error',
          text1: 'Matrícula ou código incorretos'
        });
      })
      .finally(() => {
        setLoading(false);
      });

  }

  return (
    <GradientBackground>
      <Text variant="headlineSmall">Bem-vindo</Text>
      <Text variant="bodyLarge" style={{ marginTop: 20, marginBottom: 10 }}>Para continuar, digite sua matrícula</Text>
      <Text variant="bodyLarge" style={{ marginBottom: 40 }}> e o código informado pelo professor</Text>


      <TextInput
        label="Matrícula"
        value={numMatricula}
        inputMode='numeric'
        onChangeText={setNumMatricula}
        mode="outlined"
        placeholder='Digite seu número de matrícula'
        activeOutlineColor={theme.colors.onBackground}
        style={{
          width: '75%',
          marginBottom: 40
        }}
        outlineStyle={{
          borderRadius: 10
        }}
      />

      <TextInput
        label="Código"
        value={quizCode}
        inputMode='text'
        onChangeText={setQuizCode}
        mode="outlined"
        placeholder='Digite o código'
        activeOutlineColor={theme.colors.onBackground}
        style={{
          width: '75%',
          marginBottom: 40
        }}
        outlineStyle={{
          borderRadius: 10
        }}
      />

      <Button
        icon="qrcode"
        mode="contained"
        style={{ padding: 5 }}
        onPress={connect}
        loading={loading}>
        Conectar
      </Button>
    </GradientBackground>
  );
}
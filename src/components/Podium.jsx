import React from 'react';
import { View, FlatList } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import useStyles from '../hooks/useStyles';
import getFirstNames from '../utils/getFirstNames';

const Podium = ({ students }) => {
  const styles = useStyles()
  const podiumStudents = students.slice(0, 3);

  const setMedalColor = (index) => {
    if (index === 0) {
      return '#a57c00'
    } else if (index === 1) {
      return '#c0c0c0'
    } else if (index === 2) {
      return '#cd7f32'
    }
  }

  const renderPodiumItem = ({ item, index }) => (
    <View style={styles.podiumItem}>
      <View style={{ display: 'flex', flexDirection: 'row' }}>
        <Text variant='headlineSmall' style={{ marginTop: 10 }}>
          {index + 1}º Lugar
        </Text>

        <Icon source="medal" color={setMedalColor(index)} size={50} />
      </View>

      <Text variant='titleLarge' style={{ marginVertical: 10 }}>{getFirstNames(item.nome)}</Text>
      {
        item.pontuacao == 0 &&
        <Text variant='titleLarge'>Nenhum acerto</Text>
      }

      {
        item.pontuacao == 1 &&
        <Text variant='titleLarge'>1 acerto</Text>
      }


      {
        item.pontuacao > 1 &&
        <Text variant='titleLarge'>{item.pontuacao} acertos</Text>
      }

    </View>
  );

  return (
    <View style={styles.podiumContainer}>
      <Text variant='headlineLarge'>Pódio</Text>
      <FlatList
        style={{ flexGrow: 0 }}
        data={podiumStudents}
        renderItem={renderPodiumItem}
        keyExtractor={(item) => item.matricula.toString()}
      />
    </View>
  );
};

export default Podium;

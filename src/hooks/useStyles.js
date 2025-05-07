import { StyleSheet, Dimensions } from 'react-native';

export default function useStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },

    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: Dimensions.get('window').width * 0.8,
      marginBottom: 20,
    },

    button: {
      padding: 25,
      borderRadius: 10,
      width: Dimensions.get('window').width * 0.375,
      marginVertical: 20,

      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
    },

    containedTrue: {
      backgroundColor: '#1E90FF',
      borderColor: '#1E90FF',
    },

    containedFalse: {
      backgroundColor: '#FF4500',
      borderColor: '#FF4500',
    },

    outlined: (color) => ({
      backgroundColor: 'transparent',
      borderColor: color,
    }),

    disabled: {
      opacity: 0.8, // Makes the button look grayed out
    },

    text: {
      fontSize: 16
    },

    containedText: {
      color: '#FFF',
    },

    disabledText: {
      color: '#999', // Gray text when disabled
    },

    podiumContainer: {
      alignItems: 'center',
      marginVertical: 20,
    },

    podiumItem: {
      alignItems: 'center',
      marginVertical: 10
    },

    header: {
      width: '75%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
      marginTop: 40,
    },

    track: {
      height: 10,
      width: '75%',
      borderRadius: 8,
      marginTop: 10,
      marginBottom: 20
    },

    progress: {
      height: 10,
      borderRadius: 8
    }
  });
}
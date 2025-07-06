import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

const correctPin = '1234'; // Puedes cambiar este PIN

export default function ParentalLockScreen() {
  const [pin, setPin] = useState('');
  const navigation = useNavigation();

  const checkPin = () => {
    if (pin === correctPin) {
      navigation.navigate('Admin' as never);
    } else {
      Alert.alert('PIN incorrecto');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Introduce el PIN para acceder</Text>
      <TextInput
        value={pin}
        onChangeText={setPin}
        secureTextEntry
        keyboardType="numeric"
        style={styles.input}
        placeholder="••••"
      />
      <Button title="Entrar" onPress={checkPin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  label: { fontSize: 18, marginBottom: 10, textAlign: 'center' },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 20, borderRadius: 10, textAlign: 'center'
  },
});
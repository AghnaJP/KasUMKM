import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface TransactionHeaderProps {
  onDeletePress: () => void;
  onEditPress: () => void;
  selectionCount: number;
}

const TransactionHeader = ({ onDeletePress, onEditPress, selectionCount }: TransactionHeaderProps) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      
      {selectionCount > 0 && (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={onDeletePress}>
            <Text style={styles.buttonText}>Hapus Transaksi</Text>
          </TouchableOpacity>

          {selectionCount === 1 && (
            <TouchableOpacity style={styles.button} onPress={onEditPress}>
              <Text style={styles.buttonText}>Ubah Transaksi</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  topRow: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    backgroundColor: '#375A93',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  buttonText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#fff',
  },
});

export default TransactionHeader;
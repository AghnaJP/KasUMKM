import React from 'react';
import { View, StyleSheet } from 'react-native';
import Button from '../Button/Button';       

interface TransactionHeaderProps {
  onDeletePress: () => void;
  onEditPress: () => void;
  selectionCount: number;
}

const TransactionHeader = ({ onDeletePress, onEditPress, selectionCount }: TransactionHeaderProps) => {
  return (
    <View style={styles.container}>

      {selectionCount > 0 && (
        <View style={styles.buttonRow}>
          <Button
            title="Hapus Transaksi"
            onPress={onDeletePress}
            variant="primary"
            fullWidth={false}
            customStyle={styles.button}
          />

          {selectionCount === 1 && (
            <Button
              title="Ubah Transaksi"
              onPress={onEditPress}
              variant="primary"
              fullWidth={false}
              customStyle={styles.button}
            />
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
  title: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 0,
  },
});

export default TransactionHeader;
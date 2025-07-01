import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Text, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface EditTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updatedData: { name: string; price: string }) => void;
  transactionData: { name: string; price: number } | null;
}

const EditTransactionModal = ({ visible, onClose, onSave, transactionData }: EditTransactionModalProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (transactionData) {
      setName(transactionData.name);
      setPrice(transactionData.price.toString());
    }
  }, [transactionData]);

  const handleSave = () => {
    if (!name || !price) {
      // 2. Gunakan Alert.alert, bukan alert()
      Alert.alert('Peringatan', 'Nama dan Harga tidak boleh kosong.');
      return;
    }
    onSave({ name, price });
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            {/* 3. Semua teks dibungkus <Text> */}
            <Text style={styles.title}>Ubah Transaksi</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Nama Transaksi</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="cth: Nasi Goreng"
            />

            <Text style={styles.label}>Harga Transaksi</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="cth: 20000"
              keyboardType="number-pad"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Simpan</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold', // Pastikan font ini ada di projectmu
    color: '#0E3345',
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    fontFamily: 'Montserrat-Regular',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
  },
  saveButton: {
    backgroundColor: '#375A93',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
});

export default EditTransactionModal;
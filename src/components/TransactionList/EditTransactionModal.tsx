import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomText from '../Text/CustomText';
import Button from '../Button/Button';
import {Text} from 'react-native-gesture-handler';

interface EditTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updatedData: {name: string; price: string}) => void;
  transactionData: {name: string; price: number} | null;
}

const EditTransactionModal = ({
  visible,
  onClose,
  onSave,
  transactionData,
}: EditTransactionModalProps) => {
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
      Alert.alert('Peringatan', 'Nama dan Harga tidak boleh kosong.');
      return;
    }
    onSave({name, price});
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
            <CustomText variant="subtitle">
              <Text>Ubah Transaksi</Text>
            </CustomText>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <CustomText style={styles.label}>
              <Text>Nama Transaksi</Text>
            </CustomText>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="cth: Nasi Goreng"
            />

            <CustomText style={styles.label}>
              <Text>Harga Transaksi</Text>
            </CustomText>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="cth: 20000"
              keyboardType="number-pad"
            />
          </View>

          <Button title="Simpan" onPress={handleSave} variant="primary" />
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
  form: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 6,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 16,
  },
});

export default EditTransactionModal;

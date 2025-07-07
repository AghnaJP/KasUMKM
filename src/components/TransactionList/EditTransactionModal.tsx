import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomText from '../Text/CustomText';
import Button from '../Button/Button';
import FormField from '../Form/FormField';
import {formatRupiah, parseRupiah} from '../../utils/formatIDR';

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
      setPrice(formatRupiah(transactionData.price));
    }
  }, [transactionData]);

  const handleSave = () => {
    if (!name || !price) {
      Alert.alert('Peringatan', 'Nama dan Harga tidak boleh kosong.');
      return;
    }
    const numericPrice = parseRupiah(price);
    onSave({name, price: numericPrice.toString()});
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
            <CustomText variant="subtitle">Ubah Transaksi</CustomText>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <FormField
            label="Nama Transaksi"
            placeholder="cth: Nasi Goreng"
            value={name}
            onChangeText={setName}
          />
          <FormField
            label="Harga Transaksi"
            placeholder="cth: 20.000"
            value={price}
            onChangeText={text => setPrice(formatRupiah(text))}
            keyboardType="numeric"
          />

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
});

export default EditTransactionModal;

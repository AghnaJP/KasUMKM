// EditTransactionModal.tsx

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
// Impor DatePickerField yang baru
import DatePickerField from '../Form/DatePickerField';
import {formatRupiah, parseRupiah} from '../../utils/formatIDR';

// Definisikan tipe data yang diterima dan dikirim
interface TransactionEditData {
  name: string;
  price: number;
  date: string;
}

interface EditTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updatedData: {name: string; price: string; date: string}) => void;
  transactionData: TransactionEditData | null;
}

const EditTransactionModal = ({
  visible,
  onClose,
  onSave,
  transactionData,
}: EditTransactionModalProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  // UBAH: State tanggal sekarang adalah objek Date
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    if (transactionData) {
      setName(transactionData.name);
      setPrice(formatRupiah(transactionData.price));
      // Set state tanggal dari string ke objek Date
      setDate(new Date(transactionData.date));
    }
  }, [transactionData]);

  const handleSave = () => {
    if (!name || !price) {
      Alert.alert('Peringatan', 'Nama dan Harga tidak boleh kosong.');
      return;
    }
    const numericPrice = parseRupiah(price);
    // Konversi objek Date kembali ke format string YYYY-MM-DD untuk disimpan
    const formattedDate = date.toISOString().split('T')[0];
    onSave({name, price: numericPrice.toString(), date: formattedDate});
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
            value={name}
            onChangeText={setName}
          />
          <FormField
            label="Harga Transaksi"
            value={price}
            onChangeText={text => setPrice(formatRupiah(text))}
            keyboardType="numeric"
          />

          {/* UBAH: Ganti FormField tanggal dengan DatePickerField */}
          <CustomText style={styles.dateLabel}>Tanggal Transaksi</CustomText>
          <DatePickerField
            value={date}
            onChange={newDate => setDate(newDate)}
          />

          <View style={{marginTop: 20}}>
            <Button title="Simpan" onPress={handleSave} variant="primary" />
          </View>
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
  dateLabel: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
  },
});

export default EditTransactionModal;

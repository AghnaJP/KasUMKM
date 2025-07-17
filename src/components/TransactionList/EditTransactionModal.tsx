import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomText from '../Text/CustomText';
import Button from '../Button/Button';
import DatePickerField from '../Form/DatePickerField';

const formatRupiah = (value: string): string => {
  if (!value) {
    return 'Rp 0';
  }
  return 'Rp ' + parseInt(value, 10).toLocaleString('id-ID');
};

const formatToYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];

interface EditTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updatedData: {
    description: string;
    price: string;
    quantity: string;
    date: string;
  }) => void;
  transactionData: {
    description: string;
    price: number;
    quantity?: number;
    date?: string;
  } | null;
}

const EditTransactionModal = ({
  visible,
  onClose,
  onSave,
  transactionData,
}: EditTransactionModalProps) => {
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (transactionData) {
      setDescription(transactionData.description);
      setPrice(transactionData.price.toString());
      setQuantity(transactionData.quantity?.toString() ?? '1');
      if (transactionData.date) {
        setSelectedDate(new Date(transactionData.date));
      }
    }
  }, [transactionData]);

  const handleSave = () => {
    if (!description || !price || !quantity || !selectedDate) {
      Alert.alert('Peringatan', 'Semua field wajib diisi.');
      return;
    }

    const formattedDate = formatToYYYYMMDD(selectedDate);
    onSave({description, price, quantity, date: formattedDate});
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
            <CustomText variant="subtitle">{'Ubah Transaksi'}</CustomText>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <CustomText style={styles.label}>Tanggal Transaksi</CustomText>
          <DatePickerField value={selectedDate} onChange={setSelectedDate} />

          <CustomText style={styles.label}>Nama Transaksi</CustomText>
          <TextInput
            style={styles.input}
            placeholder="cth: Nasi Goreng"
            value={description}
            onChangeText={setDescription}
          />

          <CustomText style={styles.label}>Harga Transaksi</CustomText>
          <TextInput
            style={styles.input}
            placeholder="cth: 20000"
            value={formatRupiah(price)}
            onChangeText={text => {
              const numericValue = text.replace(/[^0-9]/g, '');
              setPrice(numericValue);
            }}
            keyboardType="numeric"
          />

          <View style={styles.rowBetween}>
            <CustomText style={styles.label}>Jumlah</CustomText>
            <View style={styles.counterRow}>
              <TouchableOpacity
                onPress={() =>
                  setQuantity(q =>
                    String(Math.max(parseInt(q || '1', 10) - 1, 1)),
                  )
                }>
                <Icon name="remove-circle-outline" size={24} color="#0E3345" />
              </TouchableOpacity>
              <CustomText style={styles.quantityText}>{quantity}</CustomText>
              <TouchableOpacity
                onPress={() =>
                  setQuantity(q => String(parseInt(q || '1', 10) + 1))
                }>
                <Icon name="add-circle-outline" size={24} color="#0E3345" />
              </TouchableOpacity>
            </View>
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
  label: {
    fontSize: 15,
    color: '#0E3345',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#0E3345',
    width: 24,
    textAlign: 'center',
  },
});

export default EditTransactionModal;

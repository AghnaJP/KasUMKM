import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import CustomText from '../Text/CustomText';
import Button from '../Button/Button';
import Icon from 'react-native-vector-icons/Ionicons';
import {formatRupiah, parseRupiah} from '../../utils/formatIDR';

interface EditMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updated: {name: string; price: string}) => void;
  menuData: {name: string; price: number} | null;
}

const EditMenuModal = ({
  visible,
  onClose,
  onSave,
  menuData,
}: EditMenuModalProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (menuData) {
      setName(menuData.name);
      setPrice(formatRupiah(menuData.price));
    }
  }, [menuData]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Validasi', 'Nama menu wajib diisi.');
      return;
    }
    const numericPrice = parseRupiah(price);
    if (!numericPrice || numericPrice <= 0) {
      Alert.alert('Validasi', 'Harga harus lebih dari 0.');
      return;
    }
    onSave({name: trimmed, price: String(numericPrice)});
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
            <CustomText variant="subtitle">Edit Menu</CustomText>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <CustomText style={styles.label}>Nama Menu</CustomText>
          <TextInput
            style={styles.input}
            placeholder="cth: Nasi Goreng"
            value={name}
            onChangeText={setName}
          />

          <CustomText style={styles.label}>Harga</CustomText>
          <TextInput
            style={styles.input}
            placeholder="0"
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
});

export default EditMenuModal;

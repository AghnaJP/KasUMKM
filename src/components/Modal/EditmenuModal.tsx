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
      setPrice(menuData.price.toString());
    }
  }, [menuData]);

  const handleSave = () => {
    if (!name || !price) {
      Alert.alert('Error', 'Nama dan harga wajib diisi.');
      return;
    }
    onSave({name, price});
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.wrapper}>
        <View style={styles.modal}>
          <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
            <Icon name="close" size={24} color="#444" />
          </TouchableOpacity>
          <CustomText variant="title">Edit Menu</CustomText>
          <TextInput
            placeholder="Nama Menu"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            placeholder="Harga"
            style={styles.input}
            value={price}
            keyboardType="numeric"
            onChangeText={setPrice}
          />
          <Button title="Simpan" onPress={handleSave} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
    fontSize: 16,
    paddingVertical: 4,
  },
  closeIcon: {
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
});

export default EditMenuModal;

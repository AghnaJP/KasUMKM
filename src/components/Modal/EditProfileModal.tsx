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

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updatedData: {name: string}) => void;
  profileData: {name: string} | null;
}

const EditProfileModal = ({
  visible,
  onClose,
  onSave,
  profileData,
}: EditProfileModalProps) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (profileData) {
      setName(profileData.name);
    }
  }, [profileData]);

  const handleSave = () => {
    if (!name) {
      Alert.alert('Peringatan', 'Nama tidak boleh kosong.');
      return;
    }
    onSave({name});
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
            <CustomText variant="subtitle">Ganti Nama Pengguna</CustomText>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <FormField
            label="Nama Pengguna"
            placeholder={name}
            value={name}
            onChangeText={setName}
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

export default EditProfileModal;

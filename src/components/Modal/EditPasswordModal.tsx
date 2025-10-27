import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomText from '../Text/CustomText';
import Button from '../Button/Button';
import FormField from '../Form/FormField';
import {VALIDATION_MESSAGES} from '../../constants';

interface EditPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updatedData: {oldPassword: string; newPassword: string}) => void;
}

const EditPasswordModal = ({
  visible,
  onClose,
  onSave,
}: EditPasswordModalProps) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorOld, setErrorOld] = useState('');
  const [errorNew, setErrorNew] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (!visible) {
      setOldPassword('');
      setNewPassword('');
      setErrorOld('');
      setErrorNew('');
      setShowOld(false);
      setShowNew(false);
    }
  }, [visible]);

  const handleSave = () => {
    setErrorOld('');
    setErrorNew('');

    if (!oldPassword) {
      setErrorOld(VALIDATION_MESSAGES.oldPasswordRequired);
      return;
    }
    if (!newPassword) {
      setErrorNew(VALIDATION_MESSAGES.newPasswordRequired);
      return;
    }

    onSave({oldPassword, newPassword});
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
            <CustomText variant="subtitle">Ganti Kata Sandi</CustomText>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <FormField
            label="Kata Sandi Lama"
            placeholder="Masukkan kata sandi lama"
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry={!showOld}
            rightIcon={
              <TouchableOpacity onPress={() => setShowOld(v => !v)}>
                <Icon
                  name={showOld ? 'eye-off' : 'eye'}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            }
            error={errorOld}
          />

          <FormField
            label="Kata Sandi Baru"
            placeholder="Masukkan kata sandi baru"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNew}
            rightIcon={
              <TouchableOpacity onPress={() => setShowNew(v => !v)}>
                <Icon
                  name={showNew ? 'eye-off' : 'eye'}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            }
            error={errorNew}
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
    backgroundColor: 'rgba(0,0,0,0.5)',
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

export default EditPasswordModal;

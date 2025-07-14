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
import {getUserByPhone} from '../../database/users/userQueries';
import {useContext} from 'react';
import {AuthContext} from '../../context/AuthContext';
import {hashText} from '../../utils/crypto';
import {validateRegisterInput} from '../../utils/form';
import {VALIDATION_MESSAGES} from '../../constants';

interface EditPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updatedData: {password: string}) => void;
}

const EditPasswordModal = ({
  visible,
  onClose,
  onSave,
}: EditPasswordModalProps) => {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const {userPhone} = useContext(AuthContext);

  useEffect(() => {
    if (!visible) {
      setPassword('');
      setNewPassword('');
      setShowPassword(false);
      setShowNewPassword(false);
      setPasswordError('');
      setNewPasswordError('');
    }
  }, [visible]);

  const handleSave = async () => {
    setPasswordError('');
    setNewPasswordError('');

    let hasError = false;

    if (!password) {
      setPasswordError(VALIDATION_MESSAGES.oldPasswordRequired);
      hasError = true;
    }
    if (!newPassword) {
      setNewPasswordError(VALIDATION_MESSAGES.newPasswordRequired);
      hasError = true;
    }

    if (userPhone && password) {
      const user = await getUserByPhone(userPhone);
      const hashedInputPassword = await hashText(password);
      if (!user || user.password !== hashedInputPassword) {
        setPasswordError(VALIDATION_MESSAGES.oldPasswordInvalid);
        hasError = true;
      }
    }

    if (newPassword) {
      const {passwordError: newPasswordValidationError} = validateRegisterInput(
        '',
        '',
        newPassword,
      );
      if (newPasswordValidationError) {
        setNewPasswordError(newPasswordValidationError);
        hasError = true;
      }
    }

    if (hasError) {
      return;
    }

    const hashedNewPassword = await hashText(newPassword);
    onSave({password: hashedNewPassword});
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
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
                <Icon
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            }
            error={passwordError}
          />
          <FormField
            label="Kata Sandi Baru"
            placeholder="Masukkan kata sandi baru"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            rightIcon={
              <TouchableOpacity onPress={() => setShowNewPassword(v => !v)}>
                <Icon
                  name={showNewPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            }
            error={newPasswordError}
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

export default EditPasswordModal;

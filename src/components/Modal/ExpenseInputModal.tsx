import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FormField from '../Form/FormField';
import Button from '../Button/Button';
import CustomText from '../Text/CustomText';
import {COLORS} from '../../constants/colors';
import {formatRupiah} from '../../utils/formatIDR';

interface Props {
  visible: boolean;
  onClose: () => void;
  description: string;
  setDescription: (text: string) => void;
  amount: string;
  setAmount: (text: string) => void;
  onSave: () => void;
}

interface FieldErrors {
  description?: string;
  amount?: string;
}

const ExpenseInputModal: React.FC<Props> = ({
  visible,
  onClose,
  description,
  setDescription,
  amount,
  setAmount,
  onSave,
}) => {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [displayAmount, setDisplayAmount] = useState('');

  useEffect(() => {
    if (!visible) {
      setErrors({});
      setDescription('');
      setAmount('');
      setDisplayAmount('');
    } else {
      setDisplayAmount(amount ? formatRupiah(amount) : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const validate = (): boolean => {
    const newErrors: FieldErrors = {
      description: description.trim() ? undefined : 'Deskripsi wajib diisi',
      amount:
        amount.trim() && !Number.isNaN(Number(amount)) && Number(amount) > 0
          ? undefined
          : 'Jumlah tidak valid',
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }
    onSave();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <CustomText variant="subtitle">Tambah Pengeluaran</CustomText>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color={COLORS.darkBlue} />
              </TouchableOpacity>
            </View>

            <FormField
              label="Deskripsi"
              placeholder="Contoh: Beli bahan baku"
              value={description}
              onChangeText={setDescription}
              error={errors.description}
            />

            <FormField
              label="Jumlah Pengeluaran (Rp)"
              placeholder="Contoh: 100000"
              keyboardType="numeric"
              value={displayAmount}
              onChangeText={text => {
                const cleaned = text.replace(/\D/g, '');
                setAmount(cleaned);
                if (cleaned === '') {
                  setDisplayAmount('');
                } else {
                  setDisplayAmount(formatRupiah(cleaned));
                }
              }}
              error={errors.amount}
            />

            <Button title="Simpan" variant="primary" onPress={handleSave} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
});

export default ExpenseInputModal;

import React from 'react';
import {View, StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../Text/CustomText';
import Button from '../Button/Button';
import {COLORS} from '../../constants';

interface Props {
  visible: boolean;
  title: string;
  description: string;
  buttonLabel: string;
  onClose: () => void;
}

const SuccessModal: React.FC<Props> = ({
  visible,
  title,
  description,
  buttonLabel,
  onClose,
}) => {
  return (
    <Modal
      isVisible={visible}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropOpacity={0.4}
      useNativeDriver
      style={styles.modalWrapper}>
      <View style={styles.modalContent}>
        <Ionicons
          name="checkmark-circle"
          size={64}
          color={COLORS.green}
          style={styles.icon}
        />
        <CustomText
          variant="title"
          align="center"
          style={styles.textMarginBottom}>
          {title}
        </CustomText>

        <CustomText
          variant="body"
          color={COLORS.gray}
          align="center"
          style={styles.textDescription}>
          {description}
        </CustomText>

        <Button title={buttonLabel} variant="success" onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    width: 300,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  textMarginBottom: {
    marginBottom: 8,
  },
  textDescription: {
    marginBottom: 20,
  },
});

export default SuccessModal;

import {StyleSheet, View} from 'react-native';
import CustomText from '../Text/CustomText';
import Button from '../Button/Button';
import {COLORS} from '../../constants';

interface Props {
  onAddMenu: () => void;
  onViewAllMenu: () => void;
}

const MenuManagementCard = ({onAddMenu, onViewAllMenu}: Props) => {
  return (
    <View style={styles.card}>
      <CustomText variant="title" style={styles.title}>
        Pengelolaan Menu
      </CustomText>

      <CustomText variant="subtitle" style={styles.subtitle}>
        Kelola daftar menu makanan dan minuman Anda
      </CustomText>

      <View style={styles.buttonGroup}>
        <Button
          title="Tambahkan Menu Baru"
          variant="primary"
          onPress={onAddMenu}
        />
        <Button
          title="Tampilkan Semua Menu"
          variant="outline"
          onPress={onViewAllMenu}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
    color: COLORS.gray,
  },
  buttonGroup: {
    gap: 8,
  },
});

export default MenuManagementCard;

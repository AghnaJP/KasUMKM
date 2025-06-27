import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import CustomText from '../../components/Text/CustomText';
import SwitchBar from '../AddTransaction/SwitchBar';
import Icon from 'react-native-vector-icons/Ionicons';
import { dummyMenus, MenuItem } from '../../data/data';
import { COLORS } from '../../constants/colors';
import EmptyListMessage from '../../components/EmptyListMessage';

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (menu: MenuItem) => void;
}

const MenuModal: React.FC<MenuModalProps> = ({ visible, onClose, onSelect }) => {
  const [selectedOption, setSelectedOption] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = dummyMenus.filter((menu) => {
    const cocokKategori = selectedOption === 'Semua' || menu.kategori === selectedOption;
    const cocokSearch = menu.namaMenu.toLowerCase().includes(searchQuery.toLowerCase());
    return cocokKategori && cocokSearch;
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <CustomText variant="subtitle">
              Pilih Menu
            </CustomText>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={COLORS.darkBlue} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Cari menu..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <SwitchBar
            options={['Semua', 'Makanan', 'Minuman']}
            selected={selectedOption}
            onChange={setSelectedOption}
            size="small"
          />

          <TouchableOpacity
            style={styles.addItemContainer}
            onPress={() => {
              // You may want to open a "Tambah Menu" modal or handle this differently.
              // For now, we'll pass a placeholder MenuItem.
              onSelect({
                namaMenu: 'Tambah Menu',
                harga: 0,
                kategori: 'Makanan',
              });
              onClose();
            }}
          >
            <View style={styles.menuInfo}>
              <CustomText variant="body">Tambah Menu</CustomText>
            </View>
            <Icon name="chevron-forward" size={20} color={COLORS.darkBlue} />
          </TouchableOpacity>

          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item.namaMenu}
            style={styles.scrollArea}
            renderItem={({ item: menu }) => (
              <TouchableOpacity
                style={styles.menuItemContainer}
                onPress={() => {
                  onSelect(menu);
                  onClose();
                }}
              >
                <View style={styles.menuInfo}>
                  <CustomText variant="body">{menu.namaMenu}</CustomText>
                  <CustomText variant="caption">
                    Rp{menu.harga.toLocaleString('id-ID')}
                  </CustomText>
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    onSelect(menu);
                    onClose();
                  }}
                >
                  <Icon name="add-circle" size={25} color={COLORS.darkBlue} />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<EmptyListMessage message="Menu tidak ditemukan" />}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#eee',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  scrollArea: {
    maxHeight: '100%',
  },
  addItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderWidth: 0.5,
  },
  menuItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  menuInfo: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    paddingLeft: 8,
  },
  emptyMenuContainer: {
    padding: 16,
    alignItems: 'center',
  },
});

export default MenuModal;

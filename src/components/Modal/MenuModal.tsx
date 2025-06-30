import React, {useState, useEffect} from 'react';
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
import {MenuModalProps, CATEGORIES} from '../../types/menu';
import {COLORS} from '../../constants/colors';
import EmptyListMessage from '../../components/EmptyListMessage';
import {getAllMenus} from '../../database/menus/menuQueries';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../types/navigation';

const MenuModal: React.FC<MenuModalProps> = ({visible, onClose, onSelect}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [menus, setMenus] = useState<
    {id: number; name: string; category: string; price: number}[]
  >([]);

  useEffect(() => {
    if (visible) {
      const fetchData = async () => {
        try {
          const data = await getAllMenus();
          setMenus(data);
        } catch (err) {
          console.error('Failed to load menus:', err);
        }
      };
      fetchData();
    }
  }, [visible]);

  const [selectedOption, setSelectedOption] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const switchOptions = ['Semua', ...CATEGORIES.map(cat => cat.label)];
  const labelToValue = Object.fromEntries(
    CATEGORIES.map(cat => [cat.label, cat.value]),
  );
  const filteredOptions = menus.filter(menu => {
    const filterCategory =
      selectedOption === 'Semua' ||
      menu.category === labelToValue[selectedOption];
    const filterSearch = menu.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return filterCategory && filterSearch;
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <CustomText variant="subtitle">Pilih Menu</CustomText>
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
            options={switchOptions}
            selected={selectedOption}
            onChange={setSelectedOption}
            size="small"
          />

          <TouchableOpacity
            style={styles.addItemContainer}
            onPress={() => {
              onClose();
              navigation.navigate('App', {screen: 'AddMenu'});
            }}>
            <View style={styles.addMenu}>
              <CustomText variant="body">Tambah Menu</CustomText>
            </View>
            <Icon name="chevron-forward" size={20} color={COLORS.darkBlue} />
          </TouchableOpacity>

          <FlatList
            data={filteredOptions}
            keyExtractor={item => item.id.toString()}
            style={styles.scrollArea}
            renderItem={({item: menu}) => (
              <TouchableOpacity
                style={styles.menuItemContainer}
                onPress={() => {
                  onSelect({
                    id: menu.id,
                    name: menu.name,
                    price: menu.price,
                    category: menu.category,
                  });
                  onClose();
                }}>
                <View style={styles.addMenu}>
                  <CustomText variant="body">{menu.name}</CustomText>
                  <CustomText variant="caption">
                    Rp{menu.price.toLocaleString('id-ID')}
                  </CustomText>
                </View>
                <Icon name="add-circle" size={25} color={COLORS.darkBlue} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <EmptyListMessage message="Menu tidak ditemukan" />
            }
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
  addMenu: {
    flex: 1,
    marginRight: 8,
  },
});

export default MenuModal;

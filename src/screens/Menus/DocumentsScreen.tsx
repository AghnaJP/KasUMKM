import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import SwitchBar from '../../components/AddTransaction/SwitchBar';
import MenuItemRow from '../../components/Menu/MenuItemRow';
import HiddenMenuActions from '../../components/Menu/HiddenMenuAction';
import EditMenuModal from '../../components/Modal/EditmenuModal';
import CustomText from '../../components/Text/CustomText';
import Button from '../../components/Button/Button';
import DropdownField from '../../components/Form/DropDownField';
import FormField from '../../components/Form/FormField';

import {SwipeListView} from 'react-native-swipe-list-view';
import {formatRupiah} from '../../utils/formatIDR';

import {
  insertMenu,
  deleteMenuById,
  updateMenuById,
} from '../../database/menus/menuQueries';
import {getIncomeCountByMenuId} from '../../database/Incomes/incomeQueries';
import {fetchAndFormatMenus} from '../../services/menuService';

import type {AppStackParamList} from '../../types/navigation';
import {CategoryWithEmpty, MenuItem, CATEGORIES} from '../../types/menu';

import {COLORS, MENU_ALERTS} from '../../constants';

type Nav = NativeStackNavigationProp<AppStackParamList>;
interface FieldErrors {
  category?: string;
  name?: string;
  price?: string;
}

const DocumentsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  useLayoutEffect(() => {
    navigation.setOptions({title: 'Menu', headerRight: () => null});
  }, [navigation]);

  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryWithEmpty>('');
  const [loading, setLoading] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [editVisible, setEditVisible] = useState(false);

  const [addVisible, setAddVisible] = useState(false);
  const [addCategory, setAddCategory] = useState<CategoryWithEmpty>('');
  const [addName, setAddName] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addDisplayPrice, setAddDisplayPrice] = useState('');
  const [addErrors, setAddErrors] = useState<FieldErrors>({});

  const rowMapRef = useRef<{[key: number]: any}>({});

  useEffect(() => {
    fetchMenus();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchMenus();
      return () => {};
    }, []),
  );

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const mapped = await fetchAndFormatMenus();
      Object.values(rowMapRef.current).forEach(row => row?.closeRow?.());
      setMenus(mapped);
    } finally {
      setLoading(false);
    }
  };

  const validateAdd = (): boolean => {
    const errs: FieldErrors = {
      category: addCategory ? undefined : 'Kategori wajib diisi',
      name: addName.trim() ? undefined : 'Nama menu wajib diisi',
      price: addPrice ? undefined : 'Harga menu wajib diisi',
    };
    setAddErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const submitAdd = async () => {
    if (!validateAdd()) {
      return;
    }
    const numeric = Number(addPrice);
    if (Number.isNaN(numeric)) {
      setAddErrors(prev => ({...prev, price: 'Harga tidak valid'}));
      return;
    }
    try {
      await insertMenu(addName.trim(), addCategory, numeric);
      await fetchMenus();
      resetAddForm();
      setAddVisible(false);
      Alert.alert('Berhasil', 'Menu berhasil disimpan');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Gagal menyimpan menu');
    }
  };

  const resetAddForm = () => {
    setAddCategory('');
    setAddName('');
    setAddPrice('');
    setAddDisplayPrice('');
    setAddErrors({});
  };

  const handleEditPress = (item: MenuItem) => {
    const row = rowMapRef.current[item.id];
    if (row) {
      row.closeRow();
    }
    setSelectedMenu(item);
    setEditVisible(true);
  };

  const handleSaveEdit = async (updated: {name: string; price: string}) => {
    if (!selectedMenu) return;

    const name = updated.name?.trim();
    const price = Number(updated.price);

    if (!name) {
      Alert.alert('Validasi', 'Nama menu wajib diisi.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      Alert.alert('Validasi', 'Harga harus lebih dari 0.');
      return;
    }

    const count = await getIncomeCountByMenuId(selectedMenu.id);
    const doUpdate = async () => {
      await updateMenuById(selectedMenu.id, name, price);
      await fetchMenus();
      setEditVisible(false);
      setSelectedMenu(null);
      Alert.alert('Berhasil', 'Menu berhasil diperbarui.');
    };

    if (count > 0) {
      Alert.alert(
        'Edit Menu',
        MENU_ALERTS.editWithTransaction(count, selectedMenu.name),
        [
          {text: 'Batal', style: 'cancel'},
          {text: 'Lanjut Edit', onPress: doUpdate},
        ],
      );
    } else {
      await doUpdate();
    }
  };

  const handleDelete = useCallback(async (id: number, name: string) => {
    const count = await getIncomeCountByMenuId(id);
    const message =
      count > 0
        ? MENU_ALERTS.deleteWithTransaction(count, name)
        : MENU_ALERTS.deleteWithoutTransaction(name);

    Alert.alert(
      'Hapus Menu',
      message,
      [
        {text: 'Batal', style: 'cancel'},
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await deleteMenuById(id);
            await fetchMenus();
            Alert.alert('Berhasil', 'Menu berhasil dihapus.');
          },
        },
      ],
      {cancelable: true},
    );
  }, []);

  const categoryOptions = useMemo(
    () => [{label: 'Semua', value: ''}, ...CATEGORIES],
    [],
  );

  const filteredMenus = useMemo(() => {
    if (selectedCategory === '') {
      return menus;
    }
    return menus.filter(m => m.category === selectedCategory);
  }, [menus, selectedCategory]);

  return (
    <SafeAreaView style={styles.wrapper}>
      <Button
        title="Tambah Menu"
        onPress={() => setAddVisible(true)}
        customStyle={styles.addCornerBtn}
        variant="primary"
      />

      <View style={styles.topRow}>
        <SwitchBar
          options={categoryOptions}
          selected={selectedCategory}
          onChange={val => setSelectedCategory(val as CategoryWithEmpty)}
        />
      </View>

      <View style={styles.cardWrapper}>
        <SwipeListView
          data={filteredMenus}
          extraData={{menus, selectedCategory}}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <MenuItemRow
              name={item.name}
              category={item.category as 'food' | 'drink'}
              price={item.price}
            />
          )}
          renderHiddenItem={(data, rowMap) => {
            rowMapRef.current[data.item.id] = rowMap[data.item.id];
            return (
              <HiddenMenuActions
                item={data.item}
                onEdit={handleEditPress}
                onDelete={() => handleDelete(data.item.id, data.item.name)}
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyWrapper}>
              {loading ? (
                <ActivityIndicator color={COLORS.darkBlue} />
              ) : (
                <CustomText
                  variant="caption"
                  align="center"
                  color={COLORS.darkGray}>
                  Tidak ada menu untuk kategori ini.
                </CustomText>
              )}
            </View>
          }
          rightOpenValue={-160}
          disableRightSwipe
          contentContainerStyle={styles.listContent}
        />
      </View>

      <EditMenuModal
        visible={editVisible}
        onClose={() => {
          setEditVisible(false);
          setSelectedMenu(null);
        }}
        menuData={
          selectedMenu
            ? {name: selectedMenu.name, price: selectedMenu.price}
            : null
        }
        onSave={handleSaveEdit}
      />

      <Modal
        visible={addVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setAddVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <CustomText variant="subtitle">Tambah Menu</CustomText>
              <TouchableOpacity onPress={() => setAddVisible(false)}>
                <Icon name="close" size={22} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{gap: 12}}>
              <DropdownField<CategoryWithEmpty>
                label="Pilih Kategori"
                value={addCategory}
                onValueChange={setAddCategory}
                items={[...CATEGORIES]}
                placeholder="Pilih kategori"
                error={addErrors.category}
              />

              <FormField
                label="Nama Menu"
                placeholder="Masukkan nama menu"
                value={addName}
                onChangeText={text => {
                  const formatted =
                    text.length > 0
                      ? text.charAt(0).toUpperCase() + text.slice(1)
                      : '';
                  setAddName(formatted);
                }}
                error={addErrors.name}
              />

              <FormField
                label="Harga Menu"
                placeholder="0"
                value={addDisplayPrice}
                onChangeText={text => {
                  const cleaned = text.replace(/\D/g, '');
                  setAddPrice(cleaned);
                  setAddDisplayPrice(cleaned ? formatRupiah(cleaned) : '');
                }}
                keyboardType="numeric"
                error={addErrors.price}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="BATAL"
                variant="secondary"
                onPress={() => setAddVisible(false)}
                customStyle={{flex: 1}}
              />
              <Button
                title="SIMPAN"
                variant="primary"
                onPress={submitAdd}
                customStyle={{flex: 1}}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const BTN_SIZE = 40;
const OFFSET_RIGHT = 16;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
    marginVertical: 20,
  },

  addCornerBtn: {
    position: 'absolute',
    right: OFFSET_RIGHT,
    width: 130,
    height: 45,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  topRow: {
    paddingHorizontal: 16,
    paddingTop: BTN_SIZE + 8,
  },

  cardWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 2},
    elevation: 4,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyWrapper: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 8,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalFooter: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
});

export default DocumentsScreen;

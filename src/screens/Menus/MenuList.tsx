import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';
import {deleteMenuById, updateMenuById} from '../../database/menus/menuQueries';
import SwitchBar from '../../components/AddTransaction/SwitchBar';
import MenuItemRow from '../../components/Menu/MenuItemRow';
import HiddenMenuActions from '../../components/Menu/HiddenMenuAction';
import EditMenuModal from '../../components/Modal/EditmenuModal';
import {CategoryWithEmpty, MenuItem, CATEGORIES, ID} from '../../types/menu';
import CustomText from '../../components/Text/CustomText';
import {COLORS, MENU_ALERTS} from '../../constants';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppStackParamList} from '../../types/navigation';
import {fetchAndFormatMenus} from '../../services/menuService';
import {getIncomeCountByMenuId} from '../../database/Incomes/incomeQueries';
import {useFocusEffect} from '@react-navigation/native';

const categoryOptions = [{label: 'Semua', value: ''}, ...CATEGORIES];

const MenuList = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryWithEmpty>('');
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const rowMapRef = useRef<{[key: string]: any}>({});

  useEffect(() => {
    fetchMenus();
  }, []);

  useFocusEffect(
    useCallback(() => {
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

  const handleEdit = (item: MenuItem) => {
    const row = rowMapRef.current[item.id];
    if (row) {
      row.closeRow();
    }
    setSelectedMenu(item);
    setEditVisible(true);
  };

  const handleSaveEdit = async (updated: {name: string; price: string}) => {
    if (!selectedMenu) {
      return;
    }

    const name = updated.name?.trim();
    const price = Number(updated.price);

    if (!name) {
      Alert.alert('Validasi', 'Nama menu tidak boleh kosong.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      Alert.alert('Validasi', 'Harga harus lebih dari 0.');
      return;
    }
    const count = await getIncomeCountByMenuId(selectedMenu.id);

    const doUpdate = async () => {
      await updateMenuById(selectedMenu.id, name, price);
      setEditVisible(false);
      setSelectedMenu(null);
      fetchMenus();
      Alert.alert('Sukses', 'Menu berhasil diperbarui.');
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

  const handleDelete = useCallback(async (id: ID, name: string) => {
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
            fetchMenus();
            Alert.alert('Berhasil', 'Menu berhasil dihapus.');
          },
        },
      ],
      {cancelable: true},
    );
  }, []);

  const filteredMenus = useMemo(() => {
    if (selectedCategory === '') {
      return menus;
    }
    return menus.filter(item => item.category === selectedCategory);
  }, [menus, selectedCategory]);

  return (
    <View style={styles.container}>
      <SwitchBar
        options={categoryOptions}
        selected={selectedCategory}
        onChange={val => setSelectedCategory(val as CategoryWithEmpty)}
      />

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
                onEdit={handleEdit}
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
          contentContainerStyle={styles.contentContainerStyle}
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

      <TouchableOpacity
        onPress={() => navigation.navigate('AddMenu')}
        activeOpacity={0.8}
        style={styles.fab}>
        <Icon name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  cardWrapper: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 2},
    elevation: 4,
    maxHeight: 500,
    marginTop: 8,
  },
  contentContainerStyle: {
    paddingVertical: 8,
  },
  emptyWrapper: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: COLORS.darkBlue,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 4,
  },
});

export default MenuList;

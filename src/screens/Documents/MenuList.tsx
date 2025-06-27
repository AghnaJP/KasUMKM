import React, {useEffect, useState} from 'react';
import {View, FlatList, StyleSheet} from 'react-native';
import CustomText from '../../components/Text/CustomText';
import {getAllMenus} from '../../database/menus/menuQueries';
import {formatRupiah} from '../../utils/formatIDR';

const MenuList = () => {
  const [menus, setMenus] = useState<
    {id: number; name: string; category: string; price: number}[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllMenus();
        setMenus(data);
      } catch (err) {
        console.error('Failed to load menus:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <CustomText variant="title" style={styles.title}>
        Daftar Menu
      </CustomText>

      <FlatList
        data={menus}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <View style={styles.item}>
            <CustomText variant="body">{item.name}</CustomText>
            <CustomText variant="caption">
              {item.category === 'food' ? 'Makanan' : 'Minuman'} - Rp{' '}
              {formatRupiah(item.price.toString())}
            </CustomText>
          </View>
        )}
        ListEmptyComponent={
          <CustomText variant="body">Belum ada menu.</CustomText>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  title: {
    marginBottom: 12,
  },
  item: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
});

export default MenuList;

import React from 'react';
import {View, StyleSheet} from 'react-native';
import CustomText from '../Text/CustomText';
import {formatRupiah} from '../../utils/formatIDR';

interface Props {
  name: string;
  category: 'food' | 'drink';
  price: number;
}

const MenuItemRow: React.FC<Props> = ({name, category, price}) => {
  return (
    <View style={styles.menuRow}>
      <View style={styles.menuInfo}>
        <CustomText style={styles.menuName}>{name}</CustomText>
        <CustomText style={styles.menuCategory}>
          {category === 'food' ? 'Makanan' : 'Minuman'}
        </CustomText>
      </View>
      <CustomText style={styles.menuPrice}>{formatRupiah(price)}</CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuInfo: {
    flex: 1,
    marginLeft: 8,
  },
  menuName: {
    fontSize: 16,
    color: '#111',
  },
  menuCategory: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
});

export default MenuItemRow;

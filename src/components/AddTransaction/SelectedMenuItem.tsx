import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomText from '../Text/CustomText';
import {ExpenseItem, MenuItem} from '../../types/menu';
import {COLORS} from '../../constants';

interface SelectedMenuItemProps {
  item: MenuItem | ExpenseItem;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

const SelectedMenuItem: React.FC<SelectedMenuItemProps> = ({
  item,
  quantity,
  onIncrease,
  onDecrease,
}) => {
  const name = 'name' in item ? item.name : item.description;
  const price = item.price;
  return (
    <View style={styles.menu}>
      <View style={styles.menuInfo}>
        <CustomText variant="body">{name}</CustomText>
        <CustomText variant="caption">
          Rp{price.toLocaleString('id-ID')}
        </CustomText>
      </View>
      <View style={styles.counterWrapper}>
        <TouchableOpacity onPress={onDecrease}>
          <Icon
            name="remove-circle-outline"
            size={24}
            color={COLORS.darkBlue}
          />
        </TouchableOpacity>
        <CustomText style={styles.quantityText}>{quantity}</CustomText>
        <TouchableOpacity onPress={onIncrease}>
          <Icon name="add-circle-outline" size={24} color={COLORS.darkBlue} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderWidth: 0.5,
  },
  menuInfo: {
    flex: 1,
  },
  counterWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 8,
  },
});

export default SelectedMenuItem;

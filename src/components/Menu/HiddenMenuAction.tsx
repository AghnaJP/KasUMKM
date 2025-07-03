import React from 'react';
import {View, StyleSheet} from 'react-native';
import Button from '../Button/Button';
import {MenuItem} from '../../types/menu';

interface Props {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
}

const HiddenMenuActions: React.FC<Props> = ({item, onEdit, onDelete}) => {
  return (
    <View style={styles.hiddenRow}>
      <Button
        title="Edit"
        onPress={() => onEdit(item)}
        variant="edit"
        fullWidth={false}
        customStyle={styles.actionBtn}
      />
      <Button
        title="Delete"
        onPress={() => onDelete(item.id)}
        variant="delete"
        fullWidth={false}
        customStyle={styles.actionBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  hiddenRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingRight: 8,
  },
  actionBtn: {
    width: 72,
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
});

export default HiddenMenuActions;

import React from 'react';
import {View, StyleSheet} from 'react-native';
import Button from '../Button/Button';

interface Props<T extends {id: string | number}> {
  item: T;
  onEdit: (item: T) => void;
  onDelete: (id: string | number) => void;
}

const HiddenActions = <T extends {id: string | number}>({
  item,
  onEdit,
  onDelete,
}: Props<T>) => {
  return (
    <View style={styles.hiddenRow}>
      <Button
        title="Ubah"
        onPress={() => onEdit(item)}
        variant="edit"
        fullWidth={false}
        customStyle={styles.actionBtn}
      />
      <Button
        title="Hapus"
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

export default HiddenActions;

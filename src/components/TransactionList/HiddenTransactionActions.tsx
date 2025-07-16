import React from 'react';
import {View, StyleSheet} from 'react-native';
import Button from '../Button/Button';
import {IncomeData, ExpenseData} from '../../types/transaction';

interface Props {
  item: IncomeData | ExpenseData;
  onEdit: (item: IncomeData | ExpenseData) => void;
  onDelete: (id: number) => void;
}

const HiddenTransactionActions: React.FC<Props> = ({
  item,
  onEdit,
  onDelete,
}) => {
  return (
    <View style={styles.hiddenRow}>
      <Button
        title="Edit"
        onPress={() => onEdit(item)}
        variant="edit"
        fullWidth={false}
        customStyle={styles.actionBtn}
        textStyle={styles.actionText}
      />
      <Button
        title="Delete"
        onPress={() => onDelete(item.id)}
        variant="delete"
        fullWidth={false}
        customStyle={styles.actionBtn}
        textStyle={styles.actionText}
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
    width: 64,
    borderRadius: 6,
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  actionText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default HiddenTransactionActions;

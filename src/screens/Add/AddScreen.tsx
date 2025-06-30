import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import AddIncome from './AddIncome';
import AddExpense from './AddExpense';
import SwitchBar from '../../components/AddTransaction/SwitchBar';
import MainLayout from '../../components/MainLayout';

const AddScreen = () => {
  const [selectedOption, setSelectedOption] = useState<
    'Pemasukan' | 'Pengeluaran'
  >('Pemasukan');

  return (
    <MainLayout>
      <View style={styles.wrapper}>
        <View style={styles.container}>
          <SwitchBar
            options={['Pemasukan', 'Pengeluaran']}
            selected={selectedOption}
            onChange={(value: string) =>
              setSelectedOption(
                value === 'Pemasukan' ? 'Pemasukan' : 'Pengeluaran',
              )
            }
          />

          {selectedOption === 'Pemasukan' ? <AddIncome /> : <AddExpense />}
        </View>
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    marginVertical: 40,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    flexGrow: 1,
  },
});

export default AddScreen;

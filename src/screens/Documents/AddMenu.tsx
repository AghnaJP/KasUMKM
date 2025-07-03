import React, {useState} from 'react';
import {View, StyleSheet, ScrollView, Alert} from 'react-native';
import Button from '../../components/Button/Button';
import FormField from '../../components/Form/FormField';
import DropdownField from '../../components/Form/DropDownField';
import {formatRupiah} from '../../utils/formatIDR';
import {insertMenu} from '../../database/menus/menuQueries';
import {CATEGORIES, CategoryWithEmpty} from '../../types/menu';
import {useNavigation} from '@react-navigation/native';

interface FieldErrors {
  category?: string;
  name?: string;
  price?: string;
}

const AddMenu: React.FC = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [displayPrice, setDisplayPrice] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryWithEmpty>('');

  const validate = (): boolean => {
    const newErrors: FieldErrors = {
      category: selectedCategory ? undefined : 'Kategori wajib diisi',
      name: name.trim() ? undefined : 'Nama menu wajib diisi',
      price: price ? undefined : 'Harga menu wajib diisi',
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    const numeric = Number(price);
    if (Number.isNaN(numeric)) {
      setErrors(prev => ({...prev, price: 'Harga tidak valid'}));
      return;
    }

    try {
      await insertMenu(name.trim(), selectedCategory, numeric);
      Alert.alert('Berhasil', 'Menu berhasil disimpan', [
        {
          text: 'OK',
          onPress: () => {
            resetForm();
            navigation.goBack();
          },
        },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Gagal menyimpan menu');
    }
  };

  const resetForm = () => {
    setSelectedCategory('');
    setName('');
    setPrice('');
    setDisplayPrice('');
    setErrors({});
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <DropdownField<CategoryWithEmpty>
          label="Pilih Kategori"
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          items={[...CATEGORIES]}
          placeholder="Pilih kategori"
          error={errors.category}
        />

        <FormField
          label="Nama Menu"
          placeholder="Masukkan nama menu"
          value={name}
          onChangeText={text => {
            const formatted = text.charAt(0).toUpperCase() + text.slice(1);
            setName(formatted);
          }}
          error={errors.name}
        />

        <FormField
          label="Harga Menu"
          placeholder="0"
          value={displayPrice}
          onChangeText={text => {
            const cleaned = text.replace(/\D/g, '');
            setPrice(cleaned);
            setDisplayPrice(cleaned ? formatRupiah(cleaned) : '');
          }}
          keyboardType="numeric"
          error={errors.price}
        />

        <Button title="SIMPAN" variant="primary" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
});

export default AddMenu;

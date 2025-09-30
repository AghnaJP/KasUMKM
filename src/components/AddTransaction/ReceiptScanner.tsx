import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS} from '../../constants/colors';
import CustomText from '../Text/CustomText';

interface ExpenseScannerProps {
  onResultDetected: (
    results: {price: number; description: string; quantity: number}[],
  ) => void;
}

const ExpenseScanner: React.FC<ExpenseScannerProps> = ({onResultDetected}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  function parseReceipt(text: string) {
    const lines = text
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    const items: {description: string; quantity: number; price: number}[] = [];
    let discountAmount = 0;

    // Cari diskon dulu
    lines.forEach(line => {
      const match = line.match(/\(?(\d{1,3}(?:[.,]\d{3})+)\)?/);
      if (/diskon|discount/i.test(line) && match) {
        discountAmount = parseInt(match[1].replace(/[.,]/g, ''), 10);
      }
    });

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Cek apakah line itu harga
      const priceMatch = line.match(/^(\d{1,3}(?:[.,]\d{3})+|\d{4,})$/);
      if (priceMatch) {
        let price = parseInt(priceMatch[1].replace(/[.,]/g, ''), 10);

        // Cek baris sebelum price = quantity
        let quantity = 1;
        let descIndex = i - 1;

        if (i > 0 && /^\d+$/.test(lines[i - 1])) {
          quantity = parseInt(lines[i - 1], 10);
          descIndex = i - 2; // deskripsi ada 2 line sebelum
        }

        const description = lines[descIndex] || 'Item';

        items.push({description, quantity, price});
      }
    }

    // Jika ada discount, bagi rata ke semua item
    if (discountAmount > 0 && items.length > 0) {
      const discountPerItem = Math.floor(discountAmount / items.length);
      items.forEach(item => {
        item.price = Math.max(0, item.price - discountPerItem);
      });
    }

    console.log('Extracted items:', items);
    return items;
  }

  const processImage = async (imagePath: string) => {
    try {
      setIsProcessing(true);

      const result = await TextRecognition.recognize(imagePath);
      console.log('OCR Result:', result.text);

      const items = parseReceipt(result.text);
      console.log('Extracted items:', items);

      interface FormattedItem {
        description: string;
        quantity: number;
        price: number;
      }

      const formattedItems: FormattedItem[] = items.map(
        (item: {description: string; quantity: number; price: number}) => ({
          description: item.description,
          quantity: item.quantity,
          price: item.price,
        }),
      );

      if (formattedItems.length > 0) {
        onResultDetected(formattedItems);
      } else {
        Alert.alert(
          'Tidak Ditemukan',
          'Tidak ada item belanja dengan jumlah harga yang valid.',
        );
      }
    } catch (error) {
      console.error('OCR Error:', error);
      Alert.alert('Error', 'Gagal memproses gambar. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const openCamera = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
      });

      if (result.didCancel) {
        return;
      }
      if (result.errorCode) {
        Alert.alert('Error', `Kamera error: ${result.errorMessage}`);
        return;
      }

      if (result.assets && result.assets[0]?.uri) {
        setPreviewImage(result.assets[0].uri);
        processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera exception:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat membuka kamera');
    }
  };

  const openGallery = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets[0]?.uri) {
      setPreviewImage(result.assets[0].uri);
      processImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <CustomText style={styles.title}>Scan Nota Pengeluaran</CustomText>

      {previewImage && (
        <View style={styles.previewContainer}>
          <Image source={{uri: previewImage}} style={styles.previewImage} />
        </View>
      )}

      {isProcessing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.softBlue} />
          <CustomText style={styles.loadingText}>
            Memproses gambar...
          </CustomText>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={openCamera}
            disabled={isProcessing}>
            <Icon name="camera" size={24} color={COLORS.white} />
            <CustomText style={styles.buttonText}>Kamera</CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={openGallery}
            disabled={isProcessing}>
            <Icon name="image" size={24} color={COLORS.white} />
            <CustomText style={styles.buttonText}>Galeri</CustomText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 16,
    marginBottom: 12,
    color: COLORS.darkBlue,
    fontFamily: 'Montserrat-SemiBold',
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  loadingText: {
    marginTop: 8,
    color: COLORS.darkGray,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: COLORS.darkBlue,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.white,
    marginLeft: 8,
    fontFamily: 'Montserrat-Medium',
  },
});

export default ExpenseScanner;

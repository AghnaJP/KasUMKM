/* eslint-disable no-useless-escape */
/* eslint-disable radix */
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

interface TransactionScannerProps {
  mode: 'income' | 'expense';
  onResultDetected: (
    results: {
      tanggal: string;
      keterangan: string;
      pemasukan: number;
      pengeluaran: number;
    }[],
  ) => void;
  onClose: () => void;
}

const TransactionScanner: React.FC<TransactionScannerProps> = ({
  mode,
  onResultDetected,
  onClose,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  function parseBukuPendapatan(text: string) {
    const lines = text
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    const pemasukanIndex = lines.findIndex(l => /pemasukan/i.test(l));
    const pengeluaranIndex = lines.findIndex(l => /pengeluaran/i.test(l));

    if (pemasukanIndex === -1 || pengeluaranIndex === -1) {
      console.warn('Pemasukan/Pengeluaran header not found');
      return [];
    }

    const descriptionLines = lines.slice(2, pemasukanIndex);
    const pemasukanLines = lines.slice(pemasukanIndex + 1, pengeluaranIndex);
    const pengeluaranLines = lines.slice(pengeluaranIndex + 1);

    const entries = [];
    const maxRows = Math.max(
      descriptionLines.length,
      pemasukanLines.length,
      pengeluaranLines.length,
    );

    for (let i = 0; i < maxRows; i++) {
      const descLine = descriptionLines[i] ?? '';
      const pemasukanStr = pemasukanLines[i] ?? '0';
      const pengeluaranStr = pengeluaranLines[i] ?? '0';

      let date = '';
      let keterangan = '';
      const dateMatch = descLine.match(/(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})/);
      if (dateMatch) {
        date = dateMatch[1];
        keterangan = descLine
          .substring(dateMatch[0].length)
          .replace('|', '')
          .trim();
      } else {
        keterangan = descLine.replace('|', '').trim();
      }

      const pemasukan = parseInt(pemasukanStr.replace(/[^\d]/g, '')) || 0;
      const pengeluaran = parseInt(pengeluaranStr.replace(/[^\d]/g, '')) || 0;

      // Filter berdasarkan mode
      if (mode === 'income' && pemasukan > 0) {
        entries.push({tanggal: date, keterangan, pemasukan, pengeluaran: 0});
      } else if (mode === 'expense' && pengeluaran > 0) {
        entries.push({tanggal: date, keterangan, pemasukan: 0, pengeluaran});
      }
    }

    return entries;
  }

  const processImage = async (imagePath: string) => {
    try {
      setIsProcessing(true);
      const result = await TextRecognition.recognize(imagePath);
      const entries = parseBukuPendapatan(result.text);

      if (entries.length > 0) {
        onResultDetected(entries);
      } else {
        Alert.alert('Tidak Ditemukan', `Tidak ada entry ${mode} valid.`);
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
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Icon name="close" size={24} color={COLORS.darkBlue} />
      </TouchableOpacity>
      <CustomText style={styles.title}>
        {mode === 'income' ? 'Scan Buku Pendapatan' : 'Scan Buku Pengeluaran'}
      </CustomText>

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
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 8,
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

export default TransactionScanner;

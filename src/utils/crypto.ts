import RNSimpleCrypto from 'react-native-simple-crypto';

export const hashText = async (text: string): Promise<string> => {
  const buffer = RNSimpleCrypto.utils.convertUtf8ToArrayBuffer(text);
  const hashBuffer = await RNSimpleCrypto.SHA.sha256(buffer);
  return RNSimpleCrypto.utils.convertArrayBufferToHex(hashBuffer);
};

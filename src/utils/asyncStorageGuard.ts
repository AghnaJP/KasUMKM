import AsyncStorage from '@react-native-async-storage/async-storage';

const origSetItem = AsyncStorage.setItem.bind(AsyncStorage);
const origMultiSet = AsyncStorage.multiSet?.bind(AsyncStorage);

AsyncStorage.setItem = (key: string, value: any) => {
  if (value === undefined || value === null) {
    return AsyncStorage.removeItem(key);
  }
  return origSetItem(key, String(value));
};

if (origMultiSet) {
  AsyncStorage.multiSet = (
    keyValuePairs: ReadonlyArray<Readonly<[string, any]>>,
  ): Promise<void> => {
    const fixed = keyValuePairs.map(([k, v]): [string, string] => [
      k,
      v === undefined || v === null ? '' : String(v),
    ]);

    // TypeScript expects readonly (readonly [string, string])[]:
    return origMultiSet(fixed as readonly [string, string][]);
  };
}

export default AsyncStorage;

export type RootStackParamList = {
  Auth: {screen: keyof AuthStackParamList; params?: object};
  App: { screen: string; params?: object };
};

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Wallet: undefined;
  Add: undefined;
  Documents: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  AppTabs: undefined;
  AddMenu: undefined;
  MenuList: undefined;
  AddTransaction: undefined;
};

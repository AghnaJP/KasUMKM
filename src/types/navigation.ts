export type RootStackParamList = {
  Auth: {screen: keyof AuthStackParamList; params?: object};
  App: {screen?: keyof AppTabParamList; params?: object} | undefined;
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

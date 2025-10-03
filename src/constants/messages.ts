export const STRINGS = {
  login: {
    title: 'Selamat Datang',
    description: 'Masuk ke akun kamu dengan nomor HP',
    errorPhoneNotFound: 'Nomor tidak ditemukan',
    errorPasswordWrong: 'Password salah',
    loginButton: 'Masuk',
    registerLink: 'Daftar Sekarang',
  },
  register: {
    title: 'Ayo Daftar',
    description: 'Buat akun dan mulai kelola keuanganmu',
    successTitle: 'Akun berhasil dibuat!',
    loginLink: 'Masuk',
  },
};

export const VALIDATION_MESSAGES = {
  nameRequired: 'Nama tidak boleh kosong',
  phoneRequired: 'Nomor handphone wajib diisi',
  passwordRequired: 'Kata sandi tidak boleh kosong',
  passwordInvalid:
    'Kata sandi harus minimal 6 karakter, ada huruf besar, angka, dan simbol.',
  phoneInvalidLength: 'Nomor handphone harus 9–13 digit',
  newPasswordRequired: 'Kata sandi baru tidak boleh kosong',
  oldPasswordRequired: 'Kata sandi lama tidak boleh kosong',
  oldPasswordInvalid: 'Kata sandi lama salah',
};

const crypto = require('crypto')

// Функція для створення безпечного випадкового секрету
const generateSecret = () => {
  return crypto.randomBytes(64).toString('hex') // генерує рядок завдовжки 64 байти (128 символів)
}

//Генеруємо секрети для різних токенів
const accessSecret = generateSecret()
const refreshSecret = generateSecret()
const resetSecret = generateSecret()
const confirmSecret = generateSecret()

console.log('JWT_ACCESS_SECRET=' + accessSecret)
console.log('JWT_REFRESH_SECRET=' + refreshSecret)
console.log('JWT_RESET_SECRET=' + resetSecret)
console.log('JWT_CONFIRM_SECRET=' + confirmSecret)

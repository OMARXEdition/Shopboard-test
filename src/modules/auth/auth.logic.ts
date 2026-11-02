export const getPasswordStrength = (value: string) => {
  if (value.length < 8) return 0
  if (value.length >= 12 && /[^A-Za-z0-9]/.test(value)) return 4
  if (value.length >= 12) return 3
  if (/[A-Za-z]/.test(value) && /\d/.test(value)) return 2
  return 1
}

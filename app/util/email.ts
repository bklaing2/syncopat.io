export function splitEmail(email?: string) {
  if (!email) return []

  const i = email.indexOf('@')
  return [email.substring(0, i), email.substring(i)]
}
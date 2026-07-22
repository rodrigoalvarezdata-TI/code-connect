/** Deriva um handle "@primeironome" a partir do nome do autor (o design usa @julio). */
export function handleFromName(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? ''
  return `@${first.toLowerCase()}`
}

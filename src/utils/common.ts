export const numberEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((value) => {
    return typeof value === 'number'
  }) as number[]
}

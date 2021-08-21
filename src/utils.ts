export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function getById<T extends { id: string }>(items: T[], id: string) {
  return items.find((item) => item.id === id);
}

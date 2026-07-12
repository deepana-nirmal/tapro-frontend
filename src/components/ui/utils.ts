export const classNames = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');
export const idFrom = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

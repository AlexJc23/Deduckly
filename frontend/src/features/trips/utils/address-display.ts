// Display only: never mutate geocoded addresses or coordinates in stored trip data.
export function addressDisplay(raw?: string | null): string | null {
  const parts = raw?.split(',').map(part => part.trim()).filter(Boolean);
  if (!parts?.length) return null;
  const normalize = (value: string) => value.toLocaleLowerCase().replace(/\s+/g, ' ').trim();
  const street = normalize(parts[0]);
  const streetWithoutNumber = street.replace(/^\d+[\w-]*\s+/, '');
  const filtered = parts.filter((part, index) => index === 0 ||
    (normalize(part) !== street && normalize(part) !== streetWithoutNumber && normalize(part) !== normalize(parts[index - 1])));
  return filtered.length > 1 ? `${filtered[0]}\n${filtered.slice(1).join(', ')}` : filtered[0];
}

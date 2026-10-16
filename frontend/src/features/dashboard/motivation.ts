// Calendar-date selection: stable across rerenders/restarts, no timer, storage or network.
export const motivations = [
  'Every mile has a purpose.',
  'Work smarter. Keep more.',
  'Small trips add up.',
  'Your time has value.',
  'Know your numbers. Own your day.',
  'Progress happens one trip at a time.',
] as const;
export function dailyMotivation(date = new Date()) {
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return motivations[((day % motivations.length) + motivations.length) % motivations.length];
}

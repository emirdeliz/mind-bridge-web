export type ActorChipVariant = 'agent' | 'human' | 'system';

export const actorChipVariant = (actor: string): ActorChipVariant => {
  if (actor.toLowerCase().includes('agent')) return 'agent';
  if (actor.toLowerCase().includes('system')) return 'system';
  return 'human';
};

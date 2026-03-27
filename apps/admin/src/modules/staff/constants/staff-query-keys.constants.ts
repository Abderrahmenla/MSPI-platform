export const staffQueryKeys = {
  all: ['staff'] as const,
  lists: () => [...staffQueryKeys.all, 'list'] as const,
};

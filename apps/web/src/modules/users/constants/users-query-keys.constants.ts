export const usersKeys = {
  all: ['users'] as const,
  profile: () => [...usersKeys.all, 'profile'] as const,
};

export const roomTypeKeys = {
  all: ['room-types'] as const,
  lists: () => [...roomTypeKeys.all, 'list'] as const,
  list: (page = 1, size = 100) =>
    [...roomTypeKeys.lists(), { page, size }] as const,
}

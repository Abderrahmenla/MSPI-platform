// Re-export from the canonical shadcn utils location.
// Project code imports from @/modules/core/lib/cn; shadcn components use @/lib/utils.
// Both resolve to the same implementation.
export { cn } from '@/lib/utils';

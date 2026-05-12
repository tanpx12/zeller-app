// shadcn's class-composition helper. Kept minimal until shadcn is initialized,
// at which point `pnpm dlx shadcn@latest init` will overwrite this with the
// canonical version (clsx + tailwind-merge).
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

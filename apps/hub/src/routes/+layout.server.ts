import { buildClerkProps } from 'svelte-clerk/server';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }: { locals: App.Locals }) => {
  return {
    ...buildClerkProps(locals.auth()),
  };
};

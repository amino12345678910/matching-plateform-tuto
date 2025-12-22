import {inferAdditionalFields} from 'better-auth/client/plugins';
import {createAuthClient} from 'better-auth/react';
import type {auth} from './auth';
export const authClient = createAuthClient({
  /** the base url of the server (optional if you're using the same domain) */
  // baseURL: "http://localhost:3000",

  plugins: [inferAdditionalFields<typeof auth>()],
});

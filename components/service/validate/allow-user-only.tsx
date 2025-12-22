'use server';

import {getUserInfo} from '@/hooks/get-user-info';
async function allowClientOnly(): Promise<{
  disable: boolean;
  role?: string;
  clientId?: string;
  name?: string;
}> {
  const {role, userId: clientId, name} = await getUserInfo();

  let disable = true;

  if (!role || !name) console.error(`Cannot access user`);

  if (role == 'USER' && clientId) disable = false;

  return {disable, role, clientId, name};
}

export {allowClientOnly};

'use client';
import React from 'react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../ui/select';
import {useRouter} from 'next/navigation';
import {authClient} from '@/lib/auth-client';
import {Card, CardContent, CardFooter, CardTitle} from '../ui/card';
import {Button} from '../ui/button';
import {IconLoader2} from '@tabler/icons-react';
// import {toast} from 'sonner';

function SelectRoleComponent() {
  const [role, setRole] = React.useState<'USER' | 'SELLER'>('USER');
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const submit = async () => {
    try {
      setLoading(true);
      await authClient.updateUser({role, hasPassword: false});
      router.push(role === 'SELLER' ? '/dashboard' : '/explore');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardContent className="flex flex-col gap-y-2 w-full max-w-2xl">
        <CardTitle className="text-foreground font-semibold">
          What is your vision after logging in?
        </CardTitle>
        <label className="sr-only" htmlFor="role">
          What is your vision after logging in?
        </label>
        <Select onValueChange={value => setRole(value as 'USER' | 'SELLER')}>
          <SelectTrigger name="role" id="role" className="w-full mt-1">
            <SelectValue placeholder="What is your purpose here" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USER">Find freelancer (USER)</SelectItem>
            <SelectItem value="SELLER">Become freelancer (SELLER)</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
      <CardFooter>
        <Button disabled={loading} onClick={submit} className="w-full flex flex-row gap-x-2.5">
          Submit {loading && <IconLoader2 className="animate-spin" />}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default SelectRoleComponent;

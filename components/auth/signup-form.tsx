'use client';
import {useState} from 'react';
import {cn} from '@/lib/utils';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {authClient} from '@/lib/auth-client';
import {cloudSignUp} from '@/hooks/auth/cloud-auth';
import {Alert, AlertDescription, AlertTitle} from '../ui/alert';
import {Terminal} from 'lucide-react';

import {IconLoader} from '@tabler/icons-react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../ui/select';
import {toast} from 'sonner';

export function SignupForm({className, ...props}: React.ComponentProps<'div'>) {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'SELLER'>('USER');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    window.location.href = `/api/auth/google?role=${encodeURIComponent(role)}`;
  };

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await cloudSignUp({
        name: fullname,
        email,
        password,
        role,
      });

      if (res.success) {
        toast.success('Compte créé avec succès ! (+50 Points = 50 DT offerts)');
        window.location.href =
          res.redirectTo || (role === 'SELLER' ? '/dashboard/freelancer' : '/dashboard/client');
        return;
      } else {
        setError(res.error || 'Impossible de créer le compte.');
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Join 9arrini as a Student or Tutor</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border border-red-500" variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Registration Issue</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={e => handleSubmit(e)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  onChange={e => setFullname(e.target.value)}
                  value={fullname}
                  id="name"
                  type="text"
                  placeholder="Alex Rivera"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  onChange={e => setEmail(e.target.value)}
                  value={email}
                  id="email"
                  type="email"
                  placeholder="me@example.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  onChange={e => setPassword(e.target.value)}
                  value={password}
                  id="password"
                  type="password"
                  required
                />
              </div>
              <Label htmlFor="role">How would you like to use 9arrini?</Label>
              <Select
                defaultValue="USER"
                onValueChange={value => setRole(value as 'USER' | 'SELLER')}
              >
                <SelectTrigger name="role" id="role" className="w-full">
                  <SelectValue placeholder="Choose your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Find a Tutor & Learn (Student)</SelectItem>
                  <SelectItem value="SELLER">Become a Tutor & Teach (Educator)</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex flex-col gap-3">
                <Button disabled={loading} type="submit" className="w-full">
                  {loading ? <IconLoader className="animate-spin" stroke={2} /> : 'Sign Up'}
                </Button>
                <Button type="button" onClick={signUp} variant="outline" className="w-full">
                  Sign Up with Google
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <a href="/auth/login" className="underline underline-offset-4">
                Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

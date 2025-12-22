'use client';
import {useState} from 'react';
import {cn} from '@/lib/utils';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';

import {useRouter} from 'next/navigation';

import {authClient} from '@/lib/auth-client';
import {Alert, AlertDescription, AlertTitle} from '../ui/alert';
import {Terminal} from 'lucide-react';

import {IconLoader} from '@tabler/icons-react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../ui/select';
import {toast} from 'sonner';

export function SignupForm({className, ...props}: React.ComponentProps<'div'>) {
  const router = useRouter();

  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'SELLER'>('USER');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // const signIn = async () => {
  //   // const {data} = await authClient.signUp.email;
  // };

  const signUp = async () => {
    const {data: GoogleData, error: GoogleError} = await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/auth/select-role',
    });
    console.log('Sign up with google data', GoogleData);
    console.error('Sign up with google error', GoogleError);
  };

  async function handleSubmit(e: any) {
    e.preventDefault();

    try {
      const {data: _, error: signupError} = await authClient.signUp.email(
        {email, password, name: fullname, role: role, hasPassword: true, imageSource: 'NULL'},
        {
          onRequest: ctx => {
            setLoading(true);
          },
          onSuccess: ctx => {
            // redirect to the dashboard
            //alert("Logged in successfully");
            if (role == 'USER') router.push('/dashboard/client');
            if (role == 'SELLER') router.push('/dashboard/freelancer');
            else if (!role) {
              toast.error('There are some issues regardless to your role please login again');
            }
          },
          onError: ctx => {
            // display the error message
            setError(ctx.error.message);
            setLoading(false);
          },
        }
      );
      if (signupError) {
        throw signupError;
      }
      router.push('/dashboard');
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
          <CardDescription>Get started with your new account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border border-red-500" variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Some Issues</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={e => handleSubmit(e)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Full Name</Label>
                <Input
                  onChange={e => setFullname(e.target.value)}
                  value={fullname}
                  id="name"
                  type="text"
                  placeholder="Achour Meguenni"
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
              <Label htmlFor="role">What is your vision after logging in?</Label>
              <Select onValueChange={value => setRole(value as 'USER' | 'SELLER')}>
                <SelectTrigger name="role" id="role" className="w-full">
                  <SelectValue placeholder="What is your purpose here" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Find freelancer</SelectItem>
                  <SelectItem value="SELLER">Become freelancer</SelectItem>
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
              <a href="/login" className="underline underline-offset-4">
                Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

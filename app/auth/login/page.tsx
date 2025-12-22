import {LoginForm} from '@/components/auth/login-form';
import {Navbar} from '@/components/essentials/Navbar';

export default function Page() {
  return (
    <div className="container min-h-svh md:max-w-7xl mx-auto py-12 pt-8">
      <Navbar />

      <main className="flex flex-col  w-full items-center justify-center mt-16">
        <LoginForm className="w-full max-w-sm" />
      </main>
    </div>
  );
}

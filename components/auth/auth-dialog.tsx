'use client';

import {useState} from 'react';
import Image from 'next/image';
import {toast} from 'sonner';
import {authClient} from '@/lib/auth-client';
import {cloudSignIn, cloudSignUp} from '@/hooks/auth/cloud-auth';
import {
  IconArrowLeft,
  IconMail,
  IconCheck,
  IconLoader,
  IconBrandGoogle,
  IconEye,
  IconEyeOff,
} from '@tabler/icons-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Card, CardContent} from '@/components/ui/card';

const girlImage = '/assets/standard.0638957.png';
import freelancerVector from '@/public/assets/freelancerVector.svg';
import userVector from '@/public/assets/userVector.svg';
import {RoleDialog} from '@/components/auth/role-dialog';
import {clearPendingRole, setPendingRole} from '@/lib/sessions';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RegForm {
  email: string;
  password: string;
  username: string;
  role: 'USER' | 'SELLER' | '';
}

interface LoginForm {
  email: string;
  password: string;
}

export default function AuthModal({isOpen, onClose}: AuthModalProps) {
  const [step, setStep] = useState<'signup' | 'login'>('signup');
  const [regStep, setRegStep] = useState<
    'null' | 'create' | 'createName' | 'createFinal' | 'email'
  >('null');

  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [pendingAuthType, setPendingAuthType] = useState<'google' | 'email' | null>(null);

  const [regForm, setRegForm] = useState<RegForm>({
    email: '',
    password: '',
    username: '',
    role: '',
  });

  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isLogDisabled = !loginForm.email || !loginForm.password;
  const isRegDisabled = !regForm.email || !regForm.password;

  const validations = {
    length: regForm.password.length >= 8,
    uppercase: /[A-Z]/.test(regForm.password),
    lowercase: /[a-z]/.test(regForm.password),
    number: /\d/.test(regForm.password),
  };

  const isPasswordValid = Object.values(validations).every(Boolean);

  const handleRoleSelect = async (role: 'USER' | 'SELLER') => {
    setPendingRole(role);

    if (pendingAuthType === 'google') {
      handleGoogleSignIn(false);
    } else if (pendingAuthType === 'email') {
      setRegForm(prev => ({...prev, role}));
      setShowRoleDialog(false);
      setPendingAuthType(null);
      setRegStep('create');
    }
  };

  const handleGoogleAuth = () => {
    const role = regForm.role === 'SELLER' ? 'SELLER' : 'USER';
    onClose();
    window.location.href = `/api/auth/google?role=${encodeURIComponent(role)}`;
  };

  const handleEmailSignupStart = () => {
    setRegStep('create');
  };

  // Handle email registration (works both locally and on Netlify)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const selectedRole = regForm.role || 'USER';

    try {
      const res = await cloudSignUp({
        name: regForm.username,
        email: regForm.email,
        password: regForm.password,
        role: selectedRole,
      });

      if (res.success) {
        toast.success('Compte créé avec succès ! (+50 Points = 50 DT offerts)');
        const targetUrl =
          res.redirectTo ||
          (selectedRole === 'SELLER' ? '/dashboard/freelancer' : '/dashboard/client');
        setRegStep('null');
        setRegForm({
          email: '',
          password: '',
          username: '',
          role: '',
        });
        setLoading(false);
        onClose();
        window.location.href = targetUrl;
        return;
      } else {
        toast.error(res.error || 'Registration failed');
        setLoading(false);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Registration failed');
      setLoading(false);
    }
  };

  // Handle email login (works both locally and on Netlify)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await cloudSignIn({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (res.success) {
        toast.success('Connexion réussie ! Mar7bé bik fi 9arrini');
        onClose();
        setLoginForm({email: '', password: ''});
        setLoading(false);
        window.location.href = res.redirectTo || '/dashboard/client';
        return;
      } else {
        toast.error(res.error || 'Login failed');
        setLoading(false);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setRegForm({
        email: '',
        password: '',
        username: '',
        role: '',
      });
      setLoginForm({
        email: '',
        password: '',
      });
      setStep('signup');
      setRegStep('null');
      setShowRoleDialog(false);
      setPendingAuthType(null);
      clearPendingRole();
    }
    onClose();
  };

  const handleGoogleSignIn = async (_isSignIn: boolean) => {
    setShowRoleDialog(false);
    setPendingAuthType(null);
    const role = regForm.role === 'SELLER' ? 'SELLER' : 'USER';
    onClose();
    window.location.href = `/api/auth/google?role=${encodeURIComponent(role)}`;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-4xl p-0 h-[85vh] overflow-hidden">
          <div className="grid lg:grid-cols-2 h-full">
            <div className="hidden lg:block relative">
              <Image
                src={girlImage}
                alt="Learning starts here"
                className="object-cover"
                height={400}
                width={500}
                priority
              />
              <div
                className="absolute inset-0 flex items-center p-10 text-white"
                style={{background: 'linear-gradient(to right, rgba(0,0,0,0.7), transparent)'}}
              >
                <div>
                  <h2 className="text-3xl font-bold mb-4">Learning starts here</h2>
                  <ul className="space-y-2 text-[18px]">
                    <li>✓ Over 700+ academic & skill subjects</li>
                    <li>✓ Personalized 1-on-1 tutoring sessions</li>
                    <li>✓ Connect with top educators & mentors worldwide</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto">
              {regStep !== 'null' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRegStep('null')}
                  className="absolute top-4 left-4"
                >
                  <IconArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              {regStep === 'null' && (
                <div className="p-8 md:p-10 h-full flex flex-col justify-center ">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl">
                      {step === 'signup' ? 'Create a new account' : 'Sign in to your account'}
                    </DialogTitle>
                    <DialogDescription>
                      {step === 'signup' ? (
                        <>
                          Already have an account?{' '}
                          <Button
                            variant="link"
                            className="p-0 h-auto"
                            onClick={() => setStep('login')}
                          >
                            Sign in
                          </Button>
                        </>
                      ) : (
                        <>
                          Don&apos;t have an account?{' '}
                          <Button
                            variant="link"
                            className="p-0 h-auto"
                            onClick={() => setStep('signup')}
                          >
                            Join Here
                          </Button>
                        </>
                      )}
                    </DialogDescription>
                  </DialogHeader>

                  <Card className="border-none shadow-none">
                    <CardContent className="p-0 space-y-4">
                      <Button
                        variant="outline"
                        className="w-full h-12"
                        onClick={() => {
                          if (step === 'login') {
                            handleGoogleSignIn(true);
                          } else {
                            handleGoogleAuth();
                          }
                        }}
                      >
                        <IconBrandGoogle className="h-5 w-5 mr-2" />
                        Continue with Google
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full h-12"
                        onClick={() => {
                          if (step === 'signup') {
                            handleEmailSignupStart();
                          } else {
                            setRegStep('email');
                          }
                        }}
                      >
                        <IconMail className="h-5 w-5 mr-2" />
                        Continue with Email
                      </Button>
                    </CardContent>
                  </Card>

                  <p className="text-xs text-muted-foreground mt-8 text-center">
                    By joining, you agree to the 9arrini Terms of Service and to occasionally receive
                    learning updates from us. Please read our Privacy Policy to learn how we use your
                    personal data.
                  </p>
                </div>
              )}
              {regStep === 'email' && (
                <div className="p-8 md:p-10">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl">Continue with your email</DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          value={loginForm.email}
                          onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login-password">Password</Label>
                          <Button variant="link" className="p-0 h-auto text-xs" type="button">
                            Forgot password?
                          </Button>
                        </div>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={loginForm.password}
                            onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <IconEyeOff className="h-4 w-4" />
                            ) : (
                              <IconEye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11"
                      disabled={isLogDisabled || loading}
                    >
                      {loading ? <IconLoader className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Login
                    </Button>
                  </form>
                </div>
              )}
              {regStep === 'create' && (
                <div className="p-8 md:p-10">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl">Continue with your email</DialogTitle>
                  </DialogHeader>

                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      setRegStep('createName');
                    }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-email">Email</Label>
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="Enter your email"
                          value={regForm.email}
                          onChange={e => setRegForm({...regForm, email: e.target.value})}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="reg-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a strong password"
                            value={regForm.password}
                            onChange={e => setRegForm({...regForm, password: e.target.value})}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <IconEyeOff className="h-4 w-4" />
                            ) : (
                              <IconEye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Password must contain:</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div
                          className={`flex items-center gap-2 text-xs ${
                            validations.length ? 'text-green-600' : 'text-muted-foreground'
                          }`}
                        >
                          <IconCheck className="h-3 w-3" />
                          At least 8 characters
                        </div>
                        <div
                          className={`flex items-center gap-2 text-xs ${
                            validations.uppercase ? 'text-green-600' : 'text-muted-foreground'
                          }`}
                        >
                          <IconCheck className="h-3 w-3" />1 uppercase letter
                        </div>
                        <div
                          className={`flex items-center gap-2 text-xs ${
                            validations.lowercase ? 'text-green-600' : 'text-muted-foreground'
                          }`}
                        >
                          <IconCheck className="h-3 w-3" />1 lowercase letter
                        </div>
                        <div
                          className={`flex items-center gap-2 text-xs ${
                            validations.number ? 'text-green-600' : 'text-muted-foreground'
                          }`}
                        >
                          <IconCheck className="h-3 w-3" />1 number
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11"
                      disabled={isRegDisabled || !isPasswordValid}
                    >
                      Continue
                    </Button>
                  </form>
                </div>
              )}
              {regStep === 'createName' && (
                <div className="p-8 md:p-10">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl">Get your profile started</DialogTitle>
                    <DialogDescription>
                      We&apos;ll help you set up your learning or teaching profile on 9arrini. You
                      can always update your profile later.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">Choose a display name / username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your name or username"
                        value={regForm.username}
                        onChange={e => setRegForm({...regForm, username: e.target.value})}
                        required
                      />
                    </div>

                    <Button
                      onClick={() => setRegStep('createFinal')}
                      className="w-full h-11"
                      disabled={regForm.username.length < 3}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}
              {regStep === 'createFinal' && (
                <div className="p-8 md:p-10">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl pb-4 border-b">
                      How would you like to use 9arrini?
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleRegister} className="space-y-6">
                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={() => setRegForm(prev => ({...prev, role: 'USER'}))}
                        className={`flex gap-4 items-start p-4 rounded-lg w-full text-left border-2 transition-all ${
                          regForm.role === 'USER'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <Image
                            src={userVector}
                            alt="Student"
                            width={56}
                            height={56}
                            className="pr-3 border-r"
                          />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">STUDENT / LEARNER</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            I want to find expert tutors, book lessons, and learn new skills.
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegForm(prev => ({...prev, role: 'SELLER'}))}
                        className={`flex gap-4 items-start p-4 rounded-lg w-full text-left border-2 transition-all ${
                          regForm.role === 'SELLER'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <Image
                            src={freelancerVector}
                            alt="Tutor"
                            width={56}
                            height={56}
                            className="pr-3 border-r"
                          />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">TUTOR / EDUCATOR</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            I want to teach students, offer tutoring sessions, and earn money.
                          </p>
                        </div>
                      </button>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11"
                      disabled={loading || !regForm.role}
                    >
                      {loading ? <IconLoader className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Create Account
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <RoleDialog
        isOpen={showRoleDialog}
        onClose={() => {
          setShowRoleDialog(false);
          setPendingAuthType(null);
        }}
        onRoleSelect={handleRoleSelect}
        authType={pendingAuthType || 'google'}
      />
    </>
  );
}

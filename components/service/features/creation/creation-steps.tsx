'use client';
import {useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../../../ui/card';
import {cn} from '@/lib/utils';
import {OverviewStep} from './steps/overview-step';
import {MediaStep} from './steps/media-steps';
import {useRouter} from 'next/navigation';
import {useForm, type FieldErrors, type UseFormRegisterReturn} from 'react-hook-form';
import {generateSlug} from '@/hooks/use-slug';
import {getUserInfo} from '@/hooks/get-user-info';
import {storeImageToCloudinary} from '@/hooks/service/store-image';
import {storeService} from '@/hooks/service/store-service';
import {toast} from 'sonner';
import PricingStep from './steps/pricing-step';
import {Button} from '@/components/ui/button';

import {Alert, AlertDescription} from '@/components/ui/alert';
import {Loader2, CheckCircle2, AlertCircle} from 'lucide-react';
import {Progress} from '@/components/ui/progress';
import {FAQStep} from './steps/faq-step';
import type {FAQ} from '@/types/service';

type Step = 'overview' | 'media' | 'pricing' | 'faq';

type PackageForm = {
  price: number;
  delivery: number;
  revisions: number;
  description: string;
};

type ServiceForm = {
  title: string;
  description: string;
  tags: string;
  images: File[];
  basicPackage: PackageForm;
  standardPackage: PackageForm;
  premiumPackage: PackageForm;
  faqs: FAQ[];
};

function CreationSteps() {
  const [step, setStep] = useState<Step>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentTab, setCurrentTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: {errors, isValid: isFromValid},
    setValue,
    watch,
    trigger,
  } = useForm<ServiceForm>({
    defaultValues: {
      title: '',
      description: '',
      tags: '',
      images: [],
      basicPackage: {price: 50, delivery: 3, revisions: 2, description: ''},
      standardPackage: {price: 100, delivery: 5, revisions: 5, description: ''},
      premiumPackage: {price: 200, delivery: 7, revisions: 10, description: ''},
      faqs: [],
    },
    mode: 'onChange',
  });

  const registerFiles = (files: File[]) => {
    setValue('images', files, {shouldDirty: true});
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof ServiceForm)[] = [];

    switch (step) {
      case 'overview':
        fieldsToValidate = ['title', 'description'];
        break;
      case 'media':
        fieldsToValidate = ['images'];
        if (!selectedCategory) {
          setFormErrors(['Please select a category']);
          return false;
        }
        break;
      case 'pricing':
        fieldsToValidate = ['basicPackage', 'standardPackage', 'premiumPackage'];
        break;
      case 'faq':
        fieldsToValidate = ['faqs'];
        break;
    }

    const result = await trigger(fieldsToValidate);
    if (!result) {
      setFormErrors(['Please fill in all required fields correctly']);
    } else {
      setFormErrors([]);
    }
    return result;
  };

  const handleNextStep = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    const steps: Step[] = ['overview', 'media', 'pricing', 'faq'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  };

  const handlePreviousStep = () => {
    const steps: Step[] = ['overview', 'media', 'pricing', 'faq'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
      setFormErrors([]);
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  };

  const onSubmit = async (data: ServiceForm) => {
    const isValid = await validateCurrentStep();
    if (!isValid || !isFromValid) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 300);

    if (data.title.trim().length === 0) {
      toast.error('Title cannot be empty', {
        description: 'Please provide a valid title for your service.',
      });
      setLoading(false);
      clearInterval(progressInterval);
      return;
    }

    try {
      const slug = generateSlug(data.title, {lowercase: true});
      const {userId: sellerId} = await getUserInfo();

      const finalData = {
        id: 0,
        slug: slug,
        title: data.title.trim(),
        description: data.description.trim(),
        categorySlug: selectedCategory || null,
        status: 'PAUSED',
        sellerId: sellerId,

        tags: data.tags
          .split(',')
          .map(t => t.trim().toLowerCase())
          .filter(Boolean),

        faqs: data.faqs,

        packages: [
          {name: 'BASIC', ...data.basicPackage},
          {name: 'STANDARD', ...data.standardPackage},
          {name: 'PREMIUM', ...data.premiumPackage},
        ].map(p => ({
          ...p,
          price: Number(p.price),
          delivery: Number(p.delivery),
          revisions: Number(p.revisions),
        })),
      };

      const {
        cloudinaryImageUrls,
        error: cloudinaryError,
        message: _,
      } = await storeImageToCloudinary(data.images);

      if (cloudinaryError) {
        toast.error('Image upload failed', {
          description: 'Failed to upload images. Please try again.',
        });
        return;
      }

      const {
        success: serviceSuccess,
        error: serviceError,
        message: __,
        serviceSlug,
      } = await storeService(finalData, cloudinaryImageUrls);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (serviceError) {
        toast.error('Service creation failed', {
          description: serviceError || 'Please try again.',
        });
      } else if (serviceSuccess) {
        toast.success('Service created successfully!', {
          description: 'Your service is now ready for review.',
        });

        setTimeout(() => {
          router.push(serviceSlug ? `/service/${serviceSlug}` : '/explore');
        }, 1500);
      }
    } catch (err: unknown) {
      clearInterval(progressInterval);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error('Failed to create service', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const registerPackageField = (
    pkg: keyof ServiceForm,
    field: keyof PackageForm
  ): UseFormRegisterReturn => {
    return register(`${pkg}.${field}` as keyof ServiceForm, {
      setValueAs: field === 'description' ? v => v : v => (v === '' ? 0 : Number(v)),
    });
  };
  const handleFAQsChange = (updatedFAQs: FAQ[]) => {
    setValue('faqs', updatedFAQs, {shouldDirty: true});
  };

  const currentFAQs = watch('faqs')?.length > 0 ? watch('faqs') : [];

  const isInputInvalid = (path: string): boolean => {
    const parts = path.split('.');
    let error: FieldErrors<ServiceForm> | string | undefined = errors as any;

    for (const part of parts) {
      if (error && typeof error !== 'string') {
        error = (error as Record<string, any>)[part];
      } else {
        error = undefined;
        break;
      }
    }
    return !!error;
  };

  const getPackageError = (
    pkg: keyof ServiceForm,
    field: keyof PackageForm
  ): string | undefined => {
    const error = errors[pkg] ? (errors[pkg] as any)[field] : undefined;
    return error?.message;
  };

  const getStepProgress = () => {
    const steps = ['overview', 'media', 'pricing', 'faq'];
    const currentIndex = steps.indexOf(step);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  return (
    <div className="container max-w-6xl mx-auto px-2 py-8">
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {['overview', 'media', 'pricing', 'faq'].indexOf(step) + 1} of 4</span>
            <span>{Math.round(getStepProgress())}% Complete</span>
          </div>
          <Progress value={getStepProgress()} className="h-2" />
        </div>

        {/* Form Errors Alert */}
        {formErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {formErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1 lg:sticky top-6 self-start">
            <CardHeader>
              <CardTitle>Create Service</CardTitle>
              <CardDescription>Complete all steps to publish</CardDescription>
            </CardHeader>

            <CardContent className="space-y-2">
              {[
                {id: 'overview', label: 'Overview', description: 'Basic information'},
                {id: 'media', label: 'Gallery & Category', description: 'Visuals & classification'},
                {id: 'pricing', label: 'Pricing', description: 'Packages & rates'},
                {id: 'faq', label: 'Faqs', description: 'Common questions'},
              ].map(s => {
                const isCurrent = step === s.id;
                const isCompleted =
                  ['overview', 'media', 'pricing', 'faq'].indexOf(s.id) <
                  ['overview', 'media', 'pricing', 'faq'].indexOf(step);

                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStep(s.id as Step)}
                    className={cn(
                      'w-full text-left rounded-lg p-4 transition-all duration-200 border',
                      isCurrent
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50',
                      isCompleted && !isCurrent && 'border-green-200 bg-green-50/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full border',
                          isCurrent
                            ? 'border-primary bg-primary text-primary-foreground'
                            : isCompleted
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-border bg-background'
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <span className="text-sm font-medium">
                            {['overview', 'media', 'pricing', 'faq'].indexOf(s.id) + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={cn('font-medium', isCurrent && 'text-primary')}>
                          {s.label}
                        </div>
                        <div className="text-xs text-muted-foreground">{s.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {step === 'overview' && (
              <OverviewStep
                updateDescriptionValue={(desc: string) => setValue('description', desc)}
                register={register}
                errors={errors}
              />
            )}
            {step === 'media' && (
              <MediaStep
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                register={register}
                registerFiles={registerFiles}
                errors={errors}
              />
            )}
            {step === 'pricing' && (
              <PricingStep
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                registerPackageField={registerPackageField}
                isInputInvalid={isInputInvalid}
                getPackageError={getPackageError}
              />
            )}

            {step === 'faq' && (
              <FAQStep faqs={currentFAQs} onFAQsChange={handleFAQsChange} errors={errors} />
            )}

            {/* Upload Progress */}
            {loading && uploadProgress > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading your service...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
                disabled={step === 'overview' || loading}
              >
                Back
              </Button>

              {step !== 'faq' ? (
                <Button type="button" onClick={handleNextStep} disabled={loading}>
                  Continue
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Service'
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreationSteps;

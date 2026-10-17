'use client';

import {useState} from 'react';
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Button} from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectValue,
} from '@/components/ui/select';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Upload, ArrowLeft} from 'lucide-react';
import MultipleImageUpload from './multiple-image-handler';
import {useForm, UseFormRegisterReturn, FieldErrors} from 'react-hook-form';
import {generateSlug} from '@/hooks/use-slug';
import AddServiceLoadingState from '../states/add-service-state';
import {storeImageToCloudinary} from '../../hooks/service/store-image';
import {storeService} from '../../hooks/service/store-service';
import {getUserInfo} from '@/hooks/shared/get-user-info';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';
import {useRouter} from 'next/navigation';

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
};

export default function Create() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentTab, setCurrentTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: {errors},
    setValue,
  } = useForm<ServiceForm>({
    defaultValues: {
      title: '',
      description: '',
      tags: '',
      images: [],
      basicPackage: {price: 50, delivery: 3, revisions: 2, description: ''},
      standardPackage: {price: 100, delivery: 5, revisions: 5, description: ''},
      premiumPackage: {price: 200, delivery: 7, revisions: 10, description: ''},
    },
  });

  const registerFiles = (files: File[]) => {
    setValue('images', files, {shouldDirty: true});
  };

  const onSubmit = async (data: ServiceForm) => {
    setLoading(true);
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

      console.log('✅ FINAL PAYLOAD', finalData);
      console.log('Image', data.images);

      const {
        cloudinaryImageUrls,
        error: cloudinaryError,
        message: _,
      } = await storeImageToCloudinary(data.images);
      if (cloudinaryError) console.error('Cloudinary errors uwa uwaywa :', cloudinaryError);
      console.log('cloudinary urls', cloudinaryImageUrls);
      const {
        success: serviceSuccess,
        error: serviceError,
        message: serviceMessage,
        serviceSlug,
      } = await storeService(finalData, cloudinaryImageUrls);

      if (serviceError) console.error(serviceError);
      else if (serviceSuccess) {
        toast.success(serviceMessage);
        router.push(serviceSlug ? `/service/${serviceSlug}` : '/explore');
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error('Failed to submit form', {
        description: errorMessage,
      });
      alert(`Failed to submit form: ${errorMessage}`);
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

  return (
    <>
      {loading && <AddServiceLoadingState />}
      <form onSubmit={handleSubmit(onSubmit)} className="container mx-auto p-6 max-w-6xl">
        {/* HEADER AND ACTIONS */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 border-b pb-4">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" type="button">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Add New Service</h1>
              <p className="text-sm text-muted-foreground">
                Create a new service listing for your shop.
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" type="button">
              View Shop
            </Button>
            <Button variant="outline" type="button">
              Save Draft
            </Button>
            {/* Use type="submit" for the primary action button */}
            <Button type="submit">Publish Service</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: PRIMARY DETAILS (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* SERVICE DETAILS */}
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
                <CardDescription>
                  Start with a compelling title and a detailed description of your offering.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="service-title">Service Title</Label>
                  <Input
                    id="service-title"
                    placeholder="e.g. I will design a modern minimalist logo"
                    {...register('title', {
                      required: 'Service Title is required.',
                      minLength: {value: 10, message: 'Title must be at least 10 characters.'},
                      maxLength: {value: 70, message: 'Title must not exceed 70 characters.'},
                    })}
                    className={cn(errors.title ? 'border-red-500' : '', 'italic')}
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                  <p className="text-sm text-muted-foreground">
                    A clear, concise title (max 70 characters) that describes exactly what you
                    offer.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-description">Service Description</Label>
                  <Textarea
                    id="service-description"
                    rows={8}
                    placeholder="Write a detailed service description here..."
                    {...register('description', {
                      required: 'Service Description is required.',
                      minLength: {
                        value: 50,
                        message: 'Description must be at least 50 characters.',
                      },
                    })}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Format your description for readability (e.g., use bullet points, headings).
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* PACKAGES & PRICING */}
            <Card>
              <CardHeader>
                <CardTitle>Packages & Pricing</CardTitle>
                <CardDescription>
                  Define your service tiers (Basic, Standard, Premium) with specific pricing and
                  scope.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="standard">Standard</TabsTrigger>
                    <TabsTrigger value="premium">Premium</TabsTrigger>
                  </TabsList>

                  {/* BASIC PACKAGE */}
                  <TabsContent value="basic" className="pt-4 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="basic-price">Soum bil Dinar (DT)</Label>
                        <Input
                          id="basic-price"
                          type="number"
                          placeholder="30"
                          {...registerPackageField('basicPackage', 'price')}
                          className={isInputInvalid('basicPackage.price') ? 'border-red-500' : ''}
                        />
                        {getPackageError('basicPackage', 'price') && (
                          <p className="text-xs text-red-500">
                            {getPackageError('basicPackage', 'price')}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="basic-delivery">Delivery (Days)</Label>
                        <Input
                          id="basic-delivery"
                          type="number"
                          placeholder="3"
                          {...registerPackageField('basicPackage', 'delivery')}
                          className={
                            isInputInvalid('basicPackage.delivery') ? 'border-red-500' : ''
                          }
                        />
                        {getPackageError('basicPackage', 'delivery') && (
                          <p className="text-xs text-red-500">
                            {getPackageError('basicPackage', 'delivery')}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="basic-revisions">Revisions</Label>
                        <Input
                          id="basic-revisions"
                          type="number"
                          placeholder="2"
                          {...registerPackageField('basicPackage', 'revisions')}
                          className={
                            isInputInvalid('basicPackage.revisions') ? 'border-red-500' : ''
                          }
                        />
                        {getPackageError('basicPackage', 'revisions') && (
                          <p className="text-xs text-red-500">
                            {getPackageError('basicPackage', 'revisions')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="basic-description">Package Description</Label>
                      <Textarea
                        id="basic-description"
                        placeholder="e.g. 1 Concept, High Resolution JPG, 2 Revisions"
                        rows={3}
                        {...registerPackageField('basicPackage', 'description')}
                        className={
                          isInputInvalid('basicPackage.description') ? 'border-red-500' : ''
                        }
                      />
                      {getPackageError('basicPackage', 'description') && (
                        <p className="text-xs text-red-500">
                          {getPackageError('basicPackage', 'description')}
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  {/* STANDARD PACKAGE */}
                  <TabsContent value="standard" className="pt-4 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="standard-price">Soum bil Dinar (DT)</Label>
                        <Input
                          id="standard-price"
                          type="number"
                          placeholder="80"
                          {...registerPackageField('standardPackage', 'price')}
                          className={
                            isInputInvalid('standardPackage.price') ? 'border-red-500' : ''
                          }
                        />
                        {getPackageError('standardPackage', 'price') && (
                          <p className="text-xs text-red-500">
                            {getPackageError('standardPackage', 'price')}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="standard-delivery">Delivery (Days)</Label>
                        <Input
                          id="standard-delivery"
                          type="number"
                          placeholder="5"
                          {...registerPackageField('standardPackage', 'delivery')}
                          className={
                            isInputInvalid('standardPackage.delivery') ? 'border-red-500' : ''
                          }
                        />
                        {getPackageError('standardPackage', 'delivery') && (
                          <p className="text-xs text-red-500">
                            {getPackageError('standardPackage', 'delivery')}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="standard-revisions">Revisions</Label>
                        <Input
                          id="standard-revisions"
                          type="number"
                          placeholder="5"
                          {...registerPackageField('standardPackage', 'revisions')}
                          className={
                            isInputInvalid('standardPackage.revisions') ? 'border-red-500' : ''
                          }
                        />
                        {getPackageError('standardPackage', 'revisions') && (
                          <p className="text-xs text-red-500">
                            {getPackageError('standardPackage', 'revisions')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="standard-description">Package Description</Label>
                      <Textarea
                        id="standard-description"
                        placeholder="e.g. 2 Concepts, All Source Files, Unlimited Revisions"
                        rows={3}
                        {...registerPackageField('standardPackage', 'description')}
                        className={
                          isInputInvalid('standardPackage.description') ? 'border-red-500' : ''
                        }
                      />
                      {getPackageError('standardPackage', 'description') && (
                        <p className="text-xs text-red-500">
                          {getPackageError('standardPackage', 'description')}
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  {/* PREMIUM PACKAGE */}
                  <TabsContent value="premium" className="pt-4 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="premium-price">Soum bil Dinar (DT)</Label>
                        <Input
                          id="premium-price"
                          type="number"
                          placeholder="150"
                          {...registerPackageField('premiumPackage', 'price')}
                          className={isInputInvalid('premiumPackage.price') ? 'border-red-500' : ''}
                        />
                        {getPackageError('premiumPackage', 'price') && (
                          <p className="text-xs text-red-500">
                            {getPackageError('premiumPackage', 'price')}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="premium-delivery">Delivery (Days)</Label>
                        <Input
                          id="premium-delivery"
                          type="number"
                          placeholder="7"
                          {...registerPackageField('premiumPackage', 'delivery')}
                          className={
                            isInputInvalid('premiumPackage.delivery') ? 'border-red-500' : ''
                          }
                        />
                        {getPackageError('premiumPackage', 'delivery') && (
                          <p className="text-xs text-red-500">
                            {getPackageError('premiumPackage', 'delivery')}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="premium-revisions">Revisions</Label>
                        <Input
                          id="premium-revisions"
                          type="number"
                          placeholder="10"
                          {...registerPackageField('premiumPackage', 'revisions')}
                          className={
                            isInputInvalid('premiumPackage.revisions') ? 'border-red-500' : ''
                          }
                        />
                        {getPackageError('premiumPackage', 'revisions') && (
                          <p className="text-xs text-red-500">
                            {getPackageError('premiumPackage', 'revisions')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="premium-description">Package Description</Label>
                      <Textarea
                        id="premium-description"
                        placeholder="e.g. 3 Concepts, VIP Support, Branding Guideline PDF, Priority Delivery"
                        rows={3}
                        {...registerPackageField('premiumPackage', 'description')}
                        className={
                          isInputInvalid('premiumPackage.description') ? 'border-red-500' : ''
                        }
                      />
                      {getPackageError('premiumPackage', 'description') && (
                        <p className="text-xs text-red-500">
                          {getPackageError('premiumPackage', 'description')}
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: ADDITIONAL INFO (1/3 width) */}
          <div className="space-y-6">
            {/* SERVICE IMAGES (NOTE: Image state/validation requires integration with MultipleImageUpload hook) */}
            <Card>
              <CardHeader>
                <CardTitle>Service Media</CardTitle>
                <CardDescription>
                  Upload high-quality images or videos that showcase your work (up to 3).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label
                  htmlFor="image-upload"
                  className="border border-dashed h-36 w-full rounded-lg flex flex-col items-center justify-center text-sm text-muted-foreground cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload className="h-5 w-5 mb-2 text-primary" />
                  <span className="font-medium">Click to Upload</span>
                  <span className="text-xs mt-1">PNG, JPG, up to 5MB</span>
                </Label>

                <MultipleImageUpload
                  htmlFor="image-upload"
                  allowMultipleImages
                  registerFiles={registerFiles}
                />
              </CardContent>
            </Card>

            {/* CATEGORY & TAGS */}
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
                <CardDescription>
                  Select a category and add relevant tags to make your service discoverable.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="service-category">Service Category</Label>
                  {/* Select is controlled via useState, validation happens in onSubmit */}
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger
                      id="service-category"
                      className={!selectedCategory ? 'border-yellow-500' : ''}
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Creative</SelectLabel>
                        <SelectItem value="design">Graphics & Design</SelectItem>
                        <SelectItem value="video">Video & Animation</SelectItem>
                        <SelectItem value="music">Music & Audio</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Technical</SelectLabel>
                        <SelectItem value="dev">Programming & Tech</SelectItem>
                        <SelectItem value="data">Data Science</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Business</SelectLabel>
                        <SelectItem value="writing">Writing & Translation</SelectItem>
                        <SelectItem value="marketing">Digital Marketing</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {!selectedCategory && (
                    <p className="text-xs text-yellow-500">Selection required for publishing.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-tags">Search Tags</Label>
                  <Input
                    id="service-tags"
                    placeholder="e.g. logo design, branding, minimalist"
                    {...register('tags', {
                      maxLength: {
                        value: 100,
                        message: 'Tags string is too long (max 100 characters).',
                      },
                    })}
                    className={errors.tags ? 'border-red-500' : ''}
                  />
                  {errors.tags && <p className="text-xs text-red-500">{errors.tags.message}</p>}
                  <p className="text-xs text-muted-foreground">
                    Enter keywords separated by a comma. Used for search discoverability.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* GLOBAL FOOTER ACTIONS */}
        <div className="flex justify-end space-x-2 mt-8 p-4 border-t bg-background sticky bottom-0 z-10">
          <Button variant="outline" type="button">
            Discard Changes
          </Button>
          <Button variant="outline" type="button">
            Save Draft
          </Button>
          <Button type="submit">Publish Service</Button>
        </div>
      </form>
    </>
  );
}

'use client';

import {useEffect, useRef, useState} from 'react';
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
import {useForm, UseFormRegisterReturn, FieldErrors} from 'react-hook-form';
import {generateSlug} from '@/hooks/use-slug';
import AddServiceLoadingState from '../states/add-service-state';
import {storeImageToCloudinary} from '../../hooks/service/store-image';
import {getUserInfo} from '@/hooks/shared/get-user-info';
import {toast} from 'sonner';
import type {Service} from '@/types/service';
import {editService} from '@/hooks/service/edit-service';
import Image from 'next/image';
import {cloudinaryUrl} from '@/lib/cloudinary';
import {useRouter} from 'next/navigation';
import {defaultRoute} from '@/app/(freelancer-client)/dashboard/freelancer/config';
import Link from 'next/link';

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
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'REJECTED';
  basicPackage: PackageForm;
  standardPackage: PackageForm;
  premiumPackage: PackageForm;
};

export default function EditService({service}: {service: Service}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentTab, setCurrentTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [loadingImages, setLoadingImages] = useState(true);
  type PreviewFile = {
    url: string;
    type: string | 'image' | 'video';
  };

  const router = useRouter();

  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>();

  const {title, description, tags, images: storedImagesUrl, packages, category, status} = service;

  //// edited few likes only to give the proper context;
  const {
    register,
    handleSubmit,
    formState: {errors},
    setValue,
    getValues,
  } = useForm<ServiceForm>({
    defaultValues: {
      title: title,
      description: description,
      tags: tags?.map(tag => tag.slug).join(', ') ?? '',
      images: [],
      status,
      basicPackage: {
        price: packages.find(p => p.name === 'BASIC')?.price ?? 0,
        delivery: packages.find(p => p.name === 'BASIC')?.delivery ?? 0,
        revisions: packages.find(p => p.name === 'BASIC')?.revisions ?? 0,
        description: packages.find(p => p.name === 'BASIC')?.description ?? '',
      },
      standardPackage: {
        price: packages.find(p => p.name === 'STANDARD')?.price ?? 0,
        delivery: packages.find(p => p.name === 'STANDARD')?.delivery ?? 0,
        revisions: packages.find(p => p.name === 'STANDARD')?.revisions ?? 0,
        description: packages.find(p => p.name === 'STANDARD')?.description ?? '',
      },
      premiumPackage: {
        price: packages.find(p => p.name === 'PREMIUM')?.price ?? 0,
        delivery: packages.find(p => p.name === 'PREMIUM')?.delivery ?? 0,
        revisions: packages.find(p => p.name === 'PREMIUM')?.revisions ?? 0,
        description: packages.find(p => p.name === 'PREMIUM')?.description ?? '',
      },
    },
  });

  useEffect(() => {
    setSelectedCategory(category?.slug || '');
  }, [category]);

  useEffect(() => {
    async function convertImages() {
      if (!storedImagesUrl?.length) return setLoadingImages(false);

      const convertedFile = await Promise.all(
        storedImagesUrl.map(async url => {
          const res = await fetch(cloudinaryUrl(url, 'q_30,f_auto'));
          // console.log('url ', url);
          const blob = await res.blob();
          return new File([blob], `image-${Date.now()}-thumbnail`);
        })
      );
      // console.log('converted File', convertedFile);
      setValue('images', convertedFile, {shouldDirty: true});

      setPreviewFiles(
        convertedFile.map(file => ({
          url: URL.createObjectURL(file),
          type: file.type.startsWith('images/') ? 'image' : 'video',
        }))
      );
      setLoadingImages(false);
    }
    convertImages();
  }, [storedImagesUrl]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    const current = getValues('images') || [];

    const merged = [...current, ...selected];
    setValue('images', merged, {shouldDirty: true});

    setPreviewFiles(
      merged.map(file => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'video',
      }))
    );
  };

  // Remove image
  const removeImage = (index: number) => {
    const current = getValues('images') || [];
    const updated = current.filter((_, i) => i !== index);

    setValue('images', updated, {shouldDirty: true});

    setPreviewFiles(
      updated.map(file => ({
        url: URL.createObjectURL(file),
        type: 'image',
      }))
    );
  };

  // const registerFiles = (files: File[]) => {
  //   setValue('images', files, {shouldDirty: true});
  // };

  const onSubmit = async (data: ServiceForm) => {
    // console.log(data.tags.split(',').map(t => t.trim().toLowerCase()));
    // return;
    setLoading(true);
    try {
      const {userId: sellerId} = await getUserInfo();

      const finalData = {
        id: service.id,
        slug: title === data.title ? service.slug : generateSlug(data.title),

        title: data.title.trim(),
        description: data.description.trim(),
        categorySlug: selectedCategory || null,
        status: status || 'PAUSED',
        sellerId: sellerId,

        tags: data.tags
          .split(',')
          .map(t => t.trim().toLowerCase())
          .filter(Boolean),

        basicPackage: data.basicPackage,
        standardPackage: data.standardPackage,
        premiumPackage: data.premiumPackage,
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

      // console.log('data Images push', data.images);
      const {
        cloudinaryImageUrls,
        error: cloudinaryError,
        message: _,
      } = await storeImageToCloudinary(data.images);
      if (cloudinaryError) console.error('Cloudinary errors uwa uwaywa :', cloudinaryError);

      const {
        success: serviceSuccess,
        error: serviceError,
        message: serviceMessage,
      } = await editService(finalData, cloudinaryImageUrls);

      if (serviceError) console.error(serviceError);
      if (serviceSuccess) {
        toast.success(serviceMessage);
        router.push(`${defaultRoute}/manage`);
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

  const statusArr = [
    {name: 'DRAFT', description: 'The service will be saved privately in your account'},
    {name: 'ACTIVE', description: 'The service will be showen to client and search engine'},
    {
      name: 'PAUSED',
      description: 'The service will be shown to client but they cannot make a contact with you',
    },
    {name: 'REJECTED', description: 'The service will be hidden to you'},
  ];

  return (
    <>
      {loading && <AddServiceLoadingState />}
      <form onSubmit={handleSubmit(onSubmit)} className="container mx-auto p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 border-b pb-4">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" type="button" asChild>
              <Link href={`${defaultRoute}/manage`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Edit Service</h1>
              <p className="text-sm text-muted-foreground">
                Update your service details and republish.
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
            <Button type="submit">Update Service</Button>
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
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && ( // Display error message
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  )}
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
                        <Label htmlFor="basic-price">Price ($)</Label>
                        <Input
                          id="basic-price"
                          type="number"
                          placeholder="50"
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
                        <Label htmlFor="standard-price">Price ($)</Label>
                        <Input
                          id="standard-price"
                          type="number"
                          placeholder="100"
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
                        <Label htmlFor="premium-price">Price ($)</Label>
                        <Input
                          id="premium-price"
                          type="number"
                          placeholder="200"
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
            <Card className="gap-y-2 justify-around">
              <CardHeader>
                <CardTitle>Service Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs
                  defaultValue={status}
                  onValueChange={(e: any | 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'REJECTED') =>
                    setValue('status', e)
                  }
                >
                  {statusArr.map(status => (
                    <TabsContent
                      key={status.name}
                      value={status.name}
                      className="text-muted-foreground text-sm mb"
                    >
                      {status.description}
                    </TabsContent>
                  ))}

                  <TabsList className={`grid w-full grid-cols-${statusArr.length}`}>
                    {statusArr.map(status => (
                      <TabsTrigger
                        className="data-[state=active]:bg-primary data-[state=active]:border-amber-500"
                        value={status.name}
                        key={status.name}
                      >
                        {status.name.at(0)?.toUpperCase() + status.name.toLowerCase().slice(1, 10)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Service Media</CardTitle>
                <CardDescription>
                  Upload high-quality images that showcase your work.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* UPLOAD INPUT */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-xl p-6 cursor-pointer flex flex-col items-center justify-center hover:bg-muted/40 transition"
                >
                  <Upload className="w-6 h-6 mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload images</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />

                {/* PREVIEW GRID */}

                {loadingImages ? (
                  <div className={`grid flex-wrap grid-cols-1 sm:grid-cols-2 gap-3`}>
                    {[1, 2, 3, 4].map((_, index) => (
                      <span
                        key={index}
                        className="rounded-lg bg-background border animate-pulse object-cover h-32"
                      />
                    ))}
                  </div>
                ) : previewFiles && previewFiles.length > 0 ? (
                  <div className={`grid flex-wrap grid-cols-1 sm:grid-cols-2 gap-3`}>
                    {previewFiles.map((file, idx) => (
                      <div key={idx} className="relative group">
                        <Image
                          src={file.url}
                          alt="preview"
                          width={300}
                          height={200}
                          className="rounded-lg object-cover h-32 w-full"
                        />

                        {/* DELETE */}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center italic text-destructive mt`}>Zero images found</div>
                )}
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
                  <Select
                    value={selectedCategory || category.slug}
                    onValueChange={setSelectedCategory}
                  >
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
                      // Optional field, but max length restriction
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
          <Button type="submit">Update Service</Button>
        </div>
      </form>
    </>
  );
}

'use client';

import {useForm} from 'react-hook-form';
import {useRef, useState} from 'react';
import {Card, CardContent, CardDescription, CardFooter, CardTitle} from '../ui/card';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '../ui/form';
import {Input} from '../ui/input';
import {Button} from '../ui/button';
import type {Seller} from '@/types/service';
import createSeller from '@/hooks/freelancers/create-seller';
import WebCamComponent, {WebCamHandle} from './web-cam';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../ui/dialog';
import {redirect} from 'next/navigation';
import {IconLoader2} from '@tabler/icons-react';

function BecomeSeller({userId}: {userId: string}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [webcamImage, setWebcamImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const form = useForm<Pick<Seller, 'bio' | 'profilePhoto'>>({
    defaultValues: {
      bio: '',
      profilePhoto: '',
    },
  });

  const webcamRef = useRef<WebCamHandle>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;

      setPreview(base64);
      form.setValue('profilePhoto', base64);
    };

    reader.readAsDataURL(file);
  };

  const handleWebcamCapture = (img: string) => {
    setWebcamImage(img);
    form.setValue('profilePhoto', img);
  };

  const onSubmit = async (data: Pick<Seller, 'bio' | 'profilePhoto'>) => {
    setLoading(true);
    const payload = {
      ...data,
      userId,
    };
    const {success, error} = await createSeller(payload);
    if (error) console.error('allo ', error);
    if (error) console.log('allo ', error);
    else if (success) {
      return redirect('/dashboard/create-service');
    }
    setLoading(false);
  };

  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="space-y-6 pt-6">
        <CardTitle className="text-xl font-semibold">Become a Seller</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Provide a clear photo and a short bio to complete your seller application.
        </CardDescription>

        {/* PHOTO FIELD */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormItem className="space-y-3">
              {webcamImage || preview ? (
                <img
                  src={webcamImage || preview!}
                  className="h-40 w-40 rounded-full object-cover shadow mx-auto"
                />
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition hover:bg-muted/40">
                      <span className="font-medium text-sm">Upload a professional headshot</span>
                      <span className="text-xs text-muted-foreground">
                        Clear photo, good lighting, neutral background
                      </span>
                    </button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-md space-y-4">
                    <DialogHeader>
                      <DialogTitle>Choose Your Profile Photo</DialogTitle>
                      <DialogDescription>
                        Capture a new photo or upload one from your device.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="rounded-md overflow-hidden border">
                        <WebCamComponent onCapture={handleWebcamCapture} ref={webcamRef} />
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => {
                          webcamRef.current?.capture();
                        }}
                      >
                        Capture from Webcam
                      </Button>

                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            handlePhotoChange(e);
                            // auto-close dialog
                            const dialog = document.querySelector(
                              '[data-state="open"] button[data-radix-dialog-close]'
                            ) as HTMLButtonElement | null;
                            dialog?.click();
                          }}
                          className="w-full cursor-pointer rounded-md border p-2"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Done</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </FormItem>

            {/* BIO FIELD */}
            <FormField
              name="bio"
              control={form.control}
              rules={{required: true}}
              render={({field}) => (
                <FormItem>
                  <FormLabel>Your Bio</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Full-stack developer with 5+ years building web apps..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>

      {/* FOOTER BUTTONS */}
      <CardFooter className="flex justify-end gap-3">
        <Button variant="outline" type="button">
          Go Back
        </Button>
        <Button disabled={loading} onClick={form.handleSubmit(onSubmit)}>
          Become a Seller {loading && <IconLoader2 className="animate-spin" />}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default BecomeSeller;

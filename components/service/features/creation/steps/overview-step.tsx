'use client';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {AlertCircle, CheckCircle2} from 'lucide-react';
import {cn} from '@/lib/utils';
import {RichEditor} from '@/components/editor/rich-editor';
export function OverviewStep({register, errors, updateDescriptionValue}: any) {
  const titleLength = register('title')?.value?.length || 0;
  const descriptionLength = register('description')?.value?.length || 0;

  const handleDesValueChange = (description: string) => {
    updateDescriptionValue(description);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <CardDescription>Let clients know exactly what you offer.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Service Title */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="title">Service Title *</Label>
            <span
              className={cn(
                'text-xs',
                titleLength > 0 && titleLength < 10
                  ? 'text-amber-600'
                  : titleLength >= 10 && titleLength <= 80
                  ? 'text-green-600'
                  : 'text-muted-foreground'
              )}
            >
              {titleLength}/80 characters
            </span>
          </div>

          <div className="relative">
            <Input
              id="title"
              placeholder="I will design a modern logo for your business"
              {...register('title', {
                required: 'Service title is required',
                minLength: {
                  value: 10,
                  message: 'Title should be at least 10 characters',
                },
                maxLength: {
                  value: 80,
                  message: 'Title should not exceed 80 characters',
                },
              })}
              className={cn(
                'pr-10',
                errors.title
                  ? 'border-destructive'
                  : titleLength >= 10
                  ? 'border-green-300 focus-visible:ring-green-200'
                  : ''
              )}
            />

            {titleLength >= 10 && !errors.title && (
              <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>

          {errors.title ? (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.title.message}</span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Clear, specific titles attract more clients. Include what you'll do.
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">Description *</Label>
            <span
              className={cn(
                'text-xs',
                descriptionLength > 0 && descriptionLength < 120
                  ? 'text-amber-600'
                  : descriptionLength >= 120 && descriptionLength <= 1200
                  ? 'text-green-600'
                  : 'text-muted-foreground'
              )}
            >
              {descriptionLength}/1200 characters
            </span>
          </div>

          <div className="relative">
            <RichEditor
              onChange={handleDesValueChange}
              placeholder="Describe your service in detail. What will clients receive? What makes your service unique? What's your process?"
            />
            {/* <Textarea
              id="description"
              rows={6}
              placeholder="Describe your service in detail. What will clients receive? What makes your service unique? What's your process?"
              className={cn(
                'min-h-[150px] resize-y',
                errors.description
                  ? 'border-destructive'
                  : descriptionLength >= 120
                  ? 'border-green-300 focus-visible:ring-green-200'
                  : ''
              )}
            /> */}

            {descriptionLength >= 120 && !errors.description && (
              <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
            )}
          </div>

          {errors.description ? (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.description.message}</span>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                Tips for a great description:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Explain what clients will receive</li>
                <li>Highlight your unique selling points</li>
                <li>Include your process or timeline</li>
                <li>Add any prerequisites clients should know</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

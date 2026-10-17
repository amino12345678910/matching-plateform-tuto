'use client';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Textarea} from '@/components/ui/textarea';
import {AlertCircle, DollarSign, Clock, RefreshCw, CheckCircle2} from 'lucide-react';
import {cn} from '@/lib/utils';
import type {UseFormRegisterReturn} from 'react-hook-form';

interface PackageForm {
  price: number;
  delivery: number;
  revisions: number;
  description: string;
}

const PACKAGE_CONFIG = {
  basic: {
    title: 'Basic',
    description: 'Essential service package',
    color: 'border-blue-300 bg-blue-50/50',
    iconColor: 'text-blue-600',
  },
  standard: {
    title: 'Standard',
    description: 'Most popular choice',
    color: 'border-purple-300 bg-purple-50/50',
    iconColor: 'text-purple-600',
  },
  premium: {
    title: 'Premium',
    description: 'Complete premium package',
    color: 'border-amber-300 bg-amber-50/50',
    iconColor: 'text-amber-600',
  },
};

function PricingStep({
  currentTab,
  setCurrentTab,
  registerPackageField,
  isInputInvalid,
  getPackageError,
}: {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  registerPackageField: (
    packageName: 'basicPackage' | 'standardPackage' | 'premiumPackage',
    fieldName: keyof PackageForm
  ) => UseFormRegisterReturn;
  isInputInvalid: (fieldPath: string) => boolean;
  getPackageError: (
    packageName: 'basicPackage' | 'standardPackage' | 'premiumPackage',
    fieldName: keyof PackageForm
  ) => string | undefined;
}) {
  const renderPackageTab = (
    packageName: 'basicPackage' | 'standardPackage' | 'premiumPackage',
    tabValue: string
  ) => {
    const config = PACKAGE_CONFIG[tabValue as keyof typeof PACKAGE_CONFIG];
    const isComplete =
      !isInputInvalid(`${packageName}.price`) &&
      !isInputInvalid(`${packageName}.delivery`) &&
      !isInputInvalid(`${packageName}.revisions`) &&
      !isInputInvalid(`${packageName}.description`);

    return (
      <TabsContent value={tabValue} className="pt-6 space-y-6">
        {/* Package Header */}
        <div
          className={cn(
            'rounded-xl p-4 border-2 transition-all',
            config.color,
            isComplete && 'ring-2 ring-green-200 ring-offset-1'
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{config.title} Package</h3>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </div>
            {isComplete && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Complete</span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Price */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor={`${tabValue}-price`} className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Soum bil Dinar (DT)
              </Label>
              <span className="text-xs text-muted-foreground">Obligatoire</span>
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs font-bold">
                DT
              </div>
              <Input
                id={`${tabValue}-price`}
                type="number"
                min="5"
                max="10000"
                placeholder={tabValue === 'basic' ? '30' : tabValue === 'standard' ? '80' : '150'}
                className={cn(
                  'pl-10',
                  isInputInvalid(`${packageName}.price`)
                    ? 'border-destructive'
                    : getPackageError(packageName, 'price')
                    ? ''
                    : 'border-green-300'
                )}
                {...registerPackageField(packageName, 'price')}
              />
            </div>
            {getPackageError(packageName, 'price') && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{getPackageError(packageName, 'price')}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Minimum: $5. Competitive pricing attracts more clients.
            </p>
          </div>

          {/* Delivery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor={`${tabValue}-delivery`} className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Delivery (Days)
              </Label>
              <span className="text-xs text-muted-foreground">Required</span>
            </div>
            <div className="relative">
              <Input
                id={`${tabValue}-delivery`}
                type="number"
                min="1"
                max="90"
                placeholder={tabValue === 'basic' ? '3' : tabValue === 'standard' ? '5' : '7'}
                className={cn(
                  isInputInvalid(`${packageName}.delivery`)
                    ? 'border-destructive'
                    : getPackageError(packageName, 'delivery')
                    ? ''
                    : 'border-green-300'
                )}
                {...registerPackageField(packageName, 'delivery')}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                days
              </div>
            </div>
            {getPackageError(packageName, 'delivery') && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{getPackageError(packageName, 'delivery')}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Set realistic timelines to ensure quality delivery.
            </p>
          </div>

          {/* Revisions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor={`${tabValue}-revisions`} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Revisions
              </Label>
              <span className="text-xs text-muted-foreground">Required</span>
            </div>
            <Input
              id={`${tabValue}-revisions`}
              type="number"
              min="0"
              max="50"
              placeholder={tabValue === 'basic' ? '2' : tabValue === 'standard' ? '5' : '10'}
              className={cn(
                isInputInvalid(`${packageName}.revisions`)
                  ? 'border-destructive'
                  : getPackageError(packageName, 'revisions')
                  ? ''
                  : 'border-green-300'
              )}
              {...registerPackageField(packageName, 'revisions')}
            />
            {getPackageError(packageName, 'revisions') && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{getPackageError(packageName, 'revisions')}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Number of changes included. 0 = no revisions included.
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${tabValue}-description`}>What's included in this package?</Label>
            <span className="text-xs text-muted-foreground">Required</span>
          </div>
          <Textarea
            id={`${tabValue}-description`}
            placeholder={
              tabValue === 'basic'
                ? 'e.g., 1 Concept, High Resolution JPG files, 2 Revisions, Basic Support'
                : tabValue === 'standard'
                ? 'e.g., 2 Concepts, All Source Files, 5 Revisions, Priority Support, Commercial Use'
                : 'e.g., 3 Concepts, All Source Files + Editable Files, Unlimited Revisions, VIP Support, Brand Guideline PDF, Priority Delivery'
            }
            rows={4}
            className={cn(
              'min-h-[120px] resize-y',
              isInputInvalid(`${packageName}.description`)
                ? 'border-destructive'
                : getPackageError(packageName, 'description')
                ? ''
                : 'border-green-300'
            )}
            {...registerPackageField(packageName, 'description')}
          />
          {getPackageError(packageName, 'description') && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{getPackageError(packageName, 'description')}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Be specific about what clients receive. Clear expectations lead to better reviews.
          </p>
        </div>

        {/* Tips Card */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2">💡 Tips for the {config.title} package:</h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            {tabValue === 'basic' && (
              <>
                <li>Offer your core service at an accessible price</li>
                <li>Include 1-2 revisions to manage expectations</li>
                <li>Set a faster delivery time</li>
              </>
            )}
            {tabValue === 'standard' && (
              <>
                <li>This is typically the most popular choice</li>
                <li>Offer more features than the Basic package</li>
                <li>Include source files and commercial rights</li>
              </>
            )}
            {tabValue === 'premium' && (
              <>
                <li>Offer your best, most comprehensive service</li>
                <li>Include VIP support and fastest delivery</li>
                <li>Add exclusive features not available in other packages</li>
              </>
            )}
          </ul>
        </div>
      </TabsContent>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Packages & Pricing</CardTitle>
        <CardDescription>
          Define your service tiers. Most sellers offer 3 packages with clear value progression.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="relative">
              Basic
              {!isInputInvalid('basicPackage.price') &&
                !isInputInvalid('basicPackage.delivery') &&
                !isInputInvalid('basicPackage.revisions') &&
                !isInputInvalid('basicPackage.description') && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500"></span>
                )}
            </TabsTrigger>
            <TabsTrigger value="standard" className="relative">
              Standard
              {!isInputInvalid('standardPackage.price') &&
                !isInputInvalid('standardPackage.delivery') &&
                !isInputInvalid('standardPackage.revisions') &&
                !isInputInvalid('standardPackage.description') && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500"></span>
                )}
            </TabsTrigger>
            <TabsTrigger value="premium" className="relative">
              Premium
              {!isInputInvalid('premiumPackage.price') &&
                !isInputInvalid('premiumPackage.delivery') &&
                !isInputInvalid('premiumPackage.revisions') &&
                !isInputInvalid('premiumPackage.description') && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500"></span>
                )}
            </TabsTrigger>
          </TabsList>

          {renderPackageTab('basicPackage', 'basic')}
          {renderPackageTab('standardPackage', 'standard')}
          {renderPackageTab('premiumPackage', 'premium')}
        </Tabs>

        {/* Package Comparison Tips */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium text-sm mb-3">🎯 Package Strategy Tips:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50/50 rounded-lg">
              <h5 className="font-medium text-sm mb-1">Basic</h5>
              <p className="text-xs text-muted-foreground">
                Entry point. Attract budget-conscious clients.
              </p>
            </div>
            <div className="p-3 bg-purple-50/50 rounded-lg">
              <h5 className="font-medium text-sm mb-1">Standard</h5>
              <p className="text-xs text-muted-foreground">
                Best value. Aim to make this your most popular.
              </p>
            </div>
            <div className="p-3 bg-amber-50/50 rounded-lg">
              <h5 className="font-medium text-sm mb-1">Premium</h5>
              <p className="text-xs text-muted-foreground">
                High-end option. Maximize revenue from serious clients.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PricingStep;

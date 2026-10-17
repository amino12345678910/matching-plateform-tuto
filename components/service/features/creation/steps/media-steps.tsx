'use client';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MultipleImageUpload from '@/hooks/use-image-upload';
import {Upload, Image as ImageIcon, AlertCircle, CheckCircle2} from 'lucide-react';
import {cn} from '@/lib/utils';
import {useState} from 'react';

export function MediaStep({
  selectedCategory,
  setSelectedCategory,
  register,
  registerFiles,
  errors,
}: any) {
  const [files, setFiles] = useState<File[]>([]);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    registerFiles(selectedFiles);
  };

  const tagsValue = register('tags')?.value || '';
  const tagsCount = tagsValue ? tagsValue.split(',').filter((tag: string) => tag.trim()).length : 0;

  return (
    <div className="space-y-6">
      {/* Gallery Card */}
      <Card>
        <CardHeader>
          <CardTitle>Course & Session Gallery</CardTitle>
          <CardDescription>
            Upload images or slides that showcase your tutoring session. First image will be the
            thumbnail.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div className="space-y-2">
            {/* Image Preview/Count */}
            {files.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
                <span>
                  {files.length} image{files.length !== 1 ? 's' : ''} ready to upload
                </span>
                {files.length < 1 && (
                  <span className="text-amber-600">• Recommended: Add at least 1 cover image</span>
                )}
              </div>
            )}

            {/* Error Message */}
            {errors.images && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.images.message}</span>
              </div>
            )}

            {/* Multiple Image Upload Component */}
            <MultipleImageUpload
              htmlFor="image-upload"
              allowMultipleImages
              registerFiles={handleFilesSelected}
            />
          </div>

          {/* Tips */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2">💡 Tips for great tutoring thumbnails:</h4>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Showcase the subject or syllabus clearly</li>
              <li>Include sample study materials or diagrams if applicable</li>
              <li>Use high-resolution images (min. 1200px width)</li>
              <li>Highlight your credentials or teaching style</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Category & Tags Card */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Category & Topics</CardTitle>
          <CardDescription>
            Help students find your tutoring session by selecting the right subject category.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-3">
            <Label htmlFor="category">Subject Category *</Label>
            <div className="space-y-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger
                  className={cn(
                    selectedCategory ? 'border-green-300' : '',
                    errors.category ? 'border-destructive' : ''
                  )}
                >
                  <SelectValue placeholder="Choose a subject category for your tutoring session" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mathematics">Mathematics & Calculus</SelectItem>
                  <SelectItem value="coding">Coding & Computer Science</SelectItem>
                  <SelectItem value="languages">Languages & Literature</SelectItem>
                  <SelectItem value="science">Science, Physics & Chemistry</SelectItem>
                  <SelectItem value="ai-data">AI, Data Science & ML</SelectItem>
                  <SelectItem value="music-arts">Music, Art & Design</SelectItem>
                  <SelectItem value="business">Business, Finance & Economics</SelectItem>
                  <SelectItem value="exam-prep">SAT, GRE & Exam Prep</SelectItem>
                </SelectContent>
              </Select>

              {!selectedCategory && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Please select a subject category</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="tags">Subject Tags</Label>
              <span className="text-xs text-muted-foreground">{tagsCount}/15 tags</span>
            </div>

            <div className="space-y-2">
              <Input
                id="tags"
                placeholder="calculus, linear algebra, python, exam prep, beginner friendly"
                {...register('tags', {
                  validate: (value: string) => {
                    const tags = value.split(',').filter(tag => tag.trim());
                    if (tags.length > 15) {
                      return 'Maximum 15 tags allowed';
                    }
                    return true;
                  },
                })}
                className={cn(
                  errors.tags ? 'border-destructive' : tagsCount > 0 ? 'border-green-300' : ''
                )}
              />

              {errors.tags ? (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.tags.message}</span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Add relevant subject keywords separated by commas so students can discover your lessons.
                </p>
              )}

              {/* Tags Preview */}
              {tagsValue && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {tagsValue
                    .split(',')
                    .filter((tag: string) => tag.trim())
                    .map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

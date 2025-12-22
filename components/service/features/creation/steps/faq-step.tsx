// Create a new file: /app/dashboard/service/create/steps/faq-step.tsx
'use client';

import {useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';
import {cn} from '@/lib/utils';
import type {FAQ} from '@/types/service';

type FAQStepProps = {
  faqs: FAQ[];
  onFAQsChange: (faqs: FAQ[]) => void;
  errors?: any;
};

export function FAQStep({faqs, onFAQsChange, errors}: FAQStepProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newFAQ, setNewFAQ] = useState({question: '', answer: ''});
  const [editingFAQ, setEditingFAQ] = useState<FAQ>({id: '', question: '', answer: ''});
  const [showPreview, setShowPreview] = useState(false);

  const handleAddFAQ = () => {
    if (newFAQ.question.trim() && newFAQ.answer.trim()) {
      const newFaqItem: FAQ = {
        id: Date.now().toString(),
        question: newFAQ.question.trim(),
        answer: newFAQ.answer.trim(),
      };

      onFAQsChange([...faqs, newFaqItem]);
      setNewFAQ({question: '', answer: ''});
    }
  };

  const handleEditStart = (faq: FAQ) => {
    setEditingId(faq.id);
    setEditingFAQ({...faq});
  };

  // Save edited FAQ
  const handleEditSave = () => {
    if (editingFAQ.question.trim() && editingFAQ.answer.trim()) {
      const updatedFAQs = faqs.map(faq => (faq.id === editingId ? {...editingFAQ} : faq));
      onFAQsChange(updatedFAQs);
      setEditingId(null);
      setEditingFAQ({id: '', question: '', answer: ''});
    }
  };

  // Cancel editing
  const handleEditCancel = () => {
    setEditingId(null);
    setEditingFAQ({id: '', question: '', answer: ''});
  };

  // Delete an FAQ
  const handleDeleteFAQ = (id: string) => {
    onFAQsChange(faqs.filter(faq => faq.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingFAQ({id: '', question: '', answer: ''});
    }
  };

  // Move FAQ up/down
  const handleMoveFAQ = (index: number, direction: 'up' | 'down') => {
    const newFAQs = [...faqs];
    if (direction === 'up' && index > 0) {
      [newFAQs[index], newFAQs[index - 1]] = [newFAQs[index - 1], newFAQs[index]];
    } else if (direction === 'down' && index < newFAQs.length - 1) {
      [newFAQs[index], newFAQs[index + 1]] = [newFAQs[index + 1], newFAQs[index]];
    }
    onFAQsChange(newFAQs);
  };

  return (
    <div className="space-y-6">
      {/* Header & Description */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Add common questions clients might have about your service. This helps set clear
          expectations and reduces back-and-forth communication.
        </p>
      </div>

      {/* FAQ Form Card */}
      <Card className="border">
        <CardHeader>
          <CardTitle className="text-lg">Add New FAQ</CardTitle>
          <CardDescription>
            Keep questions clear and answers helpful. 3-5 FAQs usually cover most concerns.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Question Input */}
          <div className="space-y-2">
            <Label htmlFor="question">Question *</Label>
            <Input
              id="question"
              placeholder="e.g., How many revisions are included?"
              value={newFAQ.question}
              onChange={e => setNewFAQ({...newFAQ, question: e.target.value})}
              className={errors?.faqs?.question ? 'border-destructive' : ''}
            />
            {errors?.faqs?.question && (
              <p className="text-sm text-destructive">{errors.faqs.question.message}</p>
            )}
          </div>

          {/* Answer Input */}
          <div className="space-y-2">
            <Label htmlFor="answer">Answer *</Label>
            <Textarea
              id="answer"
              placeholder="e.g., It depends on the package you choose. Basic includes 2 revisions, Standard includes 5, and Premium includes unlimited revisions."
              value={newFAQ.answer}
              onChange={e => setNewFAQ({...newFAQ, answer: e.target.value})}
              rows={3}
              className={errors?.faqs?.answer ? 'border-destructive' : ''}
            />
            {errors?.faqs?.answer && (
              <p className="text-sm text-destructive">{errors.faqs.answer.message}</p>
            )}
          </div>

          {/* Add Button */}
          <Button
            type="button"
            onClick={handleAddFAQ}
            disabled={!newFAQ.question.trim() || !newFAQ.answer.trim()}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add FAQ
          </Button>
        </CardContent>
      </Card>

      {/* Existing FAQs */}
      {faqs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Your FAQs ({faqs.length})</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Edit Mode' : 'Preview Mode'}
            </Button>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className={cn(
                  'rounded-lg border transition-all duration-200',
                  editingId === faq.id
                    ? 'border-primary ring-1 ring-primary'
                    : 'hover:border-primary/50'
                )}
              >
                {editingId === faq.id ? (
                  // Editing Mode
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Input
                        value={editingFAQ.question}
                        onChange={e => setEditingFAQ({...editingFAQ, question: e.target.value})}
                        placeholder="Question"
                        className="font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Textarea
                        value={editingFAQ.answer}
                        onChange={e => setEditingFAQ({...editingFAQ, answer: e.target.value})}
                        placeholder="Answer"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleEditSave}
                          disabled={!editingFAQ.question.trim() || !editingFAQ.answer.trim()}
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={handleEditCancel}>
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteFAQ(faq.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Display Mode
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        {showPreview ? (
                          // Preview Mode
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">{faq.question}</h4>
                            <p className="text-sm text-muted-foreground">{faq.answer}</p>
                          </div>
                        ) : (
                          // Edit Mode View
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">{faq.question}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 ml-4">
                        {!showPreview && (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditStart(faq)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteFAQ(faq.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        <div className="flex flex-col">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMoveFAQ(index, 'up')}
                            disabled={index === 0}
                            className="h-6 w-6 p-0"
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMoveFAQ(index, 'down')}
                            disabled={index === faqs.length - 1}
                            className="h-6 w-6 p-0"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips & Guidelines */}
      <Alert className="bg-muted/50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium text-sm">💡 Tips for effective FAQs:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Focus on questions clients actually ask during consultations</li>
              <li>Be specific about delivery times, revisions, and included features</li>
              <li>Address potential concerns about the process or requirements</li>
              <li>Keep answers concise but informative</li>
              <li>Order FAQs from most to least important</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* Common FAQ Templates */}
      {faqs.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-6">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Quick Templates</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  {
                    question: 'How many revisions are included?',
                    answer: 'Revisions vary by package. Basic: 2, Standard: 5, Premium: Unlimited.',
                  },
                  {
                    question: 'Do you provide source files?',
                    answer:
                      'Yes, source files are included in all packages for easy customization.',
                  },
                  {
                    question: 'What information do you need to start?',
                    answer:
                      'Please provide: 1) Your brand guidelines 2) Reference examples 3) Project timeline.',
                  },
                  {
                    question: 'What is your delivery time?',
                    answer:
                      'Delivery times vary by package complexity. Basic: 3 days, Standard: 5 days, Premium: 7 days.',
                  },
                ].map((template, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto py-3 px-4 text-left justify-start"
                    onClick={() => setNewFAQ(template)}
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-medium line-clamp-1">{template.question}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {template.answer}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

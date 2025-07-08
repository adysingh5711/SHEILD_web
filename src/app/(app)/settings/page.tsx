'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

const sosSchema = z.object({
  message: z.string().min(10, 'Message must be at least 10 characters long.'),
});

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'A valid phone number is required'),
});

type SOSContact = z.infer<typeof contactSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sosContacts, setSosContacts] = useState<SOSContact[]>([
    { name: 'Mom', phone: '111-222-3333' },
    { name: 'Local Police', phone: '911' },
  ]);

  const sosForm = useForm<z.infer<typeof sosSchema>>({
    resolver: zodResolver(sosSchema),
    defaultValues: {
      message: "I'm in an emergency and need help. My current location is being sent. Please contact authorities.",
    },
  });

  const contactForm = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', phone: '' },
  });

  function onSosSubmit(values: z.infer<typeof sosSchema>) {
    setLoading(true);
    setTimeout(() => {
      toast({ title: 'SOS Message Updated', description: 'Your custom SOS message has been saved.' });
      setLoading(false);
    }, 1000);
  }

  function onContactSubmit(values: z.infer<typeof contactSchema>) {
    setSosContacts([...sosContacts, values]);
    contactForm.reset();
    toast({ title: 'SOS Contact Added', description: `${values.name} has been added.` });
  }

  function removeContact(index: number) {
    const contact = sosContacts[index];
    setSosContacts(sosContacts.filter((_, i) => i !== index));
    toast({ title: 'SOS Contact Removed', description: `${contact.name} has been removed.` });
  }

  return (
    <div className="grid gap-6">
      <Card className="shadow-neumorphic">
        <CardHeader>
          <CardTitle>SOS Message</CardTitle>
          <CardDescription>Set the custom message to be sent when you trigger an SOS alert.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...sosForm}>
            <form onSubmit={sosForm.handleSubmit(onSosSubmit)} className="space-y-4">
              <FormField
                control={sosForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom SOS Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your SOS message..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Message
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-neumorphic">
        <CardHeader>
          <CardTitle>SOS Contacts</CardTitle>
          <CardDescription>These contacts will be notified when you trigger an SOS alert.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4 mb-6">
            {sosContacts.map((contact, index) => (
              <li key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.phone}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeContact(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Remove SOS contact</span>
                </Button>
              </li>
            ))}
          </ul>
          <Form {...contactForm}>
            <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="flex flex-col md:flex-row gap-4 items-start">
              <FormField
                control={contactForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1 w-full">
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl><Input placeholder="Contact Name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="flex-1 w-full">
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl><Input placeholder="Phone Number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="w-full md:w-auto self-end">
                <Button type="submit" className="w-full">Add SOS Contact</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

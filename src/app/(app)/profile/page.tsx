'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email(),
});

const healthcareSchema = z.object({
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  conditions: z.string().optional(),
});

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'A valid phone number is required'),
});

type EmergencyContact = z.infer<typeof contactSchema>;

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { name: 'Jane Doe', phone: '123-456-7890' },
    { name: 'Dr. Smith', phone: '098-765-4321' },
  ]);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const healthcareForm = useForm<z.infer<typeof healthcareSchema>>({
    resolver: zodResolver(healthcareSchema),
    defaultValues: {
      bloodType: 'O+',
      allergies: 'Peanuts',
      medications: 'None',
      conditions: 'None',
    },
  });
  
  const contactForm = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      phone: '',
    }
  });


  function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    toast({ title: 'Profile Updated', description: 'Your personal information has been saved.' });
  }

  function onHealthcareSubmit(values: z.infer<typeof healthcareSchema>) {
    toast({ title: 'Healthcare Info Updated', description: 'Your healthcare information has been saved.' });
  }

  function onContactSubmit(values: z.infer<typeof contactSchema>) {
    setEmergencyContacts([...emergencyContacts, values]);
    contactForm.reset();
    toast({ title: 'Contact Added', description: `${values.name} has been added to your emergency contacts.` });
  }
  
  function removeContact(index: number) {
    const contactToRemove = emergencyContacts[index];
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
    toast({ title: 'Contact Removed', description: `${contactToRemove.name} has been removed.` });
  }


  return (
    <div className="grid gap-6">
      <Card className="shadow-neumorphic">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <FormField control={profileForm.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={profileForm.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-neumorphic">
        <CardHeader>
          <CardTitle>Healthcare Information</CardTitle>
          <CardDescription>This information may be shared in an emergency.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...healthcareForm}>
            <form onSubmit={healthcareForm.handleSubmit(onHealthcareSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={healthcareForm.control} name="bloodType" render={({ field }) => (
                  <FormItem><FormLabel>Blood Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={healthcareForm.control} name="allergies" render={({ field }) => (
                  <FormItem><FormLabel>Allergies</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={healthcareForm.control} name="medications" render={({ field }) => (
                  <FormItem><FormLabel>Medications</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={healthcareForm.control} name="conditions" render={({ field }) => (
                  <FormItem><FormLabel>Existing Conditions</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Healthcare Info</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="shadow-neumorphic">
        <CardHeader>
          <CardTitle>Emergency Contacts</CardTitle>
          <CardDescription>Manage your list of emergency contacts.</CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="space-y-4 mb-6">
                {emergencyContacts.map((contact, index) => (
                    <li key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-muted-foreground">{contact.phone}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeContact(index)}>
                            <Trash2 className="h-4 w-4 text-destructive"/>
                            <span className="sr-only">Remove contact</span>
                        </Button>
                    </li>
                ))}
            </ul>
             <Form {...contactForm}>
                <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="flex flex-col md:flex-row gap-4 items-start">
                    <FormField control={contactForm.control} name="name" render={({ field }) => (
                        <FormItem className="flex-1 w-full"><FormLabel>Contact Name</FormLabel><FormControl><Input placeholder="Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={contactForm.control} name="phone" render={({ field }) => (
                        <FormItem className="flex-1 w-full"><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="123-456-7890" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="w-full md:w-auto self-end">
                       <Button type="submit" className="w-full" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Contact</Button>
                    </div>
                </form>
            </Form>
        </CardContent>
      </Card>

    </div>
  );
}

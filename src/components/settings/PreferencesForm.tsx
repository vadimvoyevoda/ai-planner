import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { MeetingPreferencesEntity } from "@/types";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const preferencesSchema = z.object({
  preferred_distribution: z.enum(["rozłożone", "skondensowane"]),
  preferred_times_of_day: z.array(z.enum(["rano", "dzień", "wieczór"])).min(1),
  min_break_minutes: z.number().nullable(),
  unavailable_weekdays: z.array(z.number().min(0).max(6)),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

interface PreferencesFormProps {
  initialPreferences?: MeetingPreferencesEntity | null;
}

const TIMES_OF_DAY = [
  { value: "rano", label: "Rano (6:00 - 12:00)" },
  { value: "dzień", label: "Dzień (12:00 - 18:00)" },
  { value: "wieczór", label: "Wieczór (18:00 - 23:00)" },
];

const WEEKDAYS = [
  { value: 0, label: "Niedziela" },
  { value: 1, label: "Poniedziałek" },
  { value: 2, label: "Wtorek" },
  { value: 3, label: "Środa" },
  { value: 4, label: "Czwartek" },
  { value: 5, label: "Piątek" },
  { value: 6, label: "Sobota" },
];

export default function PreferencesForm({ initialPreferences }: PreferencesFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      preferred_distribution: initialPreferences?.preferred_distribution || "rozłożone",
      preferred_times_of_day: initialPreferences?.preferred_times_of_day?.length
        ? initialPreferences.preferred_times_of_day
        : ["rano", "dzień", "wieczór"],
      min_break_minutes: initialPreferences?.min_break_minutes || 0,
      unavailable_weekdays: initialPreferences?.unavailable_weekdays || [],
    },
  });

  const onSubmit = async (data: PreferencesFormData) => {
    try {
      setIsLoading(true);

      // Jeśli wszystkie pory dnia są zaznaczone, traktujemy to jako brak preferencji
      const allTimesSelected = data.preferred_times_of_day.length === TIMES_OF_DAY.length;

      // Przygotuj dane do wysłania
      const formData = {
        ...data,
        // Jeśli wszystkie pory dnia są wybrane, wysyłamy pustą tablicę
        preferred_times_of_day: allTimesSelected ? [] : data.preferred_times_of_day,
        // Jeśli przerwa jest 0, wysyłamy null
        min_break_minutes: data.min_break_minutes === 0 ? null : data.min_break_minutes,
      };

      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Wystąpił błąd podczas zapisywania preferencji");
      }

      toast.success("Preferencje zostały zapisane");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Rozkład spotkań */}
        <FormField
          control={form.control}
          name="preferred_distribution"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Preferowany rozkład spotkań</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="rozłożone" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Rozłożone (spotkania rozplanowane równomiernie w ciągu dnia)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="skondensowane" />
                    </FormControl>
                    <FormLabel className="font-normal">Skondensowane (spotkania zaplanowane blisko siebie)</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Preferowane pory dnia */}
        <FormField
          control={form.control}
          name="preferred_times_of_day"
          render={() => (
            <FormItem>
              <FormLabel>Preferowane pory dnia</FormLabel>
              <div className="grid gap-2">
                {TIMES_OF_DAY.map((time) => (
                  <FormField
                    key={time.value}
                    control={form.control}
                    name="preferred_times_of_day"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(time.value as any)}
                            onCheckedChange={(checked) => {
                              const value = time.value as any;
                              const currentValues = field.value || [];
                              const newValues = checked
                                ? [...currentValues, value]
                                : currentValues.filter((v) => v !== value);
                              field.onChange(newValues);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{time.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Minimalna przerwa między spotkaniami */}
        <FormField
          control={form.control}
          name="min_break_minutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimalna przerwa między spotkaniami (w minutach)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="np. 30"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Niedostępne dni tygodnia */}
        <FormField
          control={form.control}
          name="unavailable_weekdays"
          render={() => (
            <FormItem>
              <FormLabel>Niedostępne dni tygodnia</FormLabel>
              <div className="grid gap-2">
                {WEEKDAYS.map((day) => (
                  <FormField
                    key={day.value}
                    control={form.control}
                    name="unavailable_weekdays"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(day.value)}
                            onCheckedChange={(checked) => {
                              const currentValues = field.value || [];
                              const newValues = checked
                                ? [...currentValues, day.value]
                                : currentValues.filter((v) => v !== day.value);
                              field.onChange(newValues);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{day.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Zapisywanie..." : "Zapisz preferencje"}
        </Button>
      </form>
    </Form>
  );
}

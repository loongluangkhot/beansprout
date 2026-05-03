"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createSeason, updateSeasonSchedule } from "@/lib/api/seasons";
import type { SeasonScheduleFrequency } from "@/types/season";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];

function toLocalDatetimeValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function localDatetimeToIso(value: string): string {
  return new Date(value).toISOString();
}

const schema = z.object({
  title: z.string().trim().min(1, "Please add a season title."),
  book_title: z.string().trim().min(1, "Please add the book title."),
  book_author: z.string().trim().min(1, "Please add the author name."),
  description: z.string().optional(),
  cover_image_url: z.string().optional(),
  theme: z.string().optional(),
  max_members: z.coerce.number().int().min(1, "Please choose between 1 and 500 members.").max(500, "Please choose between 1 and 500 members.").optional(),
  membership_mode: z.enum(["auto-join", "approval-required"]),
  start_date: z
    .string()
    .trim()
    .min(1, "Please choose a start date and time.")
    .refine((value) => {
      const candidate = new Date(value);
      return !Number.isNaN(candidate.getTime()) && candidate > new Date();
    }, "Please choose a future start date and time."),
  duration_weeks: z.coerce.number().int().min(1).max(52),
  frequency: z.enum(["weekly", "bi-weekly", "monthly"]),
});

type SeasonCreateFormData = z.infer<typeof schema>;

export function SeasonCreateForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [meetupDrafts, setMeetupDrafts] = useState<string[]>([]);

  const form = useForm<SeasonCreateFormData>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      title: "",
      book_title: "",
      book_author: "",
      description: "",
      cover_image_url: "",
      theme: "",
      max_members: 20,
      membership_mode: "auto-join",
      start_date: "",
      duration_weeks: 10,
      frequency: "weekly",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const startDate = watch("start_date");
  const durationWeeks = watch("duration_weeks");
  const frequency = watch("frequency");

  const generatedMeetups = useMemo(() => {
    if (!startDate) {
      return [];
    }
    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) {
      return [];
    }

    const cadenceDays: Record<SeasonScheduleFrequency, number> = {
      weekly: 7,
      "bi-weekly": 14,
      monthly: 28,
    };
    const cadence = cadenceDays[frequency as SeasonScheduleFrequency];
    const end = new Date(start);
    end.setDate(end.getDate() + durationWeeks * 7);

    const output: string[] = [];
    const current = new Date(start);
    while (current < end) {
      output.push(toLocalDatetimeValue(current));
      current.setDate(current.getDate() + cadence);
    }
    return output;
  }, [durationWeeks, frequency, startDate]);

  useEffect(() => {
    setMeetupDrafts(generatedMeetups);
  }, [generatedMeetups]);

  const createMutation = useMutation({
    mutationFn: async (payload: SeasonCreateFormData) => {
      if (!token) {
        throw new Error("Missing auth token");
      }

      const created = await createSeason(payload, token);
      await updateSeasonSchedule(
        created.data.id,
        {
          start_date: localDatetimeToIso(payload.start_date),
          duration_weeks: payload.duration_weeks,
          frequency: payload.frequency,
          meetup_datetimes: meetupDrafts
            .filter(Boolean)
            .map((meetup) => localDatetimeToIso(meetup)),
        },
        token
      );
      return created;
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["season-library"] });
      setSuccessMessage("Season and schedule saved. Taking you to your season page now.");
      router.push(`/seasons/${encodeURIComponent(response.data.id)}`);
    },
  });

  const onSubmit = (values: SeasonCreateFormData) => {
    if (!isAuthenticated || !token) {
      const redirect = encodeURIComponent("/seasons/create");
      router.push(`/login?redirect=${redirect}`);
      return;
    }
    const normalizedValues: SeasonCreateFormData = {
      ...values,
      description: values.description?.trim() || undefined,
      cover_image_url:
        values.cover_image_url?.startsWith("blob:")
          ? undefined
          : values.cover_image_url?.trim() || undefined,
      theme: values.theme?.trim() || undefined,
      max_members: values.max_members,
      membership_mode: "auto-join",
    };
    createMutation.mutate(normalizedValues);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setCoverError(null);
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setCoverError("Please choose a JPG or PNG image.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setCoverError("Please keep your image under 5MB.");
      return;
    }

    const url = URL.createObjectURL(file);
    if (coverPreviewUrl) {
      URL.revokeObjectURL(coverPreviewUrl);
    }
    setCoverPreviewUrl(url);
    setValue("cover_image_url", "", { shouldValidate: true, shouldDirty: true });
  };

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [coverPreviewUrl]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl bg-surface-container-low p-6 space-y-5">
      {successMessage ? (
        <div role="status" className="rounded-xl bg-success-container p-3">
          <p className="font-manrope text-sm text-foreground">{successMessage}</p>
        </div>
      ) : null}

      <div className="space-y-1">
        <label htmlFor="season-title" className="font-manrope text-sm text-foreground">Season title</label>
        <Input id="season-title" {...register("title")} placeholder="Cozy Autumn Reads" />
        {errors.title ? <p className="font-manrope text-xs text-foreground">{errors.title.message}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="book-title" className="font-manrope text-sm text-foreground">Book title</label>
          <Input id="book-title" {...register("book_title")} placeholder="The Night Circus" />
          {errors.book_title ? <p className="font-manrope text-xs text-foreground">{errors.book_title.message}</p> : null}
        </div>
        <div className="space-y-1">
          <label htmlFor="book-author" className="font-manrope text-sm text-foreground">Author</label>
          <Input id="book-author" {...register("book_author")} placeholder="Erin Morgenstern" />
          {errors.book_author ? <p className="font-manrope text-xs text-foreground">{errors.book_author.message}</p> : null}
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="season-description" className="font-manrope text-sm text-foreground">Description</label>
        <textarea
          id="season-description"
          {...register("description")}
          rows={5}
          placeholder="Share the vibe, pacing, or goals for this season."
          className="w-full rounded-2xl border border-input bg-surface-container-high px-4 py-3 text-sm text-foreground font-manrope focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="season-theme" className="font-manrope text-sm text-foreground">Season theme</label>
          <Input id="season-theme" {...register("theme")} placeholder="Summer Reads: Contemporary Relationships" />
        </div>
        <div className="space-y-1">
          <label htmlFor="season-max-members" className="font-manrope text-sm text-foreground">Maximum members</label>
          <Input id="season-max-members" type="number" min={1} max={500} {...register("max_members")} />
          {errors.max_members ? <p className="font-manrope text-xs text-foreground">{errors.max_members.message}</p> : null}
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="membership-mode" className="font-manrope text-sm text-foreground">Membership mode</label>
        <select
          id="membership-mode"
          className="w-full rounded-2xl border border-input bg-surface-container-high px-4 py-3 text-sm text-foreground font-manrope focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...register("membership_mode")}
        >
          <option value="auto-join">Auto-join (available now)</option>
          <option value="approval-required" disabled>Approval-required (coming soon)</option>
        </select>
        <p className="font-manrope text-xs text-foreground-muted">For this MVP, members join automatically.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="season-cover" className="font-manrope text-sm text-foreground">Cover image</label>
        <Input id="season-cover" type="file" accept=".jpg,.jpeg,.png" onChange={handleFileChange} />
        <p className="font-manrope text-xs text-foreground-muted">JPG or PNG, up to 5MB.</p>
        {coverError ? <p className="font-manrope text-xs text-foreground">{coverError}</p> : null}
        {coverPreviewUrl ? (
          <img src={coverPreviewUrl} alt="Season cover preview" className="h-44 w-full rounded-xl object-cover" />
        ) : null}
      </div>

      <input type="hidden" {...register("cover_image_url")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="season-start-date" className="font-manrope text-sm text-foreground">Start date and time</label>
          <Input id="season-start-date" type="datetime-local" {...register("start_date")} />
          {errors.start_date ? <p className="font-manrope text-xs text-foreground">{errors.start_date.message}</p> : null}
        </div>
        <div className="space-y-1">
          <label htmlFor="season-duration-weeks" className="font-manrope text-sm text-foreground">Duration (weeks)</label>
          <Input id="season-duration-weeks" type="number" min={1} max={52} {...register("duration_weeks")} />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="season-frequency" className="font-manrope text-sm text-foreground">Meetup frequency</label>
        <select
          id="season-frequency"
          className="w-full rounded-2xl border border-input bg-surface-container-high px-4 py-3 text-sm text-foreground font-manrope focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...register("frequency")}
        >
          <option value="weekly">Weekly</option>
          <option value="bi-weekly">Bi-weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div className="space-y-2">
        <p className="font-manrope text-sm text-foreground">Meetup schedule preview</p>
        {meetupDrafts.map((value, index) => (
          <div key={`${value}-${index}`} className="flex items-center gap-2">
            <Input
              type="datetime-local"
              value={value}
              onChange={(event) => {
                const next = [...meetupDrafts];
                next[index] = event.target.value;
                setMeetupDrafts(next);
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setMeetupDrafts(meetupDrafts.filter((_, i) => i !== index))}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setMeetupDrafts([...meetupDrafts, ""])}
        >
          Add meetup
        </Button>
      </div>

      {createMutation.isError ? (
        <p className="font-manrope text-sm text-foreground">
          We could not save this season schedule yet. Please check your details and try again.
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={createMutation.isPending}>
        {createMutation.isPending ? "Saving season..." : "Create season"}
      </Button>
    </form>
  );
}

/**
 * Profile Form Component
 * React Hook Form + Zod validation for profile editing
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ReadingHistoryItem } from "@/lib/api/profile";
import { Button } from "@/components/ui/button";
import { BioEditor } from "./bio-editor";
import { GenreSelector } from "./genre-selector";
import { ReadingHistory } from "./reading-history";

// Zod validation schema
const profileSchema = z.object({
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
  favorite_genres: z.array(z.string()).max(5, "Maximum 5 genres allowed").optional(),
  reading_history: z
    .array(
      z.object({
        title: z.string().min(1, "Title is required"),
        author: z.string().min(1, "Author is required"),
        completed_date: z.string().optional(),
      })
    )
    .max(20, "Maximum 20 books in reading history")
    .optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  defaultValues: {
    bio: string;
    favorite_genres: string[];
    reading_history: ReadingHistoryItem[];
  };
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function ProfileForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues,
    mode: "onChange",
  });

  const watchedBio = watch("bio", defaultValues.bio);
  const watchedGenres = watch("favorite_genres", defaultValues.favorite_genres);
  const watchedHistory = watch("reading_history", defaultValues.reading_history);

  const bioError = errors.bio?.message;
  const genresError = errors.favorite_genres?.message;
  const historyError = errors.reading_history?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Bio Section */}
      <div>
        <h3 className="font-newsreader text-lg text-foreground mb-2">Bio</h3>
        <BioEditor
          value={watchedBio}
          onChange={(value) => setValue("bio", value, { shouldValidate: true })}
          disabled={isSubmitting}
          error={bioError}
        />
      </div>

      {/* Favorite Genres */}
      <div>
        <h3 className="font-newsreader text-lg text-foreground mb-2">
          Favorite Genres (select up to 5)
        </h3>
        <GenreSelector
          selected={watchedGenres}
          onChange={(genres) => setValue("favorite_genres", genres, { shouldValidate: true })}
          disabled={isSubmitting}
          error={genresError}
        />
      </div>

      {/* Reading History */}
      <div>
        <h3 className="font-newsreader text-lg text-foreground mb-2">Reading History</h3>
        <ReadingHistory
          books={watchedHistory}
          onChange={(books) => setValue("reading_history", books, { shouldValidate: true })}
          disabled={isSubmitting}
          error={historyError}
        />
      </div>

      {/* Hidden inputs for form registration */}
      <input type="hidden" {...register("bio")} />
      <input type="hidden" {...register("favorite_genres")} />
      <input type="hidden" {...register("reading_history")} />

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting || !isValid}
        size="lg"
        className="w-full h-12 font-manrope"
      >
        {isSubmitting ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}

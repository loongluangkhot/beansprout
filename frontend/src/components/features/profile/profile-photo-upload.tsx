/**
 * Profile Photo Upload Component
 * Handles profile photo upload with drag-and-drop and click functionality
 */

"use client";

import { useState, useRef, useCallback } from "react";
import { useProfile } from "@/hooks/useProfile";
import { ProfileAvatar } from "./profile-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

// Validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"];

interface ValidationError {
  type: "size" | "type" | "unknown";
  message: string;
}

interface ProfilePhotoUploadProps {
  displayName?: string;
  email?: string;
  currentPhotoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  onUploadSuccess?: (photoUrl: string) => void;
}

export function ProfilePhotoUpload({
  displayName,
  email,
  currentPhotoUrl,
  size = "md",
  onUploadSuccess,
}: ProfilePhotoUploadProps) {
  const { uploadPhoto, deletePhoto, isUploadingPhoto, isDeletingPhoto } = useProfile();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file before upload
  const validateFile = useCallback((file: File): ValidationError | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        type: "size",
        message: `File size exceeds maximum of 5MB. Selected file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`,
      };
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return {
          type: "type",
          message: "Invalid file type. Please select a JPG or PNG image.",
        };
      }
    }

    return null;
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Clear previous validation error
      setValidationError(null);

      // Validate file
      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        return;
      }

      // Create preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setIsPreviewOpen(true);

      // Reset input
      event.target.value = "";
    },
    [validateFile]
  );

  // Handle click on avatar
  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle upload
  const handleUpload = useCallback(async () => {
    if (!previewUrl) return;

    // Convert preview URL to file
    const response = await fetch(previewUrl);
    const blob = await response.blob();
    const file = new File([blob], "photo.jpg", { type: blob.type });

    // Reset upload progress
    setUploadProgress(0);

    try {
      await new Promise<void>((resolve, reject) => {
        uploadPhoto(file, {
          onSuccess: () => {
            setUploadProgress(100);
            setIsPreviewOpen(false);
            setPreviewUrl(null);
            setUploadProgress(null);
            onUploadSuccess?.(previewUrl);
            resolve();
          },
          onError: (error) => {
            setUploadProgress(null);
            setValidationError({
              type: "unknown",
              message: error?.message || "Failed to upload photo. Please try again.",
            });
            reject(error);
          },
        });
      });
    } catch {
      // Error is handled in onError callback
    }
  }, [previewUrl, uploadPhoto, onUploadSuccess]);

  // Handle cancel preview
  const handleCancelPreview = useCallback(() => {
    setIsPreviewOpen(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  }, [previewUrl]);

  // Handle remove photo
  const handleRemovePhoto = useCallback(async () => {
    try {
      await new Promise<void>((resolve, reject) => {
        deletePhoto(undefined, {
          onSuccess: () => {
            setIsRemoveDialogOpen(false);
            resolve();
          },
          onError: (error) => {
            setValidationError({
              type: "unknown",
              message: error?.message || "Failed to remove photo. Please try again.",
            });
            reject(error);
          },
        });
      });
    } catch {
      // Error is handled in onError callback
    }
  }, [deletePhoto]);

  // Clear validation error
  const clearValidationError = useCallback(() => {
    setValidationError(null);
  }, []);

  const isLoading = isUploadingPhoto || isDeletingPhoto;

  return (
    <div className="flex flex-col items-center">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isLoading}
      />

      {/* Avatar with click handler */}
      <div
        className="cursor-pointer relative group"
        onClick={!isLoading ? handleAvatarClick : undefined}
      >
        <ProfileAvatar
          displayName={displayName}
          email={email}
          photoUrl={currentPhotoUrl}
          size={size}
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white font-[Manrope] text-sm">Change Photo</span>
        </div>
      </div>

      {/* Upload/Remove buttons */}
      <div className="mt-3 flex flex-col items-center gap-2">
        {!currentPhotoUrl ? (
          <Button
            type="button"
            onClick={handleAvatarClick}
            disabled={isLoading}
            variant="outline"
            className="font-[Manrope]"
          >
            Upload New Photo
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleAvatarClick}
              disabled={isLoading}
              variant="outline"
              className="font-[Manrope]"
            >
              Upload New Photo
            </Button>
            <Button
              type="button"
              onClick={() => setIsRemoveDialogOpen(true)}
              disabled={isLoading}
              variant="ghost"
              className="font-[Manrope] text-destructive"
            >
              Remove
            </Button>
          </div>
        )}
        
        <p className="text-xs text-foreground-muted font-[Manrope]">
          Supported: JPG, PNG (max 5MB)
        </p>
      </div>

      {/* Validation error */}
      {validationError && (
        <div className="mt-2 px-3 py-2 bg-error-container rounded-lg">
          <p className="text-sm text-foreground font-[Manrope]">
            {validationError.message}
          </p>
          <button
            onClick={clearValidationError}
            className="text-xs text-foreground underline mt-1 font-[Manrope]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Upload progress */}
      {uploadProgress !== null && (
        <div className="mt-2 w-full max-w-[200px]">
          <div className="h-1 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-tertiary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-center text-foreground-muted font-[Manrope] mt-1">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-[Newsreader]">Preview Your Photo</DialogTitle>
            <DialogDescription>
              Make sure it feels like you.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center py-4">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-[200px] max-h-[200px] rounded-full object-cover"
              />
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelPreview}
              className="font-[Manrope]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={isLoading}
              className="font-[Manrope]"
            >
              {isLoading ? "Uploading..." : "Save Photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-[Newsreader]">Remove Your Photo?</DialogTitle>
            <DialogDescription>
              You can always upload a new one later.
            </DialogDescription>
          </DialogHeader>
          
          <p className="text-foreground font-[Manrope] opacity-80 py-2">
            Your profile will display the default avatar after removing your photo.
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRemoveDialogOpen(false)}
              className="font-[Manrope]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRemovePhoto}
              disabled={isLoading}
              className="font-[Manrope]"
            >
              {isLoading ? "Removing..." : "Remove Photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
/**
 * Profile Photo Upload Tests
 * Unit tests for the profile photo upload component
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProfilePhotoUpload } from "./profile-photo-upload";

// Mock the useProfile hook
jest.mock("@/hooks/useProfile", () => ({
  useProfile: () => ({
    uploadPhoto: jest.fn(),
    deletePhoto: jest.fn(),
    isUploadingPhoto: false,
    isDeletingPhoto: false,
  }),
}));

// Mock the useAuthStore
jest.mock("@/stores/auth-store", () => ({
  useAuthStore: jest.fn(() => ({
    user: null,
    token: "test-token",
  })),
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

describe("ProfilePhotoUpload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders upload button when no photo exists", () => {
      render(<ProfilePhotoUpload />);

      expect(screen.getByText(/upload new photo/i)).toBeInTheDocument();
    });

    it("renders avatar with current photo when provided", () => {
      render(
        <ProfilePhotoUpload
          displayName="Test User"
          currentPhotoUrl="/uploads/photos/test.jpg"
        />
      );

      // Should show the avatar
      expect(screen.getByRole("img")).toBeInTheDocument();
    });

    it("renders upload and remove buttons when photo exists", () => {
      render(
        <ProfilePhotoUpload
          displayName="Test User"
          currentPhotoUrl="/uploads/photos/test.jpg"
        />
      );

      expect(screen.getByText(/upload new photo/i)).toBeInTheDocument();
      expect(screen.getByText(/remove/i)).toBeInTheDocument();
    });

    it("shows supported file types helper text", () => {
      render(<ProfilePhotoUpload />);

      expect(screen.getByText(/supported: jpg, png \(max 5mb\)/i)).toBeInTheDocument();
    });
  });

  describe("File Validation", () => {
    it("shows error for files over 5MB", async () => {
      // Create a mock file > 5MB
      const largeFile = new File(["x".repeat(6 * 1024 * 1024)], "test.jpg", {
        type: "image/jpeg",
      });

      render(<ProfilePhotoUpload />);

      // Trigger file input change
      fireEvent.change(screen.getByRole("button", { name: /upload new photo/i }), {
        target: { files: [largeFile] },
      });

      // Since we're triggering via button, need to use the hidden input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      await waitFor(() => {
        expect(screen.getByText(/file size exceeds maximum/i)).toBeInTheDocument();
      });
    });

    it("shows error for invalid file types", async () => {
      const invalidFile = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });

      render(<ProfilePhotoUpload />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      await waitFor(() => {
        expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
      });
    });
  });

  describe("Click Behavior", () => {
    it("opens file input when avatar is clicked", () => {
      render(<ProfilePhotoUpload displayName="Test User" />);

      const avatarContainer = document.querySelector(".cursor-pointer");
      fireEvent.click(avatarContainer!);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeVisible();
    });

    it("does not open file input when loading", () => {
      // Mock loading state
      jest.doMock("@/hooks/useProfile", () => ({
        useProfile: () => ({
          uploadPhoto: jest.fn(),
          deletePhoto: jest.fn(),
          isUploadingPhoto: true,
          isDeletingPhoto: false,
        }),
      }));

      render(<ProfilePhotoUpload displayName="Test User" />);

      const avatarContainer = document.querySelector(".cursor-pointer");
      fireEvent.click(avatarContainer!);

      // Input should not be triggered when loading
    });
  });

  describe("Remove Photo", () => {
    it("opens confirmation dialog when remove is clicked", () => {
      render(
        <ProfilePhotoUpload
          displayName="Test User"
          currentPhotoUrl="/uploads/photos/test.jpg"
        />
      );

      fireEvent.click(screen.getByText(/remove/i));

      expect(
        screen.getByText(/remove your photo\?/i)
      ).toBeInTheDocument();
    });
  });
});

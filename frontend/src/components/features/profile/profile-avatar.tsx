/**
 * Profile Avatar Component
 * Displays user avatar with fallback to initials
 */

"use client";

interface ProfileAvatarProps {
  displayName?: string;
  email: string;
  photoUrl?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-lg",
  lg: "h-20 w-20 text-xl",
};

export function ProfileAvatar({
  displayName,
  email,
  photoUrl,
  size = "md",
}: ProfileAvatarProps) {
  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email.charAt(0).toUpperCase();

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={displayName || email}
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-[#4e6240]/20`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-[#4e6240] text-white font-medium font-[Manrope]`}
    >
      {initials}
    </div>
  );
}
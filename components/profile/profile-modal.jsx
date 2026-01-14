"use client";

import { useEffect, useState } from "react";
import { User, Mail, LogOut, Link2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import ButtonLoader from "../ButtonLoader";

export default function ProfileModal({
  isOpen,
  onClose,
  onLogout,
  user,
  setUser,
}) {
  const [name, setName] = useState(user?.full_name || "not found");
  const [email, setEmail] = useState(user?.email || "not found");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [tempImageUrl, setTempImageUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.picture) {
      setProfileImageUrl(user.picture.replace(/"/g, ""));
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: name, picture: profileImageUrl },
    });

    if (data?.user?.id) {
      setLoading(false);
      setUser(data?.user);
      setIsEditing(false);
      setShowImageUrlInput(false);
      toast.success("Profile updated successfully");
    } else {
      toast.error(error?.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    // Reset to original values in a real app
    setTempImageUrl(profileImageUrl);
    setName(user?.name);
    setIsEditing(false);
    setShowImageUrlInput(false);
    setImageError(false);
  };

  const handleLogout = () => {
    onClose();
    onLogout();
  };

  const handleImageUrlChange = (url) => {
    setTempImageUrl(url);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  const handleSetImageUrl = () => {
    if (tempImageUrl.trim()) {
      // Basic URL validation
      try {
        new URL(tempImageUrl);

        // console.log(tempImageUrl);
        setProfileImageUrl(tempImageUrl);
        setShowImageUrlInput(false);
        // toast.success("Profile picture updated");
      } catch {
        toast.error("Please enter a valid image URL");
      }
    } else {
      toast.error("Please enter an image URL");
    }
  };

  const handleRemoveImage = () => {
    setProfileImageUrl("");
    setTempImageUrl("");
    setShowImageUrlInput(false);
    setImageError(false);
    toast.success("Profile picture removed");
  };

  const getInitials = () => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your personal information."
              : "View and manage your profile."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-20 w-20" key={profileImageUrl ?? "no-img"}>
                {profileImageUrl && !imageError ? (
                  <AvatarImage
                    src={profileImageUrl}
                    alt="Profile"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                ) : (
                  <AvatarFallback className="text-lg border">
                    {getInitials()}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>

            {isEditing && (
              <div className="w-full max-w-sm space-y-3">
                {!showImageUrlInput ? (
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowImageUrlInput(true)}
                    >
                      <Link2 className="mr-2 h-4 w-4" />
                      {profileImageUrl ? "Change Photo" : "Add Photo"}
                    </Button>
                    {profileImageUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl" className="text-sm">
                      Image URL
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="imageUrl"
                        placeholder="https://example.com/image.jpg"
                        value={tempImageUrl}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={handleSetImageUrl}>
                        Set
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowImageUrlInput(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      {profileImageUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveImage}
                          className="flex-1 bg-transparent"
                        >
                          Remove Current
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter a direct link to an image (JPG, PNG, GIF, WebP)
                    </p>
                  </div>
                )}

                {imageError && profileImageUrl && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 text-center bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                    ⚠️ Image failed to load. Showing initials instead.
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Profile Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted/50" : ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  // onChange={(e) => setEmail(e.target.value)}
                  disabled
                  // className={!isEditing ? "bg-muted/50" : ""}
                />
              </div>
            </div>
          </div>

          <Separator />
        </div>

        <DialogFooter className="flex items-center justify-between">
          {isEditing ? (
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={loading}
                onClick={handleSave}
              >
                {loading ? <ButtonLoader /> : "Save Changes"}
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 w-full">
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
              <Button className="flex-1" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

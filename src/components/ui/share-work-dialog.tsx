import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareWorkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShareWorkDialog = ({
  open,
  onOpenChange,
}: ShareWorkDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const { toast } = useToast();

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim()) && tags.length < 10) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImages(prev => [...prev, ...files].slice(0, 5)); // Max 5 images
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your work.",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please add a description for your work.",
        variant: "destructive",
      });
      return;
    }

    if (images.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one image of your work.",
        variant: "destructive",
      });
      return;
    }

    // Here you would normally upload the files and submit the post
    console.log("Submitting work:", { title, description, tags, images });
    
    toast({
      title: "Work shared successfully!",
      description: "Your work has been posted to the community.",
    });

    // Reset form and close dialog
    setTitle("");
    setDescription("");
    setTags([]);
    setCurrentTag("");
    setImages([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Your Work</DialogTitle>
          <DialogDescription>
            Show the community what you've been working on
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Title *
            </Label>
            <Input
              id="title"
              placeholder="Give your work a catchy title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Tell us about your creative process, inspiration, or anything interesting about this work..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 min-h-[80px]"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {description.length}/500 characters
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-sm font-medium">Tags</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add a tag..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                className="flex-1"
                maxLength={20}
              />
              <Button
                type="button"
                onClick={handleAddTag}
                size="sm"
                variant="outline"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    #{tag}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-sm font-medium">Images *</Label>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Click to upload images (max 5)
                </span>
              </label>
              {images.length > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {images.length} image(s) selected
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Share Work</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { reviewAPI } from "@/lib/api";

interface WriteReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productId: string;
  onReviewSubmitted?: (review: any) => void;
}

export const WriteReviewDialog = ({
  open,
  onOpenChange,
  productName,
  productId,
  onReviewSubmitted,
}: WriteReviewDialogProps) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        description:
          "You need to rate this product before submitting your review.",
        variant: "destructive",
      });
      return;
    }

    if (review.trim().length < 10) {
      toast({
        title: "Review too short",
        description: "Please write at least 10 characters for your review.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await reviewAPI.createReview(productId, {
        rating,
        comment: review.trim(),
      });

      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback.",
      });

      // Call the callback to update the reviews list
      if (onReviewSubmitted) {
        onReviewSubmitted(response.data.review);
      }

      // Reset form and close dialog
      setRating(0);
      setReview("");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({
        title: "Failed to submit review",
        description: error.response?.data?.error || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with "{productName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Rating */}
          <div>
            <Label className="text-sm font-medium">Rating</Label>
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 cursor-pointer transition-colors ${
                    i < (hoveredStar || rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300 hover:text-yellow-300"
                  }`}
                  onClick={() => setRating(i + 1)}
                  onMouseEnter={() => setHoveredStar(i + 1)}
                  onMouseLeave={() => setHoveredStar(0)}
                />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 && `${rating} star${rating > 1 ? "s" : ""}`}
              </span>
            </div>
          </div>

          {/* Review Text */}
          <div>
            <Label htmlFor="review" className="text-sm font-medium">
              Your Review
            </Label>
            <Textarea
              id="review"
              placeholder="Tell others about your experience with this product..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="mt-2 min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {review.length}/500 characters
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

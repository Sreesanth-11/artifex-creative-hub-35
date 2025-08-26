import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Heart, Download } from "lucide-react";

interface ProfileHoverCardProps {
  name: string;
  avatar: string;
  bio: string;
  followers: string;
  likes: string;
  downloads: string;
  verified?: boolean;
  isFollowing?: boolean;
  onFollow?: () => void;
  onMessage?: () => void;
}

export const ProfileHoverCard = ({
  name,
  avatar,
  bio,
  followers,
  likes,
  downloads,
  verified = false,
  isFollowing = false,
  onFollow,
  onMessage,
}: ProfileHoverCardProps) => {
  return (
    <Card className="w-80 shadow-lg border-border">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatar} />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{name}</h3>
              {verified && (
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {bio}
            </p>
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{followers}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            <span>{likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            <span>{downloads}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isFollowing ? "outline" : "default"}
            onClick={onFollow}
            className="flex-1"
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>
          <Button size="sm" variant="outline" onClick={onMessage} className="flex-1">
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
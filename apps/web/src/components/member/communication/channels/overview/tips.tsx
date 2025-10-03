import { AtSign, Hash, Keyboard, Shield, Upload, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const ChannelTips = () => {
  const tips = [
    {
      icon: <Keyboard className="h-5 w-5" />,
      title: "Keyboard Shortcuts",
      description: "Press Ctrl+K to quickly search channels and messages",
      badge: "Pro Tip",
    },
    {
      icon: <AtSign className="h-5 w-5" />,
      title: "Mentions",
      description:
        "Use @username to mention someone or @channel for all members",
      badge: "Essential",
    },
    {
      icon: <Hash className="h-5 w-5" />,
      title: "Hashtags",
      description: "Use #topic to categorize messages and make them searchable",
      badge: "Organization",
    },
    {
      icon: <Upload className="h-5 w-5" />,
      title: "File Sharing",
      description: "Drag and drop files directly into the message composer",
      badge: "Quick Share",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Quick Reactions",
      description: "Hover over messages and click the emoji icon to react",
      badge: "Fast Feedback",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Privacy First",
      description: "Private channels are encrypted and only visible to members",
      badge: "Security",
    },
  ];

  return (
    <div>
      <h2 className="mb-4 font-semibold text-2xl">Tips & Best Practices</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {tips.map((tip, index) => (
          <Card
            className="group transition-shadow hover:shadow-md"
            key={index.toString()}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-primary">{tip.icon}</div>
                  <CardTitle className="text-lg">{tip.title}</CardTitle>
                </div>
                <Badge
                  className="text-xs"
                  variant={index === 0 ? "default" : "secondary"}
                >
                  {tip.badge}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{tip.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

import { Clock, Moon, Sun, Sunrise } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { useCurrentTime } from "@/hooks/use-current-time";

export function Greeting() {
  const { user } = useAuthedSession();
  const { formattedTime, timeOfDay, formattedDate } = useCurrentTime();

  const getIcon = () => {
    const greeting = timeOfDay.greeting.toLowerCase();
    if (greeting.includes("morning")) {
      return <Sunrise className="h-7 w-7 text-yellow-500" />;
    }
    if (greeting.includes("afternoon")) {
      return <Sun className="h-7 w-7 text-orange-500" />;
    }
    if (greeting.includes("evening")) {
      return <Moon className="h-7 w-7 text-blue-500" />;
    }
    return <Clock className="h-7 w-7 text-gray-500" />;
  };

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          {getIcon()}
          <div>
            <h2 className="font-bold text-2xl">
              {timeOfDay.greeting}, {user.name}!
            </h2>
            <p className="text-muted-foreground">
              Welcome back. Here's your attendance overview for today.
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-2xl tabular-nums">{formattedTime}</p>
          <p className="text-muted-foreground text-sm">{formattedDate}</p>
        </div>
      </CardContent>
    </Card>
  );
}

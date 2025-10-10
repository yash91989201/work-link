import { Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCurrentTime } from "@/hooks/use-current-time";

export function Greeting() {
  const { formattedTime, timeOfDay, formattedDate } = useCurrentTime();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">
          {timeOfDay.greeting}, Alex! 👋
        </CardTitle>
        <CardDescription>Welcome back to work</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex max-w-md items-start gap-3">
          <Clock className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-medium">{formattedTime}</p>
            <p>{formattedDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

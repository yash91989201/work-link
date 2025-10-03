import { Clock, LogIn, LogOut, MapPin } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AttendanceGreeting() {
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePunchInOut = () => {
    setIsPunchedIn(!isPunchedIn);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="mb-2 font-bold text-2xl">
              Good{" "}
              {new Date().getHours() < 12
                ? "Morning"
                : new Date().getHours() < 18
                  ? "Afternoon"
                  : "Evening"}
              , Alex! 👋
            </h2>
            <div className="flex flex-col gap-4 text-gray-600 text-sm sm:flex-row">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {currentTime}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Office - Main Building
              </div>
            </div>
            <div className="mt-2">
              <Badge variant={isPunchedIn ? "default" : "secondary"}>
                {isPunchedIn ? "Currently Punched In" : "Not Punched In"}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button
              className={`min-w-[140px] ${isPunchedIn ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
              onClick={handlePunchInOut}
              size="lg"
            >
              {isPunchedIn ? (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Punch Out
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Punch In
                </>
              )}
            </Button>

            {isPunchedIn && (
              <div className="text-center text-gray-600 text-sm">
                <div>Punched in at 9:00 AM</div>
                <div className="font-medium">6h 30m worked</div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


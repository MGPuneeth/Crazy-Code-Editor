"use client";

import type React from "react";
import { StarIcon, StarOffIcon } from "lucide-react";
import { useState, useEffect, forwardRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { log } from "console";
import { toggleStarMarked } from "@/modules/dashboard/actions";

interface MarkedToggleButtonProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  markedForRevision: boolean;
  id: string;
}

const starToggle = forwardRef<HTMLButtonElement, MarkedToggleButtonProps>(
  ({ markedForRevision, id, onClick, className, children, ...props }, ref) => {
    const [isMarked, setIsMarked] = useState(markedForRevision ?? false);

    useEffect(() => {
      setIsMarked(markedForRevision);
    }, [markedForRevision]);

    const handleToggle = async (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      console.log("ISMARKED:", isMarked);

      const newMarkedState = !isMarked;
      setIsMarked(newMarkedState);

      console.log("New marked state: ", newMarkedState);
      try {
        const res = await toggleStarMarked(id, newMarkedState);
        console.log(res);

        const { success, error, isMarked: serverMarked } = res;

        console.log(success, error, serverMarked);

        if (serverMarked && !error && success) {
          toast.success("Added to Favourites successfully");
        } else {
          toast.success("Removed from Favourites succcessfully");
        }
      } catch (error) {
        console.log("Failed to toggele mark for revision: ", error);
        setIsMarked(!newMarkedState);
      }
    };

    return (
      <Button
        ref={ref}
        variant="ghost"
        className={`flex items-center juc=stify-start w-full px-2 py-1.5 text-sm rounded-md cursor-pointer ${className}`}
        onClick={handleToggle}
        {...props}
      >
        {isMarked ? (
          <StarIcon size={16} className="text-green-500 mr-2" />
        ) : (
          <StarOffIcon size={16} className="text-gray-500 mr-2" />
        )}
        {children || (isMarked ? "Remove Favourite" : "Add to Favourite")}
      </Button>
    );
  }
);
export default starToggle;

"use client"

import * as React from "react"
import { CheckIcon, MinusIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type CheckedState = boolean | "indeterminate"

type ThreeWayCheckboxProps = React.InputHTMLAttributes<HTMLButtonElement> & {
  checked: CheckedState
  onCheckedChange?: (checked: CheckedState) => void
}

const ThreeWayCheckbox = React.forwardRef<HTMLButtonElement, ThreeWayCheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const handleClick = () => {
      if (onCheckedChange) {
        if (checked === true) onCheckedChange(false)
        else if (checked === false) onCheckedChange("indeterminate")
        else onCheckedChange(true)
      }
    }

    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked === "indeterminate" ? "mixed" : checked}
        ref={ref}
        onClick={handleClick}
        className={cn(
          "h-4 w-4 rounded border border-primary shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
          checked && "bg-primary",
          className,
        )}
        {...props}
      >
        {checked === true && <CheckIcon className="h-3 w-3 text-primary-foreground" />}
        {checked === "indeterminate" && <MinusIcon className="h-3 w-3 text-primary-foreground" />}
      </button>
    )
  },
)
ThreeWayCheckbox.displayName = "ThreeWayCheckbox"

export { ThreeWayCheckbox }

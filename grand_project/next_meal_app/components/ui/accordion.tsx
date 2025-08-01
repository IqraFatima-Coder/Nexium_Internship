"use client";

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionProps {
  children: React.ReactNode;
  type?: "single" | "multiple";
  className?: string;
}

interface AccordionItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

const AccordionContext = React.createContext<{
  openItems: string[];
  toggleItem: (value: string) => void;
}>({
  openItems: [],
  toggleItem: () => {},
});

const AccordionItemContext = React.createContext<{
  value: string;
  isOpen: boolean;
}>({
  value: "",
  isOpen: false,
});

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, children, type = "single", ...props }, ref) => {
    const [openItems, setOpenItems] = React.useState<string[]>([]);

    const toggleItem = (value: string) => {
      if (type === "single") {
        setOpenItems(openItems.includes(value) ? [] : [value]);
      } else {
        setOpenItems(
          openItems.includes(value)
            ? openItems.filter(item => item !== value)
            : [...openItems, value]
        );
      }
    };

    return (
      <AccordionContext.Provider value={{ openItems, toggleItem }}>
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);
Accordion.displayName = "Accordion";

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, children, value, ...props }, ref) => {
    const { openItems } = React.useContext(AccordionContext);
    const isOpen = openItems.includes(value);

    return (
      <AccordionItemContext.Provider value={{ value, isOpen }}>
        <div
          ref={ref}
          className={cn("border-b", className)}
          {...props}
        >
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  }
);
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { toggleItem } = React.useContext(AccordionContext);
    const { value, isOpen } = React.useContext(AccordionItemContext);

    return (
      <div className="flex">
        <button
          ref={ref}
          className={cn(
            "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline text-left",
            className
          )}
          onClick={() => toggleItem(value)}
          {...props}
        >
          {children}
          <ChevronDown 
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
      </div>
    );
  }
);
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen } = React.useContext(AccordionItemContext);

    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}
        {...props}
      >
        <div className={cn("pb-4 pt-0", className)}>{children}</div>
      </div>
    );
  }
);
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

import { cn } from "@/lib/cn";

type LogoProps = {
  className?: string;
};

export function Logo({ className = "h-12 w-12" }: LogoProps) {
  return (
    <img
      src="/brand/slimplay-mark.png"
      alt="Slim Play"
      width={1000}
      height={1000}
      className={cn("object-contain", className)}
    />
  );
}

// Minimal line icons (1.6px), currentColor by default.
import type { SVGProps, ReactNode } from "react";

export type IconProps = Omit<SVGProps<SVGSVGElement>, "color"> & {
  size?: number;
  color?: string;
  strokeWidth?: number;
  children?: ReactNode;
};

const Icon = ({
  children,
  size = 20,
  className = "",
  color = "currentColor",
  strokeWidth = 1.6,
  ...rest
}: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

export const IconChevronDown = (p: IconProps) => <Icon {...p}><path d="M6 9l6 6 6-6" /></Icon>;
export const IconChevronLeft = (p: IconProps) => <Icon {...p}><path d="M15 6l-6 6 6 6" /></Icon>;
export const IconSearch = (p: IconProps) => (
  <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Icon>
);
export const IconArrowRight = (p: IconProps) => (
  <Icon {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
);
export const IconCheck = (p: IconProps) => <Icon {...p}><path d="M5 12l5 5L20 7" /></Icon>;
export const IconEye = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);
export const IconEyeOff = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 3l18 18" />
    <path d="M10.6 6.1A10 10 0 0 1 12 6c6.5 0 10 7 10 7a17 17 0 0 1-3.4 4.2" />
    <path d="M6.1 6.1A17 17 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 4-.8" />
  </Icon>
);
export const IconLock = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Icon>
);
export const IconMail = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 7 9-7" />
  </Icon>
);
export const IconUser = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Icon>
);
export const IconPhone = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </Icon>
);

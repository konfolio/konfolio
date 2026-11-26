// components/icons/CalendarIcon.tsx
type Props = {
  className?: string;
  color?: string;
  strokeWidth?: number;
};

export default function CalendarIcon({
  className = "",
  color = "currentColor",
  strokeWidth = 1,
}: Props) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2.5H13C13.2761 2.5 13.5 2.72386 13.5 3V13C13.5 13.2761 13.2761 13.5 13 13.5H3C2.72386 13.5 2.5 13.2761 2.5 13V3C2.5 2.72386 2.72386 2.5 3 2.5Z" />
        <path d="M11 1.5V3.5" />
        <path d="M5 1.5V3.5" />
        <path d="M2.5 5.5H13.5" />
      </g>
    </svg>
  );
}
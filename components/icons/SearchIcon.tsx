type Props = { className?: string }

export default function SearchIcon({ className = "" }: Props) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circle — 15x15 */}
      <circle
        cx="10.5"
        cy="10.5"
        r="7.5"
        stroke="#A5A5A5"
        strokeWidth="1.5"
      />

      {/* Shortened handle */}
      <path
        d="M16.2 16.2L20.4 20.4"
        stroke="#A5A5A5"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

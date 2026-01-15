type Props = {
    className?: string
}
  
export default function DeleteIcon({ className = "" }: Props) {
    return (
      <svg
        width="9"
        height="9"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M12.5 3.5L3.5 12.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.5 12.5L3.5 3.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
}
  
type Props = {
    className?: string
}
  
export default function ArrowDown({ className = "" }: Props) {
    return (
      <svg
        width="11"
        height="6"
        viewBox="0 0 11 6"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <path
          d="M10.5 0.5L5.5 5.5L0.5 0.5"
          stroke="#A5A5A5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
}
  
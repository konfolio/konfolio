type Props = {
    className?: string
}
  
export default function CheckIcon({ className = "" }: Props) {
    return (
      <svg
        width="12"
        height="8"
        viewBox="0 0 12 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M0.5 4.4375L3.5625 7.5L10.5625 0.5"
          stroke="#262626"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
}
  
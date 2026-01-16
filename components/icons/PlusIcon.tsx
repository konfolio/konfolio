type Props = {
    className?: string
}
  
export default function PlusIcon({ className = "" }: Props) {
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M0.922852 6.00014H11.0767M5.99977 1.00012V11.154"
          stroke="currentColor"
          strokeWidth="0.923077"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
}
  
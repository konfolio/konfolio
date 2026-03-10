type Props = {
  className?: string
}

export default function ArrowRightIcon({ className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M1.08331 6.5H11.9166"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.58331 2.16675L11.9166 6.50008L7.58331 10.8334"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
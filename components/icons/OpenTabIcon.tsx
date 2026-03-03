type Props = {
  className?: string
}

export default function OpenTabIcon({ className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10.9688 5.28125L10.9682 2.03176L7.71875 2.03125"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.90625 6.09375L10.9688 2.03125"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.34375 6.90625V10.5625C9.34375 10.6702 9.30095 10.7736 9.22476 10.8498C9.14858 10.9259 9.04524 10.9688 8.9375 10.9688H2.4375C2.32976 10.9688 2.22642 10.9259 2.15024 10.8498C2.07405 10.7736 2.03125 10.6702 2.03125 10.5625V4.0625C2.03125 3.95476 2.07405 3.85142 2.15024 3.77524C2.22642 3.69905 2.32976 3.65625 2.4375 3.65625H6.09375"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
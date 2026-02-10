// components/icons/PencilIcon.tsx
type Props = {
  className?: string
}

export default function PencilIcon({ className = "" }: Props) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_679_2838)">
        <path
          d="M5.79313 13.5H3C2.86739 13.5 2.74021 13.4473 2.64645 13.3535C2.55268 13.2598 2.5 13.1326 2.5 13V10.2069C2.50006 10.0744 2.55266 9.94743 2.64625 9.85374L10.3538 2.14624C10.4475 2.05254 10.5746 1.99991 10.7072 1.99991C10.8397 1.99991 10.9669 2.05254 11.0606 2.14624L13.8538 4.93749C13.9474 5.03125 14.0001 5.15837 14.0001 5.29093C14.0001 5.42348 13.9474 5.55061 13.8538 5.64436L6.14625 13.3537C6.05255 13.4473 5.92556 13.4999 5.79313 13.5Z"
          stroke="#262626"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 4L12 7.5"
          stroke="#262626"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.25 5.75L4.25 11.75"
          stroke="#262626"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.96848 13.4681L2.53223 10.0319"
          stroke="#262626"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_679_2838">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

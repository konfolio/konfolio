type Props = {
    className?: string
}
  
export default function ImageIcon({ className }: Props) {
    return (
      <svg
        width="39"
        height="39"
        viewBox="0 0 39 39"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M37.5 0C38.3284 0 39 0.671573 39 1.5V37.5C39 38.3284 38.3284 39 37.5 39H1.5C0.671574 39 0 38.3284 0 37.5V1.5C0 0.671574 0.671573 0 1.5 0H37.5ZM11.0934 14.5166L4.33327 25.3785V34.6666H34.6666V26.8883L28.1666 20.3883L21.515 27.04L11.0934 14.5166ZM24.9166 8.66663C23.1217 8.66663 21.6666 10.1217 21.6666 11.9166C21.6666 13.7115 23.1217 15.1666 24.9166 15.1666C26.7115 15.1666 28.1666 13.7115 28.1666 11.9166C28.1666 10.1217 26.7115 8.66663 24.9166 8.66663Z"
          fill="currentColor"
        />
      </svg>
    )
}
  
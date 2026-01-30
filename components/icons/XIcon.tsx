type Props = {
    className?: string
}
  
export default function XIcon({ className = "text-[#262626]" }: Props) {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M17.6868 3.06299L12.6908 8.77399L8.37082 3.06299H2.11182L9.58882 12.839L2.50282 20.938H5.53682L11.0058 14.688L15.7858 20.938H21.8878L14.0938 10.634L20.7188 3.06299H17.6868ZM16.6228 19.123L5.65382 4.78199H7.45682L18.3028 19.122L16.6228 19.123Z"
          fill="currentColor"
        />
      </svg>
    )
}
  
type Props = {
    className?: string
}
  
export default function PopoverArrow({ className = "" }: Props) {
    return (
      <svg
        width="27"
        height="8"
        viewBox="0 0 27 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M6.86061 6.55743L12.4459 1.04104C13.0302 0.464009 13.9698 0.464008 14.5541 1.04104L20.1394 6.55742C21.0752 7.48171 22.3376 8 23.6529 8H3.3471C4.66243 8 5.92477 7.48171 6.86061 6.55743Z"
          fill="white"
        />
      </svg>
    )
}
  
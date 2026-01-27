type Props = {
    className?: string
    title?: string
}
  
export default function ZoomInIcon({ className = "", title }: Props) {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden={title ? undefined : true}
        role={title ? "img" : "presentation"}
      >
        {title ? <title>{title}</title> : null}
        <path d="M5 7H9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M7 12C9.76142 12 12 9.76142 12 7C12 4.23858 9.76142 2 7 2C4.23858 2 2 4.23858 2 7C2 9.76142 4.23858 12 7 12Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M10.5356 10.5356L14 14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 5V9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
}
  
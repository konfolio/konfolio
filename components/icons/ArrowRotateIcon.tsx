type Props = {
    className?: string
    title?: string
}
  
export default function ArrowRotateIcon({ className = "", title }: Props) {
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
        <path d="M10.5 6H13.5V3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M13.5 5.99998L11.7325 4.23248C10.7089 3.20892 9.32304 2.63016 7.87549 2.62174C6.42795 2.61331 5.03545 3.1759 4 4.18748"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M5.5 10H2.5V13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M2.5 10L4.2675 11.7675C5.2911 12.7911 6.67696 13.3698 8.12451 13.3782C9.57205 13.3867 10.9646 12.8241 12 11.8125"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
}
  
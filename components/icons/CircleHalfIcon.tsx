type Props = {
    className?: string
    title?: string
}
  
export default function CircleHalfIcon({ className = "", title }: Props) {
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
        <path
          d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M8 2V14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 3.52814V12.4719" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 2.34192V13.6582" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
}
  
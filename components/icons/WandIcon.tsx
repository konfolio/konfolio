type Props = {
    className?: string
    title?: string
}
  
export default function WandIcon({ className = "", title }: Props) {
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
        <path d="M13.5 8V11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 9.5H15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 2.5V5.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.5 4H6.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.5 11.5V13.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.5 12.5H11.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 5L11 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M11.3532 2.64634L2.64603 11.3535C2.45077 11.5487 2.45077 11.8653 2.64603 12.0606L3.93871 13.3533C4.13398 13.5485 4.45056 13.5485 4.64582 13.3533L13.353 4.64613C13.5482 4.45087 13.5482 4.13428 13.353 3.93902L12.0603 2.64634C11.865 2.45108 11.5484 2.45108 11.3532 2.64634Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
}
  
type Props = {
    className?: string
    title?: string
}
  
export default function ThermometerIcon({ className = "", title }: Props) {
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
        <path d="M8 10V5.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M8 13C8.82843 13 9.5 12.3284 9.5 11.5C9.5 10.6716 8.82843 10 8 10C7.17157 10 6.5 10.6716 6.5 11.5C6.5 12.3284 7.17157 13 8 13Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 3C6 2.46957 6.21071 1.96086 6.58579 1.58579C6.96086 1.21071 7.46957 1 8 1C8.53043 1 9.03914 1.21071 9.41421 1.58579C9.78929 1.96086 10 2.46957 10 3V8.625C10.6115 9.05079 11.0711 9.66062 11.312 10.3657C11.5529 11.0708 11.5625 11.8344 11.3394 12.5454C11.1163 13.2563 10.672 13.8775 10.0714 14.3185C9.47081 14.7595 8.74513 14.9973 8 14.9973C7.25487 14.9973 6.52919 14.7595 5.92857 14.3185C5.32795 13.8775 4.88375 13.2563 4.66061 12.5454C4.43748 11.8344 4.44706 11.0708 4.68796 10.3657C4.92886 9.66062 5.38851 9.05079 6 8.625V3Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
}
  
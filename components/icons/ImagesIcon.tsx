type Props = {
    className?: string
    title?: string
}
  
export default function ImagesIcon({ className = "", title }: Props) {
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
          d="M13.5 3H4.5C4.22386 3 4 3.22386 4 3.5V10.5C4 10.7761 4.22386 11 4.5 11H13.5C13.7761 11 14 10.7761 14 10.5V3.5C14 3.22386 13.7761 3 13.5 3Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.75 6C11.1642 6 11.5 5.66421 11.5 5.25C11.5 4.83579 11.1642 4.5 10.75 4.5C10.3358 4.5 10 4.83579 10 5.25C10 5.66421 10.3358 6 10.75 6Z"
          fill="currentColor"
        />
        <path
          d="M4 8.04315L6.39625 5.64628C6.44269 5.59979 6.49783 5.56291 6.55853 5.53775C6.61923 5.51259 6.68429 5.49963 6.75 5.49963C6.81571 5.49963 6.88077 5.51259 6.94147 5.53775C7.00217 5.56291 7.05731 5.59979 7.10375 5.64628L10.2069 8.75003L11.8125 7.14628C11.9063 7.05258 12.0334 6.99995 12.1659 6.99995C12.2985 6.99995 12.4256 7.05258 12.5194 7.14628L14 8.62878"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 11V12.5C12 12.6326 11.9473 12.7598 11.8536 12.8536C11.7598 12.9473 11.6326 13 11.5 13H2.5C2.36739 13 2.24021 12.9473 2.14645 12.8536C2.05268 12.7598 2 12.6326 2 12.5V5.5C2 5.36739 2.05268 5.24021 2.14645 5.14645C2.24021 5.05268 2.36739 5 2.5 5H4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
}
  
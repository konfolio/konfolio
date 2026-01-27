type Props = {
    className?: string
    title?: string
}
  
export default function RevertIcon({ className = "", title }: Props) {
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
        <path d="M1.5 3.5V6.5H4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M4.22437 12C5.01055 12.742 5.99793 13.2358 7.06316 13.4198C8.12838 13.6038 9.22422 13.4698 10.2137 13.0346C11.2033 12.5994 12.0426 11.8822 12.6268 10.9727C13.2111 10.0632 13.5144 9.00166 13.4988 7.92077C13.4832 6.83988 13.1494 5.78755 12.5392 4.89526C11.929 4.00297 11.0693 3.3103 10.0677 2.90378C9.06601 2.49726 7.96677 2.39493 6.90729 2.60957C5.84781 2.82421 4.87508 3.34631 4.11062 4.11062L1.5 6.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
}
  
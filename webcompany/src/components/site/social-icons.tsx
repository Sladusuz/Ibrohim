type IconProps = { className?: string };

export function TelegramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.94 4.4a1.4 1.4 0 0 0-1.46-.2L2.6 11.16a1.35 1.35 0 0 0 .1 2.53l4.53 1.47 1.74 5.6c.2.62.9.86 1.42.47l2.6-1.98 4.47 3.3c.63.47 1.53.13 1.7-.63l3.63-16.6a1.4 1.4 0 0 0-.79-1.52ZM9.3 14.02l8.4-6.9c.2-.16.44.1.26.28l-6.9 6.8c-.29.28-.47.65-.52 1.05l-.28 2.2-1-3.05a1.35 1.35 0 0 1 .04-.38Z" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedInIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9.5h4V21H3zM9.5 9.5H13v1.57h.05c.5-.9 1.7-1.85 3.5-1.85 3.75 0 4.45 2.35 4.45 5.4V21h-4v-5.4c0-1.29-.02-2.94-1.8-2.94-1.8 0-2.08 1.4-2.08 2.85V21h-4z" />
    </svg>
  );
}

export function GitHubIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.48 2 2 6.58 2 12.2c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.36-3.37-1.36-.46-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.64-1.37-2.22-.26-4.56-1.13-4.56-5.03 0-1.11.39-2.02 1.03-2.73-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.4 9.4 0 0 1 5 0c1.9-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.71 1.03 1.62 1.03 2.73 0 3.91-2.34 4.76-4.57 5.02.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.2C22 6.58 17.52 2 12 2Z"
      />
    </svg>
  );
}

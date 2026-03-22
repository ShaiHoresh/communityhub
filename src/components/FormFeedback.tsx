type Props = { message?: string };

export function FormError({ message }: Props) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
      {message}
    </p>
  );
}

export function FormSuccess({ message }: Props) {
  if (!message) return null;
  return (
    <p className="text-sm font-medium text-green-700 dark:text-green-400">
      {message}
    </p>
  );
}

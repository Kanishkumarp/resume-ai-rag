interface UploadButtonProps {
  onClick: () => void;
  disabled: boolean;
  label: string;
}

export function UploadButton({ onClick, disabled, label }: UploadButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
    </button>
  );
}

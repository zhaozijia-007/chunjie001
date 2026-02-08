type PrimaryButtonProps = {
  label: string
  onClick?: () => void
  disabled?: boolean
}

function PrimaryButton({ label, onClick, disabled }: PrimaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl bg-ink-red-600 px-6 py-4 text-base font-semibold text-white shadow-[0_18px_30px_rgba(196,30,58,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_36px_rgba(196,30,58,0.45)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-[0_18px_30px_rgba(196,30,58,0.4)]"
    >
      {label}
    </button>
  )
}

export default PrimaryButton

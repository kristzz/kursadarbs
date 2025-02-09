interface SwitchProps {
    isOn: boolean;
    onToggle: () => void;
    ariaLabel: string;
}

export const Switch = ({ isOn, onToggle, ariaLabel }: SwitchProps) => {
    return (
        <button
            role="switch"
            aria-checked={isOn}
            aria-label={ariaLabel}
            onClick={onToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primaryc focus:ring-offset-2 focus:ring-offset-backgroundc ${
                isOn ? 'bg-primaryc' : 'bg-textc/20'
            }`}
        >
            <span
                className={`${
                    isOn ? 'translate-x-6 bg-textc' : 'translate-x-1 bg-textc/60'
                } inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ease-in-out`}
            />
            <span className="absolute left-7">
                {isOn && (
                    <svg
                        className="h-3 w-3 text-textc"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                )}
            </span>
        </button>
    );
}; 
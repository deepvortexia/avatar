interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function PromptInput({ value, onChange, disabled }: PromptInputProps) {
  return (
    <div className="mb-6">
      <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-300 mb-2">
        Describe your image
      </label>
      <textarea
        id="prompt-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Describe the image you want to create..."
        disabled={disabled}
        rows={4}
        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors resize-none"
      />
    </div>
  );
}

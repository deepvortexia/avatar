import { StyleSuggestion } from "@/types";

interface StyleSuggestionsProps {
  onSelect: (style: string) => void;
}

const styles: StyleSuggestion[] = [
  { emoji: "✨", label: "Photorealistic", value: "photorealistic, highly detailed" },
  { emoji: "🎨", label: "Digital Art", value: "digital art, vibrant colors" },
  { emoji: "🌟", label: "Cinematic", value: "cinematic lighting, dramatic" },
  { emoji: "🔮", label: "Fantasy", value: "fantasy art, magical" },
  { emoji: "💎", label: "3D Render", value: "3D render, octane render" },
  { emoji: "🌈", label: "Vibrant", value: "vibrant, colorful, energetic" },
  { emoji: "🖤", label: "Dark & Moody", value: "dark, moody, atmospheric" },
  { emoji: "🌸", label: "Soft & Dreamy", value: "soft, dreamy, pastel colors" },
];

export default function StyleSuggestions({ onSelect }: StyleSuggestionsProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Popular Styles
      </label>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {styles.map((style) => (
          <button
            key={style.label}
            onClick={() => onSelect(style.value)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg hover:border-yellow-400 transition-colors whitespace-nowrap"
          >
            <span>{style.emoji}</span>
            <span>{style.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

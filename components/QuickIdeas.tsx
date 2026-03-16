import { QuickIdea } from "@/types";

interface QuickIdeasProps {
  onSelect: (prompt: string) => void;
}

const ideas: QuickIdea[] = [
  { emoji: "🏔️", label: "Landscape", prompt: "Mountain sunset golden light" },
  { emoji: "👤", label: "Portrait", prompt: "Cinematic portrait dramatic lighting" },
  { emoji: "🎭", label: "Abstract", prompt: "Colorful abstract fluid art" },
  { emoji: "🏙️", label: "Cyberpunk", prompt: "Neon cyberpunk city night" },
  { emoji: "🌌", label: "Space", prompt: "Nebula stars deep space" },
  { emoji: "🐾", label: "Animals", prompt: "Majestic lion wild savanna" },
  { emoji: "🍕", label: "Food", prompt: "Gourmet dish food photography" },
  { emoji: "🏠", label: "Interior", prompt: "Modern luxury interior design" },
];

export default function QuickIdeas({ onSelect }: QuickIdeasProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Quick Ideas
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {ideas.map((idea) => (
          <button
            key={idea.label}
            onClick={() => onSelect(idea.prompt)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg hover:border-yellow-400 transition-colors"
          >
            <span>{idea.emoji}</span>
            <span>{idea.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

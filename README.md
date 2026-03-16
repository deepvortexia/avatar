# AI Image Generator 🎨

AI-powered image generation tool using Replicate's `google/imagen-4-fast` model.

## Features

- ✨ Generate stunning images from text descriptions
- 🎁 **2 FREE generations** for non-logged users (no account required!)
- 💰 Gold animated logo and credit system
- 🎯 Multiple aspect ratio options (1:1, 4:3, 16:9, 9:16)
- 🎨 Popular style suggestions
- 💡 Quick idea templates
- ⬇️ Download generated images
- 🔐 Sign in for unlimited generations
- 🌟 Clean, modern UI matching Deep Vortex AI design
- 🔗 Connected to Deep Vortex AI ecosystem

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Model**: Replicate Imagen-4-Fast
- **API**: Replicate SDK

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Replicate API token

### Installation

1. Clone the repository:
```bash
git clone https://github.com/deepvortexia/deepvortexia-image-generator.git
cd deepvortexia-image-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
REPLICATE_API_TOKEN=your_replicate_api_token_here
NEXT_PUBLIC_HUB_URL=https://deepvortexai.art
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### For Non-Logged Users (FREE)

1. Visit the site - you automatically get **2 free generations**!
2. Enter a description of the image you want to create
3. Select an aspect ratio (default: 1:1)
4. Optionally, add style suggestions or use quick ideas
5. Click "Generate Image" - your first free generation is used
6. Download your generated image
7. Generate a second image with your remaining free generation
8. After 2 generations, sign in for unlimited access!

### For Logged-In Users

1. Sign in to get access to your credit balance
2. Generate unlimited images using your credits
3. Buy more credits as needed

## Free Generations System

- **Non-logged users**: 2 free generations (tracked in browser localStorage)
- **Visual indicators**: 
  - 🎁 icon shows remaining free generations
  - 💰 gold icon shows credit balance for logged users
- **After free generations**: Prompted to sign in for unlimited access
- **Sign In button**: Redirects to `https://deepvortexai.art/login`

## API

The application uses Replicate's Imagen-4-Fast model:
- **Model**: `google/imagen-4-fast`
- **Cost**: $0.02 per image
- **Speed**: 2-3 seconds per generation

## Deployment

This project is designed to be deployed on Vercel:

```bash
npm run build
```

### Environment Variables

Required for deployment:
- `REPLICATE_API_TOKEN`: Your Replicate API token
- `NEXT_PUBLIC_HUB_URL`: URL to Deep Vortex AI hub

## License

MIT

## Credits

Built with ❤️ by [Deep Vortex AI](https://deepvortexai.art)

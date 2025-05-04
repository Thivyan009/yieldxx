# DeFi Yield Tracker

A modern web application built with Next.js for tracking DeFi yield opportunities across various platforms and chains.

## Features

- Real-time yield data from DeFiLlama
- Filter by platforms, chains, and tokens
- Sort by APY, TVL, and other metrics
- User authentication
- Watchlist functionality
- Dark mode support
- Mobile responsive design

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or pnpm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Create a `.env.local` file in the root directory with the following content:
   ```
   DEFILLAMA_API_KEY=your_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Get your DeFiLlama API key and add it to `.env.local`

### Development

Run the development server:

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) - UI components
- [DeFiLlama API](https://defillama.com/docs/api) - Yield data

## Project Structure

- `/app` - Next.js app router pages and API routes
- `/components` - Reusable UI components
- `/contexts` - React context providers
- `/hooks` - Custom React hooks
- `/lib` - Utility functions and API clients
- `/public` - Static assets
- `/styles` - Global styles and Tailwind config
- `/types` - TypeScript type definitions 
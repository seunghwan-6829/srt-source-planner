import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        typeIllustration: '#2563eb',
        typePhoto: '#16a34a',
        typeReal: '#ea580c',
      },
    },
  },
  plugins: [],
}
export default config

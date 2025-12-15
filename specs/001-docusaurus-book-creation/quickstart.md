# Quickstart Guide: Physical AI & Humanoid Robotics Textbook

## Prerequisites
- Node.js v18 or higher
- npm or yarn package manager
- Git

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Open your browser**
   Visit `http://localhost:3000` to view the textbook

## Project Structure
- `docs/` - Contains all textbook content in Markdown format
- `src/` - Custom React components and styling
- `docusaurus.config.js` - Main configuration file
- `sidebars.js` - Navigation structure

## Adding New Content
1. Create a new Markdown file in the appropriate module directory under `docs/`
2. Add the file path to `sidebars.js` to make it appear in the navigation
3. Use standard Markdown syntax with Docusaurus-specific extensions

## Building for Production
```bash
npm run build
# or
yarn build
```

The build output will be in the `build/` directory and can be deployed to GitHub Pages.

## Deployment to GitHub Pages
The site is configured to deploy automatically via GitHub Actions when changes are pushed to the main branch. Alternatively, you can manually deploy using:
```bash
npm run deploy
# or
yarn deploy
```
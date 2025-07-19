# Carbon Intensity App

This project is a Vite + React application that visualizes UK carbon intensity data. The application is built with TypeScript and Tailwind CSS.

## Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

## Deployment

The project includes a GitHub Actions workflow that builds the app and deploys it to **GitHub Pages** whenever changes are pushed to the `main` branch. The built files are served from the `dist` directory with the base path set to `/carbon-intensity-app/`.

To manually trigger a deployment, you can also run the workflow from the GitHub Actions tab.

# Carbon Intensity App

This project is a Vite + React application that visualizes UK carbon intensity data. The application is built with TypeScript and Tailwind CSS.

## Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

## Deployment

The project includes a GitHub Actions workflow that builds the app and pushes the output to the `gh-pages` branch whenever changes are pushed to the `main` branch. Configure GitHub Pages to serve from this branch. The built files are served from the `dist` directory with the base path set to `/carbon-intensity-app/`.

To manually trigger a deployment, you can also run the workflow from the GitHub Actions tab.

## Pull Request Previews

When a pull request is opened, a GitHub Actions workflow builds the branch and deploys it to the `gh-pages` branch under `pr-<number>`. The workflow comments on the PR with a link to view the preview.

## Historical Data

The dashboard now includes a **Past 24 Hours** chart showing recent carbon intensity trends. Data is fetched from the National Grid ESO Carbon Intensity API using the `/intensity/{from}/{to}` endpoint.

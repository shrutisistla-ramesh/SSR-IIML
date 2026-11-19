# Taskflow — Task Manager

A lightweight task manager built with **Next.js 14, React, and TypeScript**. It is ready to push to GitHub and deploy on Vercel.

## Features

- Create, edit, and delete tasks
- Set start dates, due dates, priority, and an initial progress percentage
- Update progress with an interactive slider
- Automatically sync status to Not started, In progress, or Completed
- Dashboard summary for total, active, completed, and overdue tasks
- Search and filter tasks
- Responsive layout for desktop and mobile
- Automatically saves tasks in the browser using localStorage

## Run locally

1. Install Node.js 18.17 or newer.
2. Open a terminal in this folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open http://localhost:3000.

To create a production build:

```bash
npm run build
npm start
```

## Deploy with GitHub + Vercel

1. Create a new repository on GitHub.
2. Extract this ZIP file and place the project files in the repository.
3. Commit and push the files:

   ```bash
   git init
   git add .
   git commit -m "Initial Taskflow app"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
   git push -u origin main
   ```

4. Sign in to [Vercel](https://vercel.com) using GitHub.
5. Choose **Add New → Project**, import your repository, and keep the detected Next.js settings.
6. Click **Deploy**. Vercel will build and host the app. Future pushes to the connected branch trigger deployments automatically.

## Important: where your data is stored

This starter version stores tasks in **localStorage in the browser**. That means:
- Tasks remain after refreshes on the same browser and device.
- Data is not shared between devices or different browsers.
- There is no user login, cloud database, or automatic cross-device sync.
- Clearing browser site data can remove saved tasks.

For a multi-user or cross-device app, connect a database such as Supabase and add authentication before using it for important data.

## Project structure

```text
taskflow-task-manager/
├── app/
│   ├── globals.css    # App styling and responsive layout
│   ├── layout.tsx     # Root layout and metadata
│   └── page.tsx       # Task manager UI and functionality
├── .gitignore
├── next.config.mjs
├── package.json
├── tsconfig.json
└── vercel.json
```

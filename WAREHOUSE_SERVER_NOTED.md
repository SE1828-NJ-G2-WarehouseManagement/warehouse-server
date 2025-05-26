# Express Backend Project

## Overview

This project is an Express.js backend structured for scalability and maintainability using:

- ES6 module syntax (`import` / `export`)
- Modular feature-based folder structure
- Environment variables management with `dotenv`
- Nodemon for development server auto-reload
- Configuration and constants separated in dedicated folders

---

## Table of Contents

- [Project Setup](#project-setup)
- [Folder Structure](#folder-structure)
- [Key Files Explanation](#key-files-explanation)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Nodemon Configuration](#nodemon-configuration)
- [Starting the Server](#starting-the-server)
- [Adding New Modules](#adding-new-modules)
- [Troubleshooting](#troubleshooting)

---

## Project Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/SE1828-NJ-G2-WarehouseManagement/warehouse-server.git
   cd warehouse-server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create your local `.env` file from the example:

   - On **Linux/macOS**:

     ```bash
     cp .env.example .env
     ```

   - On **Windows (PowerShell)**:

     ```powershell
     copy .env.example .env
     ```

   - Or manually create a `.env` file in the project root and add the required environment variables.

---

## Folder Structure

```
src/
│
├── config/            # Configuration files (database, rate limiter, etc.)
│   ├── database.js
│   ├── limiter.js
│   └── ...
│
├── constants/         # App-wide constants (status codes, messages, etc.)
│   └── index.js
│
├── modules/           # Feature modules organized by domain
│   ├── user/
│   │   ├── user.controller.js
│   │   ├── user.service.js
│   │   ├── user.route.js
│   │   ├── user.model.js
│   │   └── user.middleware.js
│   └── ...            # other modules (product, order, etc.)
│
├── routes/            # Main routes aggregating all module routes
│   └── index.js
│
├── index.js           # Express app initialization and middleware setup
├── server.js          # Server entry point that imports app and starts listening
└── ...
```

---

## Key Files Explanation

- **`index.js`**  
  Creates and configures the Express application, sets up middleware, and mounts routes.

- **`server.js`**  
  Imports the Express app and starts the HTTP server on the defined port.

- **`modules/<moduleName>/`**  
  Contains all feature-specific files:  
  - **controller:** handles HTTP requests and responses  
  - **service:** business logic and data interaction  
  - **route:** defines module API routes  
  - **model:** database schemas/models  
  - **middleware:** module-specific middleware

- **`config/`**  
  Central place for configuration such as database connection, rate limiting, etc.

- **`constants/`**  
  Contains app-wide constants for reuse and maintainability.

---

## Environment Variables

Create a `.env` file in the root folder with:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/your_database
JWT_SECRET=your_jwt_secret
```

> **Note:** `.env` is listed in `.gitignore` to avoid pushing secrets to version control.

---

## Available Scripts

```json
"scripts": {
  "dev": "nodemon"
}
```

- `npm run dev` — runs the server with nodemon for auto-reload on code changes.

---

## Nodemon Configuration (`nodemon.json`)

```json
{
  "watch": ["src"],
  "ext": "js,json",
  "exec": "node --experimental-specifier-resolution=node src/server.js"
}
```

- Watches `src` folder for changes to `.js` and `.json` files.
- Runs the server with ES module support without needing `.js` extensions on imports.

---

## Starting the Server

Run the development server:

```bash
npm run dev
```

Server starts on the port specified in `.env` or defaults to `3000`.

Access the server at: `http://localhost:<PORT>`

---

## Adding New Modules

To add a new feature/module:

1. Create a folder in `src/modules/<moduleName>/`
2. Add files:  
   - `<moduleName>.controller.js`  
   - `<moduleName>.service.js`  
   - `<moduleName>.route.js`  
   - `<moduleName>.model.js`  
   - `<moduleName>.middleware.js` (optional)
3. Export the router in `<moduleName>.route.js`
4. Import and mount the module route in `src/routes/index.js`:

```js
import express from 'express';
import userRoutes from '../modules/user/user.route.js';

const router = express.Router();

router.use('/users', userRoutes);

export default router;
```

---

## Troubleshooting

- **Missing `.js` extensions on imports?**  
  Use `"type": "module"` in `package.json` and start node with  
  `--experimental-specifier-resolution=node` flag.

- **Server not restarting on file changes?**  
  Check `nodemon.json` settings for `watch` paths and `ext` file extensions.

- **Database connection fails?**  
  Verify your `MONGO_URI` in `.env` and config files.

---

If you need help or have questions, feel free to reach out!

---

*Happy coding!* 🚀

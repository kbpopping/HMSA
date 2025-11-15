# Quick Start Guide - Hospital Admin App

## 🚀 Running the Application

### Step 1: Navigate to the Hospital Admin Directory

```bash
cd hospital-admin
```

### Step 2: Install Dependencies

```bash
npm install
```

**Note**: This will install all required dependencies including React, TypeScript, Vite, Tailwind CSS, and more.

### Step 3: Create Environment File (Optional)

Create a `.env` file in the `hospital-admin` directory:

```env
VITE_API_BASE=http://localhost:8082
VITE_USE_MOCK_API=true
```

**Note**: The app will work without this file (uses defaults), but it's recommended for configuration.

### Step 4: Start the Development Server

```bash
npm run dev
```

### Step 5: Open in Browser

The application will automatically open at:

**http://localhost:5174**

Or manually navigate to: `http://localhost:5174`

---

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 5174) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🔧 Troubleshooting

### Port 5174 Already in Use

If you see an error that port 5174 is already in use:

1. **Option 1**: Stop the process using port 5174
   ```bash
   # Windows
   netstat -ano | findstr :5174
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:5174 | xargs kill
   ```

2. **Option 2**: Change the port in `vite.config.ts`:
   ```ts
   server: {
     port: 5175, // or any other available port
     strictPort: true
   }
   ```

### Dependencies Not Installing

If `npm install` fails:

1. Clear npm cache: `npm cache clean --force`
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install` again

### Module Not Found Errors

If you see import errors:

1. Ensure all dependencies are installed: `npm install`
2. Restart the dev server
3. Clear Vite cache: Delete `.vite` folder if it exists

---

## 🎯 What's Currently Available

### ✅ Completed
- Project setup and configuration
- API layer with mock data
- State management (Zustand stores)
- Routing and route guards
- Basic Dashboard placeholder

### 🚧 In Progress
- Component library (AppShell, forms, tables, charts)
- Full page implementations
- Authentication pages

### 📝 Next Steps
See the main [README.md](./README.md) for detailed development workflow.

---

## 🔗 Related Apps

- **Super Admin App**: Runs on `http://localhost:5173`
- **Hospital Admin App**: Runs on `http://localhost:5174`
- **Backend API**: Runs on `http://localhost:8082`

---

## 💡 Development Tips

1. **Hot Reload**: Changes to files automatically reload in the browser
2. **Mock API**: Currently using mock data - no backend required for UI development
3. **Dark Mode**: Toggle available in UI (once AppShell is implemented)
4. **TypeScript**: All files use TypeScript for type safety

---

## 📚 Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review the [PRD](../frontend/PRD.md) for feature specifications
- See the [Implementation Plan](../hmsa-front-end-complete.implementation.plan.md) for architecture details


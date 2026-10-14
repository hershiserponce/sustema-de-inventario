const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const DEV_SERVER_URL = "http://localhost:5173";
const isDev = !app.isPackaged;

function dataFilePath() {
  return path.join(app.getPath("userData"), "inventario.json");
}

function readData() {
  try {
    const file = dataFilePath();
    if (!fs.existsSync(file)) return null;
    const raw = fs.readFileSync(file, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("No se pudo leer inventario.json:", err);
    return null;
  }
}

function writeData(data) {
  try {
    const file = dataFilePath();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("No se pudo guardar inventario.json:", err);
    return false;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    backgroundColor: "#ffffff",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.once("ready-to-show", () => win.show());

  if (isDev) {
    win.loadURL(DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

ipcMain.handle("data:load", () => readData());
ipcMain.handle("data:save", (_event, data) => writeData(data));

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

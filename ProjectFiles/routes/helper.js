
const fs = require("fs");
const path = require("path");

// resolve paths from project root (NOT /routes)
function resolvePath(relPath) {
  return path.join(process.cwd(), relPath);
}

function readJsonArray(relPath) {
  const fullPath = resolvePath(relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  const raw = fs.readFileSync(fullPath, "utf-8");
  if (!raw.trim()) return [];
  return JSON.parse(raw);
}

function writeJsonArray(relPath, arr) {
  const fullPath = resolvePath(relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  fs.writeFileSync(fullPath, JSON.stringify(arr, null, 2), "utf-8");
}

module.exports = { readJsonArray, writeJsonArray };

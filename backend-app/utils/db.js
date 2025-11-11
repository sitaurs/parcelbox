import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'db');

/**
 * Read JSON database file
 */
export function readDB(filename) {
  try {
    const filePath = path.join(DB_PATH, `${filename}.json`);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}.json:`, error.message);
    return null;
  }
}

/**
 * Write to JSON database file
 */
export function writeDB(filename, data) {
  try {
    const filePath = path.join(DB_PATH, `${filename}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}.json:`, error.message);
    return false;
  }
}

/**
 * Append to array in database
 */
export function appendDB(filename, item) {
  try {
    const data = readDB(filename);
    if (!Array.isArray(data)) {
      console.error(`${filename}.json is not an array`);
      return false;
    }
    data.push(item);
    return writeDB(filename, data);
  } catch (error) {
    console.error(`Error appending to ${filename}.json:`, error.message);
    return false;
  }
}

/**
 * Update specific field in database object
 */
export function updateDB(filename, updates) {
  try {
    const data = readDB(filename);
    if (Array.isArray(data)) {
      console.error(`${filename}.json is an array, use appendDB instead`);
      return false;
    }
    const updatedData = { ...data, ...updates, updatedAt: new Date().toISOString() };
    return writeDB(filename, updatedData);
  } catch (error) {
    console.error(`Error updating ${filename}.json:`, error.message);
    return false;
  }
}

/**
 * Find item in array database
 */
export function findInDB(filename, predicate) {
  try {
    const data = readDB(filename);
    if (!Array.isArray(data)) {
      console.error(`${filename}.json is not an array`);
      return null;
    }
    return data.find(predicate);
  } catch (error) {
    console.error(`Error finding in ${filename}.json:`, error.message);
    return null;
  }
}

/**
 * Filter items in array database
 */
export function filterDB(filename, predicate) {
  try {
    const data = readDB(filename);
    if (!Array.isArray(data)) {
      console.error(`${filename}.json is not an array`);
      return [];
    }
    return data.filter(predicate);
  } catch (error) {
    console.error(`Error filtering ${filename}.json:`, error.message);
    return [];
  }
}

/**
 * Delete item from array database
 */
export function deleteFromDB(filename, predicate) {
  try {
    const data = readDB(filename);
    if (!Array.isArray(data)) {
      console.error(`${filename}.json is not an array`);
      return false;
    }
    const filtered = data.filter(item => !predicate(item));
    return writeDB(filename, filtered);
  } catch (error) {
    console.error(`Error deleting from ${filename}.json:`, error.message);
    return false;
  }
}

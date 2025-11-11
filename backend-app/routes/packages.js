import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { readDB, appendDB, writeDB } from '../utils/db.js';
import { authMiddleware, deviceTokenMiddleware } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_PATH = path.join(__dirname, '..', 'storage');

const router = express.Router();

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_PATH)) {
  fs.mkdirSync(STORAGE_PATH, { recursive: true });
}

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

/**
 * POST /api/v1/packages
 * Upload package photo from ESP32-CAM
 */
router.post('/', deviceTokenMiddleware, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }
    
    const meta = req.body.meta ? JSON.parse(req.body.meta) : {};
    const timestamp = new Date().toISOString();
    const filename = `package_${Date.now()}`;
    
    // Save original photo
    const photoPath = path.join(STORAGE_PATH, `${filename}.jpg`);
    await sharp(req.file.buffer)
      .jpeg({ quality: 85 })
      .toFile(photoPath);
    
    // Generate thumbnail
    const thumbPath = path.join(STORAGE_PATH, `${filename}_thumb.jpg`);
    await sharp(req.file.buffer)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 70 })
      .toFile(thumbPath);
    
    const packages = readDB('packages');
    const packageId = packages.length + 1;
    
    const packageData = {
      id: packageId,
      deviceId: meta.deviceId || 'box-01',
      timestamp,
      ts: timestamp,
      photoUrl: `/storage/${filename}.jpg`,
      thumbUrl: `/storage/${filename}_thumb.jpg`,
      distanceCm: meta.distanceCm || null,
      reason: meta.reason || 'detect',
      firmware: meta.firmware || 'unknown',
      status: 'received', // NEW: Package lifecycle status
      pickedUpAt: null    // NEW: Pickup timestamp
    };
    
    appendDB('packages', packageData);
    
    res.status(201).json({
      success: true,
      id: packageId,
      photoUrl: packageData.photoUrl,
      thumbUrl: packageData.thumbUrl,
      ts: timestamp
    });
    
  } catch (error) {
    console.error('Package upload error:', error);
    res.status(500).json({ error: 'Failed to upload package' });
  }
});

/**
 * GET /api/packages
 * Get all packages (for mobile app)
 */
router.get('/', authMiddleware, (req, res) => {
  try {
    const { limit, offset } = req.query;
    let packages = readDB('packages');
    
    // Sort by timestamp descending (newest first)
    packages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Pagination
    if (limit) {
      const start = parseInt(offset) || 0;
      const end = start + parseInt(limit);
      packages = packages.slice(start, end);
    }
    
    res.json({
      success: true,
      packages,
      total: packages.length
    });
    
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ error: 'Failed to get packages' });
  }
});

/**
 * GET /api/packages/:id
 * Get single package by ID
 */
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const packages = readDB('packages');
    const pkg = packages.find(p => p.id === parseInt(req.params.id));
    
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }
    
    res.json({
      success: true,
      package: pkg
    });
    
  } catch (error) {
    console.error('Get package error:', error);
    res.status(500).json({ error: 'Failed to get package' });
  }
});

/**
 * DELETE /api/packages/:id
 * Delete package by ID
 */
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const packages = readDB('packages');
    const pkg = packages.find(p => p.id === parseInt(req.params.id));
    
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }
    
    // Delete files
    const photoPath = path.join(STORAGE_PATH, path.basename(pkg.photoUrl));
    const thumbPath = path.join(STORAGE_PATH, path.basename(pkg.thumbUrl));
    
    if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    
    // Remove from database
    const filtered = packages.filter(p => p.id !== parseInt(req.params.id));
    writeDB('packages', filtered);
    
    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({ error: 'Failed to delete package' });
  }
});

/**
 * GET /api/packages/stats
 * Get package statistics
 */
router.get('/stats/summary', authMiddleware, (req, res) => {
  try {
    const packages = readDB('packages');
    
    // Today calculation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayPackages = packages.filter(p => new Date(p.timestamp) >= today);
    
    // This week calculation (last 7 days, not start of week)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const weekPackages = packages.filter(p => new Date(p.timestamp) >= sevenDaysAgo);
    
    // Latest package (sorted by timestamp)
    const sortedPackages = [...packages].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    res.json({
      success: true,
      stats: {
        total: packages.length,
        today: todayPackages.length,
        thisWeek: weekPackages.length,
        latest: sortedPackages[0] || null
      }
    });
    
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

/**
 * POST /api/packages/:id/pickup
 * Mark package as picked up
 */
router.post('/:id/pickup', authMiddleware, (req, res) => {
  try {
    const packages = readDB('packages');
    const packageIndex = packages.findIndex(p => p.id === parseInt(req.params.id));
    
    if (packageIndex === -1) {
      return res.status(404).json({ error: 'Package not found' });
    }
    
    if (packages[packageIndex].status === 'picked_up') {
      return res.status(400).json({ error: 'Package already picked up' });
    }
    
    packages[packageIndex].status = 'picked_up';
    packages[packageIndex].pickedUpAt = new Date().toISOString();
    
    writeDB('packages', packages);
    
    res.json({
      success: true,
      package: packages[packageIndex],
      message: 'Package marked as picked up'
    });
    
  } catch (error) {
    console.error('Pickup package error:', error);
    res.status(500).json({ error: 'Failed to mark package as picked up' });
  }
});

export default router;

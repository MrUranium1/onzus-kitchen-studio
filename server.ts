import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read Firebase Config
const configPath = path.join(__dirname, 'firebase-applet-config.json');
let firebaseConfig: any = {};
if (fs.existsSync(configPath)) {
  firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId || process.env.FIREBASE_PROJECT_ID
  });
}

const db = admin.firestore(firebaseConfig.firestoreDatabaseId); // Use specific database ID
const auth = admin.auth();
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/auth/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

      // Store OTP in Firestore
      await db.collection('otps').doc(email).set({
        otp,
        expiresAt,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Send Email
      if (resend) {
        await resend.emails.send({
          from: 'Bakery <noreply@onboarding.resend.dev>', // Use verified domain in production
          to: email,
          subject: 'Your Verification Code',
          html: `<div style="font-family: sans-serif; padding: 20px;">
            <h2>Verify your email</h2>
            <p>Your 6-digit verification code is:</p>
            <h1 style="font-size: 32px; letter-spacing: 5px; color: #4A2C2A;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
          </div>`
        });
        console.log(`OTP ${otp} sent to ${email} via Resend`);
      } else {
        console.warn('RESEND_API_KEY not found. Mocking email sending.');
        console.log(`[MOCK EMAIL] To: ${email}, Subject: OTP, Code: ${otp}`);
      }

      res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    try {
      const otpDoc = await db.collection('otps').doc(email).get();
      if (!otpDoc.exists) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      const data = otpDoc.data();
      if (data?.otp !== otp || Date.now() > data?.expiresAt) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      // OTP is valid, delete it
      await db.collection('otps').doc(email).delete();

      // Check if user exists in Firebase Auth
      try {
        const userRecord = await auth.getUserByEmail(email);
        // Mark email as verified
        await auth.updateUser(userRecord.uid, {
          emailVerified: true
        });
        res.json({ success: true, uid: userRecord.uid });
      } catch (authError: any) {
        // If user doesn't exist yet (unlikely in this flow but good to handle)
        res.status(404).json({ error: 'User account not found yet. Please sign up first.' });
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { validateEmail, validatePassword, generateOTP } from '../utils/validation';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Validasi input
    if (!email || !password) {
      res.status(400).json({ error: 'Email dan password harus diisi' });
      return;
    }

    if (!validateEmail(email)) {
      res.status(400).json({ error: 'Format email tidak valid' });
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      res.status(400).json({ error: 'Password tidak memenuhi kriteria', details: passwordValidation.errors });
      return;
    }

    // Cek user sudah ada
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'Email sudah terdaftar' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || undefined,
      },
    });

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

    await prisma.oTPVerification.create({
      data: {
        userId: user.id,
        code: otp,
        identifier: email,
        type: 'REGISTRATION',
        expiresAt,
      },
    });

    // TODO: Kirim OTP via email/SMS

    res.status(201).json({
      message: 'Registrasi berhasil. Silakan verifikasi OTP.',
      userId: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registrasi gagal' });
  }
};

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      res.status(400).json({ error: 'User ID dan kode OTP harus diisi' });
      return;
    }

    // Cari OTP
    const otpRecord = await prisma.oTPVerification.findFirst({
      where: {
        userId,
        code,
        type: 'REGISTRATION',
      },
    });

    if (!otpRecord) {
      res.status(400).json({ error: 'OTP tidak valid' });
      return;
    }

    if (new Date() > otpRecord.expiresAt) {
      res.status(400).json({ error: 'OTP sudah expired' });
      return;
    }

    if (otpRecord.verifiedAt) {
      res.status(400).json({ error: 'OTP sudah digunakan' });
      return;
    }

    // Update OTP sebagai terverifikasi
    await prisma.oTPVerification.update({
      where: { id: otpRecord.id },
      data: { verifiedAt: new Date() },
    });

    res.json({
      message: 'Email terverifikasi',
      userId,
      email: otpRecord.identifier,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Verifikasi OTP gagal' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email dan password harus diisi' });
      return;
    }

    // Cari user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Email atau password salah' });
      return;
    }

    // Validasi password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Email atau password salah' });
      return;
    }

    // Check if user has verified their email
    const otpVerified = await prisma.oTPVerification.findFirst({
      where: {
        userId: user.id,
        type: 'REGISTRATION',
        verifiedAt: { not: null },
      },
    });

    if (!otpVerified) {
      res.status(403).json({ error: 'Email belum diverifikasi' });
      return;
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      res.status(403).json({ error: 'Akun Anda tidak aktif' });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      message: 'Login berhasil',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login gagal' });
  }
};

export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token harus diisi' });
      return;
    }

    const payload = verifyRefreshToken(refreshToken);

    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Refresh token tidak valid' });
  }
};

import { Request, Response, NextFunction } from 'express';
import { getDb } from '../core/database.js';
import { hashPassword, verifyPassword } from '../utils/crypt.js';

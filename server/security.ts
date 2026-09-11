import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

export type UserRole = "CITIZEN" | "RESCUE_OPERATOR" | "ADMIN";

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  jurisdiction?: string;
  sessionVersion: number;
  failedLoginAttempts: number;
  lockUntil: number | null;
  createdAt: string;
  lastLoginAt?: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  action: string;
  actorEmail: string;
  actorRole: UserRole;
  ipAddress: string;
  status: "SUCCESS" | "DENIED" | "RATE_LIMITED" | "ANONYMIZED";
  details: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  sessionVersion: number;
  exp: number; // epoch ms
  iat: number;
}

// Cryptographic keys derived at server startup
const HMAC_SECRET = process.env.SECURITY_HMAC_SECRET || crypto.randomBytes(32).toString("hex");
const AES_KEY = crypto.scryptSync(HMAC_SECRET, "redalert-aes-salt", 32);

// In-memory Audit Logs (capped at 250 items)
const auditLogs: SecurityAuditLog[] = [];

export function logAuditEvent(
  action: string,
  actorEmail: string,
  actorRole: UserRole,
  ipAddress: string,
  status: "SUCCESS" | "DENIED" | "RATE_LIMITED" | "ANONYMIZED",
  details: string
): SecurityAuditLog {
  const log: SecurityAuditLog = {
    id: `AUD-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
    timestamp: new Date().toISOString(),
    action,
    actorEmail: actorEmail || "anonymous",
    actorRole: actorRole || "CITIZEN",
    ipAddress: ipAddress || "unknown",
    status,
    details,
  };
  auditLogs.unshift(log);
  if (auditLogs.length > 250) {
    auditLogs.pop();
  }
  return log;
}

export function getAuditLogs(): SecurityAuditLog[] {
  return [...auditLogs];
}

// Password Hashing with PBKDF2 (100,000 iterations, SHA-512)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(":");
    if (!salt || !originalHash) return false;
    const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
    return crypto.timingSafeEqual(Buffer.from(computedHash, "hex"), Buffer.from(originalHash, "hex"));
  } catch {
    return false;
  }
}

// AES-256-GCM encryption for location and sensitive data at rest
export function encryptAtRest(plainText: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", AES_KEY, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decryptAtRest(encryptedPayload: string): string | null {
  try {
    const [ivHex, tagHex, dataHex] = encryptedPayload.split(":");
    if (!ivHex || !tagHex || !dataHex) return null;
    const decipher = crypto.createDecipheriv("aes-256-gcm", AES_KEY, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    let decrypted = decipher.update(dataHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return null;
  }
}

// HMAC Token creation and verification
export function createAuthToken(user: UserRecord, expiresInMinutes: number = 30): string {
  const now = Date.now();
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    sessionVersion: user.sessionVersion,
    iat: now,
    exp: now + expiresInMinutes * 60 * 1000,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", HMAC_SECRET).update(payloadB64).digest("base64url");
  return `${payloadB64}.${signature}`;
}

export function verifyAuthToken(token: string): TokenPayload | null {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;

    const expectedSig = crypto.createHmac("sha256", HMAC_SECRET).update(payloadB64).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (Date.now() > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

// SOS Integrity Signature
export function generateSosIntegritySignature(data: {
  id: string;
  latitude: number | null;
  longitude: number | null;
  disasterType: string;
  severity: string;
  timestamp: string;
}): string {
  const canonical = `${data.id}|${data.latitude ?? "null"}|${data.longitude ?? "null"}|${data.disasterType}|${data.severity}|${data.timestamp}`;
  return crypto.createHmac("sha256", HMAC_SECRET).update(canonical).digest("hex");
}

export function verifySosIntegrity(data: {
  id: string;
  latitude: number | null;
  longitude: number | null;
  disasterType: string;
  severity: string;
  timestamp: string;
}, signature: string): boolean {
  const expected = generateSosIntegritySignature(data);
  try {
    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

// In-Memory User Database with Pre-seeded Accounts
export const usersDatabase: Map<string, UserRecord> = new Map();

function seedInitialUsers() {
  const seedAccounts: Array<{ email: string; pass: string; name: string; role: UserRole; jurisdiction?: string }> = [
    {
      email: "citizen@redalert.ai",
      pass: "CitizenSafe2026!",
      name: "Sarah Chen (Citizen)",
      role: "CITIZEN",
    },
    {
      email: "operator@redalert.ai",
      pass: "RescueSquad2026!",
      name: "Captain Marcus Reed",
      role: "RESCUE_OPERATOR",
      jurisdiction: "Metropolitan Disaster Command Hub",
    },
    {
      email: "admin@redalert.ai",
      pass: "AdminSecurity2026!",
      name: "Dr. Elena Rostova",
      role: "ADMIN",
      jurisdiction: "System Security & Compliance",
    },
  ];

  for (const acc of seedAccounts) {
    const id = `USR-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    usersDatabase.set(acc.email.toLowerCase(), {
      id,
      email: acc.email.toLowerCase(),
      name: acc.name,
      role: acc.role,
      passwordHash: hashPassword(acc.pass),
      jurisdiction: acc.jurisdiction,
      sessionVersion: 1,
      failedLoginAttempts: 0,
      lockUntil: null,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    });
  }
}

seedInitialUsers();

// Rate limiting & Lockout helpers
interface RateLimitBucket {
  count: number;
  resetAt: number;
}
const rateLimits: Map<string, RateLimitBucket> = new Map();

export function checkRateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const bucket = rateLimits.get(key);

  if (!bucket || now > bucket.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetInMs: windowMs };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetInMs: Math.max(0, bucket.resetAt - now) };
  }

  bucket.count++;
  return { allowed: true, remaining: limit - bucket.count, resetInMs: Math.max(0, bucket.resetAt - now) };
}

// Duplicate SOS Spam prevention cache: key -> timestamp
const recentSosHashes: Map<string, number> = new Map();

export function isDuplicateSosSpam(fingerprint: string, cooldownMs: number = 30000): boolean {
  const now = Date.now();
  const lastTime = recentSosHashes.get(fingerprint);
  if (lastTime && now - lastTime < cooldownMs) {
    return true;
  }
  recentSosHashes.set(fingerprint, now);
  // Clean old hashes periodically
  if (recentSosHashes.size > 1000) {
    for (const [k, t] of recentSosHashes.entries()) {
      if (now - t > cooldownMs * 2) recentSosHashes.delete(k);
    }
  }
  return false;
}

// Request with attached authenticated user
export interface AuthenticatedRequest extends Request {
  user?: UserRecord;
}

// Middleware: Authenticate via Bearer Token
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required",
      code: "AUTH_REQUIRED",
    });
  }

  const token = authHeader.substring(7).trim();
  const payload = verifyAuthToken(token);
  if (!payload) {
    return res.status(401).json({
      error: "Invalid or expired session token. Please log in again.",
      code: "TOKEN_EXPIRED",
    });
  }

  const user = usersDatabase.get(payload.email.toLowerCase());
  if (!user) {
    return res.status(401).json({
      error: "User account does not exist or has been removed.",
      code: "USER_NOT_FOUND",
    });
  }

  // Check if session version matches (handles "Logout from all devices")
  if (user.sessionVersion !== payload.sessionVersion) {
    return res.status(401).json({
      error: "Session has been invalidated due to logout from all devices.",
      code: "SESSION_REVOKED",
    });
  }

  req.user = user;
  next();
}

// Middleware: Optional Authentication (attaches user if valid token present)
export function optionalAuthenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const payload = verifyAuthToken(token);
    if (payload) {
      const user = usersDatabase.get(payload.email.toLowerCase());
      if (user && user.sessionVersion === payload.sessionVersion) {
        req.user = user;
      }
    }
  }
  next();
}

// Middleware: Role-Based Authorization
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required for this operation",
        code: "UNAUTHORIZED",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
      logAuditEvent(
        "RBAC_ACCESS_DENIED",
        req.user.email,
        req.user.role,
        clientIp,
        "DENIED",
        `Attempted unauthorized access to ${req.method} ${req.originalUrl}. Required roles: [${allowedRoles.join(", ")}]`
      );

      return res.status(403).json({
        error: "Access Denied: You do not have permission to perform this rescue operation.",
        code: "FORBIDDEN",
        requiredRoles: allowedRoles,
        userRole: req.user.role,
      });
    }

    next();
  };
}

// Middleware: Security Headers
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(self), microphone=(), camera=()");
  next();
}

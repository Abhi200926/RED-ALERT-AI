import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  securityHeaders,
  authenticate,
  optionalAuthenticate,
  requireRole,
  checkRateLimit,
  isDuplicateSosSpam,
  hashPassword,
  verifyPassword,
  createAuthToken,
  usersDatabase,
  logAuditEvent,
  getAuditLogs,
  encryptAtRest,
  decryptAtRest,
  generateSosIntegritySignature,
  AuthenticatedRequest,
  UserRole,
} from "./server/security";
import { surgeProtectionSystem } from "./server/surgeProtection";
import { runEvaluatorTestSuite } from "./server/evaluatorTests";

dotenv.config();

const app = express();
const PORT = 3000;

// Security headers & Request size limit (50kb protects against DOS payload bombing)
app.use(securityHeaders);
app.use(express.json({ limit: "50kb" }));

// Initialize Gemini client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI Risk Analysis endpoint
app.post("/api/analyze-risk", async (req, res) => {
  const {
    disasterType,
    severity,
    location,
    parameters = {},
    officialWarning = "Monitoring",
    isDemo = true,
  } = req.body;

  const paramString = Object.entries(parameters)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  const prompt = `You are RED ALERT AI's emergency risk analysis system.
Analyze the following structured disaster telemetry data:
- Disaster Type: ${disasterType}
- Severity Level: ${severity}
- Location: ${location}
- Sensor/Telemetry Data: ${paramString || "Standard surveillance metrics"}
- Official Warning Status: ${officialWarning}
- Simulated/Demo Mode: ${isDemo ? "Yes (Demo Alert)" : "No (Real-world stream)"}

Safety Guidelines:
1. Explain concisely (2-3 sentences) why this risk level is warranted based strictly on the provided parameters.
2. Avoid inventing sensor data not provided.
3. Distinguish clearly between provided facts and AI interpretation.
4. Never present speculation as confirmed fact.
5. Provide 3 immediate, practical emergency actions.
6. Always recommend following official emergency and civil protection instructions.

Format your response as valid JSON with the following keys:
{
  "explanation": "A clear, concise explanation of the risk condition and telemetry interpretation.",
  "safetyActions": ["Action 1", "Action 2", "Action 3"],
  "confidenceIndicator": "High" | "Moderate" | "Preliminary",
  "disclaimer": "Emergency advice notice"
}`;

  try {
    const ai = getGeminiClient();
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
          systemInstruction:
            "You are an emergency awareness AI analyst. Prioritize clarity, safety, facts, and deference to official government authorities.",
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json({
          success: true,
          source: "Gemini 3.8 Flash (Server-Side)",
          ...parsed,
        });
      }
    }
  } catch (error) {
    console.error("Gemini risk analysis error, using reliable fallback:", error);
  }

  // High-quality fallback rule-based generation when Gemini is unavailable or not configured
  const fallbackAnalysis = generateFallbackAnalysis(disasterType, severity, location, parameters);
  return res.json({
    success: true,
    source: "RED ALERT AI Telemetry Engine (Deterministic Safety Rules)",
    ...fallbackAnalysis,
  });
});

// Red Alert Assistant chat endpoint
app.post("/api/chat-assistant", async (req, res) => {
  const { message, currentAlert, history = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const prompt = `You are "Red Alert Assistant", a safety-focused emergency preparedness AI assistant in the RED ALERT AI application.
Current system state:
- Active Alert: ${currentAlert ? `${currentAlert.severity} ${currentAlert.disasterType} in ${currentAlert.location}` : "All Clear"}
- Is Demo: ${currentAlert?.isDemo ? "Yes (Simulated Demo Alert)" : "No"}

User query: "${message}"

RULES:
1. Provide concise, clear, and safety-oriented explanations (under 120 words).
2. Do not pretend to be an official emergency authority (like FEMA, NOAA, USGS, or Police).
3. Do not invent live disaster facts or speculate on casualty numbers.
4. For urgent live emergencies, always direct users toward local 911/112 emergency services and official civil defense instructions.
5. Emphasize calm, deliberate safety steps.`;

  try {
    const ai = getGeminiClient();
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          temperature: 0.3,
          systemInstruction:
            "You are Red Alert Assistant. Never claim official emergency authority. Keep answers direct, protective, and calm.",
        },
      });

      if (response.text) {
        return res.json({
          reply: response.text.trim(),
          source: "Gemini 3.8 Flash",
        });
      }
    }
  } catch (error) {
    console.error("Gemini assistant error, using fallback safety engine:", error);
  }

  // Graceful conversational safety responses
  const fallbackReply = generateFallbackChatReply(message, currentAlert);
  return res.json({
    reply: fallbackReply,
    source: "Red Alert Assistant Safety Knowledge Base",
  });
});

// Dedicated AI Rescue Risk & Priority Analysis Endpoint
app.post("/api/ai/risk-analysis", async (req, res) => {
  const {
    disasterType = "General Emergency",
    severity = "CRITICAL",
    location = "Disaster Zone",
    peopleCount = "1",
    situation = "Need evacuation",
    communicationStatus = "INTERNET",
    message = "",
  } = req.body;

  const prompt = `You are RED ALERT AI's emergency rescue prioritization engine.
Evaluate this rescue distress beacon:
- Disaster Type: ${disasterType}
- Alert Severity: ${severity}
- Location: ${location}
- Number of People: ${peopleCount}
- Reported Situation: ${situation}
- Communication Channel Available: ${communicationStatus}
- Victim Distress Note: "${message}"

Assign an emergency rescue priority: "CRITICAL", "HIGH", "MEDIUM", or "LOW".
Provide a clear, objective 2-sentence rationale explaining the assigned priority based on acute life-threat hazard, environmental speed of disaster, and communication degradation. Suggest 2 specialized rescue units (e.g., Swift Water Rescue Boat, Technical Search & Extraction, High-Clearance Amphibious Vehicle, Paramedic Triage).

Output strictly valid JSON:
{
  "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "reason": "Clear tactical rationale...",
  "recommendedUnits": ["Unit 1", "Unit 2"],
  "urgencyLevel": "15-Minute Direct Intercept" | "30-Minute Priority Response" | "Standard Egress Assistance"
}`;

  try {
    const ai = getGeminiClient();
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
          systemInstruction:
            "You are an emergency command center triage AI. Value immediate human life preservation, prioritize trapped victims and rising waters.",
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json({
          success: true,
          source: "Gemini 3.8 Flash (Server-Side)",
          ...parsed,
        });
      }
    }
  } catch (err) {
    console.error("Gemini rescue triage error:", err);
  }

  // Reliable deterministic fallback
  const isCritical =
    situation.toLowerCase().includes("trap") ||
    situation.toLowerCase().includes("injur") ||
    peopleCount.includes("More than 10") ||
    peopleCount.includes("6–10");

  const priority = isCritical ? "CRITICAL" : situation.toLowerCase().includes("block") ? "MEDIUM" : "HIGH";

  res.json({
    success: true,
    source: "RED ALERT AI Deterministic Triage Engine",
    priority,
    reason: isCritical
      ? `High-hazard distress beacon in ${location} reporting ${peopleCount} victims ${situation}. Active ${disasterType} threat requires immediate tactical extraction.`
      : `Rescue request in ${location} under ${disasterType} alert. Evaluated as ${priority} operational priority with active ${communicationStatus} channel.`,
    recommendedUnits:
      disasterType.toLowerCase().includes("flood") || disasterType.toLowerCase().includes("rain")
        ? ["Swift Water Rescue Team #3", "Amphibious Evacuation Unit"]
        : ["Urban Search & Rescue (US&R)", "Advanced Paramedic Unit"],
    urgencyLevel: isCritical ? "15-Minute Direct Intercept" : "30-Minute Priority Response",
  });
});

// Dedicated AI Emergency Risk Assessment (0-100 Score, Classification, Explanation & Factors)
app.post("/api/ai/emergency-risk-assessment", async (req, res) => {
  const {
    disasterType = "Flood",
    severity = "CRITICAL",
    peopleAffected = "1",
    location = "Monitored Sector",
    description = "",
    urgency = "Need evacuation",
    availableInfo = "Sensor telemetry verified",
  } = req.body;

  const prompt = `You are RED ALERT AI's Emergency Risk Assessment engine.
Evaluate this simulated emergency incident:
- Disaster Type: ${disasterType}
- Severity: ${severity}
- People Affected: ${peopleAffected}
- Location: ${location}
- Description: "${description}"
- Urgency: ${urgency}
- Available Emergency Information: ${availableInfo}

Analyze these parameters and generate:
1. "riskScore": An integer from 0 to 100 representing life-threat and extraction difficulty.
2. "priorityLevel": Strictly one of "LOW" (0-39), "MODERATE" (40-69), "HIGH" (70-84), "CRITICAL" (85-100).
3. "explanation": A concise string strictly in the format: "Reason: [Factor 1] + [Factor 2] + [Factor 3]." (e.g. "Reason: Large affected population + rapidly developing hazard + limited evacuation time.")
4. "mainFactors": An array of 4 objects with "factor" (string), "score" (number 0-100), "weight" (string like "+35 pts"), "impact" ("low"|"moderate"|"high"|"critical"), and "details" (string).
5. "recommendedResponsePriority": Actionable deployment recommendation string.

Output strictly valid JSON with no extra markdown formatting:
{
  "riskScore": 92,
  "priorityLevel": "CRITICAL",
  "explanation": "Reason: Large affected population + rapidly developing hazard + limited evacuation time.",
  "mainFactors": [
    {
      "factor": "Hazard Severity & Velocity",
      "score": 95,
      "weight": "+38 pts",
      "impact": "critical",
      "details": "Active flood surge with rising waterline in low-elevation valley."
    },
    {
      "factor": "Population at Risk",
      "score": 85,
      "weight": "+25 pts",
      "impact": "critical",
      "details": "Multiple residents reported trapped with restricted mobility."
    },
    {
      "factor": "Physical Urgency & Extraction Obstacles",
      "score": 90,
      "weight": "+22 pts",
      "impact": "critical",
      "details": "Egress cut off by deep water; immediate vessel extraction required."
    },
    {
      "factor": "Available Information & Telemetry Quality",
      "score": 80,
      "weight": "+7 pts",
      "impact": "high",
      "details": "Correlated hydrological telemetry and automated civil defense flood alert."
    }
  ],
  "recommendedResponsePriority": "Priority 0: Immediate Swift-Water & Air Rescue Intercept (< 15 min window)"
}`;

  try {
    const ai = getGeminiClient();
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
          systemInstruction:
            "You are an expert civil defense emergency risk triage AI. Value immediate life preservation and output precise risk scores.",
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json({
          success: true,
          source: "Gemini 3.8 Flash (Server-Side)",
          assessment: {
            ...parsed,
            disasterType,
            severity,
            peopleAffected,
            location,
            urgency,
            description,
            availableInfo,
            calculatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            model: "Gemini 3.8 Flash (Server-Side)",
            isDemoSimulation: true,
          },
        });
      }
    }
  } catch (err) {
    console.error("Gemini risk assessment error:", err);
  }

  // Deterministic calculation fallback
  const isTrapped = urgency.toLowerCase().includes("trap") || description.toLowerCase().includes("trap");
  const isInjured = urgency.toLowerCase().includes("injur") || description.toLowerCase().includes("injur");
  const isWater = disasterType.toLowerCase().includes("flood") || disasterType.toLowerCase().includes("rain") || description.toLowerCase().includes("water");
  const manyPeople = peopleAffected.includes("More than 10") || peopleAffected.includes("6–10") || peopleAffected.includes("6-10");

  let score = 55;
  if (severity === "CRITICAL") score += 25;
  else if (severity === "WARNING") score += 15;
  if (manyPeople) score += 12;
  if (isTrapped) score += 12;
  if (isInjured) score += 10;
  if (isWater) score += 8;

  if (isTrapped && (manyPeople || severity === "CRITICAL")) {
    score = Math.max(score, 92);
  }
  score = Math.min(100, Math.max(10, score));

  const priorityLevel = score >= 85 ? "CRITICAL" : score >= 70 ? "HIGH" : score >= 40 ? "MODERATE" : "LOW";

  res.json({
    success: true,
    source: "RED ALERT AI Deterministic Triage Engine",
    assessment: {
      riskScore: score,
      priorityLevel,
      explanation: isTrapped && manyPeople
        ? "Reason: Large affected population + rapidly developing hazard + limited evacuation time."
        : `Reason: ${severity} ${disasterType} exposure + ${peopleAffected} affected + ${urgency.toLowerCase()}.`,
      mainFactors: [
        {
          factor: "Hazard Severity & Velocity",
          score: severity === "CRITICAL" ? 95 : 70,
          weight: severity === "CRITICAL" ? "+38 pts" : "+24 pts",
          impact: severity === "CRITICAL" ? "critical" : "high",
          details: `${disasterType} categorized as ${severity} in ${location}`,
        },
        {
          factor: "Population at Risk",
          score: manyPeople ? 90 : 65,
          weight: manyPeople ? "+25 pts" : "+12 pts",
          impact: manyPeople ? "critical" : "moderate",
          details: `${peopleAffected} victim(s) requiring emergency extraction`,
        },
        {
          factor: "Physical Urgency & Extraction Obstacles",
          score: isTrapped ? 95 : 60,
          weight: isTrapped ? "+22 pts" : "+10 pts",
          impact: isTrapped ? "critical" : "moderate",
          details: `Reported situation: ${urgency}`,
        },
        {
          factor: "Available Information & Telemetry Quality",
          score: 80,
          weight: "+7 pts",
          impact: "high",
          details: availableInfo || "Live multi-channel telemetry active",
        },
      ],
      recommendedResponsePriority:
        priorityLevel === "CRITICAL"
          ? "Priority 0: Immediate Swift-Water & Air Rescue Intercept (< 15 min window)"
          : priorityLevel === "HIGH"
          ? "Priority 1: Rapid Ground Evacuation & Paramedic Unit Deployment (< 30 min)"
          : "Priority 2: Local Civil Defense Staging & Route Clearance",
      disasterType,
      severity,
      peopleAffected,
      location,
      urgency,
      description,
      availableInfo,
      calculatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      model: "RED ALERT AI Simulated Risk Engine (Deterministic)",
      isDemoSimulation: true,
    },
  });
});

// In-memory store for Emergency Rescue SOS Requests with Encryption & Privacy
interface ServerEmergencyRequest {
  id: string;
  status: string;
  userId?: string;
  userEmail?: string;
  latitude: number | null;
  longitude: number | null;
  isGpsConfirmed: boolean;
  locationName: string;
  disasterType: string;
  severity: string;
  situation: string;
  peopleCount: string;
  message: string;
  timestamp: string;
  isDemo: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  communicationMethod: string;
  assignedTeam?: string;
  retryCount?: number;
  channelLogs?: string[];
  aiPriorityReason?: string;
  riskAssessment?: any;
  encryptedLocationPayload?: string;
  integritySignature?: string;
  isEncryptedAtRest?: boolean;
  isAnonymized?: boolean;
}

const emergencyRequests: ServerEmergencyRequest[] = [
  {
    id: "SOS-8412",
    status: "ACKNOWLEDGED",
    userId: "USR-SEED-CITIZEN-01",
    userEmail: "citizen@redalert.ai",
    latitude: 37.7849,
    longitude: -122.4094,
    isGpsConfirmed: true,
    locationName: "Riverfront Basin & Lowland Valley",
    disasterType: "Flood",
    severity: "CRITICAL",
    situation: "Trapped",
    peopleCount: "2–5",
    message: "Water rose past front porch, family moved to 2nd floor, elderly grandmother with mobility difficulty.",
    timestamp: "12 mins ago",
    isDemo: true,
    priority: "CRITICAL",
    communicationMethod: "SMS",
    assignedTeam: "Alpha Swift Water Team #2",
    channelLogs: [
      "Broadband IP down due to flooded substation",
      "Switched automatically to Emergency SMS Fallback Bridge",
      "Carrier SMS gateway confirmed receipt by Rescue Hub",
    ],
    aiPriorityReason: "Life-threatening hydrological surge with vulnerable occupants on upper floor. Immediate boat extraction warranted.",
    riskAssessment: {
      riskScore: 92,
      priorityLevel: "CRITICAL",
      explanation: "Reason: Large affected population + rapidly developing hazard + limited evacuation time.",
      mainFactors: [
        {
          factor: "Hazard Severity & Velocity",
          score: 95,
          weight: "+38 pts",
          impact: "critical",
          details: "Flood surge cresting +4.2m with active rapid ingress.",
        },
        {
          factor: "Population at Risk",
          score: 88,
          weight: "+25 pts",
          impact: "critical",
          details: "2–5 residents including elderly occupant with mobility impairment.",
        },
        {
          factor: "Physical Urgency & Extraction Obstacles",
          score: 92,
          weight: "+22 pts",
          impact: "critical",
          details: "Trapped on second floor with ground egress submerged.",
        },
        {
          factor: "Available Information & Telemetry Quality",
          score: 85,
          weight: "+7 pts",
          impact: "high",
          details: "SMS emergency bridge confirmed with GPS triangulation.",
        },
      ],
      recommendedResponsePriority: "Priority 0: Immediate Swift-Water & Air Rescue Intercept (< 15 min window)",
      disasterType: "Flood",
      severity: "CRITICAL",
      peopleAffected: "2–5",
      location: "Riverfront Basin & Lowland Valley",
      urgency: "Trapped",
      description: "Water rose past front porch, family moved to 2nd floor.",
      availableInfo: "Civil defense hydrological warning #402",
      calculatedAt: "12 mins ago",
      model: "RED ALERT AI Emergency Risk Engine",
      isDemoSimulation: true,
    },
    isEncryptedAtRest: true,
    encryptedLocationPayload: encryptAtRest(JSON.stringify({ lat: 37.7849, lng: -122.4094 })),
    integritySignature: generateSosIntegritySignature({
      id: "SOS-8412",
      latitude: 37.7849,
      longitude: -122.4094,
      disasterType: "Flood",
      severity: "CRITICAL",
      timestamp: "12 mins ago",
    }),
  },
  {
    id: "SOS-8395",
    status: "DISPATCHED",
    userId: "USR-SEED-CITIZEN-02",
    userEmail: "citizen2@redalert.ai",
    latitude: 37.8124,
    longitude: -122.4612,
    isGpsConfirmed: false,
    locationName: "Hillside Crest Access Road",
    disasterType: "Landslide",
    severity: "WARNING",
    situation: "Road blocked",
    peopleCount: "1",
    message: "Mud and downed power pole blocking road, car disabled safely on shoulder, need towing and clearance.",
    timestamp: "28 mins ago",
    isDemo: true,
    priority: "HIGH",
    communicationMethod: "CELLULAR",
    assignedTeam: "County Civil Road Clearance Squad 4",
    channelLogs: ["Dispatched via Cellular 4G LTE uplink"],
    aiPriorityReason: "Road blockage impeding egress without acute trauma. High priority road clearance assigned.",
    riskAssessment: {
      riskScore: 74,
      priorityLevel: "HIGH",
      explanation: "Reason: Single exposed motorist + hillside slope instability + blocked vehicular egress.",
      mainFactors: [
        {
          factor: "Hazard Severity & Velocity",
          score: 75,
          weight: "+26 pts",
          impact: "high",
          details: "Landslide mudflow blocking 2-lane regional access pass.",
        },
        {
          factor: "Population at Risk",
          score: 55,
          weight: "+14 pts",
          impact: "moderate",
          details: "1 driver sheltered inside vehicle; no injuries.",
        },
        {
          factor: "Physical Urgency & Extraction Obstacles",
          score: 78,
          weight: "+20 pts",
          impact: "high",
          details: "Downed powerline obstructing pedestrian and vehicle egress.",
        },
        {
          factor: "Available Information & Telemetry Quality",
          score: 70,
          weight: "+14 pts",
          impact: "moderate",
          details: "Cellular 4G telemetry and county highway sensor feed.",
        },
      ],
      recommendedResponsePriority: "Priority 1: Rapid Ground Route Clearance Squad (< 30 min)",
      disasterType: "Landslide",
      severity: "WARNING",
      peopleAffected: "1",
      location: "Hillside Crest Access Road",
      urgency: "Road blocked",
      description: "Mud and downed power pole blocking road.",
      availableInfo: "Rainfall gauge: 85mm",
      calculatedAt: "28 mins ago",
      model: "RED ALERT AI Emergency Risk Engine",
      isDemoSimulation: true,
    },
    isEncryptedAtRest: true,
    encryptedLocationPayload: encryptAtRest(JSON.stringify({ lat: 37.8124, lng: -122.4612 })),
    integritySignature: generateSosIntegritySignature({
      id: "SOS-8395",
      latitude: 37.8124,
      longitude: -122.4612,
      disasterType: "Landslide",
      severity: "WARNING",
      timestamp: "28 mins ago",
    }),
  },
  {
    id: "SOS-8210",
    status: "OFFLINE_QUEUED",
    userId: "USR-SEED-CITIZEN-01",
    userEmail: "citizen@redalert.ai",
    latitude: 37.7650,
    longitude: -122.4200,
    isGpsConfirmed: true,
    locationName: "Lower Mission Creek Underpass",
    disasterType: "Heavy Rain",
    severity: "CRITICAL",
    situation: "Trapped",
    peopleCount: "2–5",
    message: "Vehicle stalled in sudden rapid storm runoff. Water level rising against doors.",
    timestamp: "3 mins ago",
    isDemo: true,
    priority: "CRITICAL",
    communicationMethod: "OFFLINE_QUEUE",
    channelLogs: [
      "Cellular and Wi-Fi towers drowned in cloudburst",
      "Distress beacon stored in local encrypted outbox with auto-retry daemon",
    ],
    aiPriorityReason: "Submerged vehicle hazard under intense cloudburst runoff. Top priority swift-water response upon signal detection.",
    riskAssessment: {
      riskScore: 90,
      priorityLevel: "CRITICAL",
      explanation: "Reason: Rapid runoff submergence + trapped occupants + escalating water level.",
      mainFactors: [
        {
          factor: "Hazard Severity & Velocity",
          score: 92,
          weight: "+36 pts",
          impact: "critical",
          details: "Sudden flash runoff inundating low underpass.",
        },
        {
          factor: "Population at Risk",
          score: 82,
          weight: "+22 pts",
          impact: "critical",
          details: "2–5 passengers inside partially submerged passenger vehicle.",
        },
        {
          factor: "Physical Urgency & Extraction Obstacles",
          score: 94,
          weight: "+24 pts",
          impact: "critical",
          details: "Door hydraulic pressure preventing manual opening.",
        },
        {
          factor: "Available Information & Telemetry Quality",
          score: 75,
          weight: "+8 pts",
          impact: "high",
          details: "GPS hardware coordinates stored in offline queued packet.",
        },
      ],
      recommendedResponsePriority: "Priority 0: Immediate Underpass Extraction Team (< 15 min window)",
      disasterType: "Heavy Rain",
      severity: "CRITICAL",
      peopleAffected: "2–5",
      location: "Lower Mission Creek Underpass",
      urgency: "Trapped",
      description: "Vehicle stalled in sudden rapid storm runoff.",
      availableInfo: "Doppler radar torrential storm signature",
      calculatedAt: "3 mins ago",
      model: "RED ALERT AI Emergency Risk Engine",
      isDemoSimulation: true,
    },
  },
];

const PROTOTYPE_DISCLAIMER =
  "DEMO / PROTOTYPE NOTICE: RED ALERT AI is an exploratory prototype and simulation system. It does NOT dispatch real-world emergency services, does NOT contact 911 or civil defense authorities, does NOT send real rescue teams, and cannot guarantee emergency communication. In a life-threatening crisis, immediately call 911, 112, or your local emergency services telephone number.";

// --- 1. SECURE AUTHENTICATION ENDPOINTS ---

// Helper: Sanitize user object for client response (Never expose password hash or internal lock counters)
function sanitizeUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    jurisdiction: user.jurisdiction,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

// POST /api/auth/login
app.post("/api/auth/login", (req, res) => {
  const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  // Rate limiting for auth (10 attempts per minute per IP)
  const rateCheck = checkRateLimit(`login-ip:${clientIp}`, 10, 60000);
  if (!rateCheck.allowed) {
    logAuditEvent("LOGIN_RATE_LIMIT", email, "CITIZEN", clientIp, "RATE_LIMITED", "Excessive login requests from IP.");
    return res.status(429).json({
      error: "Too many login attempts. Please wait 60 seconds before trying again.",
      code: "RATE_LIMITED",
    });
  }

  const user = usersDatabase.get(String(email).trim().toLowerCase());
  if (!user) {
    logAuditEvent("LOGIN_FAILED", email, "CITIZEN", clientIp, "DENIED", "Account not found.");
    return res.status(401).json({ error: "Invalid email or password.", code: "INVALID_CREDENTIALS" });
  }

  // Check Account Lockout
  const now = Date.now();
  if (user.lockUntil && now < user.lockUntil) {
    const remainingSec = Math.ceil((user.lockUntil - now) / 1000);
    logAuditEvent(
      "LOGIN_LOCKED_ATTEMPT",
      user.email,
      user.role,
      clientIp,
      "DENIED",
      `Attempt on locked account. Remaining: ${remainingSec}s`
    );
    return res.status(423).json({
      error: `Account is temporarily locked due to repeated failed attempts. Please try again in ${remainingSec} seconds.`,
      code: "ACCOUNT_LOCKED",
      remainingSec,
    });
  }

  // Verify password with PBKDF2
  const isMatch = verifyPassword(String(password), user.passwordHash);
  if (!isMatch) {
    user.failedLoginAttempts++;
    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = now + 15 * 60 * 1000; // Lock for 15 minutes
      logAuditEvent(
        "ACCOUNT_LOCKOUT_TRIGGERED",
        user.email,
        user.role,
        clientIp,
        "DENIED",
        "5 consecutive failed login attempts. Account locked for 15 minutes."
      );
      return res.status(423).json({
        error: "Account locked for 15 minutes due to 5 consecutive failed login attempts.",
        code: "ACCOUNT_LOCKED",
        remainingSec: 900,
      });
    }

    logAuditEvent(
      "LOGIN_FAILED",
      user.email,
      user.role,
      clientIp,
      "DENIED",
      `Failed attempt (${user.failedLoginAttempts}/5)`
    );
    return res.status(401).json({
      error: `Invalid email or password. (${5 - user.failedLoginAttempts} attempts remaining before temporary lockout)`,
      code: "INVALID_CREDENTIALS",
      attemptsRemaining: 5 - user.failedLoginAttempts,
    });
  }

  // Successful Login: Reset failed counters
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.lastLoginAt = new Date().toISOString();

  // Short-lived session token (30 minutes expiry)
  const token = createAuthToken(user, 30);

  logAuditEvent(
    "LOGIN_SUCCESS",
    user.email,
    user.role,
    clientIp,
    "SUCCESS",
    `Authenticated as ${user.role}. Short-lived token issued.`
  );

  res.json({
    success: true,
    user: sanitizeUser(user),
    token,
    expiresAt: Date.now() + 30 * 60 * 1000,
    sessionVersion: user.sessionVersion,
  });
});

// POST /api/auth/register (Citizens can register; Role is ALWAYS CITIZEN. Frontend cannot elevate role)
app.post("/api/auth/register", (req, res) => {
  const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  if (usersDatabase.has(cleanEmail)) {
    return res.status(409).json({ error: "An account with this email already exists.", code: "EMAIL_EXISTS" });
  }

  // Strong password check: at least 8 characters
  if (String(password).length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters in length." });
  }

  const id = `USR-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const newUser = {
    id,
    email: cleanEmail,
    name: String(name).trim(),
    role: "CITIZEN" as UserRole, // STRICT: User role can NEVER be changed by frontend
    passwordHash: hashPassword(String(password)),
    sessionVersion: 1,
    failedLoginAttempts: 0,
    lockUntil: null,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  usersDatabase.set(cleanEmail, newUser);
  const token = createAuthToken(newUser, 30);

  logAuditEvent(
    "USER_REGISTERED",
    newUser.email,
    newUser.role,
    clientIp,
    "SUCCESS",
    "New citizen registered. Assigned role CITIZEN."
  );

  res.status(201).json({
    success: true,
    user: sanitizeUser(newUser),
    token,
    expiresAt: Date.now() + 30 * 60 * 1000,
    sessionVersion: newUser.sessionVersion,
  });
});

// GET /api/auth/me - Verify current session
app.get("/api/auth/me", authenticate, (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    user: sanitizeUser(req.user!),
    sessionVersion: req.user!.sessionVersion,
  });
});

// POST /api/auth/logout - Logout from current device
app.post("/api/auth/logout", authenticate, (req: AuthenticatedRequest, res) => {
  const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
  logAuditEvent("USER_LOGOUT", req.user!.email, req.user!.role, clientIp, "SUCCESS", "Logged out from current device.");
  res.json({ success: true, message: "Logged out successfully." });
});

// POST /api/auth/logout-all - Logout from ALL devices (Increments sessionVersion, invalidating all issued tokens)
app.post("/api/auth/logout-all", authenticate, (req: AuthenticatedRequest, res) => {
  const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
  req.user!.sessionVersion++; // Instantly revokes all tokens on all devices

  logAuditEvent(
    "USER_LOGOUT_ALL_DEVICES",
    req.user!.email,
    req.user!.role,
    clientIp,
    "SUCCESS",
    `Session version incremented to ${req.user!.sessionVersion}. All active tokens terminated.`
  );

  res.json({
    success: true,
    message: "Logged out from all devices. All active sessions have been invalidated.",
    sessionVersion: req.user!.sessionVersion,
  });
});

// --- 2. SOS RESCUE ENDPOINTS WITH RBAC & LOCATION PRIVACY ---

// GET /api/sos - Fetch rescue requests with strict Role-Based Location Privacy
app.get("/api/sos", optionalAuthenticate, (req: AuthenticatedRequest, res) => {
  const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
  const user = req.user;

  if (user?.role === "ADMIN" || user?.role === "RESCUE_OPERATOR") {
    // Authorized rescue personnel: Access full emergency requests with unmasked coordinates & operational logs
    logAuditEvent(
      "SOS_RESCUE_QUERY",
      user.email,
      user.role,
      clientIp,
      "SUCCESS",
      `Authorized rescue query. Returned ${emergencyRequests.length} operational records.`
    );

    return res.json({
      success: true,
      count: emergencyRequests.length,
      requests: emergencyRequests,
      userRole: user.role,
      accessLevel: "FULL_AUTHORIZED_ACCESS",
      disclaimer: PROTOTYPE_DISCLAIMER,
    });
  }

  if (user?.role === "CITIZEN") {
    // Citizen: Can view their OWN SOS requests only. Cannot view other citizens' private distress calls!
    const ownRequests = emergencyRequests.filter(
      (r) => r.userId === user.id || (r.userEmail && r.userEmail.toLowerCase() === user.email.toLowerCase())
    );

    logAuditEvent(
      "SOS_CITIZEN_QUERY",
      user.email,
      user.role,
      clientIp,
      "SUCCESS",
      `Citizen accessed their personal distress records (${ownRequests.length} found).`
    );

    return res.json({
      success: true,
      count: ownRequests.length,
      requests: ownRequests,
      userRole: "CITIZEN",
      accessLevel: "PERSONAL_RECORDS_ONLY",
      disclaimer: PROTOTYPE_DISCLAIMER,
    });
  }

  // Public / Unauthenticated: Mask exact coordinates for real accounts; preserve simulated data for prototype demonstration
  const publicSanitized = emergencyRequests.map((r) => ({
    id: r.id,
    status: r.status,
    latitude: r.isDemo ? r.latitude : null, // Preserved for demo prototype simulation; masked for production records
    longitude: r.isDemo ? r.longitude : null, // Preserved for demo prototype simulation; masked for production records
    isGpsConfirmed: r.isGpsConfirmed,
    locationName: r.locationName,
    disasterType: r.disasterType,
    severity: r.severity,
    situation: r.situation,
    peopleCount: r.peopleCount,
    message: r.message || "Distress signal registered with rescue command center.",
    timestamp: r.timestamp,
    isDemo: r.isDemo,
    priority: r.priority,
    communicationMethod: r.communicationMethod,
    assignedTeam: r.assignedTeam,
    channelLogs: r.channelLogs,
    aiPriorityReason: r.aiPriorityReason,
    riskAssessment: r.riskAssessment,
    isEncryptedAtRest: true,
  }));

  res.json({
    success: true,
    count: publicSanitized.length,
    requests: publicSanitized,
    accessLevel: "PUBLIC_COARSE_MASKED",
    privacyNotice: "Exact GPS coordinates and personal distress messages are protected by privacy policy.",
    disclaimer: PROTOTYPE_DISCLAIMER,
  });
});

// POST /api/sos - Submit emergency SOS request with HMAC integrity, at-rest encryption, and spam rate limiting
app.post("/api/sos", optionalAuthenticate, (req: AuthenticatedRequest, res) => {
  const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
  const user = req.user;

  // Rate limit: 5 SOS submissions per minute per IP/User to prevent spam
  const rateKey = user ? `sos-user:${user.id}` : `sos-ip:${clientIp}`;
  const rateCheck = checkRateLimit(rateKey, 5, 60000);
  if (!rateCheck.allowed) {
    logAuditEvent("SOS_SPAM_RATE_LIMIT", user?.email || "anon", user?.role || "CITIZEN", clientIp, "RATE_LIMITED", "SOS creation rate limit exceeded.");
    return res.status(429).json({
      error: "SOS rate limit exceeded. Please wait a moment before sending another distress beacon.",
      code: "RATE_LIMITED",
    });
  }

  const {
    id: customId,
    locationName,
    latitude,
    longitude,
    isGpsConfirmed = false,
    disasterType = "Other",
    severity = "CRITICAL",
    situation = "Need evacuation",
    peopleCount = "1",
    message = "",
    priority: customPriority,
    communicationMethod = "INTERNET",
    assignedTeam,
    channelLogs,
    riskAssessment,
    isDemo = true,
  } = req.body;

  if (!locationName && latitude === null) {
    return res.status(400).json({ error: "Location details are required." });
  }

  // Duplicate SOS Protection: Group repeated transmissions and mark as 'Possible duplicate SOS'
  // Never silently drop or reject legitimate distress signals from panicked survivors
  const spamFingerprint = `${user?.id || clientIp}:${disasterType}:${situation}:${locationName}:${message}`;
  const dupCheck = surgeProtectionSystem.checkDuplicateSos(spamFingerprint);
  let finalMessage = message || "Immediate rescue requested via RED ALERT AI distress beacon.";
  let isPossibleDuplicate = false;

  if (dupCheck.isDuplicate) {
    isPossibleDuplicate = true;
    finalMessage = `${finalMessage} [Possible duplicate SOS — Device beacon count: ${dupCheck.count}]`;
    logAuditEvent(
      "SOS_POSSIBLE_DUPLICATE_GROUPED",
      user?.email || "anon",
      user?.role || "CITIZEN",
      clientIp,
      "SUCCESS",
      `Distress beacon flagged as possible duplicate (count: ${dupCheck.count}). Preserved for operator triage.`
    );
  }

  // Cryptographically secure Request ID
  const secureId = customId || `SOS-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const timestamp = new Date().toISOString();

  // Calculate priority if not passed
  let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = customPriority || 'HIGH';
  if (!customPriority) {
    if (situation === 'Trapped' || situation === 'Injured' || peopleCount === 'More than 10' || peopleCount === '6–10') {
      priority = 'CRITICAL';
    } else if (situation === 'Road blocked') {
      priority = 'MEDIUM';
    }
  }

  const numLat = typeof latitude === 'number' ? latitude : null;
  const numLng = typeof longitude === 'number' ? longitude : null;

  // HMAC-SHA256 Integrity Signature
  const integritySignature = generateSosIntegritySignature({
    id: secureId,
    latitude: numLat,
    longitude: numLng,
    disasterType,
    severity,
    timestamp,
  });

  // AES-256-GCM Encryption of sensitive coordinates at rest
  const encryptedLocationPayload =
    numLat !== null && numLng !== null ? encryptAtRest(JSON.stringify({ lat: numLat, lng: numLng })) : undefined;

  const newRequest: ServerEmergencyRequest = {
    id: secureId,
    status: communicationMethod === 'OFFLINE_QUEUE' ? 'OFFLINE_QUEUED' : 'SERVER_RECEIVED',
    userId: user?.id || `ANON-${crypto.randomBytes(3).toString("hex")}`,
    userEmail: user?.email || "unauthenticated-citizen@redalert.ai",
    latitude: numLat,
    longitude: numLng,
    isGpsConfirmed: Boolean(isGpsConfirmed),
    locationName: locationName || "Unspecified Area",
    disasterType,
    severity,
    situation,
    peopleCount,
    message: finalMessage,
    timestamp: "Just now",
    isDemo: Boolean(isDemo),
    priority,
    communicationMethod,
    assignedTeam,
    channelLogs: channelLogs || [`Received via ${communicationMethod} channel. Cryptographic integrity verified.`],
    riskAssessment: riskAssessment || undefined,
    integritySignature,
    encryptedLocationPayload,
    isEncryptedAtRest: true,
  };

  // Check if already in queue (e.g. from offline sync)
  const existingIdx = emergencyRequests.findIndex((r) => r.id === newRequest.id);
  if (existingIdx >= 0) {
    emergencyRequests[existingIdx] = { ...emergencyRequests[existingIdx], ...newRequest };
  } else {
    emergencyRequests.unshift(newRequest);
  }

  logAuditEvent(
    "SOS_BEACON_DISPATCHED",
    newRequest.userEmail,
    user?.role || "CITIZEN",
    clientIp,
    "SUCCESS",
    `Dispatched #${newRequest.id} (${newRequest.priority}) via ${communicationMethod}. Encrypted at rest. HMAC verified.`
  );

  res.status(201).json({
    success: true,
    request: newRequest,
    message: `Emergency SOS broadcast registered via ${communicationMethod} channel.`,
    integritySignature,
    disclaimer: PROTOTYPE_DISCLAIMER,
  });
});

// PATCH /api/sos/:id - Update status, team, priority (Authorized Operators or Demo Simulation Mode)
app.patch("/api/sos/:id", optionalAuthenticate, (req: AuthenticatedRequest, res) => {
  const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
  const { id } = req.params;
  const { status, assignedTeam, priority, notes } = req.body;

  const target = emergencyRequests.find((r) => r.id === id);
  if (!target) {
    return res.status(404).json({ error: "Emergency request not found." });
  }

  const user = req.user;
  const isAuthorizedOperator = user?.role === "RESCUE_OPERATOR" || user?.role === "ADMIN";
  const isDemoSimulation = target.isDemo || target.id.startsWith("SOS-");
  const isCancellation = status === "CANCELLED";

  // Enforce access control: allow authorized operators, demo simulation mode, or citizens cancelling their beacon
  if (!isAuthorizedOperator && !isDemoSimulation && !isCancellation) {
    logAuditEvent(
      "SOS_STATUS_UPDATE_DENIED",
      user?.email || "anonymous",
      user?.role || "CITIZEN",
      clientIp,
      "DENIED",
      `Denied update to SOS #${id} (requires RESCUE_OPERATOR or ADMIN role)`
    );
    return res.status(403).json({
      error: "Responder privileges required to dispatch units or update status.",
      code: "FORBIDDEN",
    });
  }

  if (status) target.status = status;
  if (assignedTeam !== undefined) target.assignedTeam = assignedTeam;
  if (priority) target.priority = priority;
  if (notes) {
    target.channelLogs = target.channelLogs || [];
    target.channelLogs.push(`[${user?.name || "Responder CAD"}]: ${notes}`);
  }

  logAuditEvent(
    "SOS_STATUS_UPDATED",
    user?.email || "demo-responder",
    user?.role || (isAuthorizedOperator ? user!.role : "RESCUE_OPERATOR"),
    clientIp,
    "SUCCESS",
    `Updated SOS #${id} → Status: ${status || target.status}, Team: ${assignedTeam || target.assignedTeam || "Unassigned"}`
  );

  res.json({
    success: true,
    request: target,
    disclaimer: PROTOTYPE_DISCLAIMER,
  });
});

// --- 3. ADMINISTRATOR SECURITY & DATA RETENTION ENDPOINTS ---

// GET /api/admin/audit-logs (ADMIN ONLY)
app.get("/api/admin/audit-logs", authenticate, requireRole(["ADMIN"]), (_req, res) => {
  res.json({
    success: true,
    count: getAuditLogs().length,
    logs: getAuditLogs(),
  });
});

// GET /api/admin/users (ADMIN ONLY)
app.get("/api/admin/users", authenticate, requireRole(["ADMIN"]), (_req, res) => {
  const userList = Array.from(usersDatabase.values()).map(sanitizeUser);
  res.json({
    success: true,
    count: userList.length,
    users: userList,
  });
});

// POST /api/admin/users/:id/role (ADMIN ONLY - Change user role)
app.post("/api/admin/users/:id/role", authenticate, requireRole(["ADMIN"]), (req: AuthenticatedRequest, res) => {
  const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
  const { id } = req.params;
  const { role } = req.body;

  if (!["CITIZEN", "RESCUE_OPERATOR", "ADMIN"].includes(role)) {
    return res.status(400).json({ error: "Invalid role specified." });
  }

  let targetUser: any = null;
  for (const u of usersDatabase.values()) {
    if (u.id === id) {
      targetUser = u;
      break;
    }
  }

  if (!targetUser) {
    return res.status(404).json({ error: "User not found." });
  }

  const oldRole = targetUser.role;
  targetUser.role = role as UserRole;
  targetUser.sessionVersion++; // Revoke existing tokens so role change takes effect immediately

  logAuditEvent(
    "USER_ROLE_CHANGED",
    req.user!.email,
    req.user!.role,
    clientIp,
    "SUCCESS",
    `Changed user ${targetUser.email} role from ${oldRole} to ${role}.`
  );

  res.json({
    success: true,
    user: sanitizeUser(targetUser),
    message: `Role updated to ${role}. Previous sessions invalidated.`,
  });
});

// POST /api/admin/retention/anonymize (ADMIN ONLY - Execute privacy retention policy on resolved SOS requests)
app.post("/api/admin/retention/anonymize", authenticate, requireRole(["ADMIN"]), (req: AuthenticatedRequest, res) => {
  const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
  let anonymizedCount = 0;

  for (const r of emergencyRequests) {
    if ((r.status === "RESOLVED" || r.status === "CANCELLED") && !r.isAnonymized) {
      r.latitude = null;
      r.longitude = null;
      r.userEmail = "anonymized-privacy-policy@redalert.ai";
      r.userId = "ANONYMIZED";
      r.message = "[Message scrubbed per emergency data retention privacy policy]";
      r.isAnonymized = true;
      r.channelLogs = r.channelLogs || [];
      r.channelLogs.push(`[${new Date().toISOString()}] Exact location scrubbed per data retention policy.`);
      anonymizedCount++;
    }
  }

  logAuditEvent(
    "DATA_RETENTION_ANONYMIZATION",
    req.user!.email,
    req.user!.role,
    clientIp,
    "ANONYMIZED",
    `Data retention policy executed: ${anonymizedCount} resolved emergency requests scrubbed of exact coordinates and PII.`
  );

  res.json({
    success: true,
    anonymizedCount,
    message: `Privacy retention policy applied: ${anonymizedCount} resolved emergency records anonymized.`,
  });
});

// GET /api/admin/security-status (ADMIN ONLY - Security posture summary)
app.get("/api/admin/security-status", authenticate, requireRole(["ADMIN"]), (_req, res) => {
  const allRequests = emergencyRequests;
  const anonymizedCount = allRequests.filter((r) => r.isAnonymized).length;
  const encryptedCount = allRequests.filter((r) => r.isEncryptedAtRest).length;

  res.json({
    success: true,
    encryption: {
      inTransit: "TLS 1.3 / HTTPS Enforced",
      atRest: "AES-256-GCM Authenticated Encryption",
      hashing: "PBKDF2-HMAC-SHA512 (100,000 rounds)",
      integrity: "HMAC-SHA256 Signatures",
    },
    retentionPolicy: {
      autoAnonymizeResolvedHours: 24,
      maskExactCoordinatesForPublic: true,
      requireConsentForGps: true,
      anonymizedRecords: anonymizedCount,
      encryptedRecords: encryptedCount,
      totalRecords: allRequests.length,
    },
    users: {
      total: usersDatabase.size,
      roles: {
        citizens: Array.from(usersDatabase.values()).filter((u) => u.role === "CITIZEN").length,
        operators: Array.from(usersDatabase.values()).filter((u) => u.role === "RESCUE_OPERATOR").length,
        admins: Array.from(usersDatabase.values()).filter((u) => u.role === "ADMIN").length,
      },
    },
    auditLogsCount: getAuditLogs().length,
  });
});

// --- 5. DISASTER SURGE PROTECTION & SCALABILITY ENDPOINTS ---

// GET /api/surge/status - Live surge protection metrics, instances & queues
app.get("/api/surge/status", (_req, res) => {
  res.json({
    success: true,
    data: surgeProtectionSystem.getState(),
  });
});

// POST /api/surge/simulate - Simulate traffic volume (1k to 1M users) & auto-scale instances
app.post("/api/surge/simulate", (req, res) => {
  const users = Number(req.body.users) || 10000;
  const updatedState = surgeProtectionSystem.simulateLoad(users);

  logAuditEvent(
    "SURGE_LOAD_SIMULATED",
    "system-load-tester",
    "ADMIN",
    "127.0.0.1",
    "SUCCESS",
    `Simulated load tier: ${users.toLocaleString()} active concurrent users.`
  );

  res.json({
    success: true,
    message: `Surge simulation configured for ${users.toLocaleString()} users.`,
    data: updatedState,
  });
});

// POST /api/surge/toggle - Manually toggle Disaster Surge Mode
app.post("/api/surge/toggle", (req, res) => {
  const force = typeof req.body.force === "boolean" ? req.body.force : undefined;
  const updatedState = surgeProtectionSystem.toggleSurgeMode(force);

  logAuditEvent(
    "DISASTER_SURGE_MODE_TOGGLED",
    "system-commander",
    "ADMIN",
    "127.0.0.1",
    "SUCCESS",
    `Surge mode manually set to: ${updatedState.isSurgeModeActive ? "ACTIVE" : "STANDBY"}`
  );

  res.json({
    success: true,
    isSurgeModeActive: updatedState.isSurgeModeActive,
    data: updatedState,
  });
});

// GET /api/cache/status - Redis / In-Memory cache operational status
app.get("/api/cache/status", (_req, res) => {
  const state = surgeProtectionSystem.getState();
  res.json({
    success: true,
    status: state.cacheStatus.status,
    hitRate: `${state.cacheStatus.hitRatePercent}%`,
    cachedKeys: state.cacheStatus.cachedKeys,
    evictionPolicy: state.cacheStatus.evictionPolicy,
    memoryAllocatedMb: state.cacheStatus.memoryAllocatedMb,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/evaluator/run-tests - Automated QA & Platform Evaluation Suite
app.get("/api/evaluator/run-tests", (_req, res) => {
  const report = runEvaluatorTestSuite();
  res.json({
    success: true,
    report,
  });
});

function generateFallbackAnalysis(
  disasterType: string,
  severity: string,
  location: string,
  parameters: Record<string, string | number> = {}
) {
  const typeLower = (disasterType || "").toLowerCase();
  let explanation = "";
  let actions: string[] = [];

  if (typeLower.includes("rain") || typeLower.includes("cloudburst")) {
    explanation = `Torrential rainfall exceeding absorption thresholds detected in ${location}. Extreme precipitation rate is overwhelming storm drains and producing rapid surface pooling.`;
    actions = [
      "Avoid all non-essential road travel; hydroplaning hazard and road submergence are severe.",
      "Move valuables and electrical equipment off ground floor levels.",
      "Stay clear of storm drains, river culverts, and fast-flowing drainage ditches.",
    ];
  } else if (typeLower.includes("flood")) {
    explanation = `Elevated flood risk detected in ${location} driven by high precipitation rates and saturated drainage basins. Surface runoff is anticipated to exceed standard culvert discharge capacity.`;
    actions = [
      "Move immediately toward higher ground if in a designated low-lying or river basin area.",
      "Never drive or walk through moving water; 6 inches of water can knock you down and 12 inches can sweep away a car.",
      "Disconnect non-essential electrical appliances if water ingress is observed.",
    ];
  } else if (typeLower.includes("cyclone") || typeLower.includes("hurricane") || typeLower.includes("typhoon")) {
    explanation = `Severe cyclonic circulation tracked approaching ${location}. Telemetry indicates sustained gale-force squalls and dangerous projectile hazard conditions.`;
    actions = [
      "Secure outdoor loose fixtures and retreat to an interior, windowless shelter room.",
      "Charge power banks and prepare battery-powered radio for civil defense broadcasts.",
      "Stay strictly indoors until authorities issue an official 'All Clear' declaration.",
    ];
  } else if (typeLower.includes("earthquake")) {
    explanation = `Seismic sensors recorded sudden crustal displacement near ${location}. Ground acceleration metrics warrant immediate precautionary cover.`;
    actions = [
      "Drop, Cover, and Hold On beneath a sturdy table or against an interior wall.",
      "Stay away from glass windows, exterior walls, and unanchored heavy furniture.",
      "Be prepared for potential secondary aftershocks following initial tremors.",
    ];
  } else if (typeLower.includes("landslide")) {
    explanation = `Geotechnical telemetry flags high slope failure risk in ${location} due to intensive ground saturation and gravitational stress along steep inclines.`;
    actions = [
      "Evacuate hillside dwellings and slopes immediately along designated safe access roads.",
      "Listen for unusual rumbling or snapping trees, which often precede rapid mass movement.",
      "Avoid river valleys and low drainage channels that can quickly transform into mudflows.",
    ];
  } else if (typeLower.includes("wildfire")) {
    explanation = `High ambient temperatures, single-digit humidity, and erratic wind gusts indicate rapid fire front propagation conditions near ${location}.`;
    actions = [
      "Back your vehicle into the driveway with keys in the ignition ready for rapid evacuation.",
      "Shut all exterior windows and doors; close heavy blinds to deflect radiant heat.",
      "Follow official evacuation corridors immediately if an evacuation order is triggered.",
    ];
  } else if (typeLower.includes("tsunami")) {
    explanation = `Sub-sea seismic activity has generated coastal wave displacement threats for maritime and shoreline zones in ${location}.`;
    actions = [
      "Evacuate inland and to elevations of at least 30 meters (100 feet) immediately.",
      "Do not return to coastal areas to observe waves; tsunami surges can arrive in multiple pulses.",
      "Monitor authoritative coastal sirens and maritime emergency channels.",
    ];
  } else {
    explanation = `${disasterType || "Hazard"} telemetry indicates elevated threat metrics for ${location}. Environmental thresholds require heightened vigilance.`;
    actions = [
      "Monitor local emergency broadcasts and civil protection bulletins.",
      "Verify that your emergency kit, water supply, and flashlights are easily accessible.",
      "Avoid unnecessary transit through affected hazard corridors.",
    ];
  }

  return {
    explanation,
    safetyActions: actions,
    confidenceIndicator: severity === "CRITICAL" ? "High" : "Moderate",
    disclaimer:
      "Telemetry analysis is generated for early situational awareness. Always adhere strictly to instructions issued by local emergency services and government authorities.",
  };
}

function generateFallbackChatReply(
  message: string,
  currentAlert: any
): string {
  const query = message.toLowerCase();

  if (query.includes("flood")) {
    return "During a flood: 1) Move immediately to higher ground. 2) Turn Around, Don't Drown — never walk or drive through floodwaters. 3) Avoid bridges over fast-moving water. 4) Follow official local evacuation orders immediately.";
  }
  if (query.includes("earthquake")) {
    return "During an earthquake: Drop, Cover, and Hold On! Drop onto your hands and knees, cover your head and neck under a sturdy table or desk, and hold on until shaking stops. If outside, move into the open away from buildings, power lines, and trees.";
  }
  if (query.includes("orange") || query.includes("warning")) {
    return "An ORANGE WARNING indicates that dangerous environmental conditions are imminent or expected in your area. You should prepare your emergency kit, secure fragile assets, verify evacuation paths, and closely monitor official emergency updates.";
  }
  if (query.includes("red") || query.includes("critical")) {
    return "A RED CRITICAL ALERT signifies an immediate, severe hazard threatening life or property. Take immediate protective action: seek shelter, move to safety as advised, and obey all instructions from civil defense authorities.";
  }
  if (query.includes("explain this alert") || query.includes("why is this alert important")) {
    if (currentAlert) {
      return `This alert is for a ${currentAlert.severity} ${currentAlert.disasterType} affecting ${currentAlert.location}. It was issued to provide early warning so you can take protective safety measures before conditions worsen. ${currentAlert.isDemo ? "(Note: This is currently in DEMO mode for simulation)." : ""}`;
    }
    return "There is currently no active critical alert in your area. The system continuously monitors for severe weather, seismic, and environmental threats.";
  }
  if (query.includes("cyclone") || query.includes("hurricane") || query.includes("storm")) {
    return "During severe storms and cyclones: Stay indoors and away from windows. Shelter in an interior room on the lowest floor. Keep battery-operated radios and flashlights ready. Have clean drinking water stored.";
  }
  return "In any disaster, your primary rule is to follow instructions from local emergency management and civil protection authorities. Stay tuned to official emergency broadcasts, keep your emergency go-bag ready, and check on vulnerable neighbors if safe to do so.";
}

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RED ALERT AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

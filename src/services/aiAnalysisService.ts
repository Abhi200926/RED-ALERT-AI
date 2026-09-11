import { RescuePriority, DisasterType, AlertSeverity, PeopleNeedingHelp, CommunicationChannel } from '../types';

export interface AiRescuePriorityResult {
  priority: RescuePriority;
  reason: string;
  recommendedUnits: string[];
  urgencyLevel: string;
  source: string;
  timestamp: string;
}

export class AiAnalysisService {
  /**
   * Request AI risk and rescue priority analysis
   */
  static async analyzeSosRescuePriority(params: {
    disasterType: DisasterType | 'Other' | string;
    severity: AlertSeverity | string;
    location: string;
    peopleCount: PeopleNeedingHelp | string;
    situation: string;
    communicationStatus: CommunicationChannel | string;
    message?: string;
  }): Promise<AiRescuePriorityResult> {
    try {
      const res = await fetch('/api/ai/risk-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.priority) {
          return {
            priority: data.priority,
            reason: data.reason,
            recommendedUnits: data.recommendedUnits || ['Swift Water Rescue', 'Paramedic Unit'],
            urgencyLevel: data.urgencyLevel || 'Immediate Action Required',
            source: data.source || 'Gemini 3.8 Flash (Server-Side)',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        }
      }
    } catch (e) {
      console.warn('AI rescue priority call failed, using deterministic emergency rules:', e);
    }

    // Deterministic offline safety rule fallback
    return this.getFallbackPriority(params);
  }

  static getFallbackPriority(params: {
    disasterType: string;
    peopleCount: string;
    situation: string;
    communicationStatus: string;
  }): AiRescuePriorityResult {
    let priority: RescuePriority = 'HIGH';
    let reason = '';
    const units: string[] = [];

    const isTrapped = params.situation.toLowerCase().includes('trap');
    const isInjured = params.situation.toLowerCase().includes('injur');
    const isWater = params.situation.toLowerCase().includes('water') || params.disasterType.toLowerCase().includes('flood') || params.disasterType.toLowerCase().includes('rain');
    const highCasualties = params.peopleCount.includes('More than 10') || params.peopleCount.includes('6–10');

    if (isTrapped && (isWater || highCasualties)) {
      priority = 'CRITICAL';
      reason = `Life-threatening hazard: ${params.peopleCount} individuals reported ${params.situation} amidst active ${params.disasterType}. Risk of structural or water ingress within minutes.`;
      units.push('Swift Water Rescue Boat', 'Tactical Urban Search & Rescue (US&R)');
    } else if (isTrapped || isInjured) {
      priority = 'CRITICAL';
      reason = `Direct medical / extraction urgency: Casualties requiring immediate triage in ${params.disasterType} perimeter.`;
      units.push('Advanced Life Support Paramedic Unit', 'Technical Extrication Team');
    } else if (isWater) {
      priority = 'HIGH';
      reason = `Rising hydrological hazard in sector: Rapid floodwater or torrential precipitation requires precautionary evacuation before road submergence.`;
      units.push('High-Clearance Amphibious Transport', 'Local Volunteer Fire Crew');
    } else if (params.situation.toLowerCase().includes('blocked')) {
      priority = 'MEDIUM';
      reason = `Egress obstacle reported without immediate structural collapse or acute trauma. Safe awaiting debris clearance.`;
      units.push('Public Works Heavy Plant / Towing Equipment');
    } else {
      priority = 'HIGH';
      reason = `Standard emergency priority assigned based on verified multi-channel distress beacon in active disaster zone.`;
      units.push('Regional Civil Protection Rescue Squad');
    }

    return {
      priority,
      reason,
      recommendedUnits: units,
      urgencyLevel: priority === 'CRITICAL' ? 'Immediate 15-Minute Response Window' : '30–45 Minute Response Window',
      source: 'RED ALERT AI Deterministic Triage Engine (Offline Compliant)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
}

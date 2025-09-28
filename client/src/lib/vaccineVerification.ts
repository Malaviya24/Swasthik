// Vaccine Verification Service
// Handles verification of vaccine information against official sources

import { VaccineRecord, VaccineSource, TRUSTED_SOURCES } from './vaccine';

export interface VerificationResult {
  vaccine: string;
  verified: boolean;
  sources: VaccineSource[];
  disagreement?: string;
  lastVerified: string;
  confidence: number;
}

export interface VerificationCache {
  [vaccineId: string]: VerificationResult;
}

export class VaccineVerificationService {
  private static instance: VaccineVerificationService;
  private cache: VerificationCache = {};
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  private constructor() {}

  public static getInstance(): VaccineVerificationService {
    if (!VaccineVerificationService.instance) {
      VaccineVerificationService.instance = new VaccineVerificationService();
    }
    return VaccineVerificationService.instance;
  }

  // Verify a single vaccine
  async verifyVaccine(vaccineId: string): Promise<VerificationResult> {
    // Check cache first
    const cached = this.cache[vaccineId];
    if (cached && this.isCacheValid(cached.lastVerified)) {
      return cached;
    }

    // Perform verification
    const result = await this.performVerification(vaccineId);
    
    // Cache the result
    this.cache[vaccineId] = result;
    
    return result;
  }

  // Verify multiple vaccines
  async verifyVaccines(vaccineIds: string[]): Promise<VerificationResult[]> {
    const promises = vaccineIds.map(id => this.verifyVaccine(id));
    return Promise.all(promises);
  }

  // Batch verify all vaccines in the database
  async verifyAllVaccines(vaccines: VaccineRecord[]): Promise<VerificationResult[]> {
    const vaccineIds = vaccines.map(v => v.id);
    return this.verifyVaccines(vaccineIds);
  }

  // Check if verification is needed for a vaccine
  needsVerification(vaccineId: string): boolean {
    const cached = this.cache[vaccineId];
    return !cached || !this.isCacheValid(cached.lastVerified);
  }

  // Get verification status for a vaccine
  getVerificationStatus(vaccineId: string): 'verified' | 'needs_verification' | 'unknown' {
    const cached = this.cache[vaccineId];
    if (!cached) return 'unknown';
    if (!this.isCacheValid(cached.lastVerified)) return 'needs_verification';
    return cached.verified ? 'verified' : 'needs_verification';
  }

  // Clear cache for a specific vaccine
  clearCache(vaccineId: string): void {
    delete this.cache[vaccineId];
  }

  // Clear all cache
  clearAllCache(): void {
    this.cache = {};
  }

  // Get cache statistics
  getCacheStats(): { total: number; verified: number; needsVerification: number } {
    const total = Object.keys(this.cache).length;
    const verified = Object.values(this.cache).filter(v => v.verified).length;
    const needsVerification = total - verified;
    
    return { total, verified, needsVerification };
  }

  private async performVerification(vaccineId: string): Promise<VerificationResult> {
    // In a real implementation, this would:
    // 1. Query official health authority APIs
    // 2. Scrape trusted websites
    // 3. Check peer-reviewed sources
    // 4. Validate against multiple sources
    
    // For now, simulate verification based on vaccine ID
    const mockSources: VaccineSource[] = [
      {
        title: "MoHFW - Universal Immunization Programme",
        url: "https://main.mohfw.gov.in/sites/default/files/Immunization_UIP.pdf",
        retrieved: new Date().toISOString().split('T')[0]
      },
      {
        title: "WHO - Immunization Guidelines",
        url: "https://www.who.int/immunization/policy/immunization_tables/en/",
        retrieved: new Date().toISOString().split('T')[0]
      },
      {
        title: "ICMR - Vaccine Guidelines",
        url: "https://www.icmr.gov.in/",
        retrieved: new Date().toISOString().split('T')[0]
      }
    ];

    // Simulate verification logic
    const isVerified = this.simulateVerificationLogic(vaccineId);
    const confidence = isVerified ? 0.95 : 0.60;

    return {
      vaccine: vaccineId,
      verified: isVerified,
      sources: isVerified ? mockSources : [],
      lastVerified: new Date().toISOString(),
      confidence
    };
  }

  private simulateVerificationLogic(vaccineId: string): boolean {
    // Simulate verification based on vaccine type and common patterns
    const mandatoryVaccines = ['bcg', 'hepb', 'dpt', 'measles'];
    const recommendedVaccines = ['covid19', 'influenza', 'pneumococcal'];
    
    if (mandatoryVaccines.includes(vaccineId)) {
      return true; // Always verified for mandatory vaccines
    }
    
    if (recommendedVaccines.includes(vaccineId)) {
      return Math.random() > 0.2; // 80% chance of verification
    }
    
    return Math.random() > 0.5; // 50% chance for other vaccines
  }

  private isCacheValid(lastVerified: string): boolean {
    const lastVerifiedDate = new Date(lastVerified);
    const now = new Date();
    const diffInMs = now.getTime() - lastVerifiedDate.getTime();
    return diffInMs < this.CACHE_DURATION;
  }

  // Validate source URLs against trusted domains
  validateSource(source: VaccineSource): boolean {
    try {
      const url = new URL(source.url);
      return TRUSTED_SOURCES.some(domain => url.hostname.includes(domain));
    } catch {
      return false;
    }
  }

  // Get verification report for all vaccines
  async getVerificationReport(vaccines: VaccineRecord[]): Promise<{
    total: number;
    verified: number;
    needsVerification: number;
    confidence: number;
    lastUpdated: string;
  }> {
    const results = await this.verifyAllVaccines(vaccines);
    
    const total = results.length;
    const verified = results.filter(r => r.verified).length;
    const needsVerification = total - verified;
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / total;
    const lastUpdated = new Date().toISOString();

    return {
      total,
      verified,
      needsVerification,
      confidence: avgConfidence,
      lastUpdated
    };
  }
}

// Export singleton instance
export const vaccineVerificationService = VaccineVerificationService.getInstance();

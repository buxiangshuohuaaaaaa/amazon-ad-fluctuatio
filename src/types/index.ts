export type Trend = 'up' | 'down' | 'stable';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ScenarioId = 'A' | 'B' | 'C' | 'E' | 'F' | 'unknown';
export type StrategyDirection = 'keep_volume' | 'keep_profit' | 'observe' | 'stop_loss';
export type CompetitorPromoType = 'price_cut' | 'coupon' | 'lightning_deal' | 'best_deal' | 'deal_of_the_day';

export interface MetricInput {
  period: 'today' | '3d' | '7d' | '30d';
  impressionTrend: Trend;
  clickTrend: Trend;
  orderTrend: Trend;
  ctrTrend: Trend;
  cvrTrend: Trend;
  cpcTrend: Trend;
  acosTrend: Trend;
}

export interface ContextInput {
  currentBid: string;
  lastWeekBid: string;
  currentPrice: string;
  lastWeekPrice: string;
  currentRating: string;
  lastWeekRating: string;
  hasBadReviewOnTop: boolean;
  stockIssue: boolean;
  hasNewNegatives: boolean;
  hasCompetitorPromo: boolean;
  competitorPromoTypes: CompetitorPromoType[];
  hasHighClickZeroConv: boolean;
  highClickThreshold: number;
}

export interface DiagnosisInput {
  metrics: MetricInput;
  context: ContextInput;
}

export interface CauseItem {
  name: string;
  reason: string;
  tag: 'competitor' | 'self' | 'market' | 'traffic' | 'conversion';
}

export interface VerifyAction {
  action: string;
  detail: string;
}

export interface ExecAction {
  label: string;
  priority: 'immediate' | 'observe' | 'defer' | 'not_recommended';
  detail: string;
}

export interface DiagnosisResult {
  scenarioId: ScenarioId;
  scenarioName: string;
  riskLevel: RiskLevel;
  topCauses: CauseItem[];
  verifyActions: VerifyAction[];
  execActions: ExecAction[];
  strategyDirection: StrategyDirection;
  observePeriod: string;
  needStopLoss: boolean;
  summary: string;
  observeMetrics: string[];
  nextReviewFocus: string[];
}

export interface DiagnosisRecord {
  id: string;
  timestamp: number;
  input: DiagnosisInput;
  result: DiagnosisResult;
}

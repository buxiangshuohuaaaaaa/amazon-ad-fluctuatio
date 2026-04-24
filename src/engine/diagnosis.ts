import type { DiagnosisInput, DiagnosisResult, ScenarioId, RiskLevel, StrategyDirection, CauseItem, VerifyAction, ExecAction } from '../types';

function determineScenario(input: DiagnosisInput): ScenarioId {
  const { metrics, context } = input;
  const { impressionTrend, clickTrend, orderTrend, acosTrend } = metrics;

  if (context.hasHighClickZeroConv && acosTrend === 'up' && orderTrend === 'down') return 'F';
  if (impressionTrend === 'down' && orderTrend === 'down') return 'A';
  if (impressionTrend === 'up' && orderTrend === 'up' && acosTrend === 'up') return 'B';
  if (impressionTrend !== 'down' && clickTrend === 'up' && orderTrend !== 'up' && acosTrend === 'up') return 'E';
  if (impressionTrend !== 'down' && orderTrend === 'down') return 'C';
  return 'unknown';
}

function getRiskLevel(scenarioId: ScenarioId, input: DiagnosisInput): RiskLevel {
  switch (scenarioId) {
    case 'F': return 'critical';
    case 'A': return input.context.hasNewNegatives ? 'high' : 'medium';
    case 'B': return 'medium';
    case 'C': return (input.context.hasBadReviewOnTop || input.context.stockIssue) ? 'high' : 'medium';
    case 'E': return 'medium';
    default: return 'low';
  }
}

function getStrategy(scenarioId: ScenarioId): StrategyDirection {
  switch (scenarioId) {
    case 'F': return 'stop_loss';
    case 'A': return 'observe';
    case 'B': return 'keep_profit';
    case 'C': return 'observe';
    case 'E': return 'keep_profit';
    default: return 'observe';
  }
}

const scenarioNames: Record<ScenarioId, string> = {
  A: '流量与订单双降',
  B: '规模扩张风险',
  C: '竞品冲击 / 客诉问题 / 转化受损',
  E: '流量分散 / 无效点击 / 只点不买',
  F: '止损回炉 / 极端清退',
  unknown: '暂无匹配场景',
};

function buildScenarioA(input: DiagnosisInput): Partial<DiagnosisResult> {
  const causes: CauseItem[] = [];
  const verifies: VerifyAction[] = [];
  const actions: ExecAction[] = [];

  causes.push({ name: '排名下降（广告位/自然位）', reason: '曝光和订单同时下降，最常见的原因是关键词排名或广告位位置下滑，导致流量入口减少。', tag: 'traffic' });
  causes.push({ name: '市场需求下降（季节性）', reason: '如果整个类目都在下滑，说明是市场大盘问题而非单品问题。', tag: 'market' });
  if (input.context.hasNewNegatives) {
    causes.push({ name: '否定词误伤', reason: '新增否定词可能把有效流量词也否掉了，导致曝光和订单同时下降。', tag: 'self' });
  }

  verifies.push({ action: '查市场趋势', detail: '在品牌分析或第三方工具中查看类目搜索量趋势，判断是否整体下滑。' });
  verifies.push({ action: '查关键词排名和广告位位置', detail: '对比核心关键词的搜索排名和广告位是否发生变化。' });
  if (input.context.hasNewNegatives) {
    verifies.push({ action: '查否定列表是否误伤', detail: '检查最近添加的否定词，是否有误否了高转化词。' });
  }

  actions.push({ label: '如果是排名掉落，小幅上调 Bid', priority: 'immediate', detail: '建议上调 1%~2%，观察 3 天看排名是否恢复。不要一次性大幅加价。' });
  actions.push({ label: '如果是市场整体下滑，稳住 ACOS', priority: 'observe', detail: '不要大幅调价，以稳住 ACOS 为准，避免在缩量市场里烧更多钱。' });
  if (input.context.hasNewNegatives) {
    actions.push({ label: '移除误否词', priority: 'immediate', detail: '把误否的有效词从否定列表中移除，恢复流量入口。' });
  }
  actions.push({ label: '不要盲目加大预算', priority: 'not_recommended', detail: '在未确认原因前加大预算可能只是加速烧钱，不会解决问题。' });

  return {
    topCauses: causes,
    verifyActions: verifies,
    execActions: actions,
    observePeriod: '3~5 天',
    needStopLoss: false,
    summary: '曝光和订单双降，优先排查排名和市场趋势，切忌盲目加价。',
    observeMetrics: ['曝光量', '关键词排名', 'ACOS'],
    nextReviewFocus: ['排名是否恢复', '否定词是否误伤', '市场趋势是否回暖'],
  };
}

function buildScenarioB(): Partial<DiagnosisResult> {
  const causes: CauseItem[] = [];
  const verifies: VerifyAction[] = [];
  const actions: ExecAction[] = [];

  causes.push({ name: '新增流量相关性不足', reason: '曝光和订单都在增长，但 ACOS 也在上升，说明新增流量中有大量低转化流量，拉高了整体花费。', tag: 'traffic' });
  causes.push({ name: '为冲销量牺牲利润', reason: '当前策略可能在用高 Bid 抢量，但转化效率不足以支撑花费。', tag: 'self' });
  causes.push({ name: '类目竞争加剧', reason: '竞品加价抢位导致 CPC 上升，同样预算获得的转化减少。', tag: 'competitor' });

  verifies.push({ action: '检查当前 ACOS 是否已突破毛利率', detail: '如果 ACOS 已经高于毛利率，说明每出一单都在亏钱，需要立刻调整。' });
  verifies.push({ action: '查看搜索词报告', detail: '确认新增流量是否来自高度相关的词，还是被无关词拉来的。' });
  verifies.push({ action: '对比 CPC 变化', detail: '如果 CPC 明显上升，说明竞争加剧，需要评估是否值得继续抢位。' });

  actions.push({ label: '若 ACOS 在利润可承受范围内，保销量', priority: 'observe', detail: 'Bid 先不动，持续观察 ACOS 走势和利润率。' });
  actions.push({ label: '若 ACOS 过高，保利润', priority: 'immediate', detail: '分步逐次降 Bid，每次降 5%~10%，观察 3 天后再决定是否继续降。' });
  actions.push({ label: '清理低转化搜索词', priority: 'immediate', detail: '对高点击低转化的词降价或否定，减少无效花费。' });
  actions.push({ label: '不要一次性大幅降 Bid', priority: 'not_recommended', detail: '大幅降 Bid 可能导致排名骤降，流量断崖式下跌，恢复成本更高。' });

  return {
    topCauses: causes,
    verifyActions: verifies,
    execActions: actions,
    observePeriod: '3~5 天',
    needStopLoss: false,
    summary: '规模扩张但利润承压，关键是判断 ACOS 是否突破毛利率底线，再决定保量还是保利。',
    observeMetrics: ['ACOS', 'CPC', '搜索词转化率'],
    nextReviewFocus: ['ACOS 是否回落到毛利率以下', '新增流量质量', 'CPC 趋势'],
  };
}

function buildScenarioC(input: DiagnosisInput): Partial<DiagnosisResult> {
  const causes: CauseItem[] = [];
  const verifies: VerifyAction[] = [];
  const actions: ExecAction[] = [];

  if (input.context.hasBadReviewOnTop) {
    causes.push({ name: '差评置顶影响转化', reason: '差评出现在首页会严重影响买家决策，导致曝光不降但转化率大幅下滑。', tag: 'self' });
  }
  if (input.context.hasCompetitorPromo) {
    causes.push({ name: '竞品促销抢夺流量', reason: '竞品开启大额 Coupon、秒杀、降价等活动，买家被竞品吸引，本品转化率下降。', tag: 'competitor' });
  }
  if (input.context.stockIssue) {
    causes.push({ name: '配送时效变差', reason: '配送变慢会导致买家转向竞品，尤其是有 Prime 标志的竞品。', tag: 'self' });
  }
  if (parseFloat(input.context.currentRating) < parseFloat(input.context.lastWeekRating)) {
    causes.push({ name: '评分下降到关键阈值以下', reason: '评分跌破 4.0 或 4.3 等关键阈值时，会显著影响转化率。', tag: 'self' });
  }
  if (causes.length === 0) {
    causes.push({ name: 'Listing 竞争力下降', reason: '曝光不降但出单减少，说明流量还在但转化出了问题，最可能是 Listing 本身竞争力下降。', tag: 'conversion' });
  }

  if (input.context.hasBadReviewOnTop) {
    verifies.push({ action: '检查 Listing 首页差评', detail: '确认差评内容和位置，评估对转化的影响程度。' });
  }
  if (input.context.hasCompetitorPromo) {
    verifies.push({ action: '查看竞品促销详情', detail: '确认竞品促销类型、力度和持续时间，判断是短期还是长期行为。' });
  }
  verifies.push({ action: '检查配送时效', detail: '确认本品配送时间是否变长，与竞品对比。' });
  verifies.push({ action: '对比 CPC 变化', detail: '如果 CPC 明显上升，说明竞品在抢位，需要评估是否跟进。' });

  if (input.context.hasBadReviewOnTop) {
    actions.push({ label: '优先处理差评', priority: 'immediate', detail: '通过客服渠道联系买家解决问题，同时通过主图/A+优化缓解差评影响，反馈给供应链。' });
  }
  if (input.context.hasCompetitorPromo) {
    actions.push({ label: '竞品短期促销：先观察', priority: 'observe', detail: '如果竞品是秒杀等短期活动，先观察几天，不急着立刻跟价。' });
    actions.push({ label: '竞品长期折扣：核算后决定', priority: 'immediate', detail: '如果竞品是长期折扣，快速核算利润后决定是否跟进降价或增加 Coupon。' });
  }
  actions.push({ label: '处理周期较长时，适度降价对冲', priority: 'observe', detail: '在差评处理或配送恢复期间，可通过适度降价或增加折扣对冲竞争力下降。' });
  actions.push({ label: '不要在未确认原因前大幅降价', priority: 'not_recommended', detail: '盲目降价会压缩利润空间，且不一定能解决根本问题。' });

  return {
    topCauses: causes,
    verifyActions: verifies,
    execActions: actions,
    observePeriod: '5~7 天',
    needStopLoss: false,
    summary: '曝光不降但出单减少，说明转化出了问题，优先排查差评、竞品促销和配送时效。',
    observeMetrics: ['CVR', '评分', '配送时效', '竞品促销状态'],
    nextReviewFocus: ['差评是否处理', '竞品促销是否结束', 'CVR 是否恢复'],
  };
}

function buildScenarioE(input: DiagnosisInput): Partial<DiagnosisResult> {
  const causes: CauseItem[] = [];
  const verifies: VerifyAction[] = [];
  const actions: ExecAction[] = [];

  causes.push({ name: '搜索词只点不买', reason: '某些搜索词点击量很高但转化率为零，说明流量被引向了不相关的用户。', tag: 'traffic' });
  causes.push({ name: '流量被引向无关关联位', reason: '广告出现在不相关的商品详情页上，买家点击后发现不是需要的商品就离开。', tag: 'traffic' });
  causes.push({ name: '流量质量下降', reason: '整体流量质量变差，点击增加但购买意愿没有同步提升。', tag: 'traffic' });

  verifies.push({ action: '查看搜索词报告', detail: `找出点击超过 ${input.context.highClickThreshold} 次但 0 转化的词，这些是"只点不买"的典型词。` });
  verifies.push({ action: '检查广告位报告', detail: '确认广告是否出现在不相关的关联位上，如互补品或无关品类。' });

  actions.push({ label: '对只点不买的词降价或暂停', priority: 'immediate', detail: '对这些词降 Bid 或直接暂停，减少无效花费。' });
  actions.push({ label: '否定不相关搜索词', priority: 'immediate', detail: '把明显不相关的词加入否定列表，防止继续烧钱。' });
  actions.push({ label: '调整广告位竞价', priority: 'observe', detail: '如果问题出在关联位，降低关联位竞价比例，把预算集中在搜索位。' });
  actions.push({ label: '不要一刀切暂停所有词', priority: 'not_recommended', detail: '部分词可能只是需要优化匹配方式或降低 Bid，直接暂停会丢失潜在转化。' });

  return {
    topCauses: causes,
    verifyActions: verifies,
    execActions: actions,
    observePeriod: '3~5 天',
    needStopLoss: false,
    summary: '点击增加但出单不增，说明流量质量出了问题，优先清理只点不买的词。',
    observeMetrics: ['搜索词转化率', 'ACOS', '无效点击占比'],
    nextReviewFocus: ['只点不买的词是否清理', 'ACOS 是否回落', '有效点击占比是否提升'],
  };
}

function buildScenarioF(): Partial<DiagnosisResult> {
  const causes: CauseItem[] = [];
  const verifies: VerifyAction[] = [];
  const actions: ExecAction[] = [];

  causes.push({ name: '关键词从未真正盈利', reason: '某些词从一开始就没有带来有效转化，持续投放只是在烧钱。', tag: 'traffic' });
  causes.push({ name: '匹配方式过于宽泛', reason: '广泛匹配可能把广告展示给了完全不相关的搜索词，导致高花费零转化。', tag: 'self' });
  causes.push({ name: 'Listing 与关键词不匹配', reason: '广告词和 Listing 内容不匹配，买家点击后发现不是想要的商品。', tag: 'conversion' });

  verifies.push({ action: '查看该词在上一层级的历史数据', detail: '检查广泛/词组匹配下的历史数据，确认是否从未盈利过。' });
  verifies.push({ action: '确认匹配方式', detail: '检查当前投放的匹配方式是否过于宽泛。' });

  actions.push({ label: '关闭当前层级投放', priority: 'immediate', detail: '退回上一级（如从精准退回词组）继续观察，减少花费。' });
  actions.push({ label: '取消原活动中的否定，重新跑词', priority: 'observe', detail: '移除可能误否的词，让系统重新探索有效搜索词。' });
  actions.push({ label: '若持续恶劣，极端清退', priority: 'immediate', detail: '如果退回上一级后仍然没有改善，直接暂停该关键词的所有投放。' });
  actions.push({ label: '不要继续加预算期望"跑出量"', priority: 'not_recommended', detail: '长期零转化的词不会因为加预算就突然转化，只会加速烧钱。' });

  return {
    topCauses: causes,
    verifyActions: verifies,
    execActions: actions,
    observePeriod: '7~14 天',
    needStopLoss: true,
    summary: '长期高花费零转化，必须止损，退回上一级观察或直接清退。',
    observeMetrics: ['花费', '转化率', 'ACOS'],
    nextReviewFocus: ['退回上一级后是否有转化', '重新跑词后是否出现有效词', '整体 ACOS 是否改善'],
  };
}

function buildUnknown(): Partial<DiagnosisResult> {
  return {
    topCauses: [{ name: '暂无明确异常', reason: '当前指标组合未匹配到典型异常场景，建议持续观察。', tag: 'market' }],
    verifyActions: [{ action: '持续观察核心指标', detail: '关注曝光、点击、出单、ACOS 的变化趋势。' }],
    execActions: [{ label: '保持当前策略，持续观察', priority: 'observe', detail: '暂无明确异常，建议保持当前策略并持续监控。' }],
    observePeriod: '3~5 天',
    needStopLoss: false,
    summary: '当前指标未匹配到典型异常场景，建议持续观察。',
    observeMetrics: ['曝光量', '出单量', 'ACOS'],
    nextReviewFocus: ['指标是否出现新的变化趋势'],
  };
}

const scenarioBuilders: Record<ScenarioId, (input: DiagnosisInput) => Partial<DiagnosisResult>> = {
  A: buildScenarioA,
  B: () => buildScenarioB(),
  C: buildScenarioC,
  E: buildScenarioE,
  F: () => buildScenarioF(),
  unknown: () => buildUnknown(),
};

export function diagnose(input: DiagnosisInput): DiagnosisResult {
  const scenarioId = determineScenario(input);
  const builder = scenarioBuilders[scenarioId];
  const partial = builder(input);
  const riskLevel = getRiskLevel(scenarioId, input);
  const strategyDirection = getStrategy(scenarioId);

  return {
    scenarioId,
    scenarioName: scenarioNames[scenarioId],
    riskLevel,
    topCauses: partial.topCauses ?? [],
    verifyActions: partial.verifyActions ?? [],
    execActions: partial.execActions ?? [],
    strategyDirection,
    observePeriod: partial.observePeriod ?? '3~5 天',
    needStopLoss: partial.needStopLoss ?? false,
    summary: partial.summary ?? '',
    observeMetrics: partial.observeMetrics ?? [],
    nextReviewFocus: partial.nextReviewFocus ?? [],
  };
}

export const scenarioDefinitions = [
  { id: 'A' as ScenarioId, name: '流量与订单双降', condition: '曝光下降 + 出单下降', description: '流量入口减少，订单同步下滑，需要排查是排名问题、市场问题还是否定词误伤。', icon: '📉' },
  { id: 'B' as ScenarioId, name: '规模扩张风险', condition: '曝光上升 + 出单上升 + ACOS上升', description: '规模在扩张但利润在缩水，需要判断 ACOS 是否已突破毛利率底线。', icon: '📈' },
  { id: 'C' as ScenarioId, name: '竞品冲击 / 转化受损', condition: '曝光不变或上升 + 出单下降', description: '流量还在但转化出了问题，可能是竞品促销、差评置顶或配送变差。', icon: '🎯' },
  { id: 'E' as ScenarioId, name: '流量分散 / 只点不买', condition: '曝光不变 + 点击上升 + 出单不变 + ACOS上升', description: '点击增加但出单不增，说明流量质量出了问题，需要清理无效点击。', icon: '🔍' },
  { id: 'F' as ScenarioId, name: '止损回炉 / 极端清退', condition: '长期高花费无转化', description: '持续烧钱但零转化，必须止损，退回上一级观察或直接清退。', icon: '🛑' },
];

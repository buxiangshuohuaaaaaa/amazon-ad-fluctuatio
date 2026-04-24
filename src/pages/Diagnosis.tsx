import { useState } from 'react';
import { ChevronRight, RotateCcw, Download, Stethoscope } from 'lucide-react';
import type { DiagnosisInput, DiagnosisResult, Trend } from '../types';
import { diagnose } from '../engine/diagnosis';
import { useHistory } from '../hooks/useHistory';
import { riskLabel, riskColor, riskDot, strategyLabel, strategyColor, tagLabel, tagColor, priorityLabel, priorityColor } from '../components/ui';

const trendOptions: { value: Trend; label: string }[] = [
  { value: 'up', label: '上升' },
  { value: 'down', label: '下降' },
  { value: 'stable', label: '不变' },
];

const defaultInput: DiagnosisInput = {
  metrics: {
    period: '7d',
    impressionTrend: 'stable',
    clickTrend: 'stable',
    orderTrend: 'stable',
    ctrTrend: 'stable',
    cvrTrend: 'stable',
    cpcTrend: 'stable',
    acosTrend: 'stable',
  },
  context: {
    currentBid: '',
    lastWeekBid: '',
    currentPrice: '',
    lastWeekPrice: '',
    currentRating: '',
    lastWeekRating: '',
    hasBadReviewOnTop: false,
    stockIssue: false,
    hasNewNegatives: false,
    hasCompetitorPromo: false,
    competitorPromoTypes: [],
    hasHighClickZeroConv: false,
    highClickThreshold: 10,
  },
};

export default function Diagnosis() {
  const [step, setStep] = useState(1);
  const [input, setInput] = useState<DiagnosisInput>(defaultInput);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const { addRecord } = useHistory();

  function updateMetrics(key: string, value: string | boolean) {
    setInput(prev => ({ ...prev, metrics: { ...prev.metrics, [key]: value } }));
  }

  function updateContext(key: string, value: string | boolean | string[] | number) {
    setInput(prev => ({ ...prev, context: { ...prev.context, [key]: value } }));
  }

  function togglePromoType(type: string) {
    setInput(prev => {
      const types = prev.context.competitorPromoTypes;
      const next = types.includes(type as any)
        ? types.filter(t => t !== type)
        : [...types, type as any];
      return { ...prev, context: { ...prev.context, competitorPromoTypes: next } };
    });
  }

  function runDiagnosis() {
    const r = diagnose(input);
    setResult(r);
    setStep(4);
    addRecord({
      id: Date.now().toString(),
      timestamp: Date.now(),
      input,
      result: r,
    });
  }

  function reset() {
    setStep(1);
    setInput(defaultInput);
    setResult(null);
  }

  function exportReport() {
    if (!result) return;
    const lines = [
      `亚马逊广告诊断报告`,
      `==================`,
      ``,
      `诊断时间：${new Date().toLocaleString('zh-CN')}`,
      `观察周期：${input.metrics.period === 'today' ? '今天' : input.metrics.period === '3d' ? '近3天' : input.metrics.period === '7d' ? '近7天' : '近30天'}`,
      ``,
      `一、诊断结论`,
      `当前场景：场景${result.scenarioId} - ${result.scenarioName}`,
      `风险等级：${riskLabel(result.riskLevel)}`,
      `策略方向：${strategyLabel(result.strategyDirection)}`,
      `是否需要止损：${result.needStopLoss ? '是' : '否'}`,
      `一句话结论：${result.summary}`,
      ``,
      `二、最可能原因（Top 3）`,
      ...result.topCauses.map((c, i) => `${i + 1}. ${c.name} [${tagLabel(c.tag)}] - ${c.reason}`),
      ``,
      `三、关键验证动作`,
      ...result.verifyActions.map((v, i) => `${i + 1}. ${v.action}：${v.detail}`),
      ``,
      `四、执行动作建议`,
      ...result.execActions.map((a, i) => `${i + 1}. [${priorityLabel(a.priority)}] ${a.label}：${a.detail}`),
      ``,
      `五、策略方向`,
      `当前建议：${strategyLabel(result.strategyDirection)}`,
      ``,
      `六、复盘建议`,
      `建议观察周期：${result.observePeriod}`,
      `观察指标：${result.observeMetrics.join('、')}`,
      `下次复诊重点：${result.nextReviewFocus.join('、')}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `广告诊断报告_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const metricFields = [
    { key: 'impressionTrend', label: '曝光变化' },
    { key: 'clickTrend', label: '点击变化' },
    { key: 'orderTrend', label: '出单变化' },
    { key: 'ctrTrend', label: 'CTR变化' },
    { key: 'cvrTrend', label: 'CVR变化' },
    { key: 'cpcTrend', label: 'CPC变化' },
    { key: 'acosTrend', label: 'ACOS变化' },
  ];

  const promoTypes = [
    { value: 'price_cut', label: '降价' },
    { value: 'coupon', label: 'Coupon' },
    { value: 'lightning_deal', label: '秒杀' },
    { value: 'best_deal', label: 'BD' },
    { value: 'deal_of_the_day', label: 'LD' },
  ];

  return (
    <div className="flex h-full">
      {/* Left: Input */}
      <div className="w-[420px] flex-shrink-0 border-r border-slate-200 bg-white overflow-auto">
        <div className="p-5">
          <h1 className="text-base font-bold text-slate-800 mb-4">广告诊断</h1>

          {/* Steps indicator */}
          <div className="flex items-center gap-1 mb-5">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-1">
                <button
                  onClick={() => { if (s < step) setStep(s); }}
                  className={`w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center transition-colors ${
                    s <= step ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {s}
                </button>
                {s < 3 && <div className={`w-8 h-0.5 ${s < step ? 'bg-blue-600' : 'bg-slate-200'}`} />}
              </div>
            ))}
            <ChevronRight size={14} className="text-slate-400" />
            <div className={`w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center ${
              step === 4 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>4</div>
          </div>

          {/* Step 1: Metrics */}
          {step === 1 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-1">Step 1：指标变化</h2>
              <p className="text-xs text-slate-500 mb-4">选择各核心指标的变化趋势</p>

              <div className="mb-4">
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">观察周期</label>
                <select
                  value={input.metrics.period}
                  onChange={e => updateMetrics('period', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white"
                >
                  <option value="today">今天</option>
                  <option value="3d">近3天</option>
                  <option value="7d">近7天</option>
                  <option value="30d">近30天</option>
                </select>
              </div>

              {metricFields.map(f => (
                <div key={f.key} className="mb-3">
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">{f.label}</label>
                  <div className="flex gap-2">
                    {trendOptions.map(t => (
                      <button
                        key={t.value}
                        onClick={() => updateMetrics(f.key, t.value)}
                        className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${
                          (input.metrics as any)[f.key] === t.value
                            ? t.value === 'up'
                              ? 'bg-red-50 border-red-300 text-red-700 font-medium'
                              : t.value === 'down'
                              ? 'bg-amber-50 border-amber-300 text-amber-700 font-medium'
                              : 'bg-slate-50 border-slate-300 text-slate-700 font-medium'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={() => setStep(2)}
                className="w-full mt-2 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                下一步
              </button>
            </div>
          )}

          {/* Step 2: Context */}
          {step === 2 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-1">Step 2：业务背景</h2>
              <p className="text-xs text-slate-500 mb-4">补充当前业务上下文信息</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">当前 Bid</label>
                  <input type="text" value={input.context.currentBid} onChange={e => updateContext('currentBid', e.target.value)} placeholder="例: 1.20" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">上周 Bid</label>
                  <input type="text" value={input.context.lastWeekBid} onChange={e => updateContext('lastWeekBid', e.target.value)} placeholder="例: 1.10" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">当前售价</label>
                  <input type="text" value={input.context.currentPrice} onChange={e => updateContext('currentPrice', e.target.value)} placeholder="例: 29.99" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">上周售价</label>
                  <input type="text" value={input.context.lastWeekPrice} onChange={e => updateContext('lastWeekPrice', e.target.value)} placeholder="例: 34.99" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">当前评分</label>
                  <input type="text" value={input.context.currentRating} onChange={e => updateContext('currentRating', e.target.value)} placeholder="例: 4.2" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">上周评分</label>
                  <input type="text" value={input.context.lastWeekRating} onChange={e => updateContext('lastWeekRating', e.target.value)} placeholder="例: 4.5" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
                </div>
              </div>

              <div className="space-y-2.5 mb-4">
                {[
                  { key: 'hasBadReviewOnTop', label: '是否出现差评置顶' },
                  { key: 'stockIssue', label: '是否缺货/接货未上架/配送变慢' },
                  { key: 'hasNewNegatives', label: '是否新增否定词' },
                  { key: 'hasCompetitorPromo', label: '是否观察到竞品促销' },
                  { key: 'hasHighClickZeroConv', label: '是否存在高点击0转化词' },
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(input.context as any)[item.key] as boolean}
                      onChange={e => updateContext(item.key, e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600"
                    />
                    <span className="text-xs text-slate-700">{item.label}</span>
                  </label>
                ))}
              </div>

              {input.context.hasCompetitorPromo && (
                <div className="mb-4">
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">竞品促销类型</label>
                  <div className="flex flex-wrap gap-2">
                    {promoTypes.map(pt => (
                      <button
                        key={pt.value}
                        onClick={() => togglePromoType(pt.value)}
                        className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                          input.context.competitorPromoTypes.includes(pt.value as any)
                            ? 'bg-orange-50 border-orange-300 text-orange-700 font-medium'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {pt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {input.context.hasHighClickZeroConv && (
                <div className="mb-4">
                  <label className="text-xs font-medium text-slate-600 mb-1 block">高点击0转化阈值</label>
                  <input type="number" value={input.context.highClickThreshold} onChange={e => updateContext('highClickThreshold', parseInt(e.target.value) || 10)} className="w-24 px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
                  <span className="text-xs text-slate-500 ml-2">次（默认10次）</span>
                </div>
              )}

              <div className="flex gap-2 mt-2">
                <button onClick={() => setStep(1)} className="flex-1 py-2 bg-white text-slate-600 text-sm font-medium rounded-md border border-slate-200 hover:bg-slate-50 transition-colors">上一步</button>
                <button onClick={() => setStep(3)} className="flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">下一步</button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-1">Step 3：确认诊断</h2>
              <p className="text-xs text-slate-500 mb-4">确认输入信息后开始诊断</p>

              <div className="bg-slate-50 rounded-md p-3 mb-4 space-y-2">
                <p className="text-xs font-medium text-slate-600">指标变化</p>
                {metricFields.map(f => (
                  <div key={f.key} className="flex justify-between text-xs">
                    <span className="text-slate-500">{f.label}</span>
                    <span className={
                      (input.metrics as any)[f.key] === 'up' ? 'text-red-600 font-medium' :
                      (input.metrics as any)[f.key] === 'down' ? 'text-amber-600 font-medium' :
                      'text-slate-600'
                    }>
                      {(input.metrics as any)[f.key] === 'up' ? '上升' : (input.metrics as any)[f.key] === 'down' ? '下降' : '不变'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 rounded-md p-3 mb-4 space-y-2">
                <p className="text-xs font-medium text-slate-600">业务背景</p>
                {input.context.hasBadReviewOnTop && <p className="text-xs text-red-600">- 差评置顶</p>}
                {input.context.stockIssue && <p className="text-xs text-amber-600">- 配送/库存问题</p>}
                {input.context.hasNewNegatives && <p className="text-xs text-amber-600">- 新增否定词</p>}
                {input.context.hasCompetitorPromo && <p className="text-xs text-orange-600">- 竞品促销</p>}
                {input.context.hasHighClickZeroConv && <p className="text-xs text-red-600">- 高点击0转化词</p>}
                {!input.context.hasBadReviewOnTop && !input.context.stockIssue && !input.context.hasNewNegatives && !input.context.hasCompetitorPromo && !input.context.hasHighClickZeroConv && (
                  <p className="text-xs text-slate-400">- 无特殊业务背景</p>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="flex-1 py-2 bg-white text-slate-600 text-sm font-medium rounded-md border border-slate-200 hover:bg-slate-50 transition-colors">上一步</button>
                <button onClick={runDiagnosis} className="flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">开始诊断</button>
              </div>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 4 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-1">诊断完成</h2>
              <p className="text-xs text-slate-500 mb-4">查看右侧诊断结果</p>
              <div className="flex gap-2">
                <button onClick={reset} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white text-slate-600 text-sm font-medium rounded-md border border-slate-200 hover:bg-slate-50 transition-colors">
                  <RotateCcw size={14} /> 重新诊断
                </button>
                <button onClick={exportReport} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white text-slate-600 text-sm font-medium rounded-md border border-slate-200 hover:bg-slate-50 transition-colors">
                  <Download size={14} /> 导出报告
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Results */}
      <div className="flex-1 overflow-auto bg-slate-50 p-6">
        {!result ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Stethoscope size={24} className="text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">请在左侧输入广告数据变化</p>
              <p className="text-xs text-slate-400 mt-1">系统将自动判断场景并给出行动建议</p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {/* 1. Diagnosis Conclusion */}
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-800">诊断结论</h2>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border ${riskColor(result.riskLevel)}`}>
                  <span className={`w-2 h-2 rounded-full ${riskDot(result.riskLevel)}`} />
                  {riskLabel(result.riskLevel)}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-1 bg-slate-800 text-white text-xs font-bold rounded">场景{result.scenarioId}</span>
                <span className="text-sm font-semibold text-slate-800">{result.scenarioName}</span>
              </div>
              <div className="bg-slate-50 rounded-md p-3">
                <p className="text-sm text-slate-700 font-medium">{result.summary}</p>
              </div>
              {result.needStopLoss && (
                <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-md">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs font-semibold text-red-700">需要立即止损</span>
                </div>
              )}
            </div>

            {/* 2. Top Causes */}
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-3">最可能原因（Top {result.topCauses.length}）</h2>
              <div className="space-y-3">
                {result.topCauses.map((cause, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0 mt-0.5">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-800">{cause.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${tagColor(cause.tag)}`}>{tagLabel(cause.tag)}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{cause.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Verify Actions */}
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-3">关键验证动作</h2>
              <div className="space-y-2.5">
                {result.verifyActions.map((v, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600 flex-shrink-0 mt-0.5">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{v.action}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{v.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Exec Actions */}
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-3">执行动作建议</h2>
              <div className="space-y-2.5">
                {(['immediate', 'observe', 'defer', 'not_recommended'] as const).map(priority => {
                  const items = result.execActions.filter(a => a.priority === priority);
                  if (items.length === 0) return null;
                  return (
                    <div key={priority}>
                      <p className={`text-xs font-semibold mb-1.5 px-2 py-0.5 rounded inline-block border ${priorityColor(priority)}`}>{priorityLabel(priority)}</p>
                      <div className="space-y-2 ml-1">
                        {items.map((a, i) => (
                          <div key={i} className="bg-slate-50 rounded-md p-3">
                            <p className="text-sm font-medium text-slate-800">{a.label}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{a.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Strategy Direction */}
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-3">策略方向</h2>
              <div className="flex gap-3">
                {(['keep_volume', 'keep_profit', 'observe', 'stop_loss'] as const).map(dir => (
                  <div key={dir} className={`flex-1 text-center py-3 rounded-md border text-sm font-medium transition-colors ${
                    result.strategyDirection === dir ? strategyColor(dir) : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {strategyLabel(dir)}
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Review */}
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-3">复盘建议</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">建议观察周期</p>
                  <p className="text-sm font-medium text-slate-800">{result.observePeriod}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">观察指标</p>
                  <div className="flex flex-wrap gap-1">
                    {result.observeMetrics.map((m, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded">{m}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">下次复诊重点</p>
                  <div className="flex flex-wrap gap-1">
                    {result.nextReviewFocus.map((f, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

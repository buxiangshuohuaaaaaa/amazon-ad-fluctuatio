import type { RiskLevel, StrategyDirection } from '../types';

export function riskColor(level: RiskLevel) {
  switch (level) {
    case 'low': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'medium': return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'high': return 'text-red-700 bg-red-50 border-red-200';
    case 'critical': return 'text-red-900 bg-red-100 border-red-300';
  }
}

export function riskLabel(level: RiskLevel) {
  switch (level) {
    case 'low': return '低风险';
    case 'medium': return '需关注';
    case 'high': return '高风险';
    case 'critical': return '极高风险';
  }
}

export function riskDot(level: RiskLevel) {
  switch (level) {
    case 'low': return 'bg-emerald-500';
    case 'medium': return 'bg-amber-500';
    case 'high': return 'bg-red-500';
    case 'critical': return 'bg-red-700';
  }
}

export function strategyLabel(dir: StrategyDirection) {
  switch (dir) {
    case 'keep_volume': return '保销量';
    case 'keep_profit': return '保利润';
    case 'observe': return '先观察';
    case 'stop_loss': return '立即止损';
  }
}

export function strategyColor(dir: StrategyDirection) {
  switch (dir) {
    case 'keep_volume': return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'keep_profit': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'observe': return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'stop_loss': return 'text-red-700 bg-red-50 border-red-200';
  }
}

export function tagLabel(tag: string) {
  switch (tag) {
    case 'competitor': return '竞品问题';
    case 'self': return '本品问题';
    case 'market': return '市场问题';
    case 'traffic': return '流量问题';
    case 'conversion': return '转化问题';
    default: return tag;
  }
}

export function tagColor(tag: string) {
  switch (tag) {
    case 'competitor': return 'text-orange-700 bg-orange-50 border-orange-200';
    case 'self': return 'text-rose-700 bg-rose-50 border-rose-200';
    case 'market': return 'text-slate-700 bg-slate-100 border-slate-200';
    case 'traffic': return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'conversion': return 'text-purple-700 bg-purple-50 border-purple-200';
    default: return 'text-slate-600 bg-slate-50 border-slate-200';
  }
}

export function priorityLabel(p: string) {
  switch (p) {
    case 'immediate': return '立即执行';
    case 'observe': return '可以观察';
    case 'defer': return '暂缓执行';
    case 'not_recommended': return '不建议执行';
    default: return p;
  }
}

export function priorityColor(p: string) {
  switch (p) {
    case 'immediate': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'observe': return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'defer': return 'text-slate-600 bg-slate-50 border-slate-200';
    case 'not_recommended': return 'text-red-700 bg-red-50 border-red-200';
    default: return 'text-slate-600 bg-slate-50 border-slate-200';
  }
}

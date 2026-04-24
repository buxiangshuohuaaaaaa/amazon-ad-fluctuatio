import { useHistory } from '../hooks/useHistory';
import { riskLabel, riskColor, riskDot, strategyLabel, strategyColor } from '../components/ui';
import { Trash2, Download, AlertTriangle } from 'lucide-react';
import type { DiagnosisRecord } from '../types';

export default function History() {
  const { records, deleteRecord, clearHistory } = useHistory();

  function exportRecord(record: DiagnosisRecord) {
    const lines = [
      `亚马逊广告诊断报告`,
      `==================`,
      ``,
      `诊断时间：${new Date(record.timestamp).toLocaleString('zh-CN')}`,
      ``,
      `一、诊断结论`,
      `当前场景：场景${record.result.scenarioId} - ${record.result.scenarioName}`,
      `风险等级：${riskLabel(record.result.riskLevel)}`,
      `策略方向：${strategyLabel(record.result.strategyDirection)}`,
      `一句话结论：${record.result.summary}`,
      ``,
      `二、最可能原因`,
      ...record.result.topCauses.map((c, i) => `${i + 1}. ${c.name} - ${c.reason}`),
      ``,
      `三、关键验证动作`,
      ...record.result.verifyActions.map((v, i) => `${i + 1}. ${v.action}：${v.detail}`),
      ``,
      `四、执行动作建议`,
      ...record.result.execActions.map((a, i) => `${i + 1}. ${a.label}：${a.detail}`),
      ``,
      `五、复盘建议`,
      `建议观察周期：${record.result.observePeriod}`,
      `观察指标：${record.result.observeMetrics.join('、')}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `广告诊断报告_${new Date(record.timestamp).toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">历史记录</h1>
          <p className="text-sm text-slate-500 mt-1">最近 {records.length} 条诊断记录</p>
        </div>
        {records.length > 0 && (
          <button onClick={clearHistory} className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors">
            清空记录
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <AlertTriangle size={24} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">暂无诊断记录</p>
          <p className="text-xs text-slate-400 mt-1">进行广告诊断后，记录会自动保存在这里</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map(record => (
            <div key={record.id} className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-slate-800 text-white text-xs font-bold rounded">场景{record.result.scenarioId}</span>
                  <span className="text-sm font-medium text-slate-800">{record.result.scenarioName}</span>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border ${riskColor(record.result.riskLevel)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${riskDot(record.result.riskLevel)}`} />
                    {riskLabel(record.result.riskLevel)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${strategyColor(record.result.strategyDirection)}`}>
                    {strategyLabel(record.result.strategyDirection)}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{new Date(record.timestamp).toLocaleString('zh-CN')}</span>
              </div>

              <p className="text-xs text-slate-600 mb-3">{record.result.summary}</p>

              <div className="flex items-center gap-2 mb-2">
                <p className="text-[10px] text-slate-500 font-medium">最可能原因：</p>
                {record.result.topCauses.slice(0, 3).map((c, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-slate-50 text-slate-600 text-[10px] rounded">{c.name}</span>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button onClick={() => exportRecord(record)} className="flex items-center gap-1 px-2 py-1 text-[10px] text-slate-500 hover:text-blue-600 transition-colors">
                  <Download size={12} /> 导出
                </button>
                <button onClick={() => deleteRecord(record.id)} className="flex items-center gap-1 px-2 py-1 text-[10px] text-slate-500 hover:text-red-600 transition-colors">
                  <Trash2 size={12} /> 删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Stethoscope, BookOpen, AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { useHistory } from '../hooks/useHistory';
import { riskLabel, riskColor, riskDot, strategyLabel, strategyColor } from '../components/ui';
import { scenarioDefinitions } from '../engine/diagnosis';

export default function Dashboard() {
  const { records } = useHistory();
  const latest = records[0];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">首页仪表盘</h1>
        <p className="text-sm text-slate-500 mt-1">亚马逊广告波动应对助手 — 诊断 + 决策指导</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link
          to="/diagnosis"
          className="flex items-center gap-4 p-5 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Stethoscope size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">开始广告诊断</p>
            <p className="text-xs text-slate-500">输入指标变化，获取诊断结果和行动建议</p>
          </div>
          <ArrowRight size={16} className="text-slate-400 ml-auto" />
        </Link>
        <Link
          to="/scenarios"
          className="flex items-center gap-4 p-5 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <BookOpen size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">查看场景SOP</p>
            <p className="text-xs text-slate-500">5大典型异常场景的标准化处理流程</p>
          </div>
          <ArrowRight size={16} className="text-slate-400 ml-auto" />
        </Link>
      </div>

      {latest ? (
        <div className="bg-white rounded-lg border border-slate-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700">最近一次诊断</h2>
            <span className="text-xs text-slate-400 ml-auto">
              {new Date(latest.timestamp).toLocaleString('zh-CN')}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">诊断场景</p>
              <p className="text-sm font-medium text-slate-800">
                场景{latest.result.scenarioId}：{latest.result.scenarioName}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">风险等级</p>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${riskColor(latest.result.riskLevel)}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${riskDot(latest.result.riskLevel)}`} />
                {riskLabel(latest.result.riskLevel)}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">策略方向</p>
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${strategyColor(latest.result.strategyDirection)}`}>
                {strategyLabel(latest.result.strategyDirection)}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">一句话结论</p>
              <p className="text-sm text-slate-700">{latest.result.summary}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-5 mb-6 text-center">
          <AlertTriangle size={24} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">暂无诊断记录</p>
          <p className="text-xs text-slate-400 mt-1">点击"开始广告诊断"进行第一次诊断</p>
        </div>
      )}

      <h2 className="text-sm font-semibold text-slate-700 mb-3">典型异常场景</h2>
      <div className="grid grid-cols-5 gap-3">
        {scenarioDefinitions.map(s => (
          <Link
            key={s.id}
            to={`/scenarios/${s.id}`}
            className="p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="text-lg mb-1">{s.icon}</div>
            <p className="text-xs font-semibold text-slate-800">场景{s.id}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.name}</p>
            <p className="text-[10px] text-slate-400 mt-1.5">{s.condition}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

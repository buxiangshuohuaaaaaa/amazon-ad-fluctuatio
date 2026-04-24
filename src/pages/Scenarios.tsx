import { Link, Outlet, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { scenarioDefinitions } from '../engine/diagnosis';

const scenarioDetails: Record<string, {
  condition: string;
  causes: { name: string; reason: string; tag: string }[];
  verifies: { action: string; detail: string }[];
  actions: { label: string; priority: string; detail: string }[];
  risks: string[];
  caseTip: string;
}> = {
  A: {
    condition: '曝光下降 + 出单下降',
    causes: [
      { name: '排名下降（广告位/自然位）', reason: '关键词排名或广告位位置下滑，导致流量入口减少。', tag: 'traffic' },
      { name: '市场需求下降（季节性）', reason: '整个类目搜索量下滑，属于市场大盘问题。', tag: 'market' },
      { name: '否定词误伤', reason: '新增否定词把有效流量词也否掉了。', tag: 'self' },
    ],
    verifies: [
      { action: '查市场趋势', detail: '在品牌分析或第三方工具中查看类目搜索量趋势。' },
      { action: '查关键词排名和广告位位置', detail: '对比核心关键词的搜索排名和广告位是否发生变化。' },
      { action: '查否定列表是否误伤', detail: '检查最近添加的否定词，是否有误否了高转化词。' },
    ],
    actions: [
      { label: '如果是排名掉落，小幅上调 Bid', priority: 'immediate', detail: '建议上调 1%~2%，观察 3 天看排名是否恢复。' },
      { label: '如果是市场整体下滑，稳住 ACOS', priority: 'observe', detail: '不要大幅调价，以稳住 ACOS 为准。' },
      { label: '移除误否词', priority: 'immediate', detail: '把误否的有效词从否定列表中移除。' },
      { label: '不要盲目加大预算', priority: 'not_recommended', detail: '在未确认原因前加大预算可能只是加速烧钱。' },
    ],
    risks: ['如果排名持续下滑且未及时处理，可能进入恶性循环', '误否词未及时移除会导致长期流量损失'],
    caseTip: '某卖家发现曝光和订单同时下降 30%，排查后发现是新增的否定词误否了核心大词，移除后 3 天内曝光恢复 80%。',
  },
  B: {
    condition: '曝光上升 + 出单上升 + ACOS上升',
    causes: [
      { name: '新增流量相关性不足', reason: '新增流量中有大量低转化流量，拉高了整体花费。', tag: 'traffic' },
      { name: '为冲销量牺牲利润', reason: '用高 Bid 抢量，但转化效率不足以支撑花费。', tag: 'self' },
      { name: '类目竞争加剧', reason: '竞品加价抢位导致 CPC 上升。', tag: 'competitor' },
    ],
    verifies: [
      { action: '检查当前 ACOS 是否已突破毛利率', detail: '如果 ACOS 已经高于毛利率，每出一单都在亏钱。' },
      { action: '查看搜索词报告', detail: '确认新增流量是否来自高度相关的词。' },
      { action: '对比 CPC 变化', detail: '如果 CPC 明显上升，说明竞争加剧。' },
    ],
    actions: [
      { label: '若 ACOS 在利润可承受范围内，保销量', priority: 'observe', detail: 'Bid 先不动，持续观察。' },
      { label: '若 ACOS 过高，保利润', priority: 'immediate', detail: '分步逐次降 Bid，每次降 5%~10%。' },
      { label: '清理低转化搜索词', priority: 'immediate', detail: '对高点击低转化的词降价或否定。' },
      { label: '不要一次性大幅降 Bid', priority: 'not_recommended', detail: '大幅降 Bid 可能导致排名骤降。' },
    ],
    risks: ['ACOS 持续高于毛利率会导致亏损扩大', '盲目保量可能陷入"越卖越亏"的困境'],
    caseTip: '某卖家 ACOS 从 25% 升到 40%，毛利率 30%，判断后选择保利润，分 3 次降 Bid 每次 8%，2 周后 ACOS 回落到 28%。',
  },
  C: {
    condition: '曝光不变或上升 + 出单下降',
    causes: [
      { name: '差评置顶影响转化', reason: '差评出现在首页严重影响买家决策。', tag: 'self' },
      { name: '竞品促销抢夺流量', reason: '竞品开启大额 Coupon、秒杀等活动。', tag: 'competitor' },
      { name: '配送时效变差', reason: '配送变慢导致买家转向竞品。', tag: 'self' },
      { name: '评分下降到关键阈值以下', reason: '评分跌破 4.0 或 4.3 等关键阈值。', tag: 'self' },
    ],
    verifies: [
      { action: '检查 Listing 首页差评', detail: '确认差评内容和位置。' },
      { action: '查看竞品促销详情', detail: '确认竞品促销类型、力度和持续时间。' },
      { action: '检查配送时效', detail: '确认本品配送时间是否变长。' },
      { action: '对比 CPC 变化', detail: '如果 CPC 明显上升，说明竞品在抢位。' },
    ],
    actions: [
      { label: '优先处理差评', priority: 'immediate', detail: '通过客服渠道联系买家，同时优化主图/A+。' },
      { label: '竞品短期促销：先观察', priority: 'observe', detail: '不急着立刻跟价。' },
      { label: '竞品长期折扣：核算后决定', priority: 'immediate', detail: '快速核算利润后决定是否跟进。' },
      { label: '不要在未确认原因前大幅降价', priority: 'not_recommended', detail: '盲目降价会压缩利润空间。' },
    ],
    risks: ['差评置顶若不处理，转化率会持续走低', '竞品长期促销若不应对，市场份额会被蚕食'],
    caseTip: '某卖家出单下降 40%，排查发现竞品开了 20% Coupon，先观察 3 天发现竞品是短期秒杀，未跟价，秒杀结束后出单恢复。',
  },
  E: {
    condition: '曝光不变 + 点击上升 + 出单不变 + ACOS上升',
    causes: [
      { name: '搜索词只点不买', reason: '某些搜索词点击量很高但转化率为零。', tag: 'traffic' },
      { name: '流量被引向无关关联位', reason: '广告出现在不相关的商品详情页上。', tag: 'traffic' },
      { name: '流量质量下降', reason: '整体流量质量变差。', tag: 'traffic' },
    ],
    verifies: [
      { action: '查看搜索词报告', detail: '找出点击超过阈值但 0 转化的词。' },
      { action: '检查广告位报告', detail: '确认广告是否出现在不相关的关联位上。' },
    ],
    actions: [
      { label: '对只点不买的词降价或暂停', priority: 'immediate', detail: '减少无效花费。' },
      { label: '否定不相关搜索词', priority: 'immediate', detail: '防止继续烧钱。' },
      { label: '调整广告位竞价', priority: 'observe', detail: '降低关联位竞价比例。' },
      { label: '不要一刀切暂停所有词', priority: 'not_recommended', detail: '部分词可能只是需要优化匹配方式。' },
    ],
    risks: ['只点不买的词若不清理，ACOS 会持续恶化', '一刀切暂停可能丢失潜在转化'],
    caseTip: '某卖家发现 ACOS 从 20% 升到 35%，排查搜索词报告发现有 5 个词点击超 15 次但 0 转化，暂停后 ACOS 一周内回落到 22%。',
  },
  F: {
    condition: '长期高花费无转化',
    causes: [
      { name: '关键词从未真正盈利', reason: '某些词从一开始就没有带来有效转化。', tag: 'traffic' },
      { name: '匹配方式过于宽泛', reason: '广泛匹配把广告展示给了完全不相关的搜索词。', tag: 'self' },
      { name: 'Listing 与关键词不匹配', reason: '广告词和 Listing 内容不匹配。', tag: 'conversion' },
    ],
    verifies: [
      { action: '查看该词在上一层级的历史数据', detail: '确认是否从未盈利过。' },
      { action: '确认匹配方式', detail: '检查当前投放的匹配方式是否过于宽泛。' },
    ],
    actions: [
      { label: '关闭当前层级投放', priority: 'immediate', detail: '退回上一级继续观察。' },
      { label: '取消原活动中的否定，重新跑词', priority: 'observe', detail: '让系统重新探索有效搜索词。' },
      { label: '若持续恶劣，极端清退', priority: 'immediate', detail: '直接暂停该关键词的所有投放。' },
      { label: '不要继续加预算期望"跑出量"', priority: 'not_recommended', detail: '长期零转化的词不会因为加预算就突然转化。' },
    ],
    risks: ['持续投放零转化词会严重拖低整体 ACOS', '加预算不会让零转化词突然转化'],
    caseTip: '某卖家一个精准匹配词 30 天花费 $200 零转化，退回词组匹配后重新跑词，发现 3 个新词开始出单，整体 ACOS 改善 15%。',
  },
};

const tagColorMap: Record<string, string> = {
  competitor: 'text-orange-700 bg-orange-50 border-orange-200',
  self: 'text-rose-700 bg-rose-50 border-rose-200',
  market: 'text-slate-700 bg-slate-100 border-slate-200',
  traffic: 'text-blue-700 bg-blue-50 border-blue-200',
  conversion: 'text-purple-700 bg-purple-50 border-purple-200',
};
const tagLabelMap: Record<string, string> = {
  competitor: '竞品问题', self: '本品问题', market: '市场问题', traffic: '流量问题', conversion: '转化问题',
};
const priorityColorMap: Record<string, string> = {
  immediate: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  observe: 'text-amber-700 bg-amber-50 border-amber-200',
  defer: 'text-slate-600 bg-slate-50 border-slate-200',
  not_recommended: 'text-red-700 bg-red-50 border-red-200',
};
const priorityLabelMap: Record<string, string> = {
  immediate: '立即执行', observe: '可以观察', defer: '暂缓执行', not_recommended: '不建议执行',
};

export function ScenarioDetail() {
  const { id } = useParams();
  const detail = id ? scenarioDetails[id] : null;

  if (!detail) {
    return <div className="p-6"><p className="text-sm text-slate-500">场景不存在</p></div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link to="/scenarios" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft size={14} /> 返回场景列表
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2.5 py-1 bg-slate-800 text-white text-xs font-bold rounded">场景{id}</span>
          <h1 className="text-lg font-bold text-slate-800">{scenarioDefinitions.find(s => s.id === id)?.name}</h1>
        </div>
        <p className="text-sm text-slate-500">判定条件：{detail.condition}</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-4">
        <h2 className="text-sm font-bold text-slate-800 mb-3">常见原因</h2>
        <div className="space-y-3">
          {detail.causes.map((c, i) => (
            <div key={i} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0 mt-0.5">{i + 1}</span>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-slate-800">{c.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${tagColorMap[c.tag] || ''}`}>{tagLabelMap[c.tag] || c.tag}</span>
                </div>
                <p className="text-xs text-slate-500">{c.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-4">
        <h2 className="text-sm font-bold text-slate-800 mb-3">验证步骤</h2>
        <div className="space-y-2.5">
          {detail.verifies.map((v, i) => (
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

      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-4">
        <h2 className="text-sm font-bold text-slate-800 mb-3">建议动作</h2>
        <div className="space-y-2.5">
          {detail.actions.map((a, i) => (
            <div key={i} className="bg-slate-50 rounded-md p-3">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${priorityColorMap[a.priority] || ''}`}>{priorityLabelMap[a.priority] || a.priority}</span>
                <span className="text-sm font-medium text-slate-800">{a.label}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{a.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-4">
        <h2 className="text-sm font-bold text-slate-800 mb-3">风险提醒</h2>
        <div className="space-y-2">
          {detail.risks.map((r, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
              <p className="text-xs text-slate-700">{r}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
        <h2 className="text-sm font-bold text-amber-800 mb-2">案例提示</h2>
        <p className="text-xs text-amber-700 leading-relaxed">{detail.caseTip}</p>
      </div>
    </div>
  );
}

export default function Scenarios() {
  const { id } = useParams();
  if (id) return <Outlet />;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-1">场景SOP</h1>
      <p className="text-sm text-slate-500 mb-6">5大典型异常场景的标准化处理流程</p>
      <div className="space-y-4">
        {scenarioDefinitions.map(s => (
          <Link key={s.id} to={`/scenarios/${s.id}`} className="block bg-white rounded-lg border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg">{s.icon}</span>
              <span className="px-2 py-0.5 bg-slate-800 text-white text-xs font-bold rounded">场景{s.id}</span>
              <span className="text-sm font-semibold text-slate-800">{s.name}</span>
            </div>
            <p className="text-xs text-slate-500 mb-2">判定条件：{s.condition}</p>
            <p className="text-xs text-slate-600">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

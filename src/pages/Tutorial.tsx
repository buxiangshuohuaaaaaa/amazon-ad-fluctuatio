import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const sections = [
  {
    title: '核心指标解释',
    items: [
      {
        question: 'CTR（点击率）是什么？CTR 下降通常说明什么？',
        answer: `CTR = 点击量 / 曝光量，反映广告被点击的概率。CTR 下降通常说明：

1. 流量质量下降 — 广告展示给了不相关的人群
2. 素材竞争力不足 — 主图、标题、价格等不够吸引人
3. 广告位变动 — 从搜索顶部掉到了页面底部
4. 竞品价格变化 — 竞品降价或促销，买家更倾向点击竞品
5. 竞品参加秒杀、促销、大额 Coupon 等活动

新手常见误区：看到 CTR 下降就立刻加 Bid。正确做法是先排查原因，再决定是否调整。`,
      },
      {
        question: 'CVR（转化率）是什么？CVR 下降通常说明什么？',
        answer: `CVR = 出单量 / 点击量，反映点击后购买的比例。CVR 下降通常说明：

1. Listing 竞争力下降 — 详情页内容不足以说服买家
2. 价格变化 — 本品涨价或竞品降价
3. 评价变化 — 新增差评、评分下降
4. 库存或配送时效变差 — 买家看到配送时间长就放弃

新手常见误区：CVR 下降就去调广告。实际上 CVR 下降更多是 Listing 本身的问题，调广告解决不了根本问题。`,
      },
      {
        question: 'CPC（单次点击成本）是什么？CPC 上升通常说明什么？',
        answer: `CPC = 广告花费 / 点击量，反映每次点击需要花多少钱。CPC 上升通常说明：

1. 竞品加价抢位 — 更多卖家在竞争同一个关键词
2. 类目竞争加剧 — 新卖家涌入或现有卖家加大投放

CPC 上升不一定是坏事，如果转化率同步提升，ACOS 可能反而下降。关键是看 CPC 和 CVR 的关系。`,
      },
      {
        question: 'ACOS 是什么？ACOS 升高但单量上升时应该怎么想？',
        answer: `ACOS = 广告花费 / 广告销售额，反映广告投入产出比。ACOS 越低越好。

ACOS 升高但单量上升时，需要判断：

1. 当前 ACOS 是否已突破毛利率？如果 ACOS > 毛利率，每出一单都在亏钱
2. 新增流量是否依然高度相关？如果相关性高，可以接受短期 ACOS 上升
3. 是否为了冲销量而牺牲利润？需要明确当前阶段的目标

关键决策：如果 ACOS 在利润可承受范围内，可以选择"保销量"；如果 ACOS 过高导致明显利润损失，选择"保利润"。`,
      },
    ],
  },
  {
    title: '常见概念解释',
    items: [
      {
        question: '什么叫误否词？',
        answer: `误否词是指把本应带来转化的有效关键词错误地加入了否定列表。

常见原因：
1. 批量否定时没有仔细检查
2. 用广泛否定（Phrase Negative）时误伤了包含该词的其他有效词
3. 看到某个词短期没出单就否定了，但该词可能需要更长时间才能转化

误否词的危害：直接导致曝光和订单下降，而且很难被发现，因为被否定的词不会出现在搜索词报告中。

排查方法：定期检查否定列表，对比否定前后的流量变化。`,
      },
      {
        question: '什么叫流量质量差？',
        answer: `流量质量差是指广告展示给了不相关的人群，导致点击后不转化。

典型表现：
1. 点击量上升但出单不增
2. 搜索词报告中出现大量不相关的词
3. ACOS 持续上升

常见原因：
1. 广泛匹配把广告展示给了不相关的搜索词
2. 广告出现在不相关的关联位上
3. 关键词选择不当

解决方法：查看搜索词报告，清理不相关词，调整匹配方式，降低关联位竞价。`,
      },
      {
        question: '什么叫竞争加剧？',
        answer: `竞争加剧是指同一关键词下更多卖家在投放广告，导致 CPC 上升、广告位竞争更激烈。

典型表现：
1. CPC 明显上升
2. 同样的 Bid 排名下降
3. 广告位从首页掉到第二页或更后

应对方法：
1. 评估当前关键词是否值得继续竞争
2. 考虑长尾词策略，避开竞争最激烈的大词
3. 优化 Listing 质量分，提高广告排名竞争力`,
      },
      {
        question: '什么叫搜索词只点不买？',
        answer: `搜索词只点不买是指某些搜索词带来了大量点击但没有任何转化。

典型特征：
1. 点击次数超过类目阈值（如 10 次以上）仍 0 转化
2. 这些词的 ACOS 极差
3. 拉高了整体 ACOS

常见原因：
1. 搜索词与产品不匹配，买家点击后发现不是想要的
2. 广告出现在关联位上，但关联商品与本品不互补
3. 价格竞争力不足，买家点击后对比价格选择竞品

解决方法：对这些词降价、降 Bid，或直接暂停/否定。`,
      },
    ],
  },
  {
    title: '新手常见误区',
    items: [
      {
        question: '误区一：看到数据波动就立刻调广告',
        answer: `很多新手看到曝光下降就加 Bid，看到 ACOS 上升就降 Bid，这种"头痛医头"的做法往往适得其反。

正确做法：
1. 先判断波动是否在正常范围内
2. 确认波动的原因（市场、竞品、本品、流量）
3. 根据原因选择对应的策略
4. 给调整留出观察时间（至少 3 天）

记住：广告优化不是越频繁越好，过度调整反而会打乱系统的学习节奏。`,
      },
      {
        question: '误区二：只看 ACOS，不看其他指标',
        answer: `ACOS 是重要指标，但不能只看 ACOS。

举例：
- ACOS 上升 + 出单上升 = 可能是规模扩张，需要判断是否在利润可承受范围内
- ACOS 上升 + 出单下降 = 需要警惕，可能是转化出了问题
- ACOS 下降 + 出单下降 = 虽然效率提高了，但总量在萎缩

正确做法：综合看曝光、点击、出单、CTR、CVR、CPC、ACOS 的变化趋势，判断属于哪个场景。`,
      },
      {
        question: '误区三：否定词越多越好',
        answer: `否定词的目的是过滤不相关流量，但否定过多会误伤有效流量。

常见问题：
1. 用广泛否定（Phrase Negative）时误伤了包含该词的其他有效词
2. 看到短期没出单就否定，但该词可能需要更长时间才能转化
3. 批量否定时没有仔细检查

正确做法：
1. 优先使用精准否定（Exact Negative）
2. 给新词足够的观察时间再决定是否否定
3. 定期检查否定列表，移除误否词`,
      },
    ],
  },
  {
    title: '广告优化节奏建议',
    items: [
      {
        question: '广告优化的正确节奏是什么？',
        answer: `广告优化不是每天调，而是有节奏地调：

1. 日常监控（每天）：看核心指标是否有异常波动
2. 周度复盘（每周）：对比上周数据，判断趋势
3. 月度优化（每月）：根据月度数据做策略调整

调整原则：
1. 每次只调一个变量，方便判断效果
2. 调整后至少观察 3 天
3. 小幅调整（Bid 每次调 5%~10%），不要一步到位
4. 记录每次调整和结果，方便复盘`,
      },
      {
        question: '什么时候应该"保销量"，什么时候应该"保利润"？',
        answer: `这取决于你的业务阶段和目标：

保销量的场景：
1. 新品期，需要积累数据和评价
2. ACOS 虽然上升但仍在利润可承受范围内
3. 类目竞争激烈，退出后很难再抢回排名

保利润的场景：
1. ACOS 已突破毛利率，每出一单都在亏钱
2. 产品已进入稳定期，不需要继续冲量
3. 利润压力较大，需要控制成本

关键判断标准：ACOS 是否超过毛利率。超过就保利，没超过可以保量。`,
      },
    ],
  },
];

function FAQSection({ section }: { section: typeof sections[0] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-slate-800 mb-3">{section.title}</h2>
      <div className="space-y-2">
        {section.items.map((item, i) => (
          <div key={i} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
            >
              {openIndex === i ? <ChevronDown size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />}
              <span className="text-sm font-medium text-slate-800">{item.question}</span>
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4 pt-0">
                <div className="pl-6 border-l-2 border-blue-200">
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{item.answer}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Tutorial() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-1">新手教程</h1>
      <p className="text-sm text-slate-500 mb-6">理解核心指标含义，避免常见误区，掌握优化节奏</p>
      {sections.map((section, i) => (
        <FAQSection key={i} section={section} />
      ))}
    </div>
  );
}

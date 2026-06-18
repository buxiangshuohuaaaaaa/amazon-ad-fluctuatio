# amazon-ad-fluctuatio

亚马逊广告波动诊断工具。输入当前广告指标趋势，自动识别所处场景并给出排查步骤和操作建议。

## 功能

**诊断引擎**：根据曝光、点击、订单、ACOS 的涨跌组合，自动匹配以下场景：

| 场景 | 描述 | 风险等级 |
|------|------|----------|
| A | 流量与订单双降 | 中 / 高 |
| B | 规模扩张风险（量价同升但 ACOS 跑高） | 中 |
| C | 竞品冲击 / 客诉 / 转化受损 | 中 / 高 |
| E | 流量分散 / 无效点击 / 只点不买 | 中 |
| F | 止损回炉 / 极端清退 | 严重 |

每个场景输出：
- 可能原因列表（含标签：流量 / 市场 / 自身操作）
- 逐步排查动作
- 可执行操作（立即 / 观察 / 不建议）

**其他页面**：
- Dashboard：整体状态概览
- Scenarios：所有场景说明文档
- Tutorial：使用指引
- History：历史诊断记录（Supabase 存储）

## 技术栈

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Supabase（数据持久化）
- React Router v7

## 本地运行

```bash
npm install
npm run dev
```

需配置 Supabase 环境变量（`VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`）。

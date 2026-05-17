# 可复用模式

这份 demo 真正能拿走的是几条小模式。

## 1. 场景协议

场景不要只是一段文案。它至少要写清楚：

| 字段 | 作用 |
|---|---|
| `id` | 页面状态和接口参数 |
| `name` | 下拉框展示 |
| `description` | 当前场景解释 |
| `impactedAssets` | 被影响资产，用来驱动图、告警和健康度 |

```json
{
  "id": "edge-pressure",
  "name": "Edge Pressure",
  "description": "Highlights one edge asset, related alerts, and downstream services.",
  "impactedAssets": ["edge-2", "hub-west", "zone-2"]
}
```

这比散落在每个组件里的 if 判断更容易维护。

## 2. 数据质量进入主流程

数据校验别只放在后台日志里。To B dashboard 里，数据质量会直接影响演示可信度。

推荐把校验结果做成这样的结构：

```json
{
  "source": "asset_inventory.csv",
  "rows": 1280,
  "matched": 1266,
  "missing": 14,
  "note": "14 rows need location mapping"
}
```

然后把它用于：

- 页面可见的校验列表。
- 报表可信度。
- 导出前提示。
- 验收说明。

## 3. 健康度不要写死

健康分可以从几条容易解释的规则开始：

| 规则 | 可解释口径 |
|---|---|
| Asset availability | 关键资产状态 |
| Relationship confidence | 关系链路是否异常 |
| Alert freshness | 活跃告警数量和等级 |
| Report readiness | 数据校验覆盖率 |

对应代码在 [src/opsPatterns.ts](../src/opsPatterns.ts)。

## 4. 合同检查脚本

演示数据也需要校验。这个 repo 里保留了一个很小的检查脚本：

```bash
npm run check:contract
```

它会检查：

- link 里的 source / target 是否都存在。
- alert 引用的资产名称是否存在。
- validation 的 `missing` 是否等于 `rows - matched`。
- scenario 里的影响资产是否存在。

这个脚本很小，但能避免 demo 现场出现图能显示、告警却对不上资产的低级问题。

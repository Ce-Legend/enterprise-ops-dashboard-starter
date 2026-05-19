# 可复用模式

这份 demo 真正能拿走的是几条小模式。

## 1. Excel 表先整理成稳定结构

页面需要什么，Excel 里就要能找到稳定来源。

| 输入表 | 页面用途 |
|---|---|
| `assets.csv` | 节点、地图点、拓扑点 |
| `links.csv` | 关系边、拓扑边、状态线 |
| `services.csv` | 业务映射、路径追踪、影响分析 |
| `alerts.csv` | 状态标记、告警列表、健康度规则 |

真实项目里可以继续叫 `.xlsx`，但程序内部最好早一点整理成这种稳定结构。

## 2. 节点和边必须能互相校验

拓扑图最怕关系断链：边表里写了一个 source，节点表里找不到它。页面可能还能渲染一部分，但数据可信度已经坏了。

这个 repo 保留了一个小检查脚本：

```bash
npm run check:contract
```

它会检查：

- link 里的 source / target 是否都存在。
- alert 引用的资产名称是否存在。
- validation 的 `missing` 是否等于 `rows - matched`。
- scenario 里的影响资产是否存在。

## 3. 状态标记不要散落在组件里

状态最好集中成几类来源：

| 来源 | 用途 |
|---|---|
| `assets.status` | 节点颜色 |
| `links.status` | 边颜色和线型 |
| `alerts.level` | 告警列表排序 |
| `validations` | 报表可信度 |

这样 GIS 地图、逻辑拓扑、统计卡片和报表导出都能解释成同一套数据。

## 4. 报表导出从数据库走

前端表格导出适合临时看，正式交付最好从数据库生成报表。这个 demo 用：

```bash
npm run export:report
```

导出：

```text
summary.json
status_by_region.csv
topology_report.csv
alert_report.csv
```

这几份文件能说明一个完整闭环：节点状态、关系拓扑、告警事件和统计口径来自同一套结构化数据。

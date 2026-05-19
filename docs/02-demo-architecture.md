# Demo 架构笔记

这类数据可视化管理平台最容易做散：Excel 导入是一套逻辑，页面关系图是一套逻辑，状态标记是一套逻辑，报表导出又重新写一套统计。

我更喜欢把它收成一条数据流。

```text
Excel sheets -> import script -> SQLite tables -> UI views -> report export
```

## 数据层职责

| 层 | 作用 |
|---|---|
| Excel / CSV sheets | 原始输入，保持接近业务方能理解的表格 |
| SQLite tables | 稳定 ID、关系边、状态和统计口径 |
| Source check | 检查节点、关系、状态引用是否断链 |
| UI views | 展示拓扑、状态、统计和数据质量 |
| Report export | 从数据库导出可回查的统计结果 |

## 页面职责

| 区块 | 作用 |
|---|---|
| Overview | 快速判断导入规模、拓扑规模和报表状态 |
| Import pipeline | 说明输入表怎么进入数据库 |
| Relationship graph | 展示节点关系和状态变化 |
| Status triage | 把异常转成可处理列表 |
| Health rules | 解释整体分数怎么来 |
| Source validation | 说明数据来源和缺口 |
| Report path | 告诉使用方报表来自同一套数据库 |

## 为什么要这样组织

演示时，使用方通常会顺着这些问题追问：

- Excel 里哪张表变成节点？
- 关系图的边从哪张表来？
- 状态颜色是谁决定的？
- 告警和拓扑怎么关联？
- 报表里的统计能不能回查？

把这些问题提前变成数据结构和页面结构，demo 会顺很多。

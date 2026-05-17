# Demo 架构笔记

To B 演示系统最容易做散：驾驶舱一套数据，关系图一套数据，告警页一套数据，报表页又是另一套逻辑。

我更喜欢从一个可解释的场景状态出发。

```text
scenario -> impacted assets -> graph highlight
scenario -> alert filter -> triage table
scenario -> health penalty -> score and rules
validation rows -> report readiness
```

## 页面职责

| 区块 | 作用 |
|---|---|
| Overview | 快速判断当前状态 |
| Asset graph | 展示资产关系和影响范围 |
| Alert triage | 把异常转成可处理列表 |
| Health rules | 解释整体分数怎么来 |
| Source validation | 说明数据来源和缺口 |
| Report readiness | 判断导出内容是否可信 |

## 为什么要这样组织

演示时，使用方通常不会只看某个功能点。他会问：

- 这个告警影响哪里？
- 这条关系为什么变色？
- 健康分为什么下降？
- 报表里的数字从哪里来？
- 有缺失数据时系统怎么提示？

把这些问题提前变成界面结构，demo 会顺很多。

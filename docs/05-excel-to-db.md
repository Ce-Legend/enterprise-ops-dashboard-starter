# Excel 到数据库

这类 To B 数据可视化平台，第一步通常是把 Excel 里的关系整理成稳定表结构，页面会顺着这套结构自然长出来。

## 最小表结构

| 表 | 用途 |
|---|---|
| `assets` | 节点、设备、站点、资源对象 |
| `links` | 节点之间的关系或拓扑边 |
| `services` | 业务、服务、路径或承载关系 |
| `alerts` | 状态事件、告警、异常记录 |

示例输入放在：

```text
examples/excel-sheets/
```

这里用 CSV 代替 Excel sheet，方便直接跑脚本。真实项目可以把读取层换成 `.xlsx` 解析。

## 入库

```bash
npm run import:demo
```

输出：

```text
output/demo.db
```

脚本会做几件事：

- 创建 SQLite 表。
- 导入资产、关系、业务、告警。
- 检查关系表里的 source / target 是否能匹配资产表。
- 检查服务和告警是否引用了存在的资产。

## 导出报表

```bash
npm run export:report
```

输出：

```text
output/report/summary.json
output/report/status_by_region.csv
output/report/topology_report.csv
output/report/alert_report.csv
```

## 真实项目里容易踩的坑

- Excel 里同一个对象有多个名字，入库前要统一 ID。
- 关系边的方向要提前约定，别在前端临时猜。
- 状态字段要明确来源，避免节点、边、告警互相冲突。
- 报表导出要走数据库，不要只导出当前页面。
- 缺失数据要进入校验结果，不能静默丢掉。

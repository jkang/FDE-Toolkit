# 组件级设计规范（Component Specs）
# UX-Optimizer 对 MVP-prototype 中 11 类页面元素的专业化升级标准。
# 每类元素定义「视觉升级」+「交互升级」+「六态实现」，配套 antd/arco 落地要点。

> 目的：把裸 antd/arco 组件，升级为**符合该企业/场景定制设计语言**的专业组件。
> 所有维度的具体值（配色/圆角/间距）由 `brand_business_matrix.md` 推导，此处定"质"。

---

## 通用设计原则（所有元素）
- **间距**：统一 8pt 体系，卡内距 `24`，卡间距 `16`。
- **圆角**：按产品气质（严谨 6px / 通用 8px / 亲和 12px）。
- **阴影**：统一蓝色相阴影 `0 2px 8px rgba(16,33,62,0.08)`，禁用粗糙黑灰。
- **过渡**：统一 `0.15s ease-out`。
- **可点击**：`cursor-pointer` 全覆盖。
- **Focus**：统一强调色 Outline `#5DB2E2`。

---

## 1. steps（步骤进度）
- **视觉**：改用强调色高亮当前步；已完成步主色、将来步灰；进度条式而非纯圆点。
- **交互**：点击历史步可回看。
- **落地**：`<Steps>` 配 `type="navigation"` 或自定义 `progressDot`，`current` 色用 `colorPrimary`。

## 2. uploadCard（文件上传）
- **视觉**：拖拽区用虚线 + 强调色描边 + hover 填充浅色；中央大 icon + 主标题 + hint 小字。
- **交互**：hover 时描边加深；文件选中后显示文件名 + 大小 + 移除按钮。
- **六态**：`empty`(引导拖拽) / `hover`(描边) / `loading`(上传中) / `error`(格式/大小校验)。

## 3. aiResultCard（AI 结果）
- **视觉**：做成 "AI Insight Panel"——顶部加 `AI` 徽章 + 强调色左边框 4px；表格/键值两种渲染都加间距与分区。
- **交互**：loading 用**骨架屏**而非转圈；结果有 summary 引导句。
- **六态**：`empty`(触发前引导) / `loading`(骨架) / `error`(原因 + 重试) / `success`。
- **落地**：`Card` 左上角 `<Tag color="processing">AI</Tag>` + 自定义边框。

## 4. table（数据表格）
- **视觉**：表头浅底 `#f8fafc` + 加粗；斑马纹行；状态列用 Tag 着色（色+文）。
- **交互**：行 hover 高亮；表头 sticky；支持分页（数据多时）。
- **落地**：`pagination` 开启（数据量>10）；`rowClassName` 做 hover；列 `render` Tag。

## 5. statRow（指标卡）
- **视觉**：做成 "Metric Hero"——大数字 + 前缀强调色 + 后缀单位小字 + 顶部小标题；卡片带微阴影。
- **交互**：数字轻微上升动画（克制）；hover 阴影加深。
- **落地**：`Statistic` 配 `valueStyle` 用主色/强调色前缀，`prefix` 加 icon。

## 6. buttonRow（操作区）
- **视觉**：主操作强调色全宽（或醒目前置），次操作描边；图标+文本对齐。
- **交互**：hover 提升（`hoverLift`）+ 过渡；点击有 active 反馈。
- **落地**：主按钮 `type="primary"`，加间距；次按钮 `default`。

## 7. alert（业务告警）
- **视觉**：加图标 + 左边框强调色 + 浅色底配语义色文字。
- **交互**：可关闭（multi 时）；内容支持操作链接。
- **六态**：`info`/`success`/`warning`/`error` 四色语义。

## 8. timeline（状态流转）
- **视觉**：做成 "State Tracker"——节点用语义色圆点（成功绿/当前蓝/待办灰），线用浅灰。
- **交互**：当前节点高亮描边；可点击节点跳转。
- **落地**：`Timeline` 配 `color` 语义色 + 自定义 `dot`。

## 9. chatPanel（AI 对话）
- **视觉**：做成 "AI Copilot"——对话气泡左灰右蓝（用户/AI）；推荐指令 chips 胶囊。
- **交互**：输入 Enter 发送；loading 显示"正在输入"（typing indicator）；chips 点击即发送。
- **落地**：消息区滚动；`Input.Search` + 气泡列表 + 思流指示器。

## 10. formCard（表单录入）
- **视觉**：label 在上、字段在下的清爽分组；字段间距 16；必填星标。
- **交互**：校验失败红框 + 错误文案；提交 loading。
- **落地**：用 `Form`（而非裸 Input），`labelCol` 上置，`validateTrigger`。

## 11. tagRow（标签）
- **视觉**：做成 "Status Chips"——pill 胶囊 + 语义色浅底 + 深色文字。
- **交互**：可筛选（点击高亮）；可移除（multi 时）。
- **落地**：`Tag` 加 `round`，用浅色底 + 深色字。**色对必须取自 `references/contrast_guard.md`**（禁 gold/cyan/processing 深底深字）。

## 12. 对比度护栏（默认追加，所有组件生效）
- **硬性规则**：所有 Tag / Alert / 状态 / 正文字色对，**强制用 `references/contrast_guard.md` 的标准语义色对**（浅底深字）。
- **校验**：输出前对每个色对跑 `scripts/contrast_check.py`，正文 ≥4.5:1、大号 ≥3:1。
- **防返工**：若 scaffold 生成了 `color="gold"|"cyan"|"processing"`，由 `apply_ux_enhance.py` 的 CSS 护栏自动替换为达标色对（`.ant-tag-*` / `.ant-alert-*` 覆盖）。

---

## 交付自检（组件级）
- [ ] 11 类元素是否都用定制设计语言（非裸 antd 默认）
- [ ] 每个交互元素是否六态完备
- [ ] 阴影是否统一蓝色相、圆角是否按气质、间距是否 8pt
- [ ] **所有色对是否满足 WCAG AA**（正文 ≥4.5:1），无 gold/cyan/processing 深底深字反模式
- [ ] 状态是否"色+图标+文字"三重表达

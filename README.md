# sudoku_expertsystem
an expert system for solving sudoku

# 数独游戏专家系统
2016 秋季人工智能课程大作业

## 使用方法
直接打开 [sudoku.html](sudoku.html){:target="_blank"} 即可开始使用。首先在 PUZZLE 框中填好数独题目（空缺位置用 0 代替），然后按 SOLVE 按钮，稍等片刻后即可在 ANSWER 框中看到答案。

## 界面介绍

### 规则(rules)
在 RULES 框中可以填入规则（已预先填好15条规则）

### 谜题(puzzle)
在 PUZZLE 框中填入要解的谜题

### 答案(answer)
ANSWER 框中会显示答案

### 日志(log)
LOG 框中会显示推理过程

### 查询(query)
可以在 QUERY 的第一个文本框中填入要具体查询事实的编号，按回车键后第二个文本框中会显示该事实的推理过程。

### 编译好的规则(compiled rules)
此框中显示由规则编译生成的 JavaScript 代码

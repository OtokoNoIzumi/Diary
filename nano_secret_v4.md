# Nano Banana第四版使用心得 - 独家技巧揭秘

## 项目背景
- 这是分享Nano Banana v4使用心得的新网站
- 目标读者：对AI绘图感兴趣的用户，特别是想掌握Nano Banana的高手
- 网站名称：nano_secret_v4.html
- 与现有网站关联：补充image_magic.html的进阶内容

## 推文准备内容
第四版Nano Banana心得独家揭秘！新SOTA模型以一致性闻名，你抄来的提示词却很可能不好用？全网首个3日破千图、梯子流量干光的我，分享3个不为人知秘密：
同一个提示词至少应该尝试7次；LM Arena双图法，快速抽到Nano！
在Gemini商用Meta Prompt！
点击【第四版使用心得】链接，解锁独家技巧！

## 核心意图说明
1. **不是要否定和批判nano**：我的文章敌人不是nano，一致性神话的破灭不是我要的阐述方向，抨击nano这个SOTA模型对我没收益。我要的是带领读者发现更多秘密，要让一些人意识到我能力手段出众，且内容干货满满，给我自己增加影响力
2. 不是要玩出千变万化，而是nano作为因为一致性而被广泛认可的顶级模型，其实一致性也有很大问题，所以哪怕一个提示词也要尝试7次，才能确保有一次效果比较好
3. 3个秘密：lmarena可以选择双图快速抽到nano；在gemini里有上下文最好尝试meta prompt而不是一次性使用
4. 读者的收益就是看到秘密，而不是应该尝试nano banana，当然也可以说，还没玩过nano banana，快来看这第四版使用心得，助你迅速掌握这个新模型？

## 计划提供的证据
- 一个全缩略图的截图
- 一个我自己开发插件的定时
- 对同一个提示词生成的119个成品的分组讨论与概率计算（要确保95%概率至少出货1个需要重试7次）
- 模型内部的风格化等等

## 网站内容框架

### 秘密1：7次重试法则

尝试了7小时，重复474次，才一共成功生成了119个图片。

对成功的119个图片的分析，这里会附上一个全景图，已经通过文件命名实现了分组同级；
119个图片中，可以分成6大类，每一个大类都有显著的内部一致性，且各大类之间有显著区别：
类型A和类型B，显著识别出慕沛灵，且画风一致的两款不同造型，共计49张（两个造型依次是24、25张，其中B类包含了3张画风还是有些差异的图，所以成品图一共46张）
类型C，与慕沛灵相似度较低，类似皮克斯的角色画风，共计18张
类型D，显著识别出和紧身衣美女相似，但画风多少也有些接近皮克斯的角色画风，共计17张
类型E，显著识别出原始素材图紧身衣美女，且画风也没迁移的指令错误执行情况，共计30张
类型F，错误，例如三只手，5张。

所以一个很重要的全网独特观察就是相同条件下nano的执行也会得出大概5-6种主要分型
直观满足慕沛灵辨识度的只有46张，与总数119张比，如果要确保95%概率至少出货1个需要重试7次，而不只是拿着抄来的提示词用一下觉得好像确实有突破就够了。

#### 实验中使用的完整提示词
```
你将基于两张输入图像（Image A和Image B）生成一张新图像。核心目标是：以Image A的角色为主体，保留其核心视觉特征（面部、发型、发饰、眼神等），并让其"显得像"Image B的打扮状态和姿势，通过创造性地融入Image A的服饰元素（颜色、材质、风格细节）。允许在细节上适当发挥，增加新鲜感，但不得改变Image A的角色身份。遵循以下步骤，每个步骤都必须输出内容供我审阅：

步骤 1：描述输入图像
简要描述Image A和Image B，包含：
角色特征：面部、发型、发饰、眼睛颜色、性别、种族等。
服饰：款式、颜色、材质、纹理、配饰。
姿态与构图：身体姿势、面部朝向、镜头范围（全身/半身）。
背景与艺术风格：现实、动漫、奇幻等。
如果信息不足，注明假设（如"未明确发色，推测为自然色"）。

步骤 2：融合规则
角色主体：
新图像的主体必须是Image A的角色，保留其核心特征：
面部特征（脸型、皮肤、鼻子、嘴巴等）。
发型（形状、颜色、长度）、发饰、眼神（颜色、表情）。
其他身份标志（如性别、种族、年龄）。
不得直接使用Image B的角色特征（如发色、眼睛颜色、耳朵形状），除非明确要求。

姿态与构图：
采用Image B的身体姿势、面部朝向和构图，应用到Image A的角色上。
如果风格差异导致不协调（如现实角色配动漫姿态），适当调整姿态细节，使其自然融入Image A的风格。

服饰设计：
款式：使用Image B的服饰款式和结构（如连体衣、裙子、盔甲）。
风格元素：基于Image A的服饰颜色、材质、纹理或标志性细节（如飘逸袖子、特定配饰），创造性地融入Image B的款式。
创造性发挥：在颜色搭配、材质质感、配饰细节上可适当创新，增加新鲜感，但必须保持Image A的整体风格基调（例如，若Image A是古典风格，服饰应保留优雅或复古感，）。
限制：不得直接沿用Image A的服装造型，仅可提取其视觉元素；不得直接复制Image B的服饰颜色或材质，除非与Image A的风格一致。

背景与风格：
默认使用Image A的背景或推测与其风格一致的背景。
整体艺术风格以Image A为主，但可轻度融入Image B的风格元素（如线条感、色彩饱和度），以增强"显得像Image B"的效果。
不得完全采用Image B的风格（如动漫化Image A角色），除非明确要求。

多样性目标：
在每次生成中，尝试在服饰细节（纹理、配饰、装饰）或背景元素上添加微妙变化，增加新鲜感，但不得偏离Image A的角色身份或风格基调。

步骤 3：验证理解
在生成前，简要总结你的融合计划，格式如下：
"主体：Image A的[角色特征]，如'深色头发女性、古典面容'。""
"姿态：Image B的[姿势]，如'站立、双手下垂'。""
"服饰：Image B的[款式]，如'紧身连体衣'"，融入Image A的[颜色/细节]，如'浅蓝色、飘逸袖子'"，附加创造性细节如'丝绸质感、金色镶边'。""
"背景与风格：以Image A的[风格]，如'现实主义'"为主，背景为'古典庭院'"。"
如果有不明确的地方，说明假设并等待确认。

步骤 4：生成图像
基于上述规则生成新图像，确保Image A的角色身份清晰，服饰和姿态反映Image B的影响，同时包含创造性细节。
如果用户反馈结果错误（如"主体应是Image A"），重新检查步骤2，优先确保Image A的角色特征完整。

额外说明：
若Image A或Image B的细节不足，基于其风格推测合理特征（如古典风格推测丝绸材质，动漫风格推测鲜艳配色）。
在对话中若用户指出误解，立即调整生成，优先强化Image A的主体身份。
```

#### 第二个验证案例：紫灵和猫娘装扮迁移
**[网页中展示]：紫灵和猫娘装扮迁移的示意图，验证分型规律的普遍性**

### 秘密2：LM Arena双图法

#### 核心技巧：模型筛选
只有3个模型支持多图编辑：
- gpt-image
- gemini 2.0
- gemini 2.5

其他模型如flux pro/dev、qwen、seededit3不支持多图编辑。

#### 分辨率差异识别
提供非方型原始参考图（如3:4分辨率），gemini 2.5(nano)生成的图片尺寸是832×1248，gpt-image是1024×1536。

**[网页中展示]：分辨率差异对比图 + 本地浏览器插件示意图**

#### 单个图片编辑
提交多图之后怎么只编辑一个图呢？只需要单独声明处理一个图片即可。

#### 遮挡推理还原
Arena对内容的限制和把控的模型与实际处理的模型并不一致，利用顶尖模型的推理能力，可以提交本地用简单白色色块遮挡部分区域的图片，并最终让模型推理出一定程度还原的完整图片。

**[网页中展示]：遮挡推理还原的成果图**

### 秘密3：Gemini上的Meta Prompt

#### 核心优势：上下文迭代优化
LMarena是一个盲测对决两个模型并投票的网站，不采用上下文是为了特定场景的图像生成对比不受污染。

而Gemini提供了强大的上下文对话能力：

**Gemini的优势**：
- 可以像语言模型一样追问或反思
- 让LLM给出可能的问题和反馈
- 逐步整合意见进行迭代优化
- 支持在aistudio或gemini app上直接对话
- 成色并没有往往不理想，这只是对模型的调用而已

#### 提示词迭代对比

**最早版本（开放性足够，但依从性差）**：
```
不要直接迁移着装，而是推理图1的角色，用图1的服饰要素，让TA变成图2角色的打扮状态和姿势时的着装款式
```

**中间迭代版本（限制严格，多样性差，融合效果生硬）**：
```
请基于我提供的Image 1和Image 2生成一张图片，严格遵循以下融合规则：
核心角色： 完全继承Image 1中女性角色的面部特征、发型、发饰和眼神细节。
姿势与构图： 身体姿势、面部朝向和构图严格参照Image 2。
服装设计：
不要直接迁移着装，而是推理Image 1，用服装的颜色、材质、纹理等服饰要素，让Image 1的角色变成Image 2的
服装的款式、结构和轮廓参照Image 2。
颜色与细节： 服装的颜色、材质、纹理和配饰细节严格参照Image 1。
```

#### 实际优化案例：手办生成效果提升

**早期版本问题**：
- 半身等比例效果非常差
- 角色比例非常丑陋

**原始提示词**：
```
turn this photo into a character figure. Behind it, place a box with the character's image printed on it, and a computer showing the Blender modeling process on its screen. In front of the box, add a round plastic base with the character figure standing on it. Make the PVC material look clear, and set the scene indoors if possible.
```

**优化过程**：
- 在Gemini上进行上下文对话
- 发现问题：缺少头身比限制
- 迭代优化：额外加入头身比的限制条件

**优化后的提示词**：
```
Create an indoor scene featuring a high-quality PVC character figure based on a provided photo. The figure is a full-body, anime-style model with a 8-head-to-body ratio, standing in a same dynamic yet elegant pose. with intricate details reflecting the character's outfit and features from the photo. The figure stands on a round plastic base with a subtle design, The base is crafted from clear, glossy PVC material, . Behind the figure, place a rectangular box with the character's image printed on it, showcasing the same pose and design as the figure. Next to the box, include a computer displaying the Blender modeling process on its screen, with visible wireframe and texture layers of the character model. The scene is well-lit, set in a modern indoor environment (e.g., a studio or display room) with a clean, professional aesthetic.
```

**优化后的效果**：
- 角色比例得到显著改善
- 整体效果提升明显

#### 获取优质prompt后的使用
在获取到优质的prompt之后就可以去lmarena里刷出模型，并反复生成图片啦。

#### 早期用法对比
最早期的手办生成图片对于半身等效果非常差，角色比例非常丑。后来优化之后就额外加入了头身比的限制，就好了不少。

#### 最后展示
最后可以展示一些自己做起来效果不错的图片。

## 其他说明
- 网站设计风格：参考Linear App的简约现代设计
- 技术实现：HTML5、TailwindCSS、JavaScript
- 响应式设计：支持手机、平板、桌面
- 深色模式：跟随系统设置
- 交互体验：悬停效果、滚动动画等

## 网页制作材料清单
- 慕沛灵119个成品全景缩略图（按6大类分组）
- 紫灵和猫娘装扮迁移示意图
- 分辨率差异对比图（832×1248 vs 1024×1536）
- 本地浏览器插件示意图
- 遮挡推理还原成果图
- 手办生成优化前后对比图
- 其他效果不错的图片展示

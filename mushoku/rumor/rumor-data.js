/* 编号在创建时定死，不要改、不要回收。
   手改容易重号。页面底部的维护窗口会取当前最大号加一，并下载一份新的本文件。
   verdict：true 属实 / false 不实 / open 未定性。
   category：canon 原作 / anime 动画 / study 考据 / other 其他。谣言不单列，不实在记录性质里。
   chapters、characters、others 只能用下面目录里的 id。
   角色名单是要覆盖的范围，没有条目也会显示 0。
   images 写相对 mushoku/index.html 的路径。 */

const RUMOR_CATALOG = {
  chapters: [
    { id: "youth", name: "少年期" },
    { id: "s2", name: "第二季" },
    { id: "s3", name: "第三季" },
    { id: "diary", name: "日记篇" }
  ],
  characters: [
    { id: "rudeus", name: "鲁迪" },
    { id: "sylphy", name: "希露菲" },
    { id: "roxy", name: "洛琪希" },
    { id: "eris", name: "艾莉丝" },
    { id: "aisha", name: "爱夏" },
    { id: "zanoba", name: "扎诺巴" },
    { id: "sara", name: "莎拉" },
    { id: "paul", name: "保罗" },
    { id: "zenith", name: "塞妮丝" },
    { id: "hitogami", name: "人神" },
    { id: "cliff", name: "克里夫" },
    { id: "luke", name: "路克" },
    { id: "ariel", name: "爱丽儿" }
  ],
  others: [
    { id: "episode", name: "话数" },
    { id: "edition", name: "译本" },
    { id: "language", name: "语言" }
  ]
};

const RUMOR_CATEGORIES = [
  { id: "canon", name: "原作" },
  { id: "anime", name: "动画" },
  { id: "study", name: "考据" },
  { id: "other", name: "其他" }
];

const RUMOR_VERDICTS = [
  {
    id: "true",
    name: "属实",
    color: "#1b6e38",
    sealBg: "#e7f4ec",
    border: "#b8d9c1",
    boxBg: "#f2f8f4",
    icon: "rumor/assets/icons/future_diary.png"
  },
  {
    id: "false",
    name: "不实",
    color: "#6d38b5",
    sealBg: "#f5eefc",
    border: "#caa8eb",
    boxBg: "#f8f4fc",
    icon: "rumor/assets/icons/magic_crystal.png"
  },
  {
    id: "open",
    name: "未定性",
    color: "#946300",
    sealBg: "#f8f1e2",
    border: "#dfcfb0",
    boxBg: "#fbf7ef",
    icon: "rumor/assets/icons/crystal_rat.png"
  }
];

const RUMOR_RECORDS = [
  {
    id: "R-0001-s3e13",
    category: "other",
    verdict: "false",
    chapters: ["diary"],
    characters: ["rudeus"],
    others: [],
    claim: "日记篇播出后的同人补完和个人推测，可以当成原文设定。",
    summary: "日记正文本身是碎片。同人补完和推测要标明，不标明就会滑成谣言。",
    details: "本集热度起来之后，有人把同人文、同人图当成原文，也有人把个人推测写成设定科普。日记在原文里就是碎片，出现推测可以理解。记忆会有曼德拉效应，补充本身也可能有纰漏。作品没写到的内容有多种可能。作者回应时也常用「可能」「也许」「应该」，很少把话说死。两边各执一词时，先退一步。",
    comparisons: [],
    images: [],
    cite: "",
    see: ["R-0008-s3e13", "R-0013-s3e13", "R-0016-s3e13"]
  },
  {
    id: "R-0002-s3e13",
    category: "canon",
    verdict: "false",
    chapters: ["diary"],
    characters: ["rudeus", "hitogami", "roxy"],
    others: [],
    claim: "老鲁迪的悲剧全都是人神的错。",
    summary: "人神是悲剧的源头，但并非一切都是人神的错。老鲁迪自己也清楚，所以才会后悔。",
    details: "人神是源头，却不是会把如此巨大的恶全部扛下来的人。老鲁迪确实做了很多错误的选择。有些事可能有人神在背后操作，落到头上仍是他伤害了自己、家人和身边的人。他性格上的缺陷被人神抓住并利用。人神坑害了他，他也辜负了对不起那些被他伤害的人。把责任分成几几开，偏开了这个故事要说的事。更该记住的是，人生不能重来。",
    comparisons: [
      { source: "理不尽な孫の手 · 9月20日", text: "说白了，鲁迪乌斯也很清楚并非一切都是人神的错。所以才会后悔呢。" }
    ],
    images: [],
    cite: "",
    see: ["R-0003-s3e13"]
  },
  {
    id: "R-0003-s3e13",
    category: "canon",
    verdict: "false",
    chapters: ["diary"],
    characters: ["rudeus", "hitogami", "roxy"],
    others: [],
    claim: "除了洛琪希，老鲁迪的悲剧其余都是他自己的错。",
    summary: "这是争论的另一头。几几开的责任划分没有意义，也偏开了故事要说的事。",
    details: "一种说法是悲剧全都是人神的错，另一种是除了洛琪希、其余都是老鲁迪的错。两边为此对骂，甚至要做责任划分。作者不站在任何一边做这种划分。人神是源头，老鲁迪也做了错误的选择，并辜负了被他伤害的人。",
    comparisons: [],
    images: [],
    cite: "",
    see: ["R-0002-s3e13"]
  },
  {
    id: "R-0004-s3e13",
    category: "canon",
    verdict: "false",
    chapters: ["diary"],
    characters: [],
    others: [],
    claim: "治疗系魔法和攻击魔法一样，有火圣级、水圣级这种称呼。",
    summary: "治疗系分成治愈、结界、解毒、神击。称呼是圣级治愈术师、圣级解毒术师。",
    details: "治愈魔术用来治疗伤，包括止血、损伤、刀伤、冻伤、断骨、接回断肢，甚至长回断肢。伤越重，需要的等级越高，并且向下兼容。解毒魔术是另一套，用来对付醉酒、中毒和各种疾病，也可以制毒、解药、解除异常状态。有的毒到现在还没有对应的解毒魔术。疑难杂症要对症下药。",
    comparisons: [
      {
        source: "理不尽な孫の手 · 9月21日",
        text: "解毒魔术在初级阶段就已经基本完善了，能够治愈人类所患的八成疾病和中毒。随着等级提升，就会逐渐能够治疗特定的疾病或毒素；到了王级以上，通常每个等级能够治疗的基本上就只有一种。暗杀人类的时候，有时也会使用现存的解毒魔术无法治愈的毒。"
      }
    ],
    images: [],
    cite: "",
    see: ["R-0005-s3e13"]
  },
  {
    id: "R-0005-s3e13",
    category: "canon",
    verdict: "false",
    icon: "rumor/assets/icons/crystal_rat.png",
    chapters: ["diary"],
    characters: ["cliff", "rudeus"],
    others: [],
    claim: "克里夫中了毒箭之后，神经解毒魔术或者鲁迪自己的解毒魔术能把他救回来。",
    summary: "神经解毒魔术只能治疗魔石病。鲁迪掌握的解毒魔术对这支毒箭无效。",
    details: "所以他无法救回克里夫。",
    comparisons: [],
    images: [],
    cite: "",
    see: ["R-0004-s3e13", "R-0006-s3e13"]
  },
  {
    id: "R-0006-s3e13",
    category: "canon",
    verdict: "false",
    icon: "rumor/assets/icons/crystal_rat.png",
    chapters: ["diary"],
    characters: ["rudeus", "cliff", "zanoba", "roxy"],
    others: ["episode"],
    claim: "转移魔法阵是人神让使徒提前去破坏的。",
    summary: "原文写的是战斗波及导致损坏。动画里是鲁迪的岩炮弹打在转移魔法阵上。",
    details: "解毒咏唱很长。中级就有五十句以上，种类也多，上级达到上百句。到了圣级，背诵慢慢减少，魔力消耗增加。王级以上会被各国研究、藏匿。有的国家会拿「魔法无法生效」作威胁，再拿出治疗的术式。这一连串是连锁反应：为了救洛琪希才去偷神经魔术，克里夫才在回程中毒。扎诺巴和鲁迪辗转其他转移魔法阵回到家时，已经来不及了。",
    comparisons: [
      { source: "日记正文", text: "【神经咏唱似乎位于大圣堂的最深处。】【克里夫好像知道地点在哪，但保管的地方据说只有大主教级别的人才能获准进入。】【因此，我们决定趁夜深人静时偷偷潜入。只要在那里抄写咏唱再回来即可。】【我们成功侵入。】【然而，我们万万没料到神经的解毒咏唱居然是像字典一样厚重的书册。】【要当场抄写下来是不可能的，于是我们带了出去，但却在脱逃途中被人发现。】【现在我们正在躲避追兵。】【我们在转移魔法阵遭到奇袭。由于受到战斗波及，转移魔法阵损坏，再也无法使用。】【克里夫中毒倒下，昏迷不醒，性命垂危。】" }
    ],
    images: [],
    cite: "",
    see: ["R-0005-s3e13", "R-0007-s3e13"]
  },
  {
    id: "R-0007-s3e13",
    category: "canon",
    verdict: "open",
    chapters: ["diary"],
    characters: ["hitogami", "rudeus", "cliff"],
    others: [],
    claim: "人神报了位置，让使徒去堵转移魔法阵。",
    summary: "这是推测。原文和动画都没有这种表述。推测可以有，但要标明是推测。",
    details: "和「使徒提前破坏魔法阵」不是同一条。那一条和原文、动画都不符。这一条原文和动画都没有写。",
    comparisons: [],
    images: [],
    cite: "",
    see: ["R-0006-s3e13", "R-0017-s3e13"]
  },
  {
    id: "R-0008-s3e13",
    category: "canon",
    verdict: "false",
    chapters: ["diary"],
    characters: ["roxy", "rudeus"],
    others: [],
    claim: "原文写了洛琪希死前的个人视角。",
    summary: "原文没有这段个人视角。看到的是同人。",
    details: "动画把腹部结晶化画得最重。本集也有很多和以前镜头、情节对应的地方。",
    comparisons: [
      { source: "日记正文", text: "【洛琪希的身体有一半化成结晶，她死了。咏唱没有派上用场。】" }
    ],
    images: [],
    cite: "",
    see: ["R-0001-s3e13", "R-0009-s3e13"]
  },
  {
    id: "R-0009-s3e13",
    category: "canon",
    verdict: "false",
    chapters: ["diary"],
    characters: ["rudeus", "sylphy", "luke", "ariel", "hitogami"],
    others: ["episode"],
    claim: "老鲁迪向鲁迪讲希露菲后来的遭遇时，说了他自己当时的具体行为。",
    summary: "上一集他讲的是人神操控路克的原因。讲到希露菲时，他没有提自己的具体行为。",
    details: "这是「结束与开始」里已经说过的内容。讲到希露菲时，他没有提自己当时的具体行为。",
    comparisons: [
      { source: "日记正文", text: "「你根本不懂。在洛琪希之后，下一个就轮到希露菲了。失去洛琪希悲伤不已的你，有好一阵子无法考虑希露菲的事情。害得希露菲因此受伤，郁郁寡欢。这个时候，那家伙操控路克介入其中。」「是啊，在那之后，你会从当时和路克交往的女人口中，听说『一早起来，路克就焦急地说听到神明的启示什么的』。」「路克会向爱丽儿进言，导致希露菲决定抛下我前往阿斯拉王国。和无法拉拢佩尔基乌斯的爱丽儿一起！身处劣势的爱丽儿，决定孤注一掷引发内乱……然后败北。希露菲……也会跟着一起战死。」" }
    ],
    images: [],
    cite: "",
    see: ["R-0008-s3e13", "R-0010-s3e13"]
  },
  {
    id: "R-0010-s3e13",
    category: "anime",
    verdict: "false",
    chapters: ["diary"],
    characters: ["sylphy", "rudeus", "ariel"],
    others: ["episode"],
    claim: "原文里希露菲也是当场被抓住，然后马上离开。",
    summary: "原文是回家后因气味被发现，道歉没有用，几天后她才离开。动画改成了当场抓住。",
    details: "动画时长有限，当场抓住更直接。作者认为鲁迪选择这种方式发泄，也许是一种路径依赖，也对应第二季婚礼上爱丽儿说过的话，以及下半季片尾里那句做不到珍惜希露菲就会被夺回。",
    comparisons: [
      { source: "日记正文", text: "【最近，希露菲会明显地诱惑我。说什么要借由抱她来忘记洛琪希……由于她实在太过诱人，我只好对她大发脾气，听了那种不经大脑思考的话，我怎么可能还抱她。不过，原因不只这样。要是现在抱了希露菲，我肯定会恨恨地对待她，作为洛琪希的替代品，作为用来发泄情绪的对象。】【我认为……不应该这么做。】【我搞砸了。】【在酒馆喝酒的时候，有妓女跑来找我搭话。趁着一股酒劲，我直接跑去旅社开了房间，毕竟是出来卖的，技巧果然非常老练。该怎么说呢，至今我以为是女人而抱过的对象，充其量也不过是少女罢了……】【不，那种事情无关紧要。】【问题是我惹希露菲哭了。她看到我带着女人的气味回家，就说「为什么我就不行呢……」，然后就哭着跑回房间把自己关在里面。】【我被莉莉雅训了一顿，就连爱夏也明显地皱起眉头。】【现在我依然能听见门内传来的哭啼声，然而就算敲门也没有任何回应。】【搞砸了。她说不定是认为就算被粗暴对待也没关系，只是希望让我能宣泄悲伤。】【明天就向她道歉吧。】【希露菲不理我。该怎么办？】【这时候，要是艾莉娜丽洁在的话……】【希露菲不见了。】【早上起床后，房间已空荡荡的。正确来说，只留下了我给她的衣服还有装饰品。莉莉雅命令我立刻追上去。】" }
    ],
    images: [],
    cite: "",
    see: ["R-0011-s3e13", "R-0009-s3e13"]
  },
  {
    id: "R-0011-s3e13",
    category: "study",
    verdict: "true",
    icon: "rumor/assets/icons/blue_earrings.png",
    chapters: ["diary"],
    characters: ["sylphy", "rudeus"],
    others: ["language"],
    claim: "这封动画原创的人类语信，是什么意思？",
    summary: "这封信是动画补上的，原文没有。耳环盖住了开头。能看见的两段对得上巴斯克语：中间 asko，末尾 denagatik。合起来是 a lot for everything。盖住的部分只能推测是 thank。",
    images: [{ src: "rumor/assets/sylphy_letter.webp", caption: "被耳环盖住的信" }],
    cite: "是默然喔 · 2026年09月24日",
    see: ["R-0010-s3e13"]
  },
  {
    id: "R-0012-s3e13",
    category: "canon",
    verdict: "false",
    chapters: ["diary"],
    characters: ["eris", "rudeus"],
    others: [],
    claim: "艾莉丝不说话，一见面就揍鲁迪。",
    summary: "日记只记下他听不清她在喊什么。动画里她说了话。更接近的情况是她劝过他，两人没说通，然后她打了他。",
    details: "原文日记完全是老鲁迪的个人视角。重逢时她听到的是早就听过的离婚传言，然后表明心意、向鲁迪求婚。时机已经差太远，误会也没有解开。动画把这段补成了第三方视角。",
    comparisons: [
      { source: "日记正文", text: "【我们在城镇入口遇见了艾莉丝和基列奴。艾莉丝不知在鬼叫什么，但是我说自己已经有两名妻子，没办法再应付你之后，她就露出不知所措的表情离开了。】【基列奴在最后留下的轻蔑视线之后很不愉快。当我赶回家后，每个人的表情都一脸沉痛。洛琪希的身体有一半化成结晶，她死了。咏唱没有派上用场。】" }
    ],
    images: [],
    cite: "",
    see: ["R-0008-s3e13"]
  },
  {
    id: "R-0013-s3e13",
    category: "canon",
    verdict: "false",
    chapters: ["diary"],
    characters: ["sylphy", "rudeus"],
    others: [],
    claim: "原文写了希露菲死前的个人视角。",
    summary: "原文没有这段个人视角。看到的是同人。",
    details: "鲁迪从诺托斯家所在的米尔波兹领地回到王都，见到的是希露菲的尸体。动画也还原了小说里的惨状。",
    comparisons: [],
    images: [],
    cite: "",
    see: ["R-0001-s3e13", "R-0014-s3e13"]
  },
  {
    id: "R-0014-s3e13",
    category: "canon",
    verdict: "false",
    chapters: ["diary"],
    characters: ["sylphy", "rudeus", "ariel", "luke"],
    others: [],
    claim: "原版里希露菲是裸体被挂出来的。",
    summary: "原文不是这样。尸体挂在王都角落的处刑场示众。希露菲少一条手臂，脸上有深深的砍伤。",
    details: "",
    comparisons: [
      { source: "日记正文", text: "【我打算写下前几天的那件事。】【爱丽儿手下的尸体，被挂在王都角落的处刑场用来示众。】【尸体里面有路克……还有希露菲也在。】【希露菲的尸体少了一条手臂，脸上残留着深深的砍伤痕迹。有好几个人都对他们扔石头，民众把希露菲视为扰乱王都和平的罪犯对她扔着石头。每当石头一扔，啄食尸体的乌鸦就会展翅飞起。我实在忍无可忍，就用火魔术把希露菲他们都烧了。把碍事的家伙也全都烧了。】【这种国家，干脆毁灭算了。】" }
    ],
    images: [],
    cite: "",
    see: ["R-0013-s3e13", "R-0015-s3e13"]
  },
  {
    id: "R-0015-s3e13",
    category: "canon",
    verdict: "false",
    chapters: ["diary"],
    characters: ["rudeus"],
    others: [],
    claim: "鲁迪烧毁了整个首都，甚至整个阿斯拉。",
    summary: "原文是王都的一部分。说法被越传越大：一部分，一半，整个首都，整个阿斯拉。",
    details: "",
    comparisons: [
      { source: "日记正文", text: "【阿斯拉王国好像还不知道我就是把首都的一部分烧毁的犯人。一群愚蠢的家伙。尽是些垃圾。】" }
    ],
    images: [],
    cite: "",
    see: ["R-0014-s3e13"]
  },
  {
    id: "R-0016-s3e13",
    category: "canon",
    verdict: "false",
    chapters: ["diary"],
    characters: ["zanoba", "sylphy", "rudeus"],
    others: [],
    claim: "扎诺巴瞒着鲁迪私下做了希露菲人偶。人偶一张口叫主人，鲁迪才把它砸了。",
    summary: "这是同人。原文没有隐瞒，也没有叫主人。人偶是当面做的，砸碎之后扎诺巴反而向他道歉。",
    details: "希露菲人偶损坏之后，他们后来又做了其他长相的自动人偶，量产卖给魔法三大国。",
    comparisons: [
      { source: "日记正文", text: "【做得和希露菲如出一辙的自动人偶。她拥有自己的思想，会自己思考并付诸行动。】【顺带一提，无论我说什么她都会言听计从。】【既顺从又耿直，嫉妒心也有些许强烈，仿佛就像是在看着从前的希露菲。】【可是，这不是她，这并不是她……】【我破坏了希露菲人偶。】【原以为扎诺巴会动怒，他却反而向我道歉。该过意不去的人是我才对。】" }
    ],
    images: [],
    cite: "",
    see: ["R-0001-s3e13", "R-0018-s3e13"]
  },
  {
    id: "R-0017-s3e13",
    category: "canon",
    verdict: "false",
    icon: "rumor/assets/icons/crystal_rat.png",
    chapters: ["diary"],
    characters: ["hitogami", "zanoba", "rudeus", "aisha"],
    others: [],
    claim: "人神透露了鲁迪家的位置，也透露了扎诺巴怕火的弱点。",
    summary: "这是推测，原文没有对应描述。看日记的鲁迪认为，扎诺巴的死似乎和人神没有关系。",
    details: "扎诺巴是神子，物理抗性拉满，没有魔法防御，而且非常怕火。人神透露位置和怕火，原文没有写。米里斯在得知神经解毒之后还来追杀，仍是去偷神经解毒之后的连锁反应。",
    comparisons: [
      { source: "日记正文", text: `下一段长文，很明显写在纸质不同的地方——

> 札诺巴死了。
> 神殿骑士团在不知不觉间就侵入了拉诺亚王国。
> 当我赶到的时候，一切都太迟了。房屋遭到烧毁，札诺巴在地下室的门口被烧成焦炭，金洁和茱丽，还有麻烦札诺巴照顾的爱夏，她们躺在门后，全身都是刀伤。
> 我把还在拉诺亚王国的神殿骑士团赶尽杀绝了。然而，就算杀了他们，也已经没有任何意义。
> 札诺巴始终为了我尽心尽力，为什么我在那家伙危机的时候却没有陪着他？我究竟是为了什么才获得这样的力量？
> 我，太无力了。
>
> 结果，大家都死了。
> 活下来的，只有我一个人。身边已经没有任何人了。我没有保护到任何人。
>
> 都是人神的错。
> 至少，我必须要杀了人神……

内容突然沉重起来。
连札诺巴和爱夏都死了吗……太难受了。
但即使如此，这个我还是没有去找过家人吗？也对，毕竟事到如今，他或许也不知道该用什么脸去面对露西。
……还是说，在这本日记没有写到的地方，莉莉雅她们也已经死了？
连诺伦的名字也没有出现，这表示……不，别乱想了。没有写的事情代表没有发生，我就这样想吧。不过话又说回来，札诺巴的死看起来似乎和人神没有关系……` }
    ],
    images: [],
    cite: "",
    see: ["R-0007-s3e13", "R-0019-s3e13", "R-0020-s3e13"]
  },
  {
    id: "R-0018-s3e13",
    category: "anime",
    verdict: "false",
    chapters: ["diary"],
    characters: ["eris", "zanoba", "aisha"],
    others: ["episode"],
    claim: "动画里艾莉丝、扎诺巴和爱夏的死亡顺序与原文一致。",
    summary: "原文是人偶、人神跳脸、铠甲、审问艾莉丝、艾莉丝挡刀，然后才是扎诺巴和爱夏死亡。动画把后面这两段对调了。",
    details: "原文顺序：做出人偶，人神跳脸，做出铠甲，审问艾莉丝，艾莉丝挡刀，扎诺巴和爱夏死亡。动画里，艾莉丝的死，和扎诺巴、爱夏的死，顺序换了。",
    comparisons: [],
    images: [],
    cite: "",
    see: ["R-0016-s3e13", "R-0017-s3e13"]
  },
  {
    id: "R-0019-s3e13",
    category: "study",
    verdict: "false",
    icon: "rumor/assets/icons/future_diary.png",
    chapters: ["diary"],
    characters: ["zanoba", "aisha"],
    others: ["language"],
    claim: "日语「扉の奥で切り刻まれていた」的意思是肢解。",
    summary: "这个词说的是被砍到残破不堪。有人理解成砍成了碎块。日语原文本身没有肢解的意思。",
    details: "这句话贴在日记那一节旁边：扎诺巴被烧成焦炭，金洁和茱丽，还有拜托他照顾的爱夏，躺在门后，全身都是刀伤。帖子里说明文字写的是茱莉，日记引文写的是茱丽。",
    comparisons: [
      { source: "日语原文", text: "扉の奥で切り刻まれていた" },
      { source: "帖子注释", text: "应该是被砍的残破不堪的程度，也有人认为是砍成了碎块，但日语原意本身没有肢解的意思。" }
    ],
    images: [],
    cite: "",
    see: ["R-0017-s3e13"]
  },
  {
    id: "R-0020-s3e13",
    category: "canon",
    verdict: "true",
    chapters: ["diary"],
    characters: ["rudeus", "zanoba"],
    others: [],
    claim: "米里斯通过阿斯拉向拉诺亚提出引渡鲁迪，魔法三大国没有同意，他仍住在夏利亚。",
    summary: "补充里就是这样写的。鲁迪当时认为自己还有利用价值。",
    details: "扎诺巴的自动人偶在这之前已经完成。米里斯神圣国的图标，在第一季的 OVA 里出现过。",
    comparisons: [],
    images: [],
    cite: "",
    see: ["R-0017-s3e13"]
  }
];

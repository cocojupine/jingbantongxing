const sharedScale = [
  { value: 1, label: "几乎无感知" },
  { value: 2, label: "轻微注意，无不适" },
  { value: 3, label: "明显注意，略有不适" },
  { value: 4, label: "感到烦躁，想回避" },
  { value: 5, label: "感到痛苦，无法忍受" }
]

const tactileScale = [
  { value: 1, label: "无排斥，正常接触" },
  { value: 2, label: "轻微注意，可接触" },
  { value: 3, label: "明显排斥，勉强接触" },
  { value: 4, label: "强烈排斥，不愿接触" },
  { value: 5, label: "极度抗拒，接触后不适" }
]

const gustatoryScale = [
  { value: 1, label: "无不适，正常食用" },
  { value: 2, label: "轻微注意，可食用" },
  { value: 3, label: "略有不适，勉强食用" },
  { value: 4, label: "明显不适，拒绝食用" },
  { value: 5, label: "感到恶心，无法接触" }
]

export const sensoryData = [
  {
    id: "visual",
    title: "视觉",
    themeColor: "#5F9AE6",
    bgLight: "#F2F7FF",
    scale: sharedScale,
    questions: [
      { id: "vis_1", text: "对强光/直射光的反应（如射灯、落地窗阳光、电子屏、反光玻璃）" },
      { id: "vis_2", text: "对视觉闪烁/条纹的反应（如滚动电子屏、灯光频闪、装饰条纹图案、旋转灯效）" },
      { id: "vis_3", text: "对视觉杂乱/鲜艳色彩的反应（如多色装饰海报、彩色灯光、琳琅满目的展示品）" },
      { id: "vis_4", text: "对场馆人群/空间拥挤的反应（如人流密集区、排队人群、狭窄通道的拥挤感）" }
    ]
  },
  {
    id: "auditory",
    title: "听觉",
    themeColor: "#8E7AE6",
    bgLight: "#F5F2FF",
    scale: sharedScale,
    questions: [
      { id: "aud_1", text: "对突发尖锐声音的反应（如广播、物品掉落、干手器鸣响、门铃/报警器）" },
      { id: "aud_2", text: "对持续背景杂音的忍受度（如空调/新风轰鸣声、人群低频交谈、背景音乐、回声）" },
      { id: "aud_3", text: "对特定频率声音的反应（如电梯运行的低频声、音响的高频声、金属碰撞的刺耳声）" },
      { id: "aud_4", text: "对大声喧哗/嘈杂的反应（如儿童哭闹、多人交谈、活动现场的喧闹声）" }
    ]
  },
  {
    id: "olfactory",
    title: "嗅觉",
    themeColor: "#E7A54B",
    bgLight: "#FFF8ED",
    scale: sharedScale,
    questions: [
      { id: "olf_1", text: "对浓烈香味的反应（如香薰/香氛、工作人员香水、食品区的甜味/烘焙味）" },
      { id: "olf_2", text: "对刺激性异味的反应（如消毒水/清洁剂、塑胶地面/座椅的味道、潮湿霉味、油烟味）" },
      { id: "olf_3", text: "对突然出现异味的反应（如打翻的饮品味、垃圾桶异味、临时消毒的刺鼻味）" }
    ]
  },
  {
    id: "tactile",
    title: "触觉",
    themeColor: "#4AAE8B",
    bgLight: "#EFFAF6",
    scale: tactileScale,
    questions: [
      { id: "tac_1", text: "对不同材质接触的反应（如皮革/布艺座椅、塑胶/瓷砖地面、金属扶手、玻璃台面）" },
      { id: "tac_2", text: "对身体触碰/压迫的反应（如人群拥挤、他人无意触碰、座椅包裹感过强、衣物与皮肤的摩擦）" },
      { id: "tac_3", text: "对洗护/清洁用品接触的反应（如洗手液、纸巾的消毒味接触皮肤、湿巾材质）" }
    ]
  },
  {
    id: "gustatory",
    title: "味觉",
    themeColor: "#C878DC",
    bgLight: "#FDF2FF",
    scale: gustatoryScale,
    questions: [
      { id: "gus_1", text: "对食物/饮品浓烈味道的反应（如甜腻饮品、辛辣/酸涩零食、过咸简餐）" },
      { id: "gus_2", text: "对食物/饮品特殊味道的反应（如食品防腐剂味、食材腥味、饮品添加剂味）" },
      { id: "gus_3", text: "对食物特定口感的反应（如过黏/过干、过硬/过软、蔬菜、肉类、絮状口感）" }
    ]
  }
]

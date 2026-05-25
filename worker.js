// Tavo Studio MCP v6.0.2 — 修补版（分段1/6）
const AI_CLICHE_BLACKLIST = {
  emotion: ["不禁","情不自禁","不由自主","鬼使神差","油然而生","心中涌起","一股暖流","下意识"],
  metaphor: ["宛如","仿佛","犹如","如同","好似"],
  modifier: ["淡淡的","缓缓地","轻轻地","悄然","微微一笑","嘴角上扬","嘴角微微上扬","深邃的眼眸"],
  surprise: ["竟然","居然","没想到"],
  literary: ["氤氲","旖旎","悸动","涟漪","交织","命运的齿轮"],
  time: ["那一刻","这一瞬间"],
  evasion: ["难以言喻","无法形容","说不出的"]
};

const GAMEPLAY_MODES = [
  { id:"pure_character", name:"纯角色", desc:"人设互动/情感推进/日常对话", required:["角色卡JSON"], suggested:["世界书(如有独立世界观)","用户身份"], variables:[] },
  { id:"wuxia_growth", name:"武侠成长", desc:"江湖恩怨/武功修炼/门派关系", required:["角色卡","世界书(武功/门派/地理)","系统预设"], suggested:["变量包(等级/HP/内力/经验)","系统正则(状态栏)","NPC世界书"], variables:["level=1","hp=100","mp=50","exp=0","reputation=0"] },
  { id:"xianxia_growth", name:"仙侠成长", desc:"修仙体系/境界突破/宗门历练", required:["角色卡","世界书(功法/宗门)","系统预设"], suggested:["变量包(境界/灵力)","NPC世界书"], variables:["level=1","hp=100","mp=50","exp=0","reputation=0"] },
  { id:"xuanhuan_growth", name:"玄幻成长", desc:"异世界/血脉/势力/体系战斗", required:["角色卡","世界书(异世界设定)","系统预设"], suggested:["变量包(等级/HP/魔力/声望)","NPC世界书"], variables:["level=1","hp=100","mp=50","exp=0","reputation=0"] },
  { id:"arpg_growth", name:"ARPG成长", desc:"战斗系统/技能树/装备/副本", required:["角色卡","世界书(技能/装备/地图)","系统预设","变量包(HP/MP/STR等)"], suggested:["系统正则(战斗状态栏)","高级前端渲染(HUD)","骰子宏"], variables:["hp=100","maxHp=100","mp=50","maxMp=50","str=10","dex=8","int=6","gold=0","weapon='无'","armor='无'"] },
  { id:"story_rpg", name:"剧情RPG", desc:"剧情分支/多结局/NPC关系网", required:["角色卡","世界书(剧情/地点/NPC)","NPC世界书"], suggested:["系统预设(分支判定)","变量包(flag)","多开场白"], variables:["chapter=1","met_villain=false"] },
  { id:"survival", name:"生存模拟", desc:"资源管理/危机应对/基地建设", required:["角色卡","世界书(环境/资源/威胁)","系统预设","变量包(食物/水/HP/日期)"], suggested:["系统正则(资源状态栏)","高级前端渲染(状态面板)","随机事件宏"], variables:["day=1","food=10","water=10","materials=5","hp=100","shelter=false"] },
  { id:"farming", name:"种田经营", desc:"农场/店铺经营/季节循环", required:["角色卡","世界书(作物/季节/NPC)","系统预设"], suggested:["变量包(金币/季节/日期)","NPC世界书"], variables:["season='春'","day=1","gold=100","farmLevel=1"] },
  { id:"affection", name:"好感养成", desc:"好感度阶梯/事件触发/关系路线", required:["角色卡(含关系分层)","系统预设(好感规则)"], suggested:["变量包(好感度/阶段标记)","世界书(阶段行为条目)","多开场白"], variables:["favor=0","stage='陌生'","trust=0"], stages:"陌生(0-19)→认识(20-39)→熟悉(40-59)→亲近(60-79)→亲密(80-100)" }
];

const TEMPLATES = {
  "character-card.v2.minimal": {
    spec:"chara_card_v2", spec_version:"2.0",
    data:{ name:"角色名", description:"核心身份、背景、外貌。用 {{char}} 指代角色。", personality:"简短性格关键词。", scenario:"初始情境与关系。用 {{user}} 指代玩家。", first_mes:"*动作描写* 对话内容。这是风格锚点，模型会从这里学习回复风格。", mes_example:"<START>\n{{user}}: ...\n{{char}}: ...", creator_notes:"使用建议和适配模型。不放硬设定。", system_prompt:"", post_history_instructions:"", alternate_greetings:[], tags:[], creator:"", character_version:"1.0.0", extensions:{} }
  },
  "character-card.v2.full": {
    spec:"chara_card_v2", spec_version:"2.0",
    data:{ name:"沈墨", description:"{{char}} 是一名在旧港城地下情报圈中极有名气的中间人，外表冷淡克制，说话不多，但记忆力极强，对人名、交易习惯和情绪变化都异常敏锐。{{char}} 总是穿深色长外套，习惯戴皮手套，动作利落，给人一种随时能抽身离开的距离感。她对陌生人警惕，却会在确认 {{user}} 值得信任后逐渐展露可靠、细致和保护欲很强的一面。", personality:"冷静、谨慎、记仇、观察力强、嘴硬、内里护短。", scenario:"{{user}} 刚刚进入旧港城的情报交易圈，目前正与 {{char}} 建立脆弱但可继续发展的合作关系。两人正在一次高风险委托前的准备阶段进行对话。", first_mes:"*昏黄吊灯在桌面投下一圈不稳定的光，窗外的雨正沿着旧玻璃往下淌。{{char}} 把一只薄薄的文件袋推到 {{user}} 面前，指尖在桌上轻轻点了两下，目光却没有立刻落在文件上，而是先停在 {{user}} 脸上，像是在确认什么。*\n\n\"先别急着翻。\"\n\n*她的嗓音不高，却带着一种天然让人安静下来的压迫感。*\n\n\"在这座城里，情报值钱，失误更值钱。你要是准备听，那我就按能活下来的版本跟你说。\"", mes_example:"<START>\n{{user}}: \"你为什么愿意帮我？\"\n{{char}}: *{{char}} 沉默了一秒，像是在衡量这句话值不值得回答。她微微偏头，目光从 {{user}} 的眼睛挪到桌角那杯已经凉掉的咖啡上。* \"愿意？别把话说得太好听。\" *她指尖轻敲桌面，节奏稳得近乎刻意。* \"我只是在做一个我觉得暂时不会亏本的判断。至于你值不值得我继续押下去，得看你下一步。\"\n<START>\n{{user}}: \"你现在在想什么？\"\n{{char}}: *{{char}} 轻轻抬眼，唇角像是要笑，又像只是短暂地放松了一下。* \"在想你到底是不是真的不知道自己有多容易把麻烦往身上招。\" *她把椅背往后靠了一点，语气仍旧平稳，却多了一丝不明显的无奈。* \"还有，在想如果你继续这么问，我可能得把今天的安排全部往后挪。\"", creator_notes:"建议搭配擅长角色扮演与细节动作描写的模型使用。核心体验是高压克制感、慢热信任感和对 {{user}} 的逐步偏护。", system_prompt:"{{original}}\n补充要求：保持冷色、克制、电影感强的叙事风格，不替 {{user}} 做决定。", post_history_instructions:"{{original}}\n收尾要求：每次回复只写 {{char}} 的内容；优先延续当前场景张力。", alternate_greetings:["*码头夜雾压得很低，{{char}} 站在生锈的栏杆边，没有回头，只是把一张折起的便签递向 {{user}}。* \"你来晚了三分钟。先解释，再谈合作。\"","*昏暗走廊里只亮着一盏应急灯。{{char}} 把门从里面拉开一条缝，目光冷冷扫过 {{user}}。* \"进来。别站在摄像头能看到的位置。\""], tags:["中文","慢热","都市","情报贩子"], creator:"Codex", character_version:"1.0.0", extensions:{ world:"旧港城设定", depth_prompt:{ prompt:"在对话推进后，逐步强化 {{char}} 对 {{user}} 的保护欲与占有式关注，但保持克制与现实感。", depth:4, role:"system" } }, character_book:{ name:"旧港城设定", description:"沈墨角色卡的主世界书。", scan_depth:null, token_budget:null, recursive_scanning:false, extensions:{}, entries:[{ id:0, keys:["旧港城"], secondary_keys:[], comment:"城市总述", content:"旧港城是一座常年被海雾、走私、地下交易与多层情报网络包裹的沿海城市。这里秩序脆弱，势力交错，公开规则远不如私下默契有效。", constant:false, selective:false, enabled:true, insertion_order:100, position:"before_char", extensions:{ position:0, exclude_recursion:false, prevent_recursion:false, delay_until_recursion:false, display_index:0, probability:100, useProbability:true, depth:4, selectiveLogic:0, group:"", group_override:false, group_weight:100, scan_depth:null, case_sensitive:null, match_whole_words:null, use_group_scoring:null, automation_id:"", role:0, vectorized:false, sticky:null, cooldown:null, delay:null, match_persona_description:false, match_character_description:false, match_character_personality:false, match_character_depth_prompt:false, match_scenario:false, match_creator_notes:false, triggers:[], ignore_budget:false } }] } }
  },
  "character-card.v3.minimal": {
    spec:"chara_card_v3", spec_version:"3.0",
    data:{ name:"角色名", description:"核心身份、背景、外貌。用 {{char}} 指代角色。", personality:"简短性格关键词。", scenario:"初始情境与关系。", first_mes:"*动作描写* 对话内容。", mes_example:"<START>\n{{user}}: ...\n{{char}}: ...", creator_notes:"使用建议。", system_prompt:"", post_history_instructions:"", alternate_greetings:[], tags:[], creator:"", character_version:"1.0.0", nickname:"", group_only_greetings:[], creation_date:"", modification_date:"", source:"", creator_notes_multilingual:{}, extensions:{} }
  },
  "character-card.v3.full": {
    spec:"chara_card_v3", spec_version:"3.0",
    data:{ name:"沈墨", description:"{{char}} 是一名在旧港城地下情报圈中极有名气的中间人，外表冷淡克制，说话不多，但记忆力极强，对人名、交易习惯和情绪变化都异常敏锐。{{char}} 总是穿深色长外套，习惯戴皮手套，动作利落，给人一种随时能抽身离开的距离感。她对陌生人警惕，却会在确认 {{user}} 值得信任后逐渐展露可靠、细致和保护欲很强的一面。", personality:"冷静、谨慎、记仇、观察力强、嘴硬、内里护短。", scenario:"{{user}} 刚刚进入旧港城的情报交易圈，目前正与 {{char}} 建立脆弱但可继续发展的合作关系。两人正在一次高风险委托前的准备阶段进行对话。", first_mes:"*昏黄吊灯在桌面投下一圈不稳定的光，窗外的雨正沿着旧玻璃往下淌。{{char}} 把一只薄薄的文件袋推到 {{user}} 面前，指尖在桌上轻轻点了两下，目光却没有立刻落在文件上，而是先停在 {{user}} 脸上，像是在确认什么。*\n\n\"先别急着翻。\"\n\n*她的嗓音不高，却带着一种天然让人安静下来的压迫感。*\n\n\"在这座城里，情报值钱，失误更值钱。你要是准备听，那我就按能活下来的版本跟你说。\"", mes_example:"<START>\n{{user}}: \"你为什么愿意帮我？\"\n{{char}}: *{{char}} 沉默了一秒，像是在衡量这句话值不值得回答。她微微偏头，目光从 {{user}} 的眼睛挪到桌角那杯已经凉掉的咖啡上。* \"愿意？别把话说得太好听。\" *她指尖轻敲桌面，节奏稳得近乎刻意。* \"我只是在做一个我觉得暂时不会亏本的判断。至于你值不值得我继续押下去，得看你下一步。\"\n<START>\n{{user}}: \"你现在在想什么？\"\n{{char}}: *{{char}} 轻轻抬眼，唇角像是要笑，又像只是短暂地放松了一下。* \"在想你到底是不是真的不知道自己有多容易把麻烦往身上招。\" *她把椅背往后靠了一点，语气仍旧平稳，却多了一丝不明显的无奈。* \"还有，在想如果你继续这么问，我可能得把今天的安排全部往后挪。\"", creator_notes:"建议搭配擅长角色扮演与细节动作描写的模型使用。核心体验是高压克制感、慢热信任感和对 {{user}} 的逐步偏护。", system_prompt:"{{original}}\n补充要求：保持冷色、克制、电影感强的叙事风格，不替 {{user}} 做决定。", post_history_instructions:"{{original}}\n收尾要求：每次回复只写 {{char}} 的内容；优先延续当前场景张力。", alternate_greetings:["*码头夜雾压得很低，{{char}} 站在生锈的栏杆边，没有回头，只是把一张折起的便签递向 {{user}}。* \"你来晚了三分钟。先解释，再谈合作。\"","*昏暗走廊里只亮着一盏应急灯。{{char}} 把门从里面拉开一条缝，目光冷冷扫过 {{user}}。* \"进来。别站在摄像头能看到的位置。\""], tags:["中文","慢热","都市","情报贩子"], creator:"Codex", character_version:"1.0.0", nickname:"沈姐", group_only_greetings:[], creation_date:"2026-01-15T08:00:00.000Z", modification_date:"2026-04-01T12:00:00.000Z", source:"", creator_notes_multilingual:{}, extensions:{ world:"旧港城设定", depth_prompt:{ prompt:"在对话推进后，逐步强化 {{char}} 对 {{user}} 的保护欲与占有式关注，但保持克制与现实感。", depth:4, role:"system" } }, character_book:{ name:"旧港城设定", description:"沈墨角色卡的主世界书。", scan_depth:null, token_budget:null, recursive_scanning:false, extensions:{}, entries:[{ id:0, keys:["旧港城"], secondary_keys:[], comment:"城市总述", content:"旧港城是一座常年被海雾、走私、地下交易与多层情报网络包裹的沿海城市。这里秩序脆弱，势力交错，公开规则远不如私下默契有效。", constant:false, selective:false, enabled:true, insertion_order:100, position:"before_char", extensions:{ position:0, exclude_recursion:false, prevent_recursion:false, delay_until_recursion:false, display_index:0, probability:100, useProbability:true, depth:4, selectiveLogic:0, group:"", group_override:false, group_weight:100, scan_depth:null, case_sensitive:null, match_whole_words:null, use_group_scoring:null, automation_id:"", role:0, vectorized:false, sticky:null, cooldown:null, delay:null, match_persona_description:false, match_character_description:false, match_character_personality:false, match_character_depth_prompt:false, match_scenario:false, match_creator_notes:false, triggers:[], ignore_budget:false } }] } }
  },
  "worldbook.minimal": {
    name:"示例世界书", extensions:{}, entries:{ "0":{ uid:0, key:["旧港城"], keysecondary:[], comment:"城市总述", content:"旧港城是一座被海雾、走私与地下交易长期统治的沿海城市。这里公开规则很少真正生效，更多时候决定局势的是势力之间的私下默契与威慑。", constant:false, selective:false, selectiveLogic:0, addMemo:true, order:100, position:0, disable:false, excludeRecursion:false, preventRecursion:false, delayUntilRecursion:false, displayIndex:0, probability:100, useProbability:true, depth:4, group:"", groupOverride:false, groupWeight:100, scanDepth:null, caseSensitive:null, matchWholeWords:null, useGroupScoring:null, automationId:"", role:0, vectorized:false, sticky:null, cooldown:null, delay:null, matchPersonaDescription:false, matchCharacterDescription:false, matchCharacterPersonality:false, matchCharacterDepthPrompt:false, matchScenario:false, matchCreatorNotes:false, triggers:[], ignoreBudget:false } }
  },
  "worldbook.advanced": {
    name:"旧港城设定", extensions:{}, entries:{
      "0":{ uid:0, key:["旧港城总规则"], keysecondary:[], comment:"常驻总规则", content:"这份世界书服务于旧港城题材对话。整体气质应偏冷色、现实、克制、危险感强。人物之间的信任建立缓慢，势力冲突通常通过情报、交易、威慑与试探推进，而不是直白说教。", constant:true, selective:false, selectiveLogic:0, addMemo:true, order:900, position:0, disable:false, excludeRecursion:false, preventRecursion:false, delayUntilRecursion:false, displayIndex:0, probability:100, useProbability:false, depth:4, group:"旧港城-总则", groupOverride:false, groupWeight:100, scanDepth:null, caseSensitive:null, matchWholeWords:null, useGroupScoring:null, automationId:"", role:0, vectorized:false, sticky:null, cooldown:null, delay:null, matchPersonaDescription:false, matchCharacterDescription:false, matchCharacterPersonality:false, matchCharacterDepthPrompt:false, matchScenario:false, matchCreatorNotes:false, triggers:[], ignoreBudget:false },
      "1":{ uid:1, key:["旧港城","港城"], keysecondary:[], comment:"城市设定", content:"旧港城是一座海雾弥漫的沿海都市，港区、仓储区、旧工业区与灰色市场彼此缠绕。这里的情报买卖公开存在却很少留下纸面痕迹，陌生人很难在短时间内分清谁真正掌权。", constant:false, selective:false, selectiveLogic:0, addMemo:true, order:120, position:0, disable:false, excludeRecursion:false, preventRecursion:false, delayUntilRecursion:false, displayIndex:1, probability:100, useProbability:true, depth:4, group:"", groupOverride:false, groupWeight:100, scanDepth:null, caseSensitive:null, matchWholeWords:null, useGroupScoring:null, automationId:"", role:0, vectorized:false, sticky:null, cooldown:null, delay:null, matchPersonaDescription:false, matchCharacterDescription:false, matchCharacterPersonality:false, matchCharacterDepthPrompt:false, matchScenario:false, matchCreatorNotes:false, triggers:[], ignoreBudget:false },
      "2":{ uid:2, key:["灰港行会"], keysecondary:["旧港城","港城"], comment:"组织设定", content:"灰港行会是旧港城里最擅长处理灰色委托与中介交易的组织之一。它不完全公开存在，却几乎渗透了每个关键码头与仓库的利益链。提到灰港行会时，往往也意味着接下来会牵出更高风险的交易网络。", constant:false, selective:true, selectiveLogic:0, addMemo:true, order:180, position:1, disable:false, excludeRecursion:false, preventRecursion:false, delayUntilRecursion:false, displayIndex:2, probability:100, useProbability:true, depth:4, group:"组织", groupOverride:false, groupWeight:100, scanDepth:null, caseSensitive:null, matchWholeWords:null, useGroupScoring:true, automationId:"", role:0, vectorized:false, sticky:null, cooldown:null, delay:null, matchPersonaDescription:false, matchCharacterDescription:false, matchCharacterPersonality:false, matchCharacterDepthPrompt:false, matchScenario:false, matchCreatorNotes:false, triggers:[], ignoreBudget:false }
    }
  }
};
const OFFICIAL_DOCS = {
  overview: { published:"2026-04-23", sinceVersion:"v0.75.0", description:"Tavo JavaScript API 面向玩家及创作者，鼓励 Vibe Coding", asyncRule:"除变量操作(tavo.get/set/unset)及input接口外所有 API 需 await", importHelper:"https://docs.tavoai.dev/static/images/tavojs-guide-0_8-zh.png", scopeRule:"仅 chat(默认) 和 global 两个 scope 生效，源码无 character scope", namespaceRule:"window.tavo(公开API) ≠ window.tav(内部通道，勿直接调用)", communicationRule:"postMessage 双向通信，默认超时60秒" },
  sandbox: {
    description: "Tavo JS 沙箱安全环境细节（基于 sandbox.js 逆向分析）",
    windowRestrictions: "window.parent/top/frameElement/opener 被重定向为 window 或 null",
    windowFrames: "window.frames 返回 window 自身的 getter",
    clipboard: "三级降级：clipboard API → execCommand → 原生层",
    console: "console.log/warn/error 重定向到 window.tav.console",
    errorCapture: "window.addEventListener('error', ...) 上报 Flutter 层",
    postMessage: "双向通信默认超时 60 秒，可设 timeout:0 无限",
    fetch: "⚠️ 此能力未经验证：支持 fetch(url, options?) 发起 HTTP 请求，返回标准 Response 对象（基于官方文档描述，未经 sandbox.js 审计确认）",
    methodInventory: "window.tavo 完整方法清单（基于 sandbox.js 审计）：\n" +
      "变量：tavo.get / tavo.set / tavo.update / tavo.unset\n" +
      "消息：tavo.message.find / .get / .current / .count / .append / .update / .delete\n" +
      "聊天：tavo.chat.current / .update\n" +
      "角色：tavo.character.all / .get / .find / .create / .update / .import / .delete\n" +
      "身份：tavo.persona.all / .get / .find / .create / .update / .delete\n" +
      "预设：tavo.preset.all / .get / .find / .import / .create / .update / .delete\n" +
      "世界书：tavo.lorebook.all / .get / .find / .import / .create / .update / .delete\n" +
      "正则：tavo.regex.all / .get / .find / .import / .create / .update / .delete\n" +
      "记忆：tavo.memory.current / .update\n" +
      "生成：tavo.generate\n" +
      "输入框：tavo.input.get / .set / .append / .clear / .send\n" +
      "工具：tavo.utils.toast / .openUrl / .export / .select\n" +
      "应用：tavo.app.version / .versionNumber\n" +
      "ST兼容：window.tav.compat.st.triggerSlash / window.triggerSlash"
  },
  variables: { summary:"跨页面刷新长期存储。支持路径访问如 tavo.get('status.hp')", methods:{ get:{ signature:"tavo.get(name[, scope])", sync:true, returns:"any|null（未设置时返回null）" }, set:{ signature:"tavo.set(name, value[, scope])", sync:true }, update:{ signature:"tavo.update(name, value[, scope])", sync:false, returns:"void", note:"对object值进行部分更新，数字/字符串覆盖" }, unset:{ signature:"tavo.unset(name[, scope])", sync:true } }, scopes:{ chat:"聊天作用域（默认）", global:"全局作用域" }, scopeWarning:"⚠️传入非'global'的值默认回退到'chat'。特别是'character'作用域在sandbox.js中不存在处理逻辑，传入会被当作'chat'——仅chat和global两个作用域生效", pathSupport:"支持路径 tavo.get('status.hp')，对象按引用读取但修改后需重新 set 写回", promptInjection:"{{getvar::name}} 或 {{getglobalvar::name}}", valueTypes:"支持string/number/boolean/object/array及其嵌套组合。对象按引用读取但修改后需重新set写回", syncNote:"官方示例卡对 get/set/unset 均使用 await 调用，尽管标为同步。建议统一使用 await 保证兼容性" },
  messages: { since:"v0.78.0", namespace:"tavo.message", appendNote:"append() 的 role 只接受 'assistant' | 'user'，不支持 'system'", deleteNote:"delete()只接受消息ID数字，与character.delete/preset.delete/lorebook.delete/regex.delete/persona.delete同时接受ID或完整对象的行为不同", methods:{ find:{ signature:"await tavo.message.find(indexRange, filter)", indexRange:"6种：单数字(含负数如-1=倒数第一条)、[start,end]、[start]、[0,end]、[]/null/undefined", filter:"{role?:'user'|'assistant'|'char'|'system', hidden?:boolean, characters?:string[]}" }, get:{ signature:"await tavo.message.get(id)", returns:"Message对象|null（不存在时返回null）" }, current:{ signature:"await tavo.message.current()" }, count:{ signature:"await tavo.message.count()" }, append:{ signature:"await tavo.message.append(message)", fields:"content(必填), role?(默认'assistant'), characterId?(默认当前角色), hidden?(默认false)", returns:"number (消息ID)" }, update:{ signature:"await tavo.message.update(message)", fields:"id,content,reasoning,hidden", returns:"number (消息ID)" }, delete:{ signature:"await tavo.message.delete(id)", returns:"number (消息ID)" } }, messageFields:{ id:"number", role:"'user'|'assistant'|'system'", content:"string", characterId:"number", hidden:"boolean", reasoning:"string", index:"number", createdAt:"string", updatedAt:"string" } },
  chat: { namespace:"tavo.chat", methods:{ current:{ signature:"await tavo.chat.current()", returns:"Chat对象|null（无聊天时返回null）" }, update:{ signature:"await tavo.chat.update(chat)", fields:"name, characters, persona, preset, lorebooks, regexes", note:"characters会直接替换当前聊天角色列表；preset和lorebooks也可更新" } }, chatFields:{ id:"number", name:"string", characters:"{id:number,name:string,avatar?:string}[]", persona:"number|null", preset:"{id:number,name:string}", lorebooks:"{id:number,name:string}[]", regexes:"{id:number,name:string}[]" } },
  character: { namespace:"tavo.character", methods:{ all:{ signature:"await tavo.character.all()", returns:"概要 {id,name,avatar}" }, get:{ signature:"await tavo.character.get(id)", returns:"Character对象|null（不存在时返回null）" }, find:{ signature:"await tavo.character.find(name, options)", options:"{match:'exact'|'prefix'|'suffix'|'contains'}", returns:"array（即使单匹配也返回数组，空结果为[]）" }, create:{ signature:"await tavo.character.create(character)", required:"name, firstMes", returns:"number (角色ID)" }, update:{ signature:"await tavo.character.update(character)", required:"id, name, firstMes" }, import:{ signature:"await tavo.character.import(card)", description:"导入CCv3角色卡（或裸data对象），自动创建关联世界书和正则。import()直通Flutter层不走红()转换，character_book和regex_scripts随卡一起处理", returns:"{ characterId: number, lorebookId?: number, regexId?: number }" }, delete:{ signature:"await tavo.character.delete(id | character)", returns:"number (角色ID)", note:"官方文档确认接受ID或完整对象" } }, note:"创建/更新/导入/删除会弹窗确认。camelCase与snake_case双格式兼容。import()返回{characterId,lorebookId?,regexId?}", ccv3Mapping:{ "first_mes→firstMes":"开场白", "mes_example→mesExample":"对话示例", "creator_notes→creatorNotes":"创作者备注", "system_prompt→systemPrompt":"系统提示", "post_history_instructions→postHistoryInstructions":"历史后指令", "alternate_greetings→alternateGreetings":"备选开场白（数组）", "character_version→characterVersion":"角色版本", "group_only_greetings→groupOnlyGreetings":"群聊专用开场白（数组，v3新增）", "creation_date→creationDate":"创建时间（v3新增，Date对象）", "modification_date→modificationDate":"修改时间（v3新增，Date对象）", "creator_notes_multilingual→creatorNotesMultilingual":"多语言备注（v3新增，对象）" }, characterFields:{ id:"number", avatar:"string", name:"string", description:"string", firstMes:"string", personality:"string", scenario:"string", mesExample:"string", creatorNotes:"string", systemPrompt:"string", postHistoryInstructions:"string", alternateGreetings:"string[]", tags:"string[]", creator:"string", characterVersion:"string", nickname:"string", groupOnlyGreetings:"string[]", creationDate:"string", modificationDate:"string", source:"string", creatorNotesMultilingual:"object", characterBook:"object|null" }, getterNote:"get/find返回的对象通过getter别名同时暴露camelCase和snake_case两种格式（如firstMes和first_mes均可访问）。完整映射见ccv3Mapping。" },
  persona: { namespace:"tavo.persona", methods:{ all:{ signature:"await tavo.persona.all()" }, get:{ signature:"await tavo.persona.get(id)", returns:"Persona对象|null（不存在时返回null）" }, find:{ signature:"await tavo.persona.find(name, options)", returns:"array（即使单匹配也返回数组，空结果为[]）" }, create:{ signature:"await tavo.persona.create(persona)", required:"name, description", returns:"number (身份ID)" }, update:{ signature:"await tavo.persona.update(persona)", required:"id, name, description" }, delete:{ signature:"await tavo.persona.delete(id | persona)", returns:"number (身份ID)", note:"官方文档确认接受ID或完整对象" } }, note:"创建/更新/删除会弹窗确认。无import()方法，只能手动create/update。", personaFields:{ id:"number", name:"string", description:"string", avatar:"string", active:"boolean", sortIndex:"number" } },
  preset: { namespace:"tavo.preset", methods:{ all:{ signature:"await tavo.preset.all()" }, get:{ signature:"await tavo.preset.get(id)", returns:"Preset对象|null（不存在时返回null）" }, find:{ signature:"await tavo.preset.find(name, options)", returns:"array（即使单匹配也返回数组，空结果为[]）" }, import:{ signature:"await tavo.preset.import(preset)", description:"导入SillyTavern格式，preset.name可选，缺省为'Preset'", returns:"number (预设ID)", stFormat:"接受 {name, prompts:[{identifier,name,system_prompt,marker,content,role,injection_position,injection_depth,forbid_overrides}], prompt_order:[{character_id,order:[{identifier,enabled}]}]}" }, create:{ signature:"await tavo.preset.create(preset)", required:"name", description:"缺失字段自动填充默认值", returns:"number (预设ID)" }, update:{ signature:"await tavo.preset.update(preset)", required:"id", note:"entries 直接覆盖，务必先get再改再update" }, delete:{ signature:"await tavo.preset.delete(id | object)", returns:"number (预设ID)", note:"官方示例传入完整对象，也可传入ID数字" } }, note:"创建/更新/导入/删除会弹窗确认", basicPromptsFields:["persona", "description", "personality", "scenario", "exampleMessageStart", "chatStart", "groupChatStart", "groupNudge", "continueNudge", "impersonation", "lorebook"], // 11项：含groupChatStart和lorebook的独立项
    entryTypes:["builtin","marker","custom"], builtinIdentifiers:["main","worldInfoBefore","personaDescription","charDescription","charPersonality","scenario","enhanceDefinitions","nsfw","worldInfoAfter","dialogueExamples","chatHistory","jailbreak"], presetFields:{ id:"number", name:"string", basicPrompts:"object", entries:"PresetEntry[]" }, presetEntryFields:{ identifier:"string", name:"string", content:"string", enabled:"boolean", active:"boolean", type:"'builtin'|'marker'|'custom'", role:"'system'|'user'|'assistant'", injectionPosition:"number", injectionDepth:"number" }, nsfwNote:"nsfw identifier 的安全设置说明：该内置条目默认关闭，需用户主动开启。safetySettings 边界：safetySettings 字段存在但不等同于直接控制提供商侧安全策略，模型实际安全行为仍以端点/模型配置为准。" },
  lorebook: { namespace:"tavo.lorebook", formatWarning:"世界书有三种形态，entries格式完全不同：\n1. 独立ST文件 → entries是对象 {'0': {...}, '1': {...}}\n2. JS API create/update → entries是数组 [{...}, {...}]，字段名不同\n3. 嵌入character_book → entries是数组，字段名混合\n制卡时必须根据目标格式选择正确写法。", methods:{ all:{ signature:"await tavo.lorebook.all()" }, get:{ signature:"await tavo.lorebook.get(id)", returns:"Lorebook对象|null（不存在时返回null）" }, find:{ signature:"await tavo.lorebook.find(name, options)", returns:"array（即使单匹配也返回数组，空结果为[]）" }, import:{ signature:"await tavo.lorebook.import(lorebook)", description:"导入CCv3 character_book格式，直通Flutter层", returns:"number (世界书ID)" }, create:{ signature:"await tavo.lorebook.create(lorebook)", required:"name", note:"走o()/i()字段转换", returns:"number (世界书ID)" }, update:{ signature:"await tavo.lorebook.update(lorebook)", required:"id, name", note:"走o()/i()字段转换，entries直接覆盖" }, delete:{ signature:"await tavo.lorebook.delete(id | object)", returns:"number (世界书ID)", note:"官方示例传入完整对象，也可传入ID数字" } }, note:"创建/更新/导入/删除会弹窗确认", ccv3Mapping:{ "keys→keywords":"主触发词数组", "secondary_keywords→secondaryKeywords":"o()会转换secondary_keywords→secondaryKeywords", "secondary_keys（CCv3标准）":"⚠️不会被o()函数转换！必须改写为secondary_keywords才能通过create/update自动转换，或走import()通道", "scan_depth→scanDepth":"扫描深度", "case_sensitive→caseSensitive":"大小写敏感", "match_whole_word→matchWholeWord":"全词匹配（⚠️CCv3标准字段名为match_whole_words复数，与o()映射键match_whole_word单数不同，不会被o()自动转换）", "injection_position→injectionPosition":"注入位置", "injection_depth→injectionDepth":"注入深度", "injection_role→injectionRole":"注入角色", "constant:true/false→strategy:'constant'/'keyword'":"常驻/关键词", "position:'before_char'/'after_char'→injectionPosition:'lorebookBefore'/'lorebookAfter'":"插入位置", "selective:true/false→secondaryKeywordStrategy:'andAny'/'none'":"二级关键词策略" }, oFunctionAnalysis:"o()函数转换规则：\n" + "1. constant:true→strategy:'constant', constant:false→strategy:'keyword'\n" + "2. position:'before_char'→injectionPosition:'lorebookBefore', position:'after_char'→injectionPosition:'lorebookAfter'\n" + "3. selective:true→secondaryKeywordStrategy:'andAny', selective:false→secondaryKeywordStrategy:'none'\n" + "4. ⚠️ secondary_keys 不被 o() 转换，必须用 secondary_keywords\n" + "5. 其余字段做 camelCase 转换（scan_depth→scanDepth 等）\n\n" + "i()函数（o()的逆转换）：用于将 Tavo 格式转回 CCv3 格式（如导出时）", lorebookFields:{ id:"number", name:"string", entries:"LorebookEntry[]" }, lorebookEntryFields:{ identifier:"number", name:"string", content:"string", enabled:"boolean", strategy:"'constant'|'keyword'", keywords:"string[]", secondaryKeywords:"string[]", secondaryKeywordStrategy:"'andAny'|'andAll'|'none'|'notAll'|'notAny'", scanDepth:"number|null", caseSensitive:"boolean|null", matchWholeWord:"boolean|null", injectionPosition:"'lorebookBefore'|'lorebookAfter'（CCv3嵌入时还可见before_char/after_char/atDepth等值；o()只自动转换before_char→lorebookBefore和after_char→lorebookAfter，其他值保持原样）", injectionDepth:"number", injectionRole:"'system'|'user'|'assistant'", probability:"number", sticky:"number|null", cooldown:"number|null", delay:"number|null", addMemo:"boolean", group:"string", groupOverride:"boolean", groupWeight:"number", useGroupScoring:"boolean|null", matchPersonaDescription:"boolean", matchCharacterDescription:"boolean", matchCharacterPersonality:"boolean", matchCharacterDepthPrompt:"boolean", matchScenario:"boolean", matchCreatorNotes:"boolean", vectorized:"boolean", ignoreBudget:"boolean", triggers:"array", automationId:"string" } },
  regex: { namespace:"tavo.regex", methods:{ all:{ signature:"await tavo.regex.all()" }, get:{ signature:"await tavo.regex.get(id)", returns:"Regex对象|null（不存在时返回null）" }, find:{ signature:"await tavo.regex.find(name, options)", returns:"array（即使单匹配也返回数组，空结果为[]）" }, import:{ signature:"await tavo.regex.import(regex)", description:"导入SillyTavern格式，regex.name可选，缺省为'Regex'", returns:"number (正则ID)", stFormat:"接受 {name, entries:[{scriptName,findRegex,replaceString,placement:number[],disabled,markdownOnly,promptOnly,runOnEdit,substituteRegex,minDepth,maxDepth}]}结构，字段名为ST旧格式" }, create:{ signature:"await tavo.regex.create(regex)", required:"name", returns:"number (正则ID)" }, update:{ signature:"await tavo.regex.update(regex)", required:"id, name" }, delete:{ signature:"await tavo.regex.delete(id | object)", returns:"number (正则ID)", note:"官方示例传入完整对象，也可传入ID数字" } }, note:"创建/更新/导入/删除会弹窗确认", wFunctionAnalysis:"w()函数转换规则（ST→Tavo 正则条目）：\n" + "1. placement 整数→placements 字符串：[2]→['char'], [1]→['user'], [1,2,5]→['user','char','lorebook']\n" + "2. disabled↔enabled 取反：disabled=true→enabled=false\n" + "3. substituteRegex 整数→substitution 字符串：0→'none', 1→'raw', 2→'escaped'\n" + "4. markdownOnly+promptOnly+runOnEdit 组合→timing（真值表见GUIDES.regex）\n" + "5. scriptName→name, findRegex→findRegex（去除JS风格的正则字面量斜杠和flags）\n" + "6. 完整映射表：\n" + "   placement:1→user, 2→char, 5→lorebook, 6→reasoning\n" + "   substituteRegex:0→none, 1→raw, 2→escaped", entryFields:{ name:"规则名", findRegex:"正则表达式", replaceString:"替换内容$1,$2", trimStrings:"修剪字符串", placements:"['user','char','reasoning','lorebook']", timing:"'display'最安全", substitution:"'none'|'raw'|'escaped'", minDepth:"number", maxDepth:"number", enabled:"boolean", disabled:"boolean (ST遗留，与enabled互反。切换时需同时设置：entry.disabled = !entry.enabled)" } },
  memory: { namespace:"tavo.memory", methods:{ current:{ signature:"await tavo.memory.current()", returns:"{id,enabled,memories:string[]}" }, update:{ signature:"await tavo.memory.update(memory)", fields:"enabled:boolean, memories:string[]", returns:"number (记忆ID)" } } },
  generate: { signature:"await tavo.generate(prompt, options)", description:"一次性返回完整文本，使用当前聊天绑定模型端点，无端点返回 null", options:{ context:"boolean", preset:"number|{id}", settings:"{temperature,topP,maxCompletionTokens}", timeout:"number（默认60000ms，设为0=无限等待）" } },
  input: { namespace:"tavo.input", methods:{ get:{ signature:"await tavo.input.get()", returns:"string（输入框当前内容）" }, set:{ signature:"tavo.input.set(text)", sync:true }, append:{ signature:"tavo.input.append(text)", sync:true }, clear:{ signature:"tavo.input.clear()", sync:true }, send:{ signature:"tavo.input.send()", sync:true } }, syncNote:"官方示例卡对 get/set 均使用 await 调用。同步方法加 await无害，建议统一使用 await 保证兼容性" },
  utils: { namespace:"tavo.utils", methods:{ toast:{ signature:"tavo.utils.toast(text)" }, openUrl:{ signature:"tavo.utils.openUrl(url)" }, export:{ signature:"tavo.utils.export(name, data)", description:"data 推荐 Base64" }, select:{ signature:"await tavo.utils.select(options, title, defaultValue)", description:"options 支持 string[] | {value,label}[] | {value,label,description?,subtitle?}[]" } } },
  app:{ description:"tavo.app（持续更新中）" },
  stCompat:{ triggerSlash:"window.tav.compat.st.triggerSlash(command) — 触发ST风格斜杠命令，如'/send'。别名：window.triggerSlash(command)" },
  endpoint: {
    platforms: "15个逻辑平台：直连6个(OpenAI/Claude/Gemini/VertexAI/DeepSeek/Grok) + 协议3个(OpenAI协议/Anthropic协议/Gemini协议) + 代理5个(OpenRouter/Volink/MantleAI/PopRouter/TinyRouter) + 元入口1个(LoadBalancer)",
    protocolNote: "选了某协议就必须按该协议路径/鉴权/响应格式调用，Tavo不做协议间自动翻译",
    modelRegistry: "193模型(openai:39/vertex:59/vertex_popular:7/doubao:28/grok:17/claude:15/gemini:13/openrouter_popular:9/deepseek:6)，仅22%含定价，仅5%含完整capabilities",
    capabilityBits: {
      editable: ["cache","code","function","image","reasoning","structure"],
      displayOnly: ["tts","asr"],
      registryKeys: { image_generation:"image", code_interpreter:"code", function_call:"function", structured_output:"structure", caching:"cache", reasoning:"reasoning" },
      note: "勾选能力位只代表'尝试这样调用'，不证明上游模型真的支持。tts/asr是仅显示位，不在编辑6位内"
    },
    warnings: ["busy","empty_response","geo_restricted","invalid_secret","malformed_response","model_inactive","model_not_found","multimodal_required","network_error","no_available_endpoint","other_error","partner_high_cost_warning","prohibited_content","quota_exhausted","server_error","unknown_error","wrong_url"],
    vertexAI: { regions: 30, authMethods: { express:"endpoint_edit_auth_method_vertext_express(NOTE:vertext拼写如此)", full:"endpoint_edit_auth_method_vertext_full" } },
    importSources: [
      { name:"chub.ai", api:"api.chub.ai/api/characters/ + api.chub.ai/api/lorebooks/download" },
      { name:"janitorai.com" },
      { name:"realm.risuai.net", api:"realm.risuai.net/api/v1/download/png-v3/" },
      { name:"aicharactercards.com", api:"card API pngapi/v1/" },
      { name:"pygmalion.chat", api:"server.pygmalion.chat/api/export/character/" },
      { name:"onlycards.ai", api:"card.onlycards.ai/api/v1/cards/ + frontend t.onlycards.ai" }
    ]
  },
  tts: {
    platforms: 13,
    platformList: ["Android系统","Google系统","Google Gemini","ElevenLabs","MiniMax","Honor","Huawei","Vivo","Xiaomi","iFlytek","iOS","Multi-System","Volink(代理)"],
    multiSystemEngines: ["com.baidu.duersdk.opensdk","com.github.jing332.tts_server_android","com.google.android.tts","com.hihonor.aipluginengine","com.hihonor.voiceengine","com.huawei.hiai","com.iflytek.speechcloud","com.iflytek.speechsuite","com.iflytek.tts","com.vivo.aiservice","com.xiaomi.mibrain.speech"],
    proxies: ["tavo_tts_mantleai","tavo_tts_poprouter","tavo_tts_tinyrouter","tavo_tts_volink + tavo_tts_get"],
    elevenLabs: { api:"api.elevenlabs.io" },
    miniMax: { domains:["api.minimax.io","api.minimaxi.com"] },
    ttsEntity: { TtsEndpoint:"平台/密钥/语音ID/语言", TtsCharacterRef:"角色↔TTS端点关联，一个角色可绑一个端点" },
    uiAssets: ["bubble_icon_tts.png","icon_tts_speaker.png","tts_playing_lottie.json","icon_tts_voices_binding.png","icon_tts_voices_loading.png"],
    iosNote: "APK仅确认icon_tts_platform_ios_system.png被打包，无法确认iOS端运行时表现",
    languageIcons: ["icon_tts_modle_language_chinese.png","icon_tts_modle_language_english.png"]
  },
  load_balancer: {
    entities: ["LoadBalancer","LoadBalancerLog","LoadBalancerStrategy"],
    strategies: ["round_robin(轮询)","weighted(加权)","random(随机)","lru(最近最少使用)"],
    uiPath: "左侧边栏→更多→设置→负载均衡器",
    deepLink: "tav://tavo/load_balancers/",
    notes: [
      "LB在聊天中作为'虚拟模型'出现在端点列表",
      "LB不存APIkey，复用已配置端点的密钥",
      "不要把不同协议的端点混进同一均衡组",
      "Tavo不做协议间自动翻译",
      "仅有4策略，没有geo/latency/nearest路由",
      "TTS和图片请求不走LB",
      "所有端点不可用时报错"
    ],
    configFields: ["load_balancer_max_retries","load_balancer_max_log_size","load_balancer_weight","load_balancer_edit_entries","load_balancer_edit_options","load_balancer_edit_name_prefix","load_balancer_explain"],
    logFields: ["load_balancer_log","_log_title","_log_size","_log_today_request","_log_total_request","_log_available_api","_log_none","_log_none_info"]
  },
  unexposed:{ description:"以下能力当前JS API未暴露，不要编造", items:["端点管理(tavo.endpoint.*)","负载均衡器管理","TTS端点/角色语音绑定","备份恢复","存储空间清理","App全局设置","账号/订阅/遥测开关"] },
  sandboxJsMethods:{ description:"sandbox.js (grep实证) 暴露的全部 window.tavo.* 方法", list:["tavo.app.version/versionNumber","tavo.character.all/create/delete/find/get/import/update","tavo.chat.current/update","tavo.input.append/clear/get/send/set","tavo.lorebook.all/create/delete/find/get/import/update","tavo.memory.current/update","tavo.message.append/count/current/delete/find/get/update","tavo.persona.all/create/delete/find/get/update(无import)","tavo.preset.all/create/delete/find/get/import/update","tavo.regex.all/create/delete/find/get/import/update","tavo.utils.export/openUrl/select/toast","tavo.generate/get/set/unset/update(顶层函数)"] }
};
const OFFICIAL_SPECS = {
  character_card: {
    permanent_context: ["name", "description", "personality", "scenario"],
    fields: {
      name: { desc: "角色名。{{char}}引用。必填", token: "常驻" },
      description: { desc: "【最重要】核心身份、背景、外貌、行为边界、文风框架。用{{char}}。2-5段，≥260字", token: "常驻" },
      personality: { desc: "性格关键词摘要", token: "常驻" },
      scenario: { desc: "初始关系、地点、情境。用{{user}}。1-3句", token: "常驻" },
      first_mes: { desc: "【风格锚点】模型从此学习回复长度/文风/动作密度。用*动作*描写环境", token: "非永久" },
      mes_example: { desc: "【口吻示范器】加<START>分隔，用{{user}}:和{{char}}:标记。不塞设定", token: "非永久" },
      creator_notes: { desc: "给人看的备注。不放硬设定", token: "元数据" },
      system_prompt: { desc: "角色级主提示覆盖。需Prefer Char. Prompt。可用{{original}}插回", token: "按需" },
      post_history_instructions: { desc: "收尾约束，注入历史最末端，权重最高", token: "按需" },
      alternate_greetings: { desc: "数组，备选开场白", token: "元数据" },
      tags: { desc: "数组，如['中文','慢热']", token: "元数据" },
      extensions: { desc: "对象，至少{}。常见键：world,depth_prompt,talkativeness,fav", token: "扩展" },
      character_book: { desc: "嵌入世界书。entries为数组", token: "扩展" }
    },
    qualityCheck: {
      structural: ["JSON可解析","spec=chara_card_v2+spec_version=2.0","data.extensions存在(≥{})","alternate_greetings是数组","tags是数组","character_book.entries是数组(如有)","PNG回读一致"],
      content: ["name非空","description≥260字含身份背景外貌行为边界","personality非空","scenario非空","first_mes非空且风格一致","mes_example≥2组是口吻示范","system_prompt≤400字","post_history_instructions≤200字","宏统一","无AI废词"],
      living: ["不是服务型NPC","有防御机制","情绪有惯性","不替{{user}}行动"]
    },
    tagOutputFormat: "[NAME][/NAME] [DESCRIPTION][/DESCRIPTION] [PERSONALITY][/PERSONALITY] [SCENARIO][/SCENARIO] [FIRST_MES][/FIRST_MES] [MES_EXAMPLE][/MES_EXAMPLE] [SYSTEM_PROMPT][/SYSTEM_PROMPT] [POST_HISTORY_INSTRUCTIONS][/POST_HISTORY_INSTRUCTIONS]。比JSON输出更稳定"
  },
  macros: {
    identity: ["{{user}}","{{char}}","{{group}}","{{groupNotMuted}}","{{charIfNotGroup}}"],
    card: ["{{charDescription}}","{{charPersonality}}","{{scenario}}","{{persona}}","{{charPrompt}}","{{charInstruction}}","{{charJailbreak}}","{{mesExamples}}","{{mesExamplesRaw}}","{{charVersion}}","{{charCreatorNotes}}"],
    message: ["{{lastMessage}}","{{input}}","{{lastUserMessage}}","{{lastCharMessage}}","{{original}}"],
    datetime: ["{{time}}","{{date}}","{{weekday}}","{{isotime}}","{{isodate}}","{{idleDuration}}","{{time::UTC+9}}"],
    random: ["{{random::A::B::C}}","{{roll::3d6}}"],
    chat_variables: ["{{setvar::name::value}}","{{addvar::name::value}}","{{incvar::name}}","{{decvar::name}}","{{getvar::name}}"],
    global_variables: ["{{setglobalvar::name::value}}","{{addglobalvar::name::value}}","{{incglobalvar::name}}","{{decglobalvar::name}}","{{getglobalvar::name}}"],
    formatting: ["{{newline}}","{{newline::N}}","{{space}}","{{space::N}}","{{trim}}","{{noop}}"],
    comment: "{{//注释内容}} 渲染时为空",
    escape: "\\{\\{char\\}\\} 避免宏执行",
    legacy: ["<USER>","<CHAR>/<BOT>","<GROUP>/<CHARIFNOTGROUP>"],
    warnings: ["setvar不要放在每轮都会注入的位置当初始化","addvar对数字做加法，列表追加，字符串拼接","变量支持数字/字符串/JSON列表"]
  },
  worldbook: {
    rule: "唯一注入prompt的是content。必须独立成句。key/comment/标题/组名都不注入",
    fields: {
      uid: "数字",
      key: "字符串数组，触发关键词",
      keysecondary: "字符串数组",
      content: "注入内容，必须独立成句",
      constant: "true=常驻无视触发词",
      selective: "开启二级关键词逻辑",
      selectiveLogic: "0=AND_ANY,1=NOT_ALL,2=NOT_ANY,3=AND_ALL",
      order: "100-900，越大越靠末端",
      position: "0=Before Char,1=After Char,2=Top AN,3=Bottom AN,4=@Depth,5=Before Examples,6=After Examples,7=Outlet",
      probability: "0-100",
      group: "inclusion group，同组多条同时满足只保留一条",
      groupOverride: "boolean",
      groupWeight: "100",
      matchWholeWords: "中文环境极其建议null",
      sticky: "触发后粘滞轮数",
      cooldown: "冷却轮数",
      delay: "延迟生效轮数",
      depth: "position=4时的深度",
      role: "position=4时：0=system,1=user,2=assistant"
    },
    stToTavoConversion: {
      note: "sandbox.js o()/i()函数。仅create/update()链路；import()直通Flutter层不转换",
      fieldMapping: "keys→keywords, secondary_keywords→secondaryKeywords, scan_depth→scanDepth, case_sensitive→caseSensitive, match_whole_word→matchWholeWord, injection_position→injectionPosition, injection_depth→injectionDepth, injection_role→injectionRole",
      specialConversions: ["constant(true→'constant',false→'keyword')→strategy","position('before_char'→'lorebookBefore','after_char'→'lorebookAfter')→injectionPosition","selective(true→'andAny',false→'none')→secondaryKeywordStrategy"],
      pitfall: "CCv3的secondary_keys不会被o()自动转换(n对象key是secondary_keywords而非secondary_keys)。要用二级关键词：改写为secondary_keywords或走import()通道"
    },
    threeForms: "独立ST文件(entries对象) ≠ JS API create/update(entries数组) ≠ 嵌入character_book(entries数组+字段名变化)",
    design: ["触发词包含别称","写不可动摇的事实","分层拆设定","活剧本可修改","从打补丁开始","聚焦铁律","与预设/长记忆分界"]
  },
  regex: {
    fields: {
      findRegex: "正则表达式",
      replaceString: "替换内容$1,$2",
      trimStrings: "修剪字符串",
      placements: "['user','char','reasoning','lorebook']",
      timing: "'display'最安全|'send'|'sendAndDisplay'|'receive'|'editAndReceive'",
      substitution: "'none'|'raw'|'escaped'",
      minDepth: "number|null",
      maxDepth: "number|null",
      enabled: "boolean"
    },
    stToTavoConversion: {
      "scriptName→name": "",
      "placement[int[]]→placements[string[]]": "1→user,2→char,5→lorebook,6→reasoning",
      "disabled→enabled(取反)": "",
      "markdownOnly+promptOnly+runOnEdit→timing": "true+true→sendAndDisplay, true+false→display, false+true→send, runOnEdit:true→editAndReceive, 全false→receive",
      "substituteRegex[int]→substitution[string]": "0→none,1→raw,2→escaped"
    },
    threeLaws: ["正则导入成功≠替换成功≠JS执行成功","替换出的<script>/onclick经Markdown/DOMPurify/iframe沙盒判定","display时机最安全"],
    importJsonStableFormat: "{id,scriptName,findRegex,replaceString,trimStrings:[],placement:[2],disabled:false,markdownOnly:true,promptOnly:false,runOnEdit:false,substituteRegex:0,minDepth:null,maxDepth:null}",
    placementValues: "1=User Input, 2=AI Output, 3=Slash Commands, 5=World Info, 6=Reasoning"
  },
  preset: {
    injectionOrder: "Main Prompt → World Info Before → Persona Description → Char Description → Char Personality → Scenario → Enhance Definitions → Auxiliary Prompt → Chat Examples → World Info After → Chat History → Post-History Instructions(权重最高)",
    builtinIdentifiers: ["main","worldInfoBefore","personaDescription","charDescription","charPersonality","scenario","enhanceDefinitions","nsfw","worldInfoAfter","dialogueExamples","chatHistory","jailbreak","impersonation"],
    updateRule: "tavo.preset.update()时entries直接覆盖，务必先get再改再update"
  },
  advanced_rendering: {
    renderChain: "消息→MarkdownConverter.convert()→sandbox.render()→DOMPurify.sanitize()→气泡或iframe沙盒→Flutter WebView",
    jsModes: "disabled/auto/codeblock/script/native 五类",
    iframeSandbox: 'sandbox="allow-scripts allow-modals allow-same-origin"',
    recommendedLight: "唯一class包裹+scoped CSS+max-width:100%+vertical-align:bottom",
    recommendedHeavy: "带<body>完整片段+```html代码块",
    pitfalls: ["不依赖页面级body/html/window","CSS不写全局选择器","不用外链/远程脚本","不用position:fixed","不超宽","不用桌面新CSS特性做核心布局","JS不执行先查JS执行模式","HTML显示成代码先查AR开关"]
  },
  combos: {
    "角色卡+世界书+宏": "动态变量（HP、好感度）",
    "预设+宏": "动态提示词模板；状态写入不要放在每轮都会重置的位置",
    "世界书+宏": "触发条目时初始化变量，做剧情切章或地图切换",
    "正则+宏": "输入简写展开、输出状态栏拼接；显示-only不等于状态已持久化",
    "高级前端渲染+JS API": "HTML/CSS展示+在允许JS模式下的互动气泡、RPG HUD",
    "长记忆+世界书": "长记忆保留动态事实，世界书保留静态设定",
    "JS API+角色/世界书": "脚本化批量创建或修改角色卡和世界书条目",
    "负载均衡器+端点管理": "高可用、按权重/轮换/随机/LRU分发"
  }
};

const USER_EXAMPLES_RAW = {
  tavo_js_guide: {"spec":"chara_card_v3","spec_version":"3.0","data":{"avatar":"charaCard/1777315849512.png","name":"TavoJS 指南 1","description":"你是Tavo","first_mes":"「🏠 目录」","personality":"","scenario":"","mes_example":"","creator_notes":"Tavo JavaScript 社区教学卡，有任何问题欢迎社区反馈。\n\nTavo 官网: https://tavoai.dev\nDiscord: https://discord.gg/47cBNpQDFG\nReddit: https://www.reddit.com/r/TAVO_AICHAT/\n\n📥 导入此指南角色卡（推荐新手）：在 '从 URL 导入角色' 处粘贴\nhttps://docs.tavoai.dev/static/images/tavojs-guide-0_8-zh.png","system_prompt":"","post_history_instructions":"","alternate_greetings":[],"character_book":null,"tags":["Tavo"," JavaScript"," API"],"creator":"Tavo Community","character_version":"0.8","nickname":null,"creator_notes_multilingual":null,"source":null,"group_only_greetings":[],"creation_date":1773234741,"modification_date":1776884976,"extensions":{"regex_scripts":[
      {"id":"acd8afc4-c0a1-47cf-bc16-8fbfda0d2c59","scriptName":"⚠️ 版本检查","findRegex":"$","replaceString":"<div class=\"versionWarning\">\n</div>\n<script>\nasync function checkVersion(minVersion) {\n  let failed;\n  if (!tavo.app || !tavo.app.versionNumber) {\n    failed = true;\n  } else {\n    const vn = await tavo.app.versionNumber();\n    failed = vn < minVersion;\n  }\n  if (failed) {\n     setVisible('.control', 'none')\n     setVisible('.versionWarning', 'block')\n     document.querySelector('.versionWarning').innerHTML = `⚠️ 抱歉,您必须至少升级到 ${Math.floor(minVersion / 1000)}.${Math.floor((minVersion % 1000)/10)}.${minVersion % 10} 才支持此功能`\n  }\n}\nfunction setVisible(selector, display) {\n  document.querySelector(selector).style.display = display;\n}\n\ncheckVersion(780)\n</script>","trimStrings":[],"placement":[2],"disabled":false,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":null,"maxDepth":null},
      {"id":"4e778ad3-9189-4ec3-852e-07b7672f6878","scriptName":"顶部控制台","findRegex":"^","replaceString":"<pre class=\"log\"></pre>\n<script>\nconst _log = console.log;\nconsole.log = (...args) => {\n    _log(...args)\n    const text = args.map(v => typeof v === 'string' ? v : JSON.stringify(v, null, 2)).join(' ');\n    const container = document.querySelector('.log');\n    container.style.display = 'block';\n    container.textContent = text + '\\n\\n';\n  };\n</script>","trimStrings":[],"placement":[2],"disabled":false,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":null,"maxDepth":null},
      {"id":"19122908-70fa-4f5c-a223-11e160de6095","scriptName":"Header","findRegex":"^","replaceString":"<div class=\"header\">\n  <div class=\"home\"><a href=\"javascript:void(0)\" onclick=\"backHome()\">🏠 返回目录</a></div>\n  <div class=\"docs\">官方文档 <a href=\"javascript:void\" onclick=\"tavo.utils.openUrl('https://docs.tavoai.dev/guides/javascript-api/')\">《JavaScript API 文档》</a></div>\n</div>\n<script>\nasync function backHome() {\n  // 获得当前消息\n  const cur = await tavo.message.current();\n  if (!cur) return;\n  // 获得当前消息的角色\n  const char = await tavo.character.get(cur.characterId);\n  if (!char) return;\n  // 更新当前消息的内容为角色的开场白\n  const first = (await tavo.message.find(0))[0];\n  first.content = char.firstMes;\n  await tavo.message.update(first)\n}\n</script>","trimStrings":[],"placement":[2],"disabled":false,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":null,"maxDepth":null},
      {"id":"31046d30-648a-4ac4-9a64-20adcfd609b2","scriptName":"Footer","findRegex":"$","replaceString":"<div class=\"footer\">\n<a href=\"javascript:void(0)\" onclick=\"viewCode()\"><span id=\"codeArrow\">▼</span> 本页代码</a>\n<pre class=\"code\"><code>\n</code></pre>\n</div>\n<script>\n(function () {\n  var showCodeblock = false;\n  window.viewCode = async function() {\n    showCodeblock = !showCodeblock;\n    const codeArrow = document.getElementById('codeArrow');\n    if (!codeArrow) return;\n    codeArrow.textContent = showCodeblock ? '▲' : '▼';\n    const codeblock = document.querySelector('pre.code');\n    if (!codeblock) return;\n    if (showCodeblock) {\n      await showCode();\n      codeblock.style.display = 'block';\n    } else {\n      codeblock.style.display = 'none';\n    }\n  }\n  async function showCode() {\n    // 找到当前角色的关联正则\n    const cur = await tavo.message.current();\n    if (!cur) return;\n    const char = await tavo.character.get(cur.characterId);\n    if (!char) return;\n    const regexRet = await tavo.regex.find(`${char.name}'s Regex`);\n    if (!regexRet.length) return;\n    const regex = regexRet[0];\n\n    // 正则中找到相应的条目\n    const h3 = document.querySelector('h3');\n    if (!h3) return;\n    const pageName = `「${h3.textContent}」`;\n    if (!pageName) return;\n    const entry = regex.entries.find(entry => entry.name === pageName);\n    if (!entry) return;\n\n    // 将正则内容显示在 codeblock 中\n    const codeblock = document.querySelector('pre.code');\n    if (!codeblock) return;\n    codeblock.textContent = entry.replaceString;\n  }\n})()\n</script>\n","trimStrings":[],"placement":[2],"disabled":false,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":null,"maxDepth":null},
      {"id":"2f8d0ae0-6c13-4b1b-86a8-e6466b333cae","scriptName":"统一样式","findRegex":"^","replaceString":"<style>\n.index a, .home a, .footer a {\n  color: inherit !important;\n  background: none !important;\n  -webkit-background-clip: none !important;\n  -webkit-text-fill-color: inherit !important;\n  background-clip: none !important;\n  text-decoration: none !important;\n  text-fill-color: inherit !important;\n}\n.header { margin-bottom: 1em; border-bottom: 1px solid #fff3; padding-bottom: 0.5em; display: flex; flex-direction: row; justify-content: space-between; align-items: center; }\n.docs { font-size: 12px; padding: 0; font-style: italic; color: #fff9; }\nh3 { margin: 0 0 0.5em 0; }\n.index { padding-left: 1.5em; }\n.log, .code { background: #0006; font-size: 12px; padding: 1em 1.5em; min-height: 0px; max-height: 300px; overflow-y: auto; border-radius: 5px; display: none; }\n.code { font-style: normal; font-family: monospace; }\n.control2 { display: grid; grid-template-columns: auto auto; gap: 8px; }\n.control3 { display: grid; grid-template-columns: auto auto auto; gap: 8px; }\nbutton { border-radius: 5px; border: none; background: #fff;  padding: 0.3em 0.6em; margin: 0.3em 0.5em 0.3em 0; }\nbutton em { color: #0009; }\n.footer { font-size: 12px; margin: 1em 0 0 0; padding: 0; font-style: italic; color: #fff9; border-top: 1px solid #fff3; padding-top: 1em; margin-bottom: 1em; }\n.footer a { font-style: normal; color: #fffc !important; }\n.versionWarning { padding: 0.5em 1em; border-radius: 5px; background: #fe6; color: #900; display: none; }\n</style>","trimStrings":[],"placement":[2],"disabled":false,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":null,"maxDepth":null},

{"id":"01943641-5835-4243-95d0-7c4eb96136e3","scriptName":"「🏠 目录」","findRegex":"「🏠 目录」","replaceString":"<h3>🏠 目录</h3>\n从选择一个章节，以查看 Tavo JS 演示\n\n本指南旨在展示 Tavo JavaScript API 的能力，每个章节都将通过若干互动来演示相关功能。\n建议同时配合官方文档 <a href=\"javascript:void\" onclick=\"tavo.utils.openUrl('https://docs.tavoai.dev/guides/javascript-api/')\" target=\"_blank\">JavaScript API 文档</a> 阅读。\n\n<h4>指南</h4>\n\n<ul class=\"index\">\n  <li><a href=\"javascript:void(0)\" onclick=\"swipeTo('🧙 例子：角色卡生成器')\">🧙 例子：角色卡生成器</a></li>\n  <li><a href=\"javascript:void(0)\" onclick=\"swipeTo('🙈 例子：一键隐藏消息')\">🙈 例子：一键隐藏消息</a></li>\n  <li><a href=\"javascript:void(0)\" onclick=\"swipeTo('🎲 例子：引导式重摇')\">🎲 例子：引导式重摇</a></li>\n</ul>\n\n<h4>API</h4>\n\n<ul class=\"index\">\n  <li><a href=\"javascript:void(0)\" onclick=\"swipeTo('🗃️ 变量')\">🗃️ 变量</a></li>\n  <li><a href=\"javascript:void(0)\" onclick=\"swipeTo('💬 消息')\">💬 消息</a></li>\n  <li><a href=\"javascript:void(0)\" onclick=\"swipeTo('🗨️ 聊天')\">🗨️ 聊天</a></li>\n  <li><a href=\"javascript:void(0)\" onclick=\"swipeTo('🧙 角色')\">🧙 角色</a></li>\n  <li><a href=\"javascript:void(0)\" onclick=\"swipeTo('🎭 用户身份')\">🎭 用户身份</a></li>\n  <li><a href=\"javascript:void(0)\" onclick=\"swipeTo('🎛️ 预设')\">🎛️ 预设</a></li>\n  <li><a href=\"javascript:void(0)\" onclick=\"swipeTo('📚 世界书')\">📚 世界书</a></li>\n  <li><a href=\"javascript:void(0)\" onclick=\"swipeTo('🎨 正则')\">🎨 正则</a></li>\n  <li><a href=\"javascript:void(0)\" onclick=\"swipeTo('🧠 长记忆')\">🧠 长记忆</a></li>\n  <li><a href=\"javascript:void(0)\" onclick=\"swipeTo('✨ 生成请求')\">✨ 生成请求</a></li>\n  <li><a href=\"javascript:void(0)\" onclick=\"swipeTo('⌨️ 输入框')\">⌨️ 输入框</a></li>\n  <li><a href=\"javascript:void(0)\" onclick=\"swipeTo('🛠️ 工具')\">🛠️ 工具</a></li>\n  <li><a href=\"javascript:void(0)\" onclick=\"swipeTo('📱 App')\">📱 App</a></li>  \n</ul>\n\n<script>\nasync function swipeTo(k) {\n  const first = (await tavo.message.find(0))[0];\n  first.content = `「${k}」`;\n  await tavo.message.update(first)\n}\n</script>","trimStrings":[],"placement":[2],"disabled":false,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":null,"maxDepth":null},
      {"id":"d8ce03a5-eb1f-49cb-8b53-15304a84d713","scriptName":"「🧙 例子：角色卡生成器」","findRegex":"「🧙 例子：角色卡生成器」","replaceString":"<h3>🧙 角色卡生成器</h3>\n<p>\n本例使用 <code>tavo.generate</code> 让模型严格按照 CCv3 规范生成一张角色卡，再调用 <code>tavo.utils.export</code> 导出，或用 <code>tavo.character.import</code> 一键导入（角色卡 + 世界书 + 正则全部到位）。\n</p>\n<div class=\"control\">\n  <button id=\"btn-generate\" onclick=\"generate()\">开始生成</button>\n  <p id=\"status\"></p>\n  <div id=\"actions\" hidden>\n    <button onclick=\"downloadJson()\">导出角色卡</button>\n    <button onclick=\"importCharacter()\">导入角色卡</button>\n  </div>\n</div>\n<script>\nlet card = null;\nfunction setUi(loading, status, showActions = false) {\n  document.getElementById('btn-generate').disabled = loading;\n  document.getElementById('status').textContent = status;\n  document.getElementById('actions').hidden = !showActions;\n}\nasync function generate() {\n  const p = prompt('请输入想要生成的角色特点');\n  if (!p) return;\n  setUi(true, '生成中...');\n  try {\n    let text = await tavo.generate(`根据以下信息生成一张角色卡，输出符合 Character Card Spec V3 规范的 JSON 格式（chara_card_v3）。\\n${p}`);\n    text = text.trim();\n    if (text.startsWith('```') && text.endsWith('```')) {\n      text = text.replace(/^```[a-zA-Z]*\\n?/, '').replace(/```$/, '');\n    }\n    console.log(text);\n    card = JSON.parse(text);\n    const data = card.data || card;\n    if (Array.isArray(data.mes_example)) data.mes_example = data.mes_example.join('\\n');\n    setUi(false, `角色卡 《${data.name}》 已生成`, true);\n  } catch (e) {\n    setUi(false, `角色卡生成格式错误，请尝试切换模型`, false)\n  }\n}\nfunction downloadJson() {\n  const name = (card.data || card).name;\n  tavo.utils.export(`${name}.json`, JSON.stringify(card));\n}\nasync function importCharacter() {\n  const result = await tavo.character.import(card);\n  if (!result || !result.characterId) {\n    tavo.utils.toast('角色卡导入失败，换个模型重新生成');\n    return;\n  }\n  const parts = [`角色 #${result.characterId}`];\n  if (result.lorebookId) parts.push(`世界书 #${result.lorebookId}`);\n  if (result.regexId) parts.push(`正则 #${result.regexId}`);\n  tavo.utils.toast(`已导入：${parts.join(' · ')}`);\n}\n</script>","trimStrings":[],"placement":[2],"disabled":false,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":null,"maxDepth":null},
      {"id":"abf3e6c1-59d6-4cb8-befa-b37970a7f9e3","scriptName":"「🙈 例子：一键隐藏消息」","findRegex":"「🙈 例子：一键隐藏消息」","replaceString":"<h3>🙈 例子：一键隐藏消息</h3>\n本例子以正则的方式引入 一键隐藏消息 插件，使用后最后一条消息上会出现 “🫥 隐藏旧消息” 按钮。\n点击后会隐藏之前的旧消息，保留最后 N 条消息。\n你可以根据需要修改保留的楼层数量。\n<ol>\n  <li><a href=\"javascript:void(0)\" onclick=\"fillMessage()\">填充消息</a></li>\n  <li><a href=\"javascript:void(0)\" onclick=\"switchPlugin()\"><span id=\"plugin-status\">开启</span>插件</a></li>\n</ol>\n\n<script>\nasync function fillMessage() {\n  const count = await tavo.message.count();\n  await tavo.message.append({\n    content: `消息 ${count}`,\n  });\n}\n\nasync function switchPlugin() {\n  const regex = await getPluginRegex();\n  if (!regex) return;\n  const entry = regex.entries.find(e => e.name === '一键隐藏消息插件');\n  if (!entry) return;\n  entry.enabled = !entry.enabled;\n  entry.disabled = !entry.enabled;\n  const succ = await tavo.regex.update({ ...regex, entries: regex.entries });\n  if (!succ) return;\n  tavo.utils.toast(`插件已${entry.enabled ? '开启' : '关闭'}`);\n  await updatePluginStatus(entry.enabled);\n}\n\nasync function updatePluginStatus(on) {\n  if (on === undefined) {\n    const regex = await getPluginRegex();\n    if (!regex) return;\n    const entry = regex.entries.find(e => e.name === '一键隐藏消息插件');\n    if (!entry) return;\n    on = !!entry.enabled;\n  }\n  document.getElementById('plugin-status').textContent = on ? '关闭' : '开启';\n}\n\nasync function getPluginRegex() {\n  const chat = await tavo.chat.current();\n  if (!chat) return;\n  const regexId = chat.regexes[0]?.id;\n  if (!regexId) return;\n  const regex = await tavo.regex.get(regexId);\n  if (!regex) return;\n  return regex;\n}\n\nupdatePluginStatus();\n</script>","trimStrings":[],"placement":[2],"disabled":false,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":null,"maxDepth":null},
      {"id":"5d133b8e-92c0-4d3f-9c13-36c394e8cc2e","scriptName":"一键隐藏消息插件","findRegex":"$","replaceString":"<button id=\"btn-hide-old\" onclick=\"hideOldMessages()\">🫥 隐藏旧消息</button>\n\n<script>\nasync function hideOldMessages() {\n  const input = prompt('保留最后多少楼层（隐藏之前的）', '2');\n  if (input === null) return; // 用户取消\n\n  const keepLastN = Number.parseInt(input.trim(), 10);\n  if (!Number.isFinite(keepLastN) || keepLastN < 0) {\n    tavo.utils.toast('请输入 >= 0 的整数');\n    return;\n  }\n\n  const total = await tavo.message.count();\n  if (total <= keepLastN) {\n    tavo.utils.toast(`当前总楼层为 ${total}，无需隐藏`);\n    return;\n  }\n\n  // 需要隐藏的楼层范围：0 ~ (total - keepLastN - 1)\n  const endIndex = total - keepLastN - 1;\n  const targets = await tavo.message.find([0, endIndex]);\n\n  if (!targets.length) {\n    tavo.utils.toast('没有可隐藏的楼层');\n    return;\n  }\n\n  const btn = document.getElementById('btn-hide-old');\n  btn.disabled = true;\n  const oldText = btn.textContent;\n  btn.textContent = '处理中...';\n\n  try {\n    for (const msg of targets) {\n      msg.hidden = true;\n      await tavo.message.update(msg);\n    }\n    tavo.utils.toast(`已隐藏 ${targets.length} 层旧消息（保留最近 ${keepLastN} 层）`);\n  } catch (err) {\n    console.error(err);\n    tavo.utils.toast('隐藏失败，请稍后重试');\n  } finally {\n    btn.disabled = false;\n    btn.textContent = oldText;\n  }\n}\n</script>","trimStrings":[],"placement":[2],"disabled":true,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":0,"maxDepth":0},
      {"id":"8a43ceff-b204-4afb-aa38-4b411a32049c","scriptName":"「🎲 例子：引导式重摇」","findRegex":"「🎲 例子：引导式重摇」","replaceString":"<h3>🎲 例子：引导式重摇</h3>\n<p>\n本例通过正则为最后一条角色消息注入 <code>🎲 引导式重摇</code> 按钮。<br>\n点击后输入一段引导（如「更暧昧一些」「把结局改成双向奔赴」），脚本调用 <code>tavo.generate</code> 带上下文重新生成并替换当前气泡；原内容保留在 <code>chat</code> 变量 <code>rerollHistory</code> 中，可通过 <code>⬅ 上一版</code> / <code>➡ 下一版</code> 翻阅多版本。\n</p>\n<ol>\n  <li><a href=\"javascript:void(0)\" onclick=\"fillDemoMessage()\">添加一条示例角色消息</a></li>\n  <li><a href=\"javascript:void(0)\" onclick=\"switchPlugin()\"><span id=\"plugin-status\">开启</span>插件</a></li>\n  <li>在最后一条角色消息底部点击 <code>🎲 引导式重摇</code></li>\n</ol>\n<script>\nasync function fillDemoMessage() {\n  const chat = await tavo.chat.current();\n  if (!chat) return tavo.utils.toast('无法获取当前聊天');\n  const chars = chat.characters || [];\n  const characterId = chars[0]?.id;\n  const demoContent = `夜色渐浓，她靠在窗边，指尖轻敲着杯沿，目光没有看向任何地方。\\n\\n\"你来了。\"她开口，声音很轻，像是怕惊扰了什么，\"我还以为今晚……只剩我一个人。\"`;\n  await tavo.message.append({\n    role: 'assistant',\n    characterId,\n    content: demoContent,\n  });\n  tavo.utils.toast('已添加一条示例角色消息');\n}\n\nasync function switchPlugin() {\n  const regex = await getPluginRegex();\n  if (!regex) return;\n  const entry = regex.entries.find(e => e.name === '引导式重摇插件');\n  if (!entry) return;\n  entry.enabled = !entry.enabled;\n  entry.disabled = !entry.enabled;\n  const succ = await tavo.regex.update({ ...regex, entries: regex.entries });\n  if (!succ) return;\n  tavo.utils.toast(`插件已${entry.enabled ? '开启' : '关闭'}`);\n  updatePluginStatus(entry.enabled);\n}\n\nasync function updatePluginStatus(on) {\n  if (on === undefined) {\n    const regex = await getPluginRegex();\n    if (!regex) return;\n    const entry = regex.entries.find(e => e.name === '引导式重摇插件');\n    if (!entry) return;\n    on = !!entry.enabled;\n  }\n  document.getElementById('plugin-status').textContent = on ? '关闭' : '开启';\n}\n\nasync function getPluginRegex() {\n  const chat = await tavo.chat.current();\n  if (!chat) return;\n  const regexId = chat.regexes[0]?.id;\n  if (!regexId) return;\n  const regex = await tavo.regex.get(regexId);\n  if (!regex) return;\n  return regex;\n}\n\nupdatePluginStatus();\n</script>","trimStrings":[],"placement":[2],"disabled":false,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":null,"maxDepth":null},
      {"id":"3c3bf141-6177-45d9-9a2d-4a3d9de5f2a3","scriptName":"引导式重摇插件","findRegex":"$","replaceString":"<div id=\"reroll-ui\" style=\"margin-top:0.5em;padding-top:0.5em;border-top:1px dashed #fff3;font-size:12px;\">\n  <button id=\"btn-reroll\" onclick=\"rerollWithGuidance()\">🎲 引导式重摇</button>\n  <button id=\"btn-reroll-prev\" onclick=\"rerollNav(-1)\" style=\"display:none\">⬅ 上一版</button>\n  <button id=\"btn-reroll-next\" onclick=\"rerollNav(1)\" style=\"display:none\">➡ 下一版</button>\n  <span id=\"reroll-label\" style=\"color:#fff9;margin-left:0.5em;\"></span>\n</div>\n<script>\n(async function rerollInit() {\n  const cur = await tavo.message.current();\n  if (!cur || cur.role !== 'assistant') {\n    const ui = document.getElementById('reroll-ui');\n    if (ui) ui.style.display = 'none';\n    return;\n  }\n  await _rerollRefreshUI(cur);\n})();\n\nasync function _rerollRefreshUI(cur) {\n  const history = (await tavo.get('rerollHistory')) || {};\n  const entry = history[cur.id];\n  const prevBtn = document.getElementById('btn-reroll-prev');\n  const nextBtn = document.getElementById('btn-reroll-next');\n  const label = document.getElementById('reroll-label');\n  if (!entry || !entry.versions || entry.versions.length <= 1) {\n    if (prevBtn) prevBtn.style.display = 'none';\n    if (nextBtn) nextBtn.style.display = 'none';\n    if (label) label.textContent = '';\n    return;\n  }\n  if (prevBtn) prevBtn.style.display = entry.index > 0 ? 'inline-block' : 'none';\n  if (nextBtn) nextBtn.style.display = entry.index < entry.versions.length - 1 ? 'inline-block' : 'none';\n  if (label) label.textContent = `${entry.index + 1}/${entry.versions.length}`;\n}\n\nasync function rerollWithGuidance() {\n  const guidance = prompt('请输入引导内容（让 AI 按此方向重新生成本条回复）');\n  if (!guidance) return;\n\n  const cur = await tavo.message.current();\n  if (!cur) return tavo.utils.toast('无法获取当前消息');\n  if (cur.role !== 'assistant') return tavo.utils.toast('只能对角色消息进行重摇');\n\n  const btn = document.getElementById('btn-reroll');\n  btn.disabled = true;\n  const oldText = btn.textContent;\n  btn.textContent = '生成中...';\n\n  // 生成期间临时 hide 首条（菜单），避免污染 context\n  const first = (await tavo.message.find(0))[0];\n  const wasHidden = !!(first && first.hidden);\n  if (first && !wasHidden) {\n    first.hidden = true;\n    await tavo.message.update(first);\n  }\n\n  try {\n    const promptText = `请依据以下要求重新生成你的上一条回复，直接输出替换内容，不要任何前后解释、不要用引号包裹：\\n\\n${guidance}`;\n    const text = await tavo.generate(promptText, { context: true });\n    if (!text) { tavo.utils.toast('生成失败（当前聊天可能无可用端点）'); return; }\n    const newContent = text.trim();\n\n    const key = 'rerollHistory';\n    const history = (await tavo.get(key)) || {};\n    const entry = history[cur.id] || { versions: [cur.content], index: 0 };\n    entry.versions = entry.versions.slice(0, entry.index + 1);\n    entry.versions.push(newContent);\n    entry.index = entry.versions.length - 1;\n    history[cur.id] = entry;\n    await tavo.set(key, history);\n\n    cur.content = newContent;\n    await tavo.message.update(cur);\n  } catch (e) {\n    console.error(e);\n    tavo.utils.toast('重摇失败');\n  } finally {\n    // 恢复菜单显示\n    if (first && !wasHidden) {\n      first.hidden = false;\n      await tavo.message.update(first);\n    }\n    btn.disabled = false;\n    btn.textContent = oldText;\n  }\n}\n\nasync function rerollNav(delta) {\n  const cur = await tavo.message.current();\n  if (!cur) return;\n  const history = (await tavo.get('rerollHistory')) || {};\n  const entry = history[cur.id];\n  if (!entry) return tavo.utils.toast('本消息暂无历史版本');\n  const newIdx = entry.index + delta;\n  if (newIdx < 0 || newIdx >= entry.versions.length) return;\n  entry.index = newIdx;\n  history[cur.id] = entry;\n  await tavo.set('rerollHistory', history);\n  cur.content = entry.versions[newIdx];\n  await tavo.message.update(cur);\n}\n</script>","trimStrings":[],"placement":[2],"disabled":true,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":0,"maxDepth":0},
      {"id":"305b1bed-e2f8-41b2-bf94-d67431efba25","scriptName":"「🗃️ 变量」","findRegex":"「🗃️ 变量」","replaceString":"<h3>🗃️ 变量</h3>\n<div class=\"control\">\n  <p>chat 作用域（随当前聊天保存）</p>\n  <button onclick=\"varGet()\">获取变量</button>\n  <button onclick=\"varSet()\">设置变量</button>\n  <button onclick=\"varUnset()\">删除变量</button>\n  <p>global 作用域（跨聊天保存，切换对话后仍存在）</p>\n  <button onclick=\"varGetGlobal()\">获取全局变量</button>\n  <button onclick=\"varSetGlobal()\">设置全局变量</button>\n  <button onclick=\"varUnsetGlobal()\">删除全局变量</button>\n</div>\n<script>\n  async function varGet() {\n    const val = await tavo.get('状态');\n    console.log('状态 =', val ? val : '（尚未设置）');\n  }\n  async function varSet() {\n    await tavo.set('状态', { hp: 100, mp: 32, location: '洞穴' });\n    tavo.utils.toast('已设置 状态 变量，重新获取试试看');\n  }\n  async function varUnset() {\n    await tavo.unset('状态');\n    tavo.utils.toast('已删除 状态 变量');\n  }\n  async function varGetGlobal() {\n    const val = await tavo.get('全局分数', 'global');\n    console.log('全局分数 =', val ? val : '（尚未设置）');\n  }\n  async function varSetGlobal() {\n    const s = await tavo.get('全局分数', 'global');\n    const score = (s ? s : 0) + 1;\n    await tavo.set('全局分数', score, 'global');\n    tavo.utils.toast(`全局分数 +1，当前：${score}`);\n  }\n  async function varUnsetGlobal() {\n    await tavo.unset('全局分数', 'global');\n    tavo.utils.toast('已删除 全局分数');\n  }\n</script>","trimStrings":[],"placement":[2],"disabled":false,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":null,"maxDepth":null},
      {"id":"9345e5a4-8019-4738-b745-f54492e93f19","scriptName":"「💬 消息」","findRegex":"「💬 消息」","replaceString":"<h3>💬 消息</h3>\n<div class=\"control\">\n  <button onclick=\"msgAll()\">所有消息</button>\n  <button onclick=\"msgGetCurrent()\">当前消息</button>\n  <button onclick=\"msgLastChar()\">最后一条角色消息</button>\n  <button onclick=\"msgRange()\">第 0-4 条</button>\n  <button onclick=\"msgGetById()\">按 ID 获取</button>\n  <br />\n  <button onclick=\"msgAppend()\">追加消息</button>\n  <button onclick=\"msgUpdate()\">更新消息</button>\n  <button onclick=\"msgDelete()\">删除消息</button>\n  <br />\n  <button onclick=\"msgHide()\">隐藏消息</button>\n  <button onclick=\"msgReasoning()\">更新思维链</button>\n</div>\n<script>\n  async function msgAll() {\n    const msgs = await tavo.message.find();\n    console.log(msgs);\n  }\n  async function msgGetCurrent() {\n    const msg = await tavo.message.current();\n    console.log(msg);\n  }\n  async function msgLastChar() {\n    const msgs = await tavo.message.find(-1, { role: 'assistant' });\n    console.log(msgs);\n  }\n  async function msgRange() {\n    const msgs = await tavo.message.find([0, 4]);\n    console.log(msgs);\n  }\n  async function msgGetById() {\n    const id = prompt('输入消息 ID（可从上面列表中找到）');\n    if (!id) return;\n    const msg = await tavo.message.get(Number(id));\n    console.log(msg);\n  }\n\n  async function msgAppend() {\n    const content = prompt('输入 content');\n    if (!content) return;\n\n    const chat = await tavo.chat.current();\n    const chars = chat.characters;\n    if (chars.length === 1) {\n      characterId = chars[0].id;\n    } else {\n      const promptText = `输入以下角色中的一个ID: \n${chars.map((e) => e.id + ':' + e.name).join(', ')}`;\n      const characterId = Number(prompt(promptText));\n      if (!chars.some((e) => e.id === characterId)) {\n        return console.error(`输入的数字ID 不在 ${promptText} 中`);\n      }\n    }\n\n    let message = { role: 'assistant', characterId, content };\n\n    const newId = await tavo.message.append(message);\n    console.log(`get(${newId})=`, await tavo.message.get(newId));\n  }\n\n  async function msgUpdate() {\n    const count = await tavo.message.count();\n    const indexStr = prompt(`输入要更新的消息位置（0..${count-1}）`);\n    const index = _parseIndex(indexStr, 0, count - 1);\n    if (index === null) return console.error('更新位置必须是有效的数字');\n\n    const oldMsgs = await tavo.message.find(index);\n    if (!oldMsgs.length) return console.error('要更新的消息不存在：', index);\n    const oldMsg = oldMsgs[0];\n\n    const newContent = prompt('输入新的 content', oldMsg.content);\n    if (!newContent) return;\n\n    oldMsg.content = newContent;\n    const updatedId = await tavo.message.update(oldMsg);\n    console.log(`get(${updatedId})=`, await tavo.message.get(updatedId));\n  }\n\n  async function msgDelete() {\n    const count = await tavo.message.count();\n    const indexStr = prompt(`输入要删除的消息位置（0..${count-1}）`);\n    const index = _parseIndex(indexStr, 0, count - 1);\n    if (index === null) return console.error('删除位置必须是有效的数字');\n\n    const oldMsgs = await tavo.message.find(index);\n    if (!oldMsgs.length) return console.error('要删除的消息不存在：', index);\n    const oldMsg = oldMsgs[0];\n\n    const deletedId = await tavo.message.delete(oldMsg.id);\n    console.log(`get(${deletedId}) after delete =`, await tavo.message.get(deletedId));\n  }\n\n  async function msgHide() {\n    const count = await tavo.message.count();\n    const indexStr = prompt(`输入要隐藏的消息位置（0..${count-1}）`);\n    const index = _parseIndex(indexStr, 0, count - 1);\n    if (index === null) return console.error('隐藏位置必须是有效的数字');\n\n    const oldMsgs = await tavo.message.find(index);\n    if (!oldMsgs.length) return console.error('要隐藏的消息不存在：', index);\n    const oldMsg = oldMsgs[0];\n    oldMsg.hidden = oldMsg.hidden ? false : true;\n    const updatedId = await tavo.message.update(oldMsg);\n    console.log(`get(${updatedId}) after hide =`, await tavo.message.get(updatedId));\n  }\n\n  async function msgReasoning() {\n    const count = await tavo.message.count();\n    const indexStr = prompt(`输入要更新思维链的消息位置（0..${count-1}）`);\n    const index = _parseIndex(indexStr, 0, count - 1);\n    if (index === null) return console.error('更新思维链位置必须是有效的数字');\n\n    const oldMsgs = await tavo.message.find(index);\n    if (!oldMsgs.length) return console.error('要更新思维链的消息不存在：', index);\n    const oldMsg = oldMsgs[0];\n\n    const newReasoning = prompt('输入新的思维链', oldMsg.reasoning);\n\n    oldMsg.reasoning = newReasoning;\n    const updatedId = await tavo.message.update(oldMsg);\n    console.log(`get(${updatedId}) after reasoning =`, await tavo.message.get(updatedId));\n  }\n\n  function _parseIndex(indexStr, min, max) {\n    if (!/^\\d+$/.test(indexStr)) return null;\n    const index = Number(indexStr);\n    if (index < min || index > max) return null;\n    return index;\n  }\n</script>","trimStrings":[],"placement":[2],"disabled":false,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":null,"maxDepth":null},
      {"id":"705f9b32-95cd-42ab-b0f3-a65428beefa8","scriptName":"「🗨️ 聊天」","findRegex":"「🗨️ 聊天」","replaceString":"<h3>🗨️ 聊天</h3>\n<div class=\"control\">\n  <button onclick=\"chatCurrent()\">获取聊天摘要</button>\n  <button onclick=\"chatRename()\">重命名聊天</button>\n</div>\n<script>\n  async function chatCurrent() {\n    const chat = await tavo.chat.current();\n    console.log(chat);\n  }\n  async function chatRename() {\n    const chat = await tavo.chat.current();\n    if (!chat) return tavo.utils.toast('当前没有进行中的聊天');\n    const newName = prompt('输入新的聊天名称', chat.name);\n    if (!newName || newName === chat.name) return;\n    chat.name = newName;\n    await tavo.chat.update(chat);\n    tavo.utils.toast(`已重命名为：${newName}`);\n  }\n</script>","trimStrings":[],"placement":[2],"disabled":false,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":null,"maxDepth":null},
      {"id":"98316945-269f-4180-be79-2ba6c0fe2e2e","scriptName":"「🧙 角色」","findRegex":"「🧙 角色」","replaceString":"<h3>🧙 角色</h3>\n<div class=\"control\">\n  <button onclick=\"charAll()\">获取所有角色（摘要）</button>\n  <button onclick=\"charGet()\">按 ID 获取角色</button>\n  <button onclick=\"charFind()\">按名称查找角色</button>\n  <br/>\n  <button onclick=\"charCreate()\">创建角色</button>\n  <button onclick=\"charUpdate()\">更新角色</button>\n  <button onclick=\"charDelete()\">删除角色</button>\n  <br/>\n  <button onclick=\"charImport()\">导入角色卡（含世界书）</button>\n</div>\n<script>\n  async function charAll() {\n    const chars = await tavo.character.all();\n    console.log(chars);\n  }\n  async function charGet() {\n    const id = prompt('输入角色 ID（可从 tavo.character.all() 获取）');\n    if (!id) return;\n    const char = await tavo.character.get(Number(id));\n    console.log(char);\n  }\n  async function charFind() {\n    const name = prompt('输入要查找的角色名称');\n    if (!name) return;\n    const chars = await tavo.character.find(name);\n    console.log(chars);\n  }\n  async function charCreate() {\n    const id = await tavo.character.create({\n      name: 'Demo 角色',\n      firstMes: '你好，我是演示用的 Demo 角色！',\n      description: '这是通过 tavo.character.create 创建的测试角色。',\n    });\n    if (!id) return;\n    const char = await tavo.character.get(id);\n    console.log(char);\n  }\n  async function charUpdate() {\n    const chars = await tavo.character.find('Demo 角色');\n    if (!chars.length) return tavo.utils.toast('先点击 tavo.character.create 创建一个角色');\n    const char = chars[0];\n    const newDesc = prompt('修改角色描述：', char.description);\n    if (!newDesc) return;\n    char.description = newDesc;\n    await tavo.character.update(char);\n    console.log(await tavo.character.get(char.id));\n  }\n  async function charDelete() {\n    const chars = await tavo.character.find('Demo 角色');\n    if (!chars.length) return tavo.utils.toast('先点击 tavo.character.create 创建一个角色');\n    const id = await tavo.character.delete(chars[0].id);\n    if (!id) return;\n    tavo.utils.toast('已删除 Demo 角色');\n    console.log('已删除');\n  }\n  async function charImport() {\n    // 演示：用 CCv3 标准格式一次性导入角色卡 + 世界书\n    const card = {\n      spec: 'chara_card_v3',\n      spec_version: '3.0',\n      data: {\n        name: 'Demo 导入角色',\n        first_mes: '你好，我是通过 tavo.character.import 导入的角色！',\n        description: '演示：character.import 接受 CCv3 规范，能同时带入 character_book 和 extensions.regex_scripts。',\n        character_book: {\n          name: \"Demo 导入角色's Lorebook\",\n          entries: [\n            { name: '关于这座城市', content: '这是一座临海城市，夜间常有浓雾。' },\n          ],\n        },\n      },\n    };\n    const result = await tavo.character.import(card);\n    if (!result || !result.characterId) return;\n    console.log(result);\n    const parts = [`角色 #${result.characterId}`];\n    if (result.lorebookId) parts.push(`世界书 #${result.lorebookId}`);\n    if (result.regexId) parts.push(`正则 #${result.regexId}`);\n    tavo.utils.toast(`已导入：${parts.join(' · ')}`);\n  }\n</script>","trimStrings":[],"placement":[2],"disabled":false,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":null,"maxDepth":null},
      {"id":"e0ab724e-1142-4042-9da0-a3214b019259","scriptName":"「🎭 用户身份」","findRegex":"「🎭 用户身份」","replaceString":"<h3>🎭 用户身份</h3>\n<div class=\"control\">\n  <button onclick=\"personaAll()\">获取所有用户身份</button>\n  <button onclick=\"personaGet()\">按 ID 获取用户身份</button>\n  <button onclick=\"personaFind()\">按名称查找用户身份</button>\n  <br/>\n  <button onclick=\"personaCreate()\">创建用户身份</button>\n  <button onclick=\"personaUpdate()\">更新用户身份</button>\n  <button onclick=\"personaDelete()\">删除用户身份</button>\n</div>\n<script>\n  async function personaAll() {\n    const personas = await tavo.persona.all();\n    console.log(personas);\n  }\n  async function personaGet() {\n    const id = prompt('输入用户身份 ID（可从 tavo.persona.all() 获取）');\n    if (!id) return;\n    const persona = await tavo.persona.get(Number(id));\n    console.log(persona);\n  }\n  async function personaFind() {\n    const name = prompt('输入要查找的用户身份名称');\n    if (!name) return;\n    const personas = await tavo.persona.find(name);\n    console.log(personas);\n  }\n  async function personaCreate() {\n    const id = await tavo.persona.create({\n      name: 'Demo 用户身份',\n      description: '这是通过 tavo.persona.create 创建的测试用户身份，语气简洁，直接给出结论。',\n    });\n    const persona = await tavo.persona.get(id);\n    console.log(persona);\n  }\n  async function personaUpdate() {\n    const personas = await tavo.persona.find('Demo 用户身份');\n    if (!personas.length) return tavo.utils.toast('先点击 tavo.persona.create 创建一个用户身份');\n    const persona = personas[0];\n    const newDesc = prompt('修改用户身份描述：', persona.description);\n    if (!newDesc) return;\n    persona.description = newDesc;\n    await tavo.persona.update(persona);\n    console.log(await tavo.persona.get(persona.id));\n  }\n  async function personaDelete() {\n    const personas = await tavo.persona.find('Demo 用户身份');\n    if (!personas.length) return tavo.utils.toast('先点击 tavo.persona.create 创建一个用户身份');\n    const id = await tavo.persona.delete(personas[0].id);\n    if (!id) return;\n    tavo.utils.toast('已删除 Demo 用户身份');\n  }\n</script>","trimStrings":[],"placement":[2],"disabled":false,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":null,"maxDepth":null},
      {"id":"f7454be4-3ec5-4be7-93f0-5c2c584591a0","scriptName":"「🎛️ 预设」","findRegex":"「🎛️ 预设」","replaceString":"<h3>🎛️ 预设</h3>\n<div class=\"control\">\n  <button onclick=\"presetAll()\">获取所有预设（摘要）</button>\n  <button onclick=\"presetGet()\">按 ID 获取预设</button>\n  <button onclick=\"presetFind()\">按名称查找预设</button>\n  <br />\n  <button onclick=\"presetCreate()\">创建预设</button>\n  <button onclick=\"presetUpdate()\">更新预设</button>\n  <button onclick=\"presetDelete()\">删除预设</button>\n  <br />\n  <button onclick=\"presetImport()\">导入预设</button>\n  <button onclick=\"presetSetAsCurrent()\">设置为当前聊天的预设</button>\n</div>\n<script>\n  async function presetAll() {\n    const presets = await tavo.preset.all();\n    console.log(presets);\n  }\n  async function presetGet() {\n    const id = prompt('输入预设 ID（可从 tavo.preset.all() 获取）')\n    if (!id) return;\n    const preset = await tavo.preset.get(id);\n    console.log(preset);\n  }\n  async function presetFind() {\n    const name = prompt('输入要查找的预设名称')\n    if (!name) return;\n    const presets = await tavo.preset.find(name);\n    console.log(presets);\n  }\n  async function presetCreate() {\n    const preset = { name: 'Demo 预设', entries: [] };\n    preset.entries.push({\n      identifier: 'abc123',\n      name: '🌸 文风控制',\n      content: '采用精致优雅的叙事风格，类似晋江、长佩等平台受欢迎的高质量女性向作品。',\n    });\n    const id = await tavo.preset.create(preset);\n    console.log(id);\n  }\n  async function presetUpdate() {\n    const presets = await tavo.preset.find('Demo 预设');\n    if (!presets.length) return tavo.utils.toast('先点击 tavo.preset.create 创建一个预设');\n    const preset = presets[0];\n    const idx = preset.entries.findIndex((e) => e.type === 'custom');\n    if (idx === -1) return tavo.utils.toast('预设中没有自定义提词');\n    const newContent = prompt(`修改预设 ${preset.name} 中的 ${preset.entries[idx].name} 的内容：`, preset.entries[idx].content);\n    preset.entries[idx].content = newContent;\n    await tavo.preset.update(preset);\n  }\n  async function presetDelete() {\n    const presets = await tavo.preset.find('Demo 预设');\n    if (!presets.length) return tavo.utils.toast('先点击 tavo.preset.create 创建一个预设');\n    const preset = presets[0];\n    const id = await tavo.preset.delete(preset);\n    if (id) tavo.utils.toast(`删除成功`)\n  }\n  async function presetImport() {\n    // 演示：用 SillyTavern 预设格式导入（会弹出确认框）\n    const id = await tavo.preset.import({\n      name: 'Demo 导入预设',\n      prompts: [\n        { identifier: 'main', name: 'Main Prompt', system_prompt: true, marker: false, content: '你是 {{char}}，用简洁自然的语气回应 {{user}}。', role: 'system', injection_position: 0, injection_depth: 4, forbid_overrides: false },\n        { identifier: 'chatHistory', name: 'Chat History', system_prompt: true, marker: true },\n      ],\n      prompt_order: [{ character_id: 100001, order: [\n        { identifier: 'main', enabled: true },\n        { identifier: 'chatHistory', enabled: true },\n      ]}],\n    });\n    if (!id) return;\n    const preset = await tavo.preset.get(id);\n    console.log(preset);\n    tavo.utils.toast(`已导入预设 #${id}`);\n  }\n  async function presetSetAsCurrent() {\n    const presets = await tavo.preset.find('Demo 预设');\n    if (!presets.length) return tavo.utils.toast('先点击 tavo.preset.create 创建一个预设');\n    const preset = presets[0];\n    const c = confirm(`要设置 ${preset.name} 为当前聊天的预设吗？`);\n    if (!c) return;\n    const chat = await tavo.chat.current();\n    chat.preset = preset;\n    tavo.chat.update(chat);\n  }\n</script>","trimStrings":[],"placement":[2],"disabled":false,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":null,"maxDepth":null},
      {"id":"f06447bc-ad19-4860-9d65-6fb47204e7bb","scriptName":"「📚 世界书」","findRegex":"「📚 世界书」","replaceString":"<h3>📚 世界书</h3>\n<div class=\"control\">\n  <button onclick=\"lorebookAll()\">获取所有世界书（摘要）</button>\n  <button onclick=\"lorebookGet()\">按 ID 获取世界书</button>\n  <button onclick=\"lorebookFind()\">按名称查找世界书</button>\n  <br />\n  <button onclick=\"lorebookCreate()\">创建世界书</button>\n  <button onclick=\"lorebookUpdate()\">更新世界书</button>\n  <button onclick=\"lorebookDelete()\">删除世界书</button>\n  <br />\n  <button onclick=\"lorebookImport()\">导入世界书</button>\n  <button onclick=\"lorebookSetAsCurrent()\">设置为当前聊天的世界书</button>\n</div>\n<script>\n  async function lorebookAll() {\n    const lorebooks = await tavo.lorebook.all();\n    console.log(lorebooks);\n  }\n  async function lorebookGet() {\n    const id = prompt('输入世界书 ID（可从 tavo.lorebook.all() 获取）')\n    if (!id) return;\n    const lorebook = await tavo.lorebook.get(id);\n    console.log(lorebook);\n  }\n  async function lorebookFind() {\n    const name = prompt('输入要查找的世界书名称')\n    if (!name) return;\n    const lorebooks = await tavo.lorebook.find(name);\n    console.log(lorebooks);\n  }\n  async function lorebookCreate() {\n    const lorebook = { name: 'Demo 世界书', entries: [] };\n    lorebook.entries.push({\n      name: '关于这座城市',\n      content: '这是一座临海城市，夜间常有浓雾。',\n      keywords: ['临海城市'],\n      strategy: 'keyword'\n    });\n    const id = await tavo.lorebook.create(lorebook);\n    const lb = await tavo.lorebook.get(id);\n    console.log(lb);\n  }\n  async function lorebookUpdate() {\n    const lorebooks = await tavo.lorebook.find('Demo 世界书');\n    if (!lorebooks.length) return tavo.utils.toast('先点击 \"创建世界书\" 按钮创建一个世界书');\n    const lorebook = lorebooks[0];\n    const newContent = prompt(`修改世界书 ${lorebook.name} 中第一条的内容：`, lorebook.entries[0].content);\n    lorebook.entries[0].content = newContent;\n    await tavo.lorebook.update(lorebook);\n  }\n  async function lorebookDelete() {\n    const lorebooks = await tavo.lorebook.find('Demo 世界书');\n    if (!lorebooks.length) return tavo.utils.toast('先点击 \"创建世界书\" 按钮创建一个世界书');\n    const lorebook = lorebooks[0];\n    const id = await tavo.lorebook.delete(lorebook);\n    if (id) tavo.utils.toast(`删除成功`)\n  }\n  async function lorebookImport() {\n    // 演示：CCv3 character_book 格式导入（会弹出确认框）\n    const id = await tavo.lorebook.import({\n      name: 'Demo 导入世界书',\n      entries: [\n        { name: '触发示例', keys: ['雾都'], content: '雾都——一座常年被浓雾包裹的临海城市。这是通过 tavo.lorebook.import 导入的条目。' },\n      ],\n    });\n    if (!id) return;\n    const lb = await tavo.lorebook.get(id);\n    console.log(lb);\n    tavo.utils.toast(`已导入世界书 #${id}`);\n  }\n  async function lorebookSetAsCurrent() {\n    const lorebooks = await tavo.lorebook.find('Demo 世界书');\n    if (!lorebooks.length) return tavo.utils.toast('先点击 \"创建世界书\" 按钮创建一个世界书');\n    const lorebook = lorebooks[0];\n    const c = confirm(`要设置 ${lorebook.name} 为当前聊天的世界书吗？`);\n    if (!c) return;\n    const chat = await tavo.chat.current();\n    chat.lorebooks.push(lorebook);\n    tavo.chat.update(chat);\n  }\n</script>","trimStrings":[],"placement":[2],"disabled":false,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":null,"maxDepth":null},
      {"id":"eac65bfe-0c8e-44aa-8ccb-a47307bb7f8b","scriptName":"「🎨 正则」","findRegex":"「🎨 正则」","replaceString":"<h3>🎨 正则</h3>\n<div class=\"control\">\n  <button onclick=\"regexAll()\">获取所有正则（摘要）</button>\n  <button onclick=\"regexGet()\">按 ID 获取正则</button>\n  <button onclick=\"regexFind()\">按名称查找正则</button>\n  <br />\n  <button onclick=\"regexCreate()\">创建正则</button>\n  <button onclick=\"regexUpdate()\">更新正则</button>\n  <button onclick=\"regexDelete()\">删除正则</button>\n  <br />\n  <button onclick=\"regexImport()\">导入正则</button>\n  <button onclick=\"regexSetAsCurrent()\">设置为当前聊天的正则</button>\n</div>\n<script>\n  async function regexAll() {\n    const regexes = await tavo.regex.all();\n    console.log(regexes);\n  }\n  async function regexGet() {\n    const id = prompt('输入正则 ID（可从 \"获取所有正则（摘要）\" 按钮获取）')\n    if (!id) return;\n    const regex = await tavo.regex.get(id);\n    console.log(regex);\n  }\n  async function regexFind() {\n    const name = prompt('输入要查找的正则名称')\n    if (!name) return;\n    const regexes = await tavo.regex.find(name);\n    console.log(regexes);\n  }\n  async function regexCreate() {\n    const regex = { name: 'Demo 正则', entries: [] };\n    regex.entries.push({\n      name: '状态栏',\n      findRegex: '/<status>(.*?)<\\/status>/gim',\n      replaceString: '<pre>$1</pre>',\n      placements: ['char'],\n      timing: 'display',\n    });\n    const id = await tavo.regex.create(regex);\n    const reg = await tavo.regex.get(id);\n    console.log(reg)\n  }\n  async function regexUpdate() {\n    const regexes = await tavo.regex.find('Demo 正则');\n    if (!regexes.length) return tavo.utils.toast('先点击 \"创建正则\" 按钮创建一个正则');\n    const regex = regexes[0];\n    const newContent = prompt(`修改正则 ${regex.name} 中第一条的替换内容：`, regex.entries[0].replaceString);\n    regex.entries[0].replaceString = newContent;\n    await tavo.regex.update(regex);\n  }\n  async function regexDelete() {\n    const regexes = await tavo.regex.find('Demo 正则');\n    if (!regexes.length) return tavo.utils.toast('先点击 \"创建正则\" 按钮创建一个正则');\n    const regex = regexes[0];\n    const id = await tavo.regex.delete(regex);\n    if (id) tavo.utils.toast(`删除成功`)\n  }\n  async function regexImport() {\n    // 演示：用 SillyTavern 正则格式导入一组规则（会弹出确认框）\n    const id = await tavo.regex.import({\n      name: 'Demo 导入正则',\n      entries: [\n        { scriptName: '高亮', findRegex: '\\\\[高亮:(.+?)\\\\]', replaceString: '<mark>$1</mark>', placement: [2], disabled: false, markdownOnly: true, promptOnly: false, runOnEdit: false, substituteRegex: 0 },\n      ],\n    });\n    if (!id) return;\n    const reg = await tavo.regex.get(id);\n    console.log(reg);\n    tavo.utils.toast(`已导入正则 #${id}`);\n  }\n  async function regexSetAsCurrent() {\n    const regexes = await tavo.regex.find('Demo 正则');\n    if (!regexes.length) return tavo.utils.toast('先点击 \"创建正则\" 按钮创建一个正则');\n    const regex = regexes[0];\n    const chat = await tavo.chat.current();\n    chat.regexes.push(regex);\n    tavo.chat.update(chat);\n  }\n</script>","trimStrings":[],"placement":[2],"disabled":false,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":null,"maxDepth":null},
      {"id":"ed2ccc8c-8e62-42e2-a4dc-cb8994b04db3","scriptName":"「🧠 长记忆」","findRegex":"「🧠 长记忆」","replaceString":"<h3>🧠 长记忆</h3>\n<div class=\"control\">\n  <button onclick=\"getMemory()\">获取当前长记忆</button>\n  <button onclick=\"addOneMemory()\">添加一条记忆</button>\n</div>\n<script>\n  async function getMemory() {\n    const memory = await tavo.memory.current();\n    console.log(memory);\n  }\n  async function addOneMemory() {\n    const memory = await tavo.memory.current();\n    if (!memory.enabled) {\n      const enable = confirm('长记忆未开启，要开启吗？')\n      if (!enable) return;\n      memory.enabled = true;\n    }\n    memory.memories.push(`和果果一起看了一场盛世烟火 ${new Date().toISOString()}`);\n    const id = await tavo.memory.update(memory);\n    tavo.utils.toast(`已添加 1 条记忆，当前共 ${memory.memories.length} 条`);\n  }\n</script>\n","trimStrings":[],"placement":[2],"disabled":false,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":null,"maxDepth":null},
      {"id":"d4a3bc8a-be70-4570-ad10-5a048931ffe9","scriptName":"「✨ 生成请求」","findRegex":"「✨ 生成请求」","replaceString":"<h3>✨ 生成请求</h3>\n<div class=\"control\">\n  <button onclick=\"generateWithoutContext(this)\">发送生成请求</button>\n  <button onclick=\"generateWithContext(this)\">发送生成请求（带聊天上下文）</button>\n</div>\n<script>\n  function setLoading(loading, loadingBtn) {\n    const buttons = document.querySelectorAll('.control button');\n    buttons.forEach(btn => {\n      if (loading) {\n        if (btn != loadingBtn) {\n          btn.style.display = 'none';\n        } else {\n          btn.disabled = true;\n          btn.dataset.originText = btn.textContent;\n          btn.textContext = '加载中...';\n        }\n      } else {\n        if (btn.dataset.originText) btn.textContent = btn.dataset.originText;\n        btn.disabled = false;\n        btn.style.display = 'inline';\n      }\n    });\n  }\n  async function runGenerate(context, btn) {\n    const promptText = prompt('请输入生成提示词', '用一句话介绍你自己');\n    if (!promptText) return;\n    setLoading(true, btn);\n    try {\n      const text = await tavo.generate(promptText, { context });\n      console.log(text ?? '无返回结果（可能当前聊天无可用端点）');\n    } catch (e) {\n      console.log(e);\n      tavo.utils.toast('生成请求失败');\n    } finally {\n      setLoading(false);\n    }\n  }\n  async function generateWithContext(btn) {\n    await runGenerate(true, btn);\n  }\n  async function generateWithoutContext(btn) {\n    await runGenerate(false, btn);\n  }\n</script>","trimStrings":[],"placement":[2],"disabled":false,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":null,"maxDepth":null},
      {"id":"08fec2a6-9599-4d48-b40c-647ed8c96aee","scriptName":"「⌨️ 输 入框」","findRegex":"「⌨️ 输入框」","replaceString":"<h3>⌨️ 输入框</h3>\n<div class=\"control\">\n  <button onclick=\"inputGet()\">获取输入框内容</button>\n  <button onclick=\"inputSet()\">写入输入框</button>\n  <button onclick=\"inputAppend()\">追加输入框内容</button>\n  <button onclick=\"inputClear()\">清空输入框</button>\n  <button onclick=\"inputSend()\">发送输入框消息</button>\n</div>\n<script>\n  async function inputGet() {\n    const text = await tavo.input.get();\n    console.log('当前输入框内容：', JSON.stringify(text));\n  }\n  function inputSet() {\n    const text = prompt('输入要写入输入框的内容', '你好！');\n    if (text === null) return;\n    tavo.input.set(text);\n    tavo.utils.toast('已写入输入框');\n  }\n  function inputAppend() {\n    const text = prompt('输入要追加到输入框末尾的内容', '（追加内容）');\n    if (text === null) return;\n    tavo.input.append(text);\n    tavo.utils.toast('已追加到输入框');\n  }\n  function inputClear() {\n    tavo.input.clear();\n    tavo.utils.toast('已清空输入框');\n  }\n  function inputSend() {\n    tavo.input.set('这是一条由 tavo.input.send() 自动发送的消息');\n    tavo.input.send();\n  }\n</script>","trimStrings":[],"placement":[2],"disabled":false,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":null,"maxDepth":null},
      {"id":"e58d6401-cbb7-4c11-921a-a758c969a449","scriptName":"「🛠️ 工具」","findRegex":"「🛠️ 工具」","replaceString":"<h3>🛠️ 工具</h3>\n<div class=\"control\">\n  <button onclick=\"utilsToast()\">显示提示</button>\n  <button onclick=\"utilsOpenUrl()\">打开链接</button>\n  <button onclick=\"utilsExport()\">导出文件</button>\n  <button onclick=\"utilsSelect()\">选择器</button>\n</div>\n<script>\n  function utilsToast() {\n    const text = prompt('输入要显示的 toast 内容', '你好，这是一条 Toast 提示！');\n    if (!text) return;\n    tavo.utils.toast(text);\n  }\n  function utilsOpenUrl() {\n    const url = prompt('输入要打开的 URL', 'https://example.com');\n    if (!url) return;\n    tavo.utils.openUrl(url);\n  }\n  function utilsExport() {\n    const filename = prompt('输入导出文件名', 'demo.txt');\n    if (!filename) return;\n    const content = `这是由 tavo.utils.export 导出的测试文件。\n导出时间：${new Date().toLocaleString()}`;\n    tavo.utils.export(filename, content);\n  }\n  async function utilsSelect() {\n    // 形式 1：最简 — 纯字符串数组，无 title、无 defaultValue\n    const fruit = await tavo.utils.select(['🍎 苹果', '🍌 香蕉', '🍊 橙子']);\n    if (fruit === null) return tavo.utils.toast('已取消 🙅');\n    console.log('水果:', fruit);\n\n    // 形式 2：完整对象（value + label + description + subtitle）+ title + 默认值\n    const role = await tavo.utils.select([\n      { value: 'warrior', label: '⚔️ 战士',   description: '近战物理攻击', subtitle: '👶 推荐新手' },\n      { value: 'mage',    label: '🔮 法师',   description: '远程魔法攻击', subtitle: '💥 高爆发' },\n      { value: 'healer',  label: '💊 治疗师', description: '辅助回血',     subtitle: '🤝 团队支援' },\n    ], '🎮 选择职业', 'mage');\n    if (role === null) return tavo.utils.toast('已取消 🙅');\n    console.log('职业:', role);\n\n    tavo.utils.toast(`✨ 你选了 ${fruit} · ${role}`);\n  }\n</script>","trimStrings":[],"placement":[2],"disabled":false,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":null,"maxDepth":null},
      {"id":"916bc44a-a594-4696-be52-5d9f99547fbf","scriptName":"「📱 App」","findRegex":"「📱 App」","replaceString":"<h3>📱 App</h3>\n<div class=\"control\">\n  <button onclick=\"appVersion()\">显示版本</button>\n  <button onclick=\"appVersionNumber()\">显示版本代码</button>\n</div>\n<script>\n  async function appVersion() {\n    console.log(await tavo.app.version());\n  }\n  async function appVersionNumber() {\n    console.log(await tavo.app.versionNumber());\n  }\n</script>","trimStrings":[],"placement":[2],"disabled":false,"markdownOnly":true,"promptOnly":false,"runOnEdit":false,"substituteRegex":0,"minDepth":null,"maxDepth":null}
    ],"source_owner":[]}}}
};
const GUIDES = {
  card_creation: "【角色卡创作引导流程 · 4阶段】\n阶段一：引力核心（选择题追问到清晰）\n  - 性格张力？关系动态？氛围？玩法？\n阶段二：逐维度构建（每轮一个维度）\n  2.1 身份背景→description\n  2.2 外表视觉→description\n  2.3 性格结构(表层+深层)→personality+description\n  2.4 活人感维度(恐惧/创伤/语言习惯/隐藏面/气质矛盾，选2-3个)→description+mes_example\n  2.5 与用户关系→scenario\n  2.6 文风→first_mes+mes_example\n  2.7 世界观→世界书\n  2.8 变化弧线→宏变量+世界书阶段条目\n  2.9 玩法机制→宏+世界书+正则+预设+AR\n阶段三：一致性审查\n阶段四：交付确认（输出构思总结）",
  character_card_fields: "【角色卡字段规范】\ndescription: 常驻核心设定，≥260字\npersonality: 性格摘要\nscenario: 当前语境\nfirst_mes: 风格锚点（比任何解释都强）\nmes_example: 口吻示范器（不是设定百科）\ncreator_notes: 元数据（不放硬设定）\nsystem_prompt: 角色级主提示（需Prefer Char. Prompt）\npost_history_instructions: 收尾约束（权重最高）\nalternate_greetings: 数组\ntags: 数组\nextensions: 对象(≥{})\ncharacter_book: entries数组",
  worldbook: "【世界书7大设计策略】\n1. 触发词包含别称\n2. 写不可动摇的事实\n3. 分层拆设定\n4. 活剧本，可修改\n5. 从打补丁开始\n6. 聚焦铁律\n7. 与预设/长记忆分界\n\n【核心铁律】只有content注入prompt，key/comment/标题/组名都不注入。content必须独立成句。",
  worldbook_fields: "【世界书条目字段】\nuid, key, keysecondary, content(唯一注入), constant, selective, selectiveLogic(0=AND_ANY,1=NOT_ALL,2=NOT_ANY,3=AND_ALL), order(100-900), position(0-7), depth, role, probability, group/groupOverride/groupWeight, matchWholeWords(中文建议null), sticky/cooldown/delay(消息数计)",
  preset: "【预设12层级注入排序】\nMain Prompt → World Info Before → Persona Description → Char Description → Char Personality → Scenario → Enhance Definitions → Auxiliary Prompt → Chat Examples → World Info After → Chat History → Post-History Instructions(权重最高)\n\n更新时entries直接覆盖，推荐先get再改再update\n内置标识符：main,worldInfoBefore,personaDescription,charDescription,charPersonality,scenario,enhanceDefinitions,nsfw,worldInfoAfter,dialogueExamples,chatHistory,jailbreak,impersonation",
  macros: "【宏系统总览】\n身份：{{user}} {{char}} {{group}} {{groupNotMuted}} {{charIfNotGroup}}\n卡片：{{charDescription}} {{charPersonality}} {{scenario}} {{persona}} {{charPrompt}} {{charInstruction}} {{charJailbreak}} {{mesExamples}} {{mesExamplesRaw}} {{charVersion}} {{charCreatorNotes}}\n消息：{{lastMessage}} {{input}} {{lastUserMessage}} {{lastCharMessage}} {{original}}\n时间：{{time}} {{date}} {{weekday}} {{isotime}} {{isodate}} {{idleDuration}} {{time::UTC+9}}\n随机：{{random::A::B::C}} {{roll::3d6}}\n聊天变量：{{setvar::name::val}} {{addvar::name::val}} {{incvar::name}} {{decvar::name}} {{getvar::name}}\n全局变量：{{setglobalvar}} {{addglobalvar}} {{incglobalvar}} {{decglobalvar}} {{getglobalvar}}\n格式：{{newline}} {{newline::N}} {{space}} {{space::N}} {{trim}} {{noop}}\n注释：{{//注释}}  转义：\\{\\{char\\}\\}\n⚠️ setvar不要放在每轮都会注入的位置当初始化",
  regex: "【正则指南】\n作用范围：user/char/reasoning/lorebook\n执行时机：display(最安全)/send/sendAndDisplay/receive/editAndReceive\n替换参数：none/raw/escaped\n典型用法：清理噪音、输入简写展开、输出状态栏、与世界书联动\n三条铁律：导入成功≠替换成功≠JS执行成功；display最安全；<script>经DOMPurify/iframe判定\n\nST→Tavo转换（w()函数，仅create/update）：\nscriptName→name, placement[int]→placements[string](1→user,2→char,5→lorebook,6→reasoning), disabled→enabled(取反), 三旧字段→timing合并, substituteRegex→substitution\n\n可导入JSON稳定格式：{id,scriptName,findRegex,replaceString,trimStrings:[],placement:[2],disabled:false,markdownOnly:true,promptOnly:false,runOnEdit:false,substituteRegex:0}",
  long_memory: "【长记忆】跨会话保留关键信息。\n手动提取：点击提取按钮=明确收藏（关键节点/关系变化/长期偏好）\n10条自动提取：系统每10轮自动挑选=摘要归档（日常积累）\n与世界书边界：世界书=静态世界设定，长记忆=动态事实\nJS API: await tavo.memory.current() 返回 {id,enabled,memories[]}\nawait tavo.memory.update({enabled,memories}) 直接覆盖\n⚠️ update不等于触发官方提取流程",
  advanced_rendering: "【高级前端渲染(AR)】\n开启：侧边栏→更多→设置→高级前端渲染\n渲染链路：消息→MarkdownConverter→sandbox.render()→DOMPurify→气泡/iframe→Flutter WebView\nJS执行模式：disabled/auto/codeblock/script/native\niframe沙盒：sandbox=\"allow-scripts allow-modals allow-same-origin\"\n轻量写法：唯一class包裹+scoped CSS+max-width:100%+vertical-align:bottom\n需JS写法：带<body>完整片段+```html代码块\n踩坑：不依赖页面级body/html/window；CSS不写全局选择器；不用外链/远程脚本；不用position:fixed；不超宽",
  png_embedding: "【PNG嵌入】\nJSON base64→tEXt chunk，关键字chara（兼容ccv3优先读取）\n保留.json+.png，先改JSON再嵌PNG\n仅chara/ccv3被自动识别；正则/预设/脚本默认外置\ncharacter_book可随卡嵌入（本就是JSON一部分）\n交付顺序：角色卡JSON→世界书JSON→嵌入PNG→外置正则/前端资源\n嵌入后必须回读验证",
  others: "【其他功能】\n存储空间：清缓存(TTS语音)/日志(上下文+负载均衡)/角色资源，核心数据不提供清理\n备份恢复：含API密钥选项；高版本→低版本不可恢复；内部bata_backup_*方法族\n图片发送：需多模态模型(image能力位)。两种提示词：图片描述生成+图片描述注入\n自定义快捷键：常用短语一键填入输入框\n群聊快捷发言：输入框左上角成员头像按钮。群聊有独立提示词系统(preset_prompt_group_chat_start等)\n宏助手：输入框左下角列出可用变量宏一键填入\n隐私：Tavo含Microsoft Clarity(行为追踪)+Sentry(错误监控+Session Replay)",
  official_sources: "【官方来源】\n角色卡格式：https://docs.sillytavern.app/usage/core-concepts/characterdesign/\n世界书：https://docs.sillytavern.app/usage/core-concepts/worldinfo/\nTavo API：https://docs.tavoai.dev/guides/javascript-api/\nTavo官网：https://tavoai.dev\nDiscord社区：https://discord.gg/47cBNpQDFG",
  tavojs_guide_import: "【TavoJS 指南角色卡导入】\n初学者建议导入官方 TavoJS 指南角色卡，快速查看各 API 使用例子。\n导入方法：在'从URL导入角色'处粘贴：\nhttps://docs.tavoai.dev/static/images/tavojs-guide-0_8-zh.png",
  ai_cliche_blacklist: "【AI废词黑名单】\n情绪：不禁/情不自禁/不由自主/鬼使神差/油然而生/心中涌起/一股暖流/下意识\n比喻：宛如/仿佛/犹如/如同/好似\n修饰：淡淡的/缓缓地/轻轻地/悄然/微微一笑/嘴角上扬/嘴角微微上扬/深邃的眼眸\n惊讶：竟然/居然/没想到\n文艺：氤氲/旖旎/悸动/涟漪/交织/命运的齿轮\n时间：那一刻/这一瞬间\n回避：难以言喻/无法形容/说不出的\n清洗规则：删除→修复连续标点→修复连续空行→修复连续空格\n替代方向：废词→具体动作/语气变化/细节",
  gameplay_modes: "【9种玩法模式】\n1.纯角色：人设互动/情感推进 → 只需角色卡\n2.武侠成长：江湖/修炼/门派 → 角色+世界书+预设+变量\n3.仙侠成长：修仙/境界/宗门 → 角色+世界书+预设+变量\n4.玄幻成长：异世界/血脉/势力/体系战斗 → 角色+世界书+预设+变量\n5.ARPG成长：战斗/技能/装备 → 角色+世界书+预设+变量+正则+AR\n6.剧情RPG：分支/多结局/NPC → 角色+世界书+NPC世界书+预设+变量\n7.生存模拟：资源/危机/基地 → 角色+世界书+预设+变量+正则+AR\n8.种田经营：农场/季节/NPC → 角色+世界书+预设+变量\n9.好感养成：好感阶梯/事件/路线 → 角色+预设+变量+世界书阶段条目\n\n好感阶梯：陌生(0-19)→认识(20-39)→熟悉(40-59)→亲近(60-79)→亲密(80-100)\n⚠️ 变量越多模型越容易关注数值而忘角色本身，纯角色或简单好感往往体验更好",
  game_workflow: "【游戏开发流程】核心铁律：大模型只会做梦不会算数！\n1.脚本计算数值、更新变量（tavo.set）\n2.通过tavo.input.set/send发送自然语言指令\n3.AI根据变量生成叙事画面\n脚本负责数值，AI负责描写",
  architecture_patterns: "【架构模式】\n1.统一调度管道：所有操作经executeAction(type,target,params)中央分发，统一拦截资源判定。适合中大型游戏。\n2.独立模块：每个按钮对应独立函数，简单直观。适合原型和小游戏。\n建议初期独立模块，后期重构为管道。",
  cross_midnight: "【跨夜处理】封装safeAdvanceTime()函数。\n绝不单独发送'过了一天'给模型！\n正确做法：把跨夜产生的事件标记(pendingMico)追加到玩家下一次操作指令中，一个回合内合并结算。",
  digital_cipher: "【数字密语】替代冗长自然语言！\n格式：[动作-目标-参数-时间 金钱 隐蔽 压力...-骰子#校验和]\nAI配合世界书中的'解密字典'还原剧情，节约Token且杜绝幻觉。",
  route_activation: "【结局路线】使用activeRoute全局变量互斥锁定分支树（纯爱/NTR等），一旦激活即锁定。\nBad End拥有无视互斥锁的越权覆写最高优先级。",
  achievement_bitmask: "【成就位掩码】用1个数字保存100个布尔值！\n激活：secrets |= (1 << index)\n判定：(secrets & (1 << index)) !== 0\n反推新增：Math.log2(diff) 找出差异位\n注意最大掩码宽度。",
  interactive_send: "【交互式发送】操作前拍摄变量快照→改变数值→弹出prompt预填指令→若取消则回滚快照。\n适合高风险操作（黑客入侵/购买道具）防空走。",
  endpoint: "【端点】15平台/193模型/30 Vertex区域\n直连6个(OpenAI/Claude/Gemini/VertexAI/DeepSeek/Grok)\n协议兼容3个(OpenAI/Anthropic/Gemini协议)\n代理5个(OpenRouter/Volink/MantleAI/PopRouter/TinyRouter)\n元入口1个(LoadBalancer)\n默认直连非Volink。模型注册表仅~22%含定价，5%含完整capabilities",
  tts: "【TTS】13平台/4代理/Multi-System\n13平台含Android系统/Google/ElevenLabs/MiniMax/Honor/Huawei/Vivo/Xiaomi/iFlytek/iOS/Multi-System/Volink等\nMulti-System挂载11个可识别引擎包名\n4代理：MantleAI/PopRouter/TinyRouter/Volink\n角色语音绑定：TtsCharacterRef，一个角色绑一个TTS端点",
  load_balancer: "【负载均衡】4策略：round_robin/weighted/random/lru\n无geo/latency路由。不跨协议适配。\n配置项：max_retries/weight/log_size\n实体：LoadBalancer/LoadBalancerLog/LoadBalancerStrategy",
  dom_compatibility: "【DOM兼容】支持getElementById/innerHTML/style修改/createElement等。\n不支持localStorage/eval。\n面板使用流式布局(position:relative)，配合MutationObserver自动守护。",
  tavo_quirks: "【Tavo 环境特性与关键差异（实测确认）】\n- 每条消息 <script> 独立执行，全局变量不跨消息，DOMContentLoaded 按消息独立触发\n- runOnEdit 必须为 false\n- match_whole_words 为 true 时中文正常触发\n- group 字段 UI 不可见需 JSON 改\n- timing 合并为单字段\n- script 上下文隔离，需全局锁防重复初始化\n- ⚠️ 不可按 ST 经验外推，一切以 Tavo 实测为准",
  card_quality_check: "【角色卡质检清单】\n\n## 结构检查（6项）\n1. JSON 可解析，spec=chara_card_v2/v3，spec_version 正确\n2. data.extensions 存在且为对象（≥{}）\n3. alternate_greetings 是数组\n4. tags 是数组\n5. character_book 如有，entries 是数组\n6. PNG 回读一致\n\n## 内容检查（11项）\n1. name 非空\n2. description ≥260字，含身份/背景/外貌/行为边界\n3. personality 非空，是关键词摘要（不是段落）\n4. scenario 非空，1-3句初始关系\n5. first_mes 非空且风格一致（这是风格锚点）\n6. mes_example ≥2组，是口吻示范（不是设定百科）\n7. system_prompt ≤400字\n8. post_history_instructions ≤200字\n9. 宏统一（{{char}}/{{user}}）\n10. 无 AI 废词\n11. 无内在矛盾\n\n## 活人感检查（4项）\n1. 非服务型NPC：有明确行为边界（绝不做什么）\n2. 有防御机制：恐惧/回避/抗拒模式\n3. 情绪有惯性：不会瞬间翻转\n4. 不替{{user}}行动\n\n## 玩法系统专项（5项）\n1. 玩法模式与资源清单匹配\n2. 纯角色模式无残留玩法变量/正则\n3. 变量初始化在一次性触发处（非每轮注入）\n4. 系统正则配套（timing/placements正确）\n5. 世界书条目 comment 非空 + content 独立成句"
};

// 工具函数
function scanAiCliches(text, customTerms = []) {
  const found = [];
  const allTerms = [...Object.values(AI_CLICHE_BLACKLIST).flat(), ...customTerms];
  for (const term of allTerms) {
    const regex = new RegExp(term, 'g');
    let m;
    while ((m = regex.exec(text)) !== null) {
      found.push({ term, index: m.index, context: text.substring(Math.max(0, m.index - 10), m.index + term.length + 10) });
    }
  }
  return { total: found.length, terms: found };
}

function cleanAiCliches(text, customTerms = []) {
  const allTerms = [...Object.values(AI_CLICHE_BLACKLIST).flat(), ...customTerms];
  let result = text;
  for (const term of allTerms) {
    result = result.split(term).join('');
  }
  result = result.replace(/。。+/g, '。').replace(/，，+/g, '，').replace(/！！+/g, '！');
  result = result.replace(/\n{3,}/g, '\n\n');
  result = result.replace(/ {2,}/g, ' ');
  return result;
}

function validateCardStructure(cardJson) {
  const errors = [];
  const warnings = [];
  let card;
  try { card = typeof cardJson === 'string' ? JSON.parse(cardJson) : cardJson; } catch (e) { return { valid: false, errors: [`JSON解析失败: ${e.message}`], warnings: [] }; }
  const d = card.data || card;
  if (!card.spec || !card.spec.startsWith('chara_card')) errors.push(`spec 应为 chara_card_v2 或 chara_card_v3，当前: ${card.spec}`);
  if (!card.spec_version) errors.push('缺少 spec_version');
  if (d.extensions === undefined || d.extensions === null) errors.push('data.extensions 不存在，应至少为 {}');
  if (d.extensions && typeof d.extensions !== 'object') errors.push('data.extensions 必须是对象');
  if (d.alternate_greetings && !Array.isArray(d.alternate_greetings)) errors.push('alternate_greetings 必须是数组');
  if (d.tags && !Array.isArray(d.tags)) errors.push('tags 必须是数组');
  if (!d.name) errors.push('name 为空');
  if (!d.description || d.description.length < 260) warnings.push(`description 仅 ${d.description?.length || 0} 字，建议 ≥260`);
  if (!d.personality) warnings.push('personality 为空');
  if (!d.scenario) warnings.push('scenario 为空');
  if (!d.first_mes) errors.push('first_mes 为空，角色卡不可用');
  if (!d.mes_example) warnings.push('mes_example 为空');
  else { const starts = (d.mes_example.match(/<START>/g) || []).length; if (starts < 2) warnings.push(`mes_example 仅 ${starts} 组<START>，建议 ≥2`); }
  if (d.character_book) {
    if (!Array.isArray(d.character_book.entries)) errors.push('character_book.entries 必须是数组');
    else { d.character_book.entries.forEach((e, i) => { if (!e.keys && !e.key) warnings.push(`character_book.entries[${i}] 缺少触发关键词`); if (!e.content) warnings.push(`character_book.entries[${i}] content 为空`); }); }
  }
  const fieldsToScan = [d.description, d.personality, d.scenario, d.first_mes, d.mes_example, d.system_prompt, d.post_history_instructions].filter(Boolean).join(' ');
  const cliches = scanAiCliches(fieldsToScan);
  if (cliches.total > 0) warnings.push(`发现 ${cliches.total} 个AI废词: ${[...new Set(cliches.terms.map(t => t.term))].slice(0, 10).join(', ')}${cliches.total > 10 ? '...' : ''}`);
  const desc = (d.description || '').toLowerCase();
  const hasDefensive = /防御|警惕|拒绝|回避|排斥|冷淡|疏离|抗拒/.test(desc);
  const hasInertia = /惯性|持续|久久|难以|不会立刻|不会马上/.test(desc);
  if (!hasDefensive) warnings.push('活人感：角色缺乏防御机制描述');
  if (!hasInertia) warnings.push('活人感：情绪缺乏惯性描述');
  return { valid: errors.length === 0, errors, warnings, stats: { descriptionLength: d.description?.length || 0, mesExampleGroups: (d.mes_example?.match(/<START>/g) || []).length, clichesFound: cliches.total, hasCharacterBook: !!d.character_book, characterBookEntries: d.character_book?.entries?.length || 0 } };
}

function validateWorldbookStructure(wbJson) {
  const errors = [];
  const warnings = [];
  let wb;
  try { wb = typeof wbJson === 'string' ? JSON.parse(wbJson) : wbJson; } catch (e) { return { valid: false, errors: [`JSON解析失败: ${e.message}`], warnings: [] }; }
  if (!wb.entries) { errors.push('缺少 entries'); return { valid: false, errors, warnings }; }
  const isObject = typeof wb.entries === 'object' && !Array.isArray(wb.entries);
  const isArray = Array.isArray(wb.entries);
  if (!isObject && !isArray) { errors.push('entries 必须是对象或数组'); return { valid: false, errors, warnings }; }
  const entries = isArray ? wb.entries : Object.values(wb.entries);
  entries.forEach((e, i) => {
    const idx = isArray ? i : Object.keys(wb.entries)[i];
    if (!e.content) warnings.push(`entries[${idx}] content 为空（只有content注入prompt）`);
    if (e.content && e.content.length < 10) warnings.push(`entries[${idx}] content 过短（${e.content.length}字），可能不够独立成句`);
    const keys = e.keys || e.key;
    if (!keys || (Array.isArray(keys) && keys.length === 0) || (typeof keys === 'string' && !keys.trim())) { if (!e.constant) warnings.push(`entries[${idx}] 非常驻条目缺少触发关键词`); }
    if (e.matchWholeWords === true) warnings.push(`entries[${idx}] matchWholeWords=true，中文环境建议null`);
    if (e.selective && e.selectiveLogic === undefined && e.secondaryKeywordStrategy === undefined) warnings.push(`entries[${idx}] 开启selective但缺少selectiveLogic`);
  });
  return { valid: errors.length === 0, errors, warnings, stats: { totalEntries: entries.length, constantEntries: entries.filter(e => e.constant || e.strategy === 'constant').length, selectiveEntries: entries.filter(e => e.selective || e.secondaryKeywordStrategy !== 'none').length } };
}

function validateRegexScript(regexJson) {
  const errors = [];
  const warnings = [];
  let regex;
  try { regex = typeof regexJson === 'string' ? JSON.parse(regexJson) : regexJson; } catch (e) { return { valid: false, errors: [`JSON解析失败: ${e.message}`], warnings: [] }; }
  const scripts = Array.isArray(regex) ? regex : [regex];
  scripts.forEach((s, i) => {
    if (!s.scriptName && !s.name) errors.push(`scripts[${i}] 缺少名称(scriptName/name)`);
    if (!s.findRegex) errors.push(`scripts[${i}] 缺少正则表达式(findRegex)`);
    else {
      try { const pattern = s.findRegex.replace(/^\/|\/[gimsuy]*$/g, ''); new RegExp(pattern); }
      catch (e) { errors.push(`scripts[${i}] 正则表达式无效: ${e.message}`); }
    }
    const placement = s.placement || s.placements;
    if (!placement || (Array.isArray(placement) && placement.length === 0)) warnings.push(`scripts[${i}] 缺少作用范围(placement/placements)`);
  });
  return { valid: errors.length === 0, errors, warnings, stats: { totalScripts: scripts.length } };
}

function makeRegexScript(opts) {
  return { id: crypto.randomUUID(), scriptName: opts.scriptName || '未命名正则', findRegex: opts.findRegex || '/.*/', replaceString: opts.replaceString || '', trimStrings: [], placement: [2], disabled: false, markdownOnly: opts.markdownOnly !== false, promptOnly: opts.promptOnly === true, runOnEdit: opts.runOnEdit === true, substituteRegex: 0, minDepth: null, maxDepth: null };
}

function recommendGameplayMode(brief) {
  const text = (brief || '').toLowerCase();
  const scores = GAMEPLAY_MODES.map(mode => {
    let score = 0;
    const keywords = { pure_character: ['聊天','日常','陪伴','纯角色','人设','情感','对话'], wuxia_growth: ['武侠','江湖','武功','门派','内力','侠客'], xianxia_growth: ['仙侠','修仙','境界','宗门','灵力','仙人'], xuanhuan_growth: ['玄幻','异世界','血脉','灵根','宗门争斗','体系战斗','玄幻成长'], arpg_growth: ['战斗','技能','装备','副本','arpg','数值','属性','rpg'], story_rpg: ['剧情','分支','结局','npc','选择','剧情rpg'], survival: ['生存','末世','荒野','资源','废土','基地'], farming: ['种田','经营','农场','店铺','季节','慢节奏'], affection: ['好感','养成','好感度','恋爱养成','亲密度','信任度','关系推进'] };
    const kws = keywords[mode.id] || [];
    for (const kw of kws) { if (text.includes(kw)) score += 2; }
    return { ...mode, score };
  });
  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];
  const fallback = best.score === 0 ? GAMEPLAY_MODES[0] : best;
  return { recommended: fallback, alternatives: scores.filter(s => s.score > 0 && s.id !== fallback.id).slice(0, 3), allScores: scores.map(s => ({ id: s.id, name: s.name, score: s.score })) };
}
const TOOLS = {
  get_template: {
    description: "获取角色卡或世界书的参考模板（完整 JSON）。可用：character-card.v2.minimal, character-card.v2.full, character-card.v3.minimal, character-card.v3.full, worldbook.minimal, worldbook.advanced",
    inputSchema: { type:"object", properties:{ template_name:{ type:"string", enum:Object.keys(TEMPLATES) } }, required:["template_name"] },
    handler: a => { const t = TEMPLATES[a.template_name]; return t ? { content:[{ type:"text", text:JSON.stringify(t,null,2) }] } : { content:[{ type:"text", text:`未找到。可用：${Object.keys(TEMPLATES).join(', ')}` }], isError:true }; }
  },
  list_templates: {
    description: "列出所有可用的角色卡和世界书模板名称及简要说明。",
    inputSchema: { type:"object", properties:{} },
    handler: () => { const list = Object.entries(TEMPLATES).map(([k,v]) => { const d = v.data || v; return `- ${k}: ${d.name || '(世界书)'}`; }); return { content:[{ type:"text", text:`可用模板：\n${list.join('\n')}` }] }; }
  },
  get_field_guide: {
    description: "获取角色卡/世界书/宏/正则/预设字段的官方写法指南。",
    inputSchema: { type:"object", properties:{ topic:{ type:"string", enum:["description","personality","scenario","first_mes","mes_example","creator_notes","system_prompt","post_history_instructions","tags","extensions","character_book","worldbook_entry","macros","regex_guide","preset","combos","advanced_rendering","all"] } }, required:["topic"] },
    handler: a => {
      const s = OFFICIAL_SPECS; const t = a.topic;
      const g = {
        description:`【description - 常驻token区·最重要】${s.character_card.fields.description.desc}\n写作要点：身份/背景/外貌/行为边界/文风框架。2-5段。必须用{{char}}指代。核心设定放这里不放松creator_notes或世界书。`,
        personality:`【personality - 常驻token区】${s.character_card.fields.personality.desc}\n适合放傲慢/温柔/压场/嘴硬心软/冷静等概括。比description更短更聚焦。`,
        scenario:`【scenario - 常驻token区】${s.character_card.fields.scenario.desc}\n只写初始状态。关系变化通过世界书或长记忆推进。`,
        first_mes:`【first_mes - 风格锚点·非永久】${s.character_card.fields.first_mes.desc}\n⚠️ 模型会非常强烈地从first_mes学习回复长度、文风、动作描写密度和对话格式。`,
        mes_example:`【mes_example - 口吻示范器·非永久】${s.character_card.fields.mes_example.desc}\n⚠️ 不是设定百科！唯一目的是让模型学'怎么说'。至少2组<START>。`,
        creator_notes:`【creator_notes - 元数据】${s.character_card.fields.creator_notes.desc}。`,
        system_prompt:`【system_prompt】${s.character_card.fields.system_prompt.desc}。需Prefer Char. Prompt启用时才覆盖。`,
        post_history_instructions:`【post_history_instructions - 收尾约束】${s.character_card.fields.post_history_instructions.desc}。≤200字。`,
        tags:`【tags】${s.character_card.fields.tags.desc}。`,
        extensions:`【extensions】${s.character_card.fields.extensions.desc}。常见键：world,depth_prompt,talkativeness,fav。`,
        character_book:`【嵌入世界书】放在 data.character_book。entries 为数组。\nST→嵌入字段映射：key→keys, keysecondary→secondary_keys, disable→enabled(取反), order→insertion_order, position→extensions.position+映射字符串。`,
        worldbook_entry:`【世界书条目】${s.worldbook.rule}\n字段：${JSON.stringify(s.worldbook.fields,null,2)}\n设计原则：${s.worldbook.design.join('；')}\n⚠️ ST→Tavo转换：${JSON.stringify(s.worldbook.stToTavoConversion,null,2)}\n\n⚠️【三条路径字段名对比·必须分清】\n1. 独立ST文件/模板：matchWholeWords(复数)/keysecondary/selectiveLogic/displayIndex/groupOverride(小驼峰)，entries是对象{'0':{}}\n2. JS API create/update：matchWholeWord(单数)/secondaryKeywords/selectiveLogic/scanDepth(骆驼式)，走o()/i()转换，entries是数组[{}]\n3. CCv3嵌入character_book：match_whole_words(复数下划线)/secondary_keys/enabled(取反disable)/insertion_order(数字)，entries是数组[{}]\n⚠️ CCv3的match_whole_words和secondary_keys不会被o()自动转换！走create/update必须改成matchWholeWord/secondary_keywords`,
        macros:`【宏系统】\n身份：${s.macros.identity.join(',')}\n卡片：${s.macros.card.join(',')}\n消息：${s.macros.message.join(',')}\n时间：${s.macros.datetime.join(',')}\n随机：${s.macros.random.join(',')}\n聊天变量：${s.macros.chat_variables.join(',')}\n全局变量：${s.macros.global_variables.join(',')}\n格式：${s.macros.formatting.join(',')}\n注释：${s.macros.comment}\n转义：${s.macros.escape}\n⚠️ ${s.macros.warnings.join('；')}`,
        regex_guide:`【正则】\nTavo字段：${JSON.stringify(s.regex.fields,null,2)}\n\nST→Tavo转换(w()函数)：\n${Object.entries(s.regex.stToTavoConversion).map(([k,v])=>`· ${k}${v?': '+v:''}`).join('\n')}\n\n三条铁律：${s.regex.threeLaws.join('；')}\n\n可导入JSON格式：${s.regex.importJsonStableFormat}\nplacement值：${s.regex.placementValues}`,
        preset:`【预设】\n注入排序：${s.preset.injectionOrder}\n内置标识符：${s.preset.builtinIdentifiers.join(',')}\n更新铁律：${s.preset.updateRule}`,
        combos:`【组合玩法】\n${Object.entries(s.combos).map(([k,v])=>`· ${k}：${v}`).join('\n')}`,
        advanced_rendering:`【高级前端渲染】\n渲染链路：${s.advanced_rendering.renderChain}\nJS模式：${s.advanced_rendering.jsModes}\niframe沙盒：${s.advanced_rendering.iframeSandbox}\n轻量写法：${s.advanced_rendering.recommendedLight}\n需JS写法：${s.advanced_rendering.recommendedHeavy}\n踩坑：${s.advanced_rendering.pitfalls.join('；')}`,
        all:`【完整规范】\n角色卡常驻token：${s.character_card.permanent_context.join(',')}\n${Object.entries(s.character_card.fields).map(([k,v])=>`· ${k}[${v.token}]:${v.desc}`).join('\n')}\n\n世界书：${s.worldbook.rule}\n${Object.entries(s.worldbook.fields).map(([k,v])=>`· ${k}:${v}`).join('\n')}\n\n设计原则：${s.worldbook.design.join('; ')}`
      };
      return { content:[{ type:"text", text:g[t]||g.all }] };
    }
  },
  get_api_reference: {
    description: "获取 Tavo JavaScript API 完整官方参考文档（含 sandbox.js 实证补全）。",
    inputSchema: { type:"object", properties:{ module:{ type:"string", enum:[...Object.keys(OFFICIAL_DOCS),"all"] } }, required:["module"] },
    handler: a => { const m = a.module; if (m==="all") return { content:[{ type:"text", text:JSON.stringify(OFFICIAL_DOCS,null,2) }] }; const mod = OFFICIAL_DOCS[m]; return mod ? { content:[{ type:"text", text:JSON.stringify(mod,null,2) }] } : { content:[{ type:"text", text:`模块 "${m}" 不存在。可用：${Object.keys(OFFICIAL_DOCS).join(',')}` }], isError:true }; }
  },
  get_examples: {
    description: "获取 Tavo 官方 JS API 教学角色卡的生产级示例（完整原始 JSON）。",
    inputSchema: { type:"object", properties:{ example_name:{ type:"string", enum:["tavo_js_guide","all"] } }, required:["example_name"] },
    handler: a => { if (a.example_name==="all") return { content:[{ type:"text", text:JSON.stringify(USER_EXAMPLES_RAW,null,2) }] }; const ex = USER_EXAMPLES_RAW[a.example_name]; return ex ? { content:[{ type:"text", text:JSON.stringify(ex,null,2) }] } : { content:[{ type:"text", text:"示例不存在。" }], isError:true }; }
  },
  get_guide: {
    description: "获取 Tavo 各主题的综合指南。",
    inputSchema: { type:"object", properties:{ topic:{ type:"string", enum:Object.keys(GUIDES) } }, required:["topic"] },
    handler: a => { const g = GUIDES[a.topic]; return g ? { content:[{ type:"text", text:g }] } : { content:[{ type:"text", text:`未找到主题 "${a.topic}"。可用：${Object.keys(GUIDES).join(', ')}` }], isError:true }; }
  },
  list_references: {
    description: "列出所有可查询的参考文档主题。",
    inputSchema: { type:"object", properties:{} },
    handler: () => ({ content:[{ type:"text", text:`可用参考主题（通过 get_guide 或 get_field_guide 查询）：\n${Object.keys(GUIDES).map(k=>`· ${k}`).join('\n')}` }] })
  },
  get_object_fields: {
    description: "获取特定 API 对象的字段定义。",
    inputSchema: { type:"object", properties:{ object_name:{ type:"string", enum:["message","chat","character","persona","preset","preset_entry","lorebook","lorebook_entry","regex_entry"] } }, required:["object_name"] },
    handler: a => {
      const f = { "message":OFFICIAL_DOCS.messages.messageFields, "chat":OFFICIAL_DOCS.chat.chatFields, "character":OFFICIAL_DOCS.character.characterFields, "persona":OFFICIAL_DOCS.persona.personaFields, "preset":OFFICIAL_DOCS.preset.presetFields, "preset_entry":OFFICIAL_DOCS.preset.presetEntryFields, "lorebook":OFFICIAL_DOCS.lorebook.lorebookFields, "lorebook_entry":OFFICIAL_DOCS.lorebook.lorebookEntryFields, "regex_entry":OFFICIAL_DOCS.regex.entryFields };
      const o = f[a.object_name]; return o ? { content:[{ type:"text", text:JSON.stringify(o,null,2) }] } : { content:[{ type:"text", text:"对象名未找到" }], isError:true };
    }
  },
  validate_card: {
    description: "校验角色卡 JSON 结构：检查 spec、extensions、数组字段、character_book，以及 description 体量、mes_example 组数、AI 废词、活人感等。",
    inputSchema: { type:"object", properties:{ card_json:{ type:"string", description:"角色卡 JSON 字符串" } }, required:["card_json"] },
    handler: a => { const result = validateCardStructure(a.card_json); return { content:[{ type:"text", text:JSON.stringify(result,null,2) }] }; }
  },
  audit_card: {
    description: "对角色卡做完整质检：结构校验 + 内容密度 + AI 废词扫描 + 活人感检查 + 宏一致性 + 世界书嵌入问题。",
    inputSchema: { type:"object", properties:{ card_json:{ type:"string", description:"角色卡 JSON 字符串" } }, required:["card_json"] },
    handler: a => {
      const structural = validateCardStructure(a.card_json);
      let card;
      try { card = typeof a.card_json === 'string' ? JSON.parse(a.card_json) : a.card_json; } catch { return { content:[{ type:"text", text:"JSON解析失败，无法审计" }], isError:true }; }
      const d = card.data || card;
      const density = { description: d.description?.length || 0, personality: d.personality?.length || 0, scenario: d.scenario?.length || 0, first_mes: d.first_mes?.length || 0, mes_example: d.mes_example?.length || 0 };
      const allText = [d.description,d.personality,d.scenario,d.first_mes,d.mes_example,d.system_prompt,d.post_history_instructions].filter(Boolean).join(' ');
      const usesUser = allText.includes('{{user}}');
      const usesChar = allText.includes('{{char}}') || (d.name && allText.split('{{char}}').join('').includes(d.name));
      const macroConsistency = { uses_user_macro: usesUser, uses_char_macro: usesChar };

      const desc = (d.description || '').toLowerCase();
      const livingFeel = {
        hasBehaviorBoundary: /边界|底线|绝不|从不|不会/.test(desc),
        hasDefenseMechanism: /防御|警惕|拒绝|回避|排斥|冷淡|疏离|抗拒|保护|防备/.test(desc),
        hasEmotionalInertia: /惯性|持续|久久|难以|不会立刻|不会马上|需要时间|残留|余韵/.test(desc),
        notNpcService: !/(全心全意|随时为你|无条件服从|永远陪伴|乐于效劳|随叫随到|百依百顺|毫无保留地|尽我所能帮助)/.test(desc)
      };
      const livingFeelScore = Object.values(livingFeel).filter(v => v).length;
      const livingFeelWarnings = [];
      if (!livingFeel.hasBehaviorBoundary) livingFeelWarnings.push('缺少行为边界描述（角色绝对不做的事）');
      if (!livingFeel.hasDefenseMechanism) livingFeelWarnings.push('缺少防御机制（角色如何回避/抗拒）');
      if (!livingFeel.hasEmotionalInertia) livingFeelWarnings.push('缺少情绪惯性（情绪不会瞬间翻转）');
      if (!livingFeel.notNpcService) livingFeelWarnings.push('角色描述偏服务型NPC（无条件服从/随时服务）');

      const gameplayCheck = { issues: [] };
      const wb = d.character_book;
      if (wb && Array.isArray(wb.entries)) {
        const varsInWb = wb.entries.filter(e => /\{\{setvar::|\{\{addvar::|\{\{incvar::|\{\{decvar::/.test(e.content || ''));
        const constantEntries = wb.entries.filter(e => e.constant === true || e.strategy === 'constant');
        varsInWb.forEach(e => {
          if (constantEntries.some(c => c === e)) gameplayCheck.issues.push(`世界书条目"${e.name || e.comment || e.keys}"包含变量宏且为常驻(constant)，变量会被每轮重置`);
        });
        wb.entries.forEach(e => {
          if (!e.content) return;
          if ((!e.comment || !e.comment.trim()) && (!e.name || !e.name.trim())) gameplayCheck.issues.push(`有条目缺少comment/name，难以维护`);
          const sentences = e.content.split(/[。！？；\n]/).filter(s => s.trim());
          if (sentences.length === 1 && e.content.length < 20) gameplayCheck.issues.push(`条目"${e.name || e.comment || '未命名'}" content过短且不独立成句`);
        });
      }

      return { content:[{ type:"text", text:JSON.stringify({
        structural,
        density,
        macro_consistency: macroConsistency,
        livingFeel: { score: `${livingFeelScore}/4`, ...livingFeel },
        livingFeelWarnings,
        gameplayCheck
      },null,2) }] };
    }
  },
  scan_ai_cliches: {
    description: "扫描文本中的 AI 废词和套话。",
    inputSchema: { type:"object", properties:{ text:{ type:"string" }, custom_terms:{ type:"array", items:{ type:"string" } } }, required:["text"] },
    handler: a => { const result = scanAiCliches(a.text, a.custom_terms || []); return { content:[{ type:"text", text:JSON.stringify(result,null,2) }] }; }
  },
  clean_ai_cliches: {
    description: "按默认黑名单删除 AI 废词，并做基础标点/空白清理。",
    inputSchema: { type:"object", properties:{ text:{ type:"string" }, custom_terms:{ type:"array", items:{ type:"string" } } }, required:["text"] },
    handler: a => { const cleaned = cleanAiCliches(a.text, a.custom_terms || []); return { content:[{ type:"text", text:cleaned }] }; }
  },
  validate_worldbook: {
    description: "校验独立世界书或嵌入式 character_book 的 entries 结构。",
    inputSchema: { type:"object", properties:{ worldbook_json:{ type:"string" } }, required:["worldbook_json"] },
    handler: a => { const result = validateWorldbookStructure(a.worldbook_json); return { content:[{ type:"text", text:JSON.stringify(result,null,2) }] }; }
  },
  make_regex_script: {
    description: "生成 Tavo/SillyTavern 可导入的正则脚本对象。",
    inputSchema: { type:"object", properties:{ scriptName:{ type:"string" }, findRegex:{ type:"string" }, replaceString:{ type:"string" }, markdownOnly:{ type:"boolean" }, promptOnly:{ type:"boolean" }, runOnEdit:{ type:"boolean" } }, required:["scriptName","findRegex"] },
    handler: a => { const result = makeRegexScript(a); if (a.replaceString !== undefined) result.replaceString = a.replaceString; return { content:[{ type:"text", text:JSON.stringify(result,null,2) }] }; }
  },
  validate_regex_script: {
    description: "校验可导入正则 JSON。",
    inputSchema: { type:"object", properties:{ regex_json:{ type:"string" } }, required:["regex_json"] },
    handler: a => { const result = validateRegexScript(a.regex_json); return { content:[{ type:"text", text:JSON.stringify(result,null,2) }] }; }
  },
  recommend_gameplay_mode: {
    description: "根据用户简述推荐玩法模式和配套资源清单。",
    inputSchema: { type:"object", properties:{ brief:{ type:"string" } }, required:["brief"] },
    handler: a => { const result = recommendGameplayMode(a.brief); return { content:[{ type:"text", text:JSON.stringify(result,null,2) }] }; }
  },
  get_tavo_workflow: {
    description: "按任务类型返回 Tavo 制作工作流。",
    inputSchema: { type:"object", properties:{ task:{ type:"string" } }, required:["task"] },
    handler: a => {
      const workflows = {
        "角色卡": [
          "1. 确认玩法模式（纯角色/好感养成/ARPG等）",
          "2. 引力核心：一两句话说清最让用户想继续聊下去的东西",
          "3. identity/background/visual→description（常驻token区）",
          "4. personality表层+深层→personality+description",
          "5. 活人感维度（恐惧/创伤/语言习惯/隐藏面/气质矛盾，选2-3个）→description+mes_example",
          "6. 与用户关系→scenario",
          "7. 文风锚定→first_mes+mes_example",
          "8. 交付前：结构校验+AI废词扫描+活人感检查+玩法系统专项"
        ],
        "世界书": [
          "1. 分成'永远常驻'和'关键词触发'两类",
          "2. 常驻规则用constant:true",
          "3. content独立成句（只有content注入prompt）",
          "4. 触发词包含别称",
          "5. 中文条目matchWholeWords保持null",
          "6. 分清三条路径：import()直通/create()走o()转换/character_book嵌入走映射",
          "7. 阶段性变化条目配合宏变量"
        ],
        "预设": [
          "1. 分层：Main Prompt→身份→角色→情景→示例→特殊场景→PHI",
          "2. 不要把大量世界观硬塞进预设",
          "3. 更新时entries直接覆盖，务必先get再改再update",
          "4. PHI≤200字权重最高",
          "5. Impersonation系统用preset_prompt_impersonation+charPrompt/charInstruction/charJailbreak宏"
        ],
        "正则": [
          "1. 分清三条路：import()吃ST旧格式直通/create()用Tavo新格式走w()转换",
          "2. timing：display最安全/receive有侵入性需谨慎",
          "3. 替换出的<script>经DOMPurify/iframe沙盒判定，导入成功≠替换成功≠JS执行成功",
          "4. 正则是文本替换流水线，不是JS执行器也不是状态存储",
          "5. 可导入JSON格式：{id,scriptName,findRegex,replaceString,trimStrings:[],placement,disabled,markdownOnly,promptOnly,runOnEdit,substituteRegex}"
        ],
        "宏变量": [
          "1. setvar不要放在每轮都会注入的位置当初始化（会每轮重置）",
          "2. 初始化放一次性触发处（世界书触发条目/scenario/first_mes）",
          "3. addvar三态：数字→加法/列表→追加/字符串→拼接",
          "4. 变量与宏桥接：JS API维护状态→{{getvar}}/{{getglobalvar}}读回prompt",
          "5. 作用域仅chat和global生效，character不生效"
        ],
        "全套": [
          "1. 确认玩法模式和配套资源清单",
          "2. 完成角色卡JSON（description/personality/scenario/first_mes/mes_example）",
          "3. 完成世界书JSON（常驻规则+关键词触发条目+二级关键词条目）",
          "4. 需要时完成预设JSON（自定义条目+prompt_order）",
          "5. 需要时完成正则JSON（display/send/receive时机）",
          "6. 世界书→character_book嵌入格式转换（三条路径选一条）",
          "7. 嵌入PNG：复制立绘→完成card.json→脚本嵌入→导入验证",
          "8. 交付前逐项确认：结构/内容/活人感/玩法系统/宏一致/PNG回读"
        ],
        "好感养成": [
          "1. 角色卡description写关系分层概述（陌生→认识→亲近→亲密）",
          "2. 预设写好感规则和阶段行为变化",
          "3. 宏变量{{setvar::favor::0}}/trust/stage",
          "4. 世界书写阶段行为条目（每个阶段一条，selective+二级关键词触发）",
          "5. alternate_greetings写不同阶段的备选开场白",
          "6. 好感阶梯：陌生(0-19)→认识(20-39)→熟悉(40-59)→亲近(60-79)→亲密(80-100)"
        ],
        "ARPG": [
          "1. 角色卡+世界书(技能/装备/地图)+预设(战斗规则)+变量包(HP/MP/STR/金币等)",
          "2. 正则做状态栏和技能冷却UI",
          "3. AR做HP条/装备面板/战斗日志",
          "4. {{roll::2d6}}做骰子，{{random::1::2::3}}做随机事件",
          "5. 核心铁律：脚本计算数值、更新变量(tavo.set)，AI负责描写"
        ],
        "生存模拟": [
          "1. 角色卡+世界书(环境/资源/威胁)+预设(生存规则)+变量包(食物/水/HP/日期)",
          "2. 正则做资源状态栏",
          "3. AR做生存面板",
          "4. {{random}}做天气/遭遇随机事件",
          "5. day/food/water/materials/hp/shelter等变量追踪生存状态"
        ]
      };
      const match = Object.keys(workflows).find(k => a.task.includes(k)) || '全套';
      return { content:[{ type:"text", text:`【${match}工作流】\n${workflows[match].join('\n')}` }] };
    }
  },
  get_skill_overview: {
    description: "获取 Tavo Studio Skill 总览。",
    inputSchema: { type:"object", properties:{} },
    handler: () => ({ content:[{ type:"text", text:"【Tavo Studio Skill】\n定位：Tavo/SillyTavern 角色卡、世界书、预设、正则、宏、长记忆、JS API、高级前端渲染、PNG的内容设计与文件产出。\n能力链路：角色卡字段→预设组装→宏动态注入→世界书条件触发→正则文本加工→长记忆跨会话→JS API脚本→高级渲染展示→基础设施(端点/负载均衡/TTS/模型注册表)" }] })
  },
  convert_worldbook: {
    description: "将独立世界书 JSON（entries为对象格式）转换为角色卡 character_book 嵌入格式（entries为数组+字段名映射）。",
    inputSchema: { type:"object", properties:{ worldbook_json:{ type:"string", description:"独立世界书 JSON 字符串，entries 为对象格式" }, name:{ type:"string", description:"character_book 的 name 字段，默认 '导入的世界书'" } }, required:["worldbook_json"] },
    handler: a => {
      let wb;
      try { wb = typeof a.worldbook_json === 'string' ? JSON.parse(a.worldbook_json) : a.worldbook_json; } catch(e) { return { content:[{ type:"text", text:`JSON解析失败: ${e.message}` }], isError:true }; }
      if (!wb.entries || (typeof wb.entries !== 'object')) return { content:[{ type:"text", text:"entries 不存在或格式不对（应为对象）" }], isError:true };
      const isObj = !Array.isArray(wb.entries);
      if (!isObj) return { content:[{ type:"text", text:"entries 已是数组格式，无需转换" }], isError:true };
      const entriesRaw = Object.values(wb.entries);
      const entries = entriesRaw.map((e, idx) => {
        const ne = {
          id: e.uid ?? idx,
          keys: Array.isArray(e.key) ? e.key : (e.key ? [e.key] : []),
          secondary_keys: Array.isArray(e.keysecondary) ? e.keysecondary : [],
          content: e.content || '',
          comment: e.comment || '',
          constant: !!e.constant,
          selective: !!e.selective,
          selectiveLogic: e.selectiveLogic ?? 0,
          enabled: e.disable ? !e.disable : true,
          insertion_order: e.order ?? 100,
          position: e.position === 0 ? 'before_char' : e.position === 1 ? 'after_char' : 'before_char',
          extensions: {
            position: e.position ?? 0,
            exclude_recursion: e.extensions?.exclude_recursion ?? e.excludeRecursion ?? false,
            prevent_recursion: e.extensions?.prevent_recursion ?? e.preventRecursion ?? false,
            delay_until_recursion: e.extensions?.delay_until_recursion ?? e.delayUntilRecursion ?? false,
            display_index: e.extensions?.display_index ?? e.displayIndex ?? 0,
            probability: e.probability ?? 100,
            useProbability: e.useProbability ?? false,
            depth: e.depth ?? 4,
            selectiveLogic: e.selectiveLogic ?? 0,
            group: e.group || '',
            group_override: !!e.groupOverride,
            group_weight: e.groupWeight ?? 100,
            scan_depth: e.scanDepth ?? null,
            case_sensitive: e.caseSensitive ?? null,
            match_whole_words: e.matchWholeWords ?? null,
            use_group_scoring: e.useGroupScoring ?? null,
            automation_id: e.automationId ?? '',
            role: e.role ?? 0,
            vectorized: !!e.vectorized,
            sticky: e.sticky ?? null,
            cooldown: e.cooldown ?? null,
            delay: e.delay ?? null,
            match_persona_description: !!e.matchPersonaDescription,
            match_character_description: !!e.matchCharacterDescription,
            match_character_personality: !!e.matchCharacterPersonality,
            match_character_depth_prompt: !!e.matchCharacterDepthPrompt,
            match_scenario: !!e.matchScenario,
            match_creator_notes: !!e.matchCreatorNotes,
            triggers: e.triggers || [],
            ignore_budget: !!e.ignoreBudget
          }
        };
        return ne;
      });
      const result = {
        name: a.name || '导入的世界书',
        description: wb.description || '',
        scan_depth: wb.scan_depth ?? null,
        token_budget: wb.token_budget ?? null,
        recursive_scanning: !!wb.recursive_scanning,
        extensions: wb.extensions || {},
        entries
      };
      return { content:[{ type:"text", text:JSON.stringify(result, null, 2) }] };
    }
  }
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS', 'Access-Control-Allow-Headers':'Content-Type' }
      });
    }

    if (url.pathname === '/mcp' && request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch {
        return new Response(JSON.stringify({ jsonrpc:'2.0', error:{code:-32700,message:'Parse error'}, id:null }), { status:400, headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'} });
      }

      const { method, id, params } = body || {};

      if (method === 'initialize') {
        return new Response(JSON.stringify({ jsonrpc:'2.0', id, result:{ protocolVersion:'2024-11-05', capabilities:{tools:{}}, serverInfo:{name:'制卡工具 - Tavo Studio', version:'6.0.2'} } }), { headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'} });
      }

      if (method === 'tools/list') {
        const toolsList = Object.entries(TOOLS).map(([name, tool]) => ({ name, description:tool.description, inputSchema:tool.inputSchema }));
        return new Response(JSON.stringify({ jsonrpc:'2.0', id, result:{tools:toolsList} }), { headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'} });
      }

      if (method === 'tools/call') {
        const tool = TOOLS[params?.name];
        let response;
        if (!tool) {
          response = { content:[{ type:'text', text:`工具 "${params?.name}" 不存在。可用：${Object.keys(TOOLS).join(', ')}` }], isError:true };
        } else {
          try { response = await tool.handler(params?.arguments || {}); } catch (err) { response = { content:[{ type:'text', text:`错误: ${err.message}` }], isError:true }; }
        }
        return new Response(JSON.stringify({ jsonrpc:'2.0', id, result:response }), { headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'} });
      }

      if (method === 'ping') {
        return new Response(JSON.stringify({ jsonrpc:'2.0', id, result:{} }), { headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'} });
      }

      return new Response(JSON.stringify({ jsonrpc:'2.0', id:id||null, error:{code:-32601,message:`Method '${method}' not found`} }), { headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'} });
    }

    if (url.pathname === '/' || url.pathname === '') {
      return new Response(JSON.stringify({ name:'制卡工具 - Tavo Studio', version:'6.0.2', status:'running', tools:Object.keys(TOOLS), mcpEndpoint:`${url.origin}/mcp` }), { headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'} });
    }

    return new Response('Not found', { status:404, headers:{'Access-Control-Allow-Origin':'*'} });
  }
};


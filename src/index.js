import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';

// ==================== 内嵌模板 ====================
const TEMPLATES = {
  character_card_v2_minimal: `{
  "spec": "chara_card_v2",
  "spec_version": "2.0",
  "data": {
    "name": "角色名",
    "description": "核心身份、背景、外貌。用 {{char}} 指代角色。",
    "personality": "简短性格关键词。",
    "scenario": "初始情境与关系。",
    "first_mes": "*动作描写* 对话内容。",
    "mes_example": "<START>\\n{{user}}: ...\\n{{char}}: ...",
    "creator_notes": "使用建议。",
    "system_prompt": "",
    "post_history_instructions": "",
    "alternate_greetings": [],
    "tags": [],
    "creator": "",
    "character_version": "1.0.0",
    "extensions": {}
  }
}`,
  character_card_v2_full: `{
  "spec": "chara_card_v2",
  "spec_version": "2.0",
  "data": {
    "name": "沈墨",
    "description": "{{char}} 是一名在旧港城地下情报圈中极有名气的中间人，外表冷淡克制，说话不多，但记忆力极强。{{char}} 总是穿深色长外套，戴皮手套，动作利落，给人一种随时能抽身离开的距离感。她对陌生人警惕，却会在确认 {{user}} 值得信任后逐渐展露可靠、细致和保护欲很强的一面。",
    "personality": "冷静、谨慎、记仇、观察力强、嘴硬、内里护短。",
    "scenario": "{{user}} 刚刚进入旧港城的情报交易圈，目前正与 {{char}} 建立脆弱的合作关系。两人正在一次高风险委托前的准备阶段进行对话。",
    "first_mes": "*昏黄吊灯在桌面投下一圈不稳定的光，窗外的雨正沿着旧玻璃往下淌。{{char}} 把一只薄薄的文件袋推到 {{user}} 面前，指尖在桌上轻轻点了两下。*\\n\\n“先别急着翻。”\\n\\n*她的嗓音不高，却带着一种天然让人安静下来的压迫感。*\\n\\n“在这座城里，情报值钱，失误更值钱。你要是准备听，那我就按能活下来的版本跟你说。”",
    "mes_example": "<START>\\n{{user}}: \\"你为什么愿意帮我？\\"\\n{{char}}: *沉默了一秒，微微偏头。* \\"愿意？别把话说得太好听。我只是在做一个我觉得暂时不会亏本的判断。\\"\\n<START>\\n{{user}}: \\"你现在在想什么？\\"\\n{{char}}: *轻轻抬眼，唇角像是要笑。* \\"在想你到底是不是真的不知道自己有多容易把麻烦往身上招。\\"",
    "creator_notes": "建议搭配擅长角色扮演与细节动作描写的模型使用。核心体验是高压克制感、慢热信任感和对 {{user}} 的逐步偏护。",
    "system_prompt": "{{original}}\\n补充要求：保持冷色、克制、电影感强的叙事风格，不替 {{user}} 做决定。",
    "post_history_instructions": "{{original}}\\n收尾要求：每次回复只写 {{char}} 的内容；优先延续当前场景张力。",
    "alternate_greetings": [
      "*码头夜雾压得很低，{{char}} 站在生锈的栏杆边，没有回头，只是把一张折起的便签递向 {{user}}。* \\"你来晚了三分钟。先解释，再谈合作。\\""
    ],
    "tags": ["中文", "慢热", "都市", "情报贩子"],
    "creator": "Codex",
    "character_version": "1.0.0",
    "extensions": { "world": "旧港城设定" }
  }
}`,
  worldbook_minimal: `{
  "name": "示例世界书",
  "extensions": {},
  "entries": {
    "0": {
      "uid": 0, "key": ["旧港城"], "keysecondary": [],
      "comment": "城市总述",
      "content": "旧港城是一座被海雾、走私与地下交易长期统治的沿海城市。这里公开规则很少真正生效，更多时候决定局势的是势力之间的私下默契与威慑。",
      "constant": false, "selective": false, "selectiveLogic": 0, "addMemo": true,
      "order": 100, "position": 0, "disable": false, "excludeRecursion": false,
      "preventRecursion": false, "delayUntilRecursion": false, "displayIndex": 0,
      "probability": 100, "useProbability": true, "depth": 4, "group": "",
      "groupOverride": false, "groupWeight": 100, "scanDepth": null,
      "caseSensitive": null, "matchWholeWords": null, "useGroupScoring": null,
      "automationId": "", "role": 0, "vectorized": false, "sticky": null,
      "cooldown": null, "delay": null, "matchPersonaDescription": false,
      "matchCharacterDescription": false, "matchCharacterPersonality": false,
      "matchCharacterDepthPrompt": false, "matchScenario": false,
      "matchCreatorNotes": false, "triggers": [], "ignoreBudget": false
    }
  }
}`,
  worldbook_advanced: `{
  "name": "旧港城设定",
  "extensions": {},
  "entries": {
    "0": {
      "uid": 0, "key": ["旧港城总规则"], "keysecondary": [],
      "comment": "常驻总规则",
      "content": "对话气质应偏冷色、现实、克制、危险感强。信任建立缓慢，势力冲突通过情报、交易、威慑推进。",
      "constant": true, "selective": false, "selectiveLogic": 0, "addMemo": true,
      "order": 900, "position": 0, "disable": false, "excludeRecursion": false,
      "preventRecursion": false, "delayUntilRecursion": false, "displayIndex": 0,
      "probability": 100, "useProbability": false, "depth": 4, "group": "旧港城-总则",
      "groupOverride": false, "groupWeight": 100, "scanDepth": null, "caseSensitive": null,
      "matchWholeWords": null, "useGroupScoring": null, "automationId": "", "role": 0,
      "vectorized": false, "sticky": null, "cooldown": null, "delay": null,
      "matchPersonaDescription": false, "matchCharacterDescription": false,
      "matchCharacterPersonality": false, "matchCharacterDepthPrompt": false,
      "matchScenario": false, "matchCreatorNotes": false, "triggers": [], "ignoreBudget": false
    }
  }
}`
};

// ==================== 完整官方知识库 ====================
const OFFICIAL_SPECS = {
  character_card_fields: {
    permanent_context: ["name", "description", "personality", "scenario"],
    non_permanent: ["first_mes", "mes_example"],
    all_fields: {
      name: "角色名。宏 {{char}} 引用此值。nickname 优先级高于 name。必填。",
      description: "【常驻 token 区，最重要】核心身份、背景、外貌、行为边界。用 {{char}} 指代。2-5 段。不要把硬设定只放 creator_notes。",
      personality: "【常驻 token 区】性格关键词摘要。如'冷静、谨慎、嘴硬、内里护短'。",
      scenario: "【常驻 token 区】初始关系、地点、情境。用 {{user}}。1-3 句。只写初始状态。",
      first_mes: "【风格锚点】第一条消息。用 *动作* 描写环境。模型从此学习回复长度、文风、动作密度。必填。",
      mes_example: "【口吻示范器】每段加 <START>。用 {{user}}: 和 {{char}}: 标记。2 组示例，示范说话方式。",
      creator_notes: "给人看的备注。使用建议、适配模型、版本。不放入核心设定。",
      system_prompt: "角色级主提示覆盖。用 {{original}} 保留默认。仅在 Prefer Char. Prompt 开启时生效。",
      post_history_instructions: "收尾约束。限制篇幅、格式、节奏。仅在 Prefer Char. Instructions 开启时生效。",
      alternate_greetings: "数组。2-3 个备选开场白。",
      tags: "数组。如 ['中文', '慢热', '都市']。必须为数组。",
      creator: "作者名。",
      character_version: "版本号。如 '1.0.0'。",
      extensions: "对象，必须存在，至少 {}。depth_prompt: { prompt, depth:1-4, role:'system'|'user'|'assistant' }。"
    },
    import_behavior: "tavo.character.import() 导入 CCv3 角色卡时，若含 character_book 会同时创建世界书；含 extensions.regex_scripts 会同时创建正则脚本。操作前弹窗确认。创建/更新/删除均弹窗确认。"
  },
  macros: {
    character: ["{{user}}", "{{char}}", "{{group}}", "{{charIfNotGroup}}", "{{groupNotMuted}}"],
    card_fields: ["{{charDescription}}", "{{description}}", "{{charPersonality}}", "{{personality}}",
      "{{charScenario}}", "{{scenario}}", "{{persona}}", "{{charPrompt}}", "{{charInstruction}}",
      "{{charJailbreak}}", "{{mesExamples}}", "{{mesExamplesRaw}}", "{{charVersion}}", "{{charCreatorNotes}}"],
    message: ["{{lastMessage}}", "{{input}}", "{{lastUserMessage}}", "{{lastCharMessage}}"],
    datetime: ["{{time}}", "{{date}}", "{{weekday}}", "{{isotime}}", "{{isodate}}", "{{idleDuration}}", "{{time::UTC+9}}"],
    random: ["{{random::1::3::5}}", "{{random::1,3,5}}", "{{roll::3d6}}"],
    formatting: ["{{newline}}", "{{newline::N}}", "{{space}}", "{{space::N}}", "{{trim}}", "{{noop}}", "{{//注释}}"],
    chat_variables: ["{{setvar::name::value}}", "{{addvar::name::value}}", "{{incvar::name}}", "{{decvar::name}}", "{{getvar::name}}"],
    global_variables: ["{{setglobalvar::name::value}}", "{{addglobalvar::name::value}}", "{{incglobalvar::name}}", "{{decglobalvar::name}}", "{{getglobalvar::name}}"],
    variable_types: "数字、文本、JSON 列表。addvar 对数字做加法，对列表追加元素，对字符串拼接。",
    scopes: { chat: "当前聊天，默认，可随聊天导出", global: "跨对话保存，注意命名冲突" }
  },
  worldbook_entry: {
    content_rule: "唯一注入 prompt 的字段是 content。key、comment、标题均不注入。content 必须独立成句，不能假设模型看到 key 或 comment。",
    fields: {
      uid: "数字，条目唯一编号。通常与 entries 对象键一致。",
      key: "字符串数组，主触发关键词。支持普通文本和 JS regex（/pattern/flags）。逗号分隔多个 key。",
      keysecondary: "字符串数组，二级条件关键词。配合 selective 和 selectiveLogic。",
      content: "唯一注入 prompt 的内容。必须独立成句。建议短而密，一条只讲一件事。",
      comment: "给人看的备注，不进 prompt。",
      constant: "布尔。true=常驻（适合总规则），false=关键词触发。",
      selective: "布尔。启用二级关键词逻辑。",
      selectiveLogic: "枚举：0=AND_ANY, 1=NOT_ALL, 2=NOT_ANY, 3=AND_ALL。",
      order: "数字 100-900。数值越大越靠近上下文末尾，影响越强。",
      position: "枚举：0=Before Char Defs, 1=After Char Defs, 2=Top of Author's Note, 3=Bottom of Author's Note, 4=@Depth, 5=Before Example Messages, 6=After Example Messages, 7=Outlet。",
      depth: "数字。position=4 时的聊天历史深度。",
      role: "枚举：0=system, 1=user, 2=assistant。position=4 时使用。",
      probability: "数字 0-100。100=稳定触发。",
      useProbability: "布尔。是否启用概率。",
      group: "字符串。inclusion group 名称。同组多条同时满足时只保留一条。",
      groupOverride: "布尔。",
      groupWeight: "数字。",
      scanDepth: "数字或 null。覆盖全局扫描深度。",
      caseSensitive: "布尔或 null。",
      matchWholeWords: "布尔或 null。中文建议 null/false（不用空格分词）。",
      useGroupScoring: "布尔或 null。",
      vectorized: "布尔。向量检索匹配。",
      sticky: "数字或 null。以消息数计的持续轮数。",
      cooldown: "数字或 null。冷却轮数。",
      delay: "数字或 null。延迟轮数。",
      ignoreBudget: "布尔。预算溢出时仍尽量保留。",
      displayIndex: "数字。通常与 uid 一致。"
    },
    ccv3_mapping: {
      "keys → keywords": "主触发词数组",
      "secondary_keys → secondaryKeywords": "二级关键词数组",
      "constant: true/false → strategy: 'constant'/'keyword'": "常驻/关键词触发",
      "position: 'before_char'/'after_char' → injectionPosition: 'lorebookBefore'/'lorebookAfter'": "插入位置",
      "selective: true/false → secondaryKeywordStrategy: 'andAny'/'none'": "二级关键词策略",
      "disable → enabled（取反）": "启用/禁用",
      "order → insertion_order": "插入优先级"
    }
  },
  regex_entry: {
    fields: {
      name: "规则名，便于管理。",
      findRegex: "正则表达式。如 ^\\[系统提示\\]：(.+)$。",
      replaceString: "替换内容。支持 $1, $2, {{match}}。",
      trimStrings: "替换前修剪的字符串数组。",
      placements: "数组。可选：'user', 'char', 'reasoning', 'lorebook'。默认 ['char']。",
      timing: "枚举：'display', 'send', 'sendAndDisplay', 'receive', 'editAndReceive'。默认 'display'。",
      substitution: "枚举：'none', 'raw', 'escaped'。默认 'raw'。",
      minDepth: "数字。最小消息深度。",
      maxDepth: "数字。最大消息深度。",
      enabled: "布尔。是否启用。默认 true。"
    },
    safety: "display 最安全（不改持久数据）；receive/editAndReceive 有侵入性，需谨慎。",
    import_note: "tavo.regex.import() 以 SillyTavern 正则格式导入，name 可选（缺省'Regex'），entries 为规则数组。弹窗确认。"
  },
  preset: {
    basic_prompts_fields: ["persona", "description", "personality", "scenario", "exampleMessageStart",
      "chatStart", "groupChatStart", "groupNudge", "continueNudge", "impersonation", "lorebook"],
    entry_fields: {
      identifier: "内置标识符或自定义",
      name: "条目名称",
      content: "提示词内容",
      enabled: "布尔",
      active: "布尔",
      type: "枚举：'builtin', 'marker', 'custom'",
      role: "'system'|'user'|'assistant'",
      injectionPosition: "插入位置",
      injectionDepth: "插入深度"
    },
    builtin_identifiers: ["main", "worldInfoBefore", "personaDescription", "charDescription",
      "charPersonality", "scenario", "enhanceDefinitions", "nsfw", "worldInfoAfter",
      "dialogueExamples", "chatHistory", "jailbreak"],
    import_note: "tavo.preset.import() 以 SillyTavern 预设格式导入，name 可选（缺省'Preset'）。弹窗确认。",
    update_note: "update 时 entries 直接覆盖旧数组；推荐先 get 再修改后 update。"
  },
  variables_api: {
    methods: {
      get: "tavo.get(name[, scope])。作用域默认 'chat'，可选 'global'。同步操作。",
      set: "tavo.set(name, value[, scope])。值可为数字、字符串、对象。同步操作。",
      unset: "tavo.unset(name[, scope])。删除变量。同步操作。",
      path: "支持路径形式：tavo.get('status.hp')、tavo.unset('status.hp')。"
    },
    scopes: { chat: "当前聊天，默认，可随聊天导出", global: "跨对话保存，注意命名冲突" },
    prompt_injection: "{{getvar::name}}（chat 作用域）或 {{getglobalvar::name}}（global 作用域）"
  },
  message_api: {
    find: "await tavo.message.find(indexRange, filter)。indexRange 支持：number（单条）、[start,end]（双侧闭区间）、负数（-1=最后一条）。filter: { role:'system'|'assistant'|'user', hidden:boolean, characters:array }。",
    get: "await tavo.message.get(id)。按 ID 获取单条消息。",
    current: "await tavo.message.current()。获取当前执行代码所在的消息对象。",
    count: "await tavo.message.count()。获取消息总数（含隐藏消息）。",
    append: "await tavo.message.append({content, role:'assistant'|'user', characterId, hidden})。追加消息到末尾。",
    update: "await tavo.message.update({id, content, reasoning, hidden})。更新已有消息，reasoning 可选。",
    delete: "await tavo.message.delete(id)。按 ID 删除消息。"
  },
  chat_api: {
    current: "await tavo.chat.current()。获取当前聊天信息，无聊天时返回 null。",
    update: "await tavo.chat.update({name, characters, persona})。仅更新当前聊天，characters 直接替换角色列表。"
  },
  character_api: {
    all: "await tavo.character.all()。返回角色概要数组（id, name, avatar）。",
    get: "await tavo.character.get(id)。按 ID 获取完整角色对象。",
    find: "await tavo.character.find(name, {match:'exact'|'prefix'|'suffix'|'contains'})。",
    create: "await tavo.character.create(char)。name 和 firstMes（或 first_mes）为必填。CCv3 兼容。",
    update: "await tavo.character.update(char)。id, name, firstMes 为必填。CCv3 兼容。",
    import: "await tavo.character.import(card)。导入 CCv3 角色卡，自动创建关联世界书和正则脚本。弹窗确认。",
    delete: "await tavo.character.delete(id)。弹窗确认。",
    ccv3_note: "创建和更新接受 CCv3 字段名（如 first_mes, mes_example, creator_notes），自动转换。"
  },
  persona_api: {
    all: "await tavo.persona.all()。返回用户身份概要数组。",
    get: "await tavo.persona.get(id)。",
    find: "await tavo.persona.find(name, {match})。",
    create: "await tavo.persona.create(p)。name 和 description 为必填。",
    update: "await tavo.persona.update(p)。id, name, description 为必填。",
    delete: "await tavo.persona.delete(id)。"
  },
  preset_api: {
    all: "await tavo.preset.all()。返回预设摘要数组。",
    get: "await tavo.preset.get(id)。",
    find: "await tavo.preset.find(name, {match})。",
    create: "await tavo.preset.create(p)。name 必填，basicPrompts 和 entries 缺失自动补默认值。",
    update: "await tavo.preset.update(p)。id 必填，entries 直接覆盖。",
    import: "await tavo.preset.import(p)。SillyTavern 格式导入，name 可选。弹窗确认。",
    delete: "await tavo.preset.delete(id)。"
  },
  lorebook_api: {
    all: "await tavo.lorebook.all()。返回世界书概要数组。",
    get: "await tavo.lorebook.get(id)。",
    find: "await tavo.lorebook.find(name, {match})。",
    create: "await tavo.lorebook.create(lb)。name 必填。CCv3 兼容。",
    update: "await tavo.lorebook.update(lb)。id 和 name 必填。CCv3 兼容。",
    import: "await tavo.lorebook.import(lb)。导入 CCv3 character_book 格式，自动字段映射。弹窗确认。",
    delete: "await tavo.lorebook.delete(id)。"
  },
  regex_api: {
    all: "await tavo.regex.all()。返回正则摘要数组（entries 为规则条数）。",
    get: "await tavo.regex.get(id)。",
    find: "await tavo.regex.find(name, {match})。",
    create: "await tavo.regex.create(r)。name 必填，entries 可省略。弹窗确认。",
    update: "await tavo.regex.update(r)。id 和 name 必填。推荐 get→修改→update。",
    import: "await tavo.regex.import(r)。SillyTavern 格式导入，name 可选。弹窗确认。",
    delete: "await tavo.regex.delete(id)。"
  },
  memory_api: {
    current: "await tavo.memory.current()。返回 {id, enabled, memories: string[]}。",
    update: "await tavo.memory.update({enabled, memories})。可更新字段仅 enabled 和 memories。"
  },
  generate_api: {
    call: "await tavo.generate(prompt, options)。一次性返回完整文本（非流式）。",
    options: {
      context: "boolean。true=带当前对话上下文，false=独立请求（默认）。",
      preset: "number | {id: number}。指定预设 ID。",
      settings: "{temperature, topP, maxCompletionTokens}。覆盖模型参数。"
    },
    note: "使用当前聊天绑定的模型端点；无可用端点时返回 null。"
  },
  input_api: {
    get: "await tavo.input.get()。读取输入框内容。",
    set: "tavo.input.set(text)。覆盖写入（清除原有内容）。同步。",
    append: "tavo.input.append(text)。末尾追加。同步。",
    clear: "tavo.input.clear()。清空输入框。同步。",
    send: "tavo.input.send()。触发发送当前输入框消息。同步。"
  },
  utils_api: {
    toast: "tavo.utils.toast(text)。显示轻量提示，数秒后消失。",
    openUrl: "tavo.utils.openUrl(url)。外部浏览器打开链接。",
    export: "tavo.utils.export(name, data)。导出文件并触发分享/保存。data 推荐 Base64。",
    select: "await tavo.utils.select(options, title, defaultValue)。弹出原生选择器。options 格式：string[]、{value,label}[]、{value,label,description,subtitle}[]。取消返回 null。"
  },
  app_api: {
    version: "tavo.app（持续更新中）。目前仅可获取 App 版本。"
  },
  official_resources: {
    helper_card_url: "https://tavoai.dev/app/docs/Tavo%20JS%20API%20%E6%8C%87%E5%8D%97_v0.2.png",
    description: "官方提供的 JS API 辅助角色卡，可直接导入 Tavo 查看各 API 使用示例。",
    vibe_coding: "官方鼓励'氛围编程 (Vibe Coding)'：将此文档复制给 AI，让 AI 生成与 Tavo 结合紧密的高可玩性代码。",
    async_note: "除变量操作（get/set/unset）外，所有 API 都需要 await，且必须在 async 函数内使用。",
    beta_note: "API 仍处于早期 beta 阶段（Since v0.75.0），持续建设中。"
  },
  combo_patterns: {
    "角色卡+世界书+宏": "角色设定 + 条件触发知识 + 动态变量（HP、好感度、回合数）。",
    "预设+宏": "动态提示词模板，模型每轮自动遵循状态更新规则。",
    "世界书+宏": "触发条目时初始化变量，做剧情切章或地图切换。",
    "正则+宏": "输入简写展开（-hp5→{{decvar::hp}}×5）、输出状态栏拼接。",
    "高级前端渲染+JS API": "带 UI 的互动气泡、RPG HUD、角色状态面板。",
    "长记忆+世界书": "长记忆保留动态事实，世界书保留静态设定，分层管理。",
    "JS API+角色/世界书": "脚本化批量创建或修改角色卡和世界书条目。",
    "生成请求+角色创建": "用 tavo.generate() 生成角色卡 JSON → tavo.character.create() 直接落库。"
  }
};

// ==================== 工具函数 ====================
async function callAI(env, prompt, maxTokens = 4096, temperature = 0.8) {
  const model = env.AI_MODEL || "@cf/meta/llama-4-scout-17b-16e-instruct";
  const response = await env.AI.run(model, {
    messages: [{ role: "user", content: prompt }],
    max_tokens: maxTokens,
    temperature
  });
  return response.response || response.choices?.[0]?.message?.content || "";
}

function extractJSON(raw) {
  let s = raw.trim();
  const m = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) s = m[1].trim();
  return s;
}

function buildFullSpecPrompt() {
  return `
【Tavo/SillyTavern 官方完整规范 - 必须严格遵循】

一、角色卡规范 (chara_card_v2 / CCv3)
- 常驻 token 区: description, personality, scenario, name。
- 非永久: first_mes, mes_example。
- 字段指南：
  · description：核心身份、背景、外貌、行为边界。用 {{char}}。2-5 段。
  · personality：简短关键词。
  · scenario：初始关系、地点。用 {{user}}。
  · first_mes：第一条消息，用 *动作* 描写环境。决定风格。
  · mes_example：加 <START>，用 {{user}}: 和 {{char}}: 标记。2 组示例。
  · system_prompt：用 {{original}} 保留默认。
  · alternate_greetings：数组。
  · tags：数组。
  · extensions：至少 {}。

二、宏系统
- 角色：{{user}}, {{char}}
- 聊天变量：{{setvar::name::value}}, {{getvar::name}}, {{incvar::name}}, {{decvar::name}}
- 全局变量：{{setglobalvar::name::value}}, {{getglobalvar::name}}
- 时间：{{time}}, {{date}}, {{weekday}}
- 随机：{{random::1,3,5}}, {{roll::3d6}}

三、世界书规范
- 唯一注入 prompt 的是 content，必须独立成句。
- 常驻规则用 constant: true；具体条目用关键词触发；中文 matchWholeWords 为 null。
- 字段：uid, key, keysecondary, content, constant, selective, selectiveLogic(0=AND_ANY), order(100-900, 越大约靠后), position(0=before_char,1=after_char), probability(100), depth(4), group, sticky, cooldown, delay。

四、正则
- 字段：findRegex, replaceString($1,$2), placements(['user','char','lorebook']), timing('display'最安全), substitution('none','raw','escaped')。

五、组合玩法
- 角色卡+世界书+宏：动态变量（HP、好感度）
- 正则+宏：输入简写展开
- 世界书条目内可使用宏初始化变量。
`;
}

// ==================== PNG 嵌入 ====================
async function embedJsonIntoDefaultPng(jsonStr) {
  JSON.parse(jsonStr);
  const pngB64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==";
  const buf = Uint8Array.from(atob(pngB64), c => c.charCodeAt(0));
  const chunks = parsePngChunks(buf).filter(c => {
    if (c.type !== 'tEXt') return true;
    const idx = c.data.indexOf(0);
    return new TextDecoder().decode(c.data.subarray(0, idx)).toLowerCase() !== 'chara';
  });
  const charaB64 = btoa(unescape(encodeURIComponent(jsonStr)));
  const charaChunk = mkTextChunk('chara', charaB64);
  const i = chunks.findIndex(c => c.type === 'IEND');
  if (i === -1) throw new Error('no IEND');
  chunks.splice(i, 0, charaChunk);
  return btoa(String.fromCharCode(...new Uint8Array(buildPngBuf(chunks))));
}

function parsePngChunks(b) {
  const sig = new Uint8Array([137,80,78,71,13,10,26,10]);
  if (!sig.every((v,i)=>b[i]===v)) throw new Error('bad png');
  const r = []; let o = 8;
  while (o < b.length) {
    const len = new DataView(b.buffer,o,4).getUint32(0,false);
    const t = new TextDecoder().decode(b.subarray(o+4,o+8));
    const d = b.subarray(o+8,o+8+len);
    r.push({type:t,data:d}); o+=12+len; if(t==='IEND') break;
  }
  return r;
}

function mkTextChunk(k, t) {
  const e = new TextEncoder(); const kb = e.encode(k), tb = e.encode(t);
  const d = new Uint8Array(kb.length+1+tb.length);
  d.set(kb,0); d[kb.length]=0; d.set(tb,kb.length+1);
  return {type:'tEXt',data:d};
}

function buildPngBuf(cs) {
  const sig = new Uint8Array([137,80,78,71,13,10,26,10]);
  const p = [sig];
  for (const c of cs) {
    const lb = new Uint8Array(4); new DataView(lb.buffer).setUint32(0,c.data.length,false);
    const tb = new TextEncoder().encode(c.type);
    const ci = new Uint8Array(tb.length+c.data.length); ci.set(tb,0); ci.set(c.data,tb.length);
    const crc = crc32(ci); const cb = new Uint8Array(4); new DataView(cb.buffer).setUint32(0,crc,false);
    p.push(lb,tb,c.data,cb);
  }
  const total = p.reduce((s,x)=>s+x.length,0);
  const r = new Uint8Array(total); let off = 0;
  for (const x of p) { r.set(x,off); off+=x.length; }
  return r.buffer;
}

function crc32(d) {
  let c = 0xFFFFFFFF;
  for (const b of d) { c^=b; for(let i=0;i<8;i++) c=(c>>>1)^(c&1?0xEDB88320:0); }
  return (c^0xFFFFFFFF)>>>0;
}

// ==================== 工具注册 ====================
function registerTools(server) {
  server.tool("generate_character_card", "根据描述生成一个完整的 SillyTavern v2 角色卡 JSON（兼容 Tavo CCv3）。", {
    character_description: z.string().describe("角色的自然语言描述，包括名字、身份、性格、风格、世界观等。")
  }, async ({ character_description }, extra) => {
    const env = extra.env;
    const spec = buildFullSpecPrompt();
    const prompt = `你是一个 SillyTavern 角色卡生成器。${spec}
【角色卡生成任务】输出纯 JSON 对象，无 markdown。
JSON 结构：{"spec":"chara_card_v2","spec_version":"2.0","data":{"name":"","description":"","personality":"","scenario":"","first_mes":"","mes_example":"","creator_notes":"","system_prompt":"","post_history_instructions":"","alternate_greetings":[],"tags":[],"creator":"AI Generator","character_version":"1.0.0","extensions":{}}}
高质量参考 (沈墨)：${TEMPLATES.character_card_v2_full?.substring(0, 3000)}
用户描述：${character_description}`;
    try {
      const raw = await callAI(env, prompt, 4096, 0.8);
      const jsonStr = extractJSON(raw);
      let card;
      try { card = JSON.parse(jsonStr); } catch {
        return { content: [{ type: "text", text: `JSON 解析失败。原始输出：\n\n${raw.substring(0, 2000)}` }] };
      }
      card.spec = card.spec || "chara_card_v2";
      card.spec_version = card.spec_version || "2.0";
      card.data = card.data || {};
      card.data.extensions = card.data.extensions || {};
      if (!Array.isArray(card.data.alternate_greetings)) card.data.alternate_greetings = [];
      if (!Array.isArray(card.data.tags)) card.data.tags = [];
      return { content: [{ type: "text", text: JSON.stringify(card, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: `生成失败：${err.message}` }] };
    }
  });

  server.tool("generate_worldbook", "根据世界观描述生成一个 SillyTavern 世界书 JSON。", {
    world_description: z.string().describe("世界的描述，包括规则、地点、派系、历史等。")
  }, async ({ world_description }, extra) => {
    const env = extra.env;
    const spec = buildFullSpecPrompt();
    const prompt = `你是一个 SillyTavern 世界书生成器。${spec}
【世界书生成任务】输出纯 JSON，结构：{"name":"世界书名","extensions":{},"entries":{"0":{...}}}
每个条目必须包含：uid, key, keysecondary, comment, content, constant, selective, selectiveLogic, order, position, disable, excludeRecursion, preventRecursion, delayUntilRecursion, displayIndex, probability, useProbability, depth, group, groupOverride, groupWeight, scanDepth, caseSensitive, matchWholeWords, useGroupScoring, automationId, role, vectorized, sticky, cooldown, delay, matchPersonaDescription, matchCharacterDescription, matchCharacterPersonality, matchCharacterDepthPrompt, matchScenario, matchCreatorNotes, triggers, ignoreBudget。
设计原则：拆成多个短条目；常驻规则用 constant:true；content 独立成句；中文 matchWholeWords 为 null。
参考模板：${TEMPLATES.worldbook_advanced?.substring(0, 2000)}
用户描述：${world_description}
生成至少 3 个条目。`;
    try {
      const raw = await callAI(env, prompt, 4096, 0.7);
      const jsonStr = extractJSON(raw);
      let wb;
      try { wb = JSON.parse(jsonStr); } catch {
        return { content: [{ type: "text", text: `JSON 解析失败。原始输出：\n\n${raw.substring(0, 2000)}` }] };
      }
      wb.entries = wb.entries || {};
      wb.extensions = wb.extensions || {};
      return { content: [{ type: "text", text: JSON.stringify(wb, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: `生成失败：${err.message}` }] };
    }
  });

  server.tool("get_template", "获取角色卡或世界书的参考模板。", {
    template_name: z.enum(["character-card.v2.minimal","character-card.v2.full","worldbook.minimal","worldbook.advanced"])
  }, async ({ template_name }) => {
    const key = template_name.replace(/\./g,"_").replace(/-/g,"_");
    const content = TEMPLATES[key] || "模板未找到。";
    let fmt;
    try { fmt = JSON.stringify(JSON.parse(content), null, 2); } catch { fmt = content; }
    return { content: [{ type: "text", text: fmt }] };
  });

  server.tool("get_field_guide", "获取角色卡/世界书/宏/正则/预设字段的官方规范指南。", {
    field: z.enum([
      "description","personality","scenario","first_mes","mes_example","creator_notes",
      "system_prompt","post_history_instructions","tags","extensions","character_book",
      "worldbook_entry","macros","regex","preset","variables","all"
    ])
  }, async ({ field }) => {
    const spec = OFFICIAL_SPECS;
    const guide = {
      description: `【description - 常驻 token 区】${spec.character_card_fields.all_fields.description}`,
      personality: `【personality】${spec.character_card_fields.all_fields.personality}`,
      scenario: `【scenario】${spec.character_card_fields.all_fields.scenario}`,
      first_mes: `【first_mes】${spec.character_card_fields.all_fields.first_mes}`,
      mes_example: `【mes_example】${spec.character_card_fields.all_fields.mes_example}`,
      creator_notes: `【creator_notes】${spec.character_card_fields.all_fields.creator_notes}`,
      system_prompt: `【system_prompt】${spec.character_card_fields.all_fields.system_prompt}`,
      post_history_instructions: `【post_history_instructions】${spec.character_card_fields.all_fields.post_history_instructions}`,
      tags: `【tags】${spec.character_card_fields.all_fields.tags}`,
      extensions: `【extensions】${spec.character_card_fields.all_fields.extensions}`,
      character_book: "【嵌入世界书】entries 为数组，字段映射：keys, secondary_keys, enabled, insertion_order, position。",
      worldbook_entry: `【世界书条目】${spec.worldbook_entry.content_rule} 字段：${JSON.stringify(spec.worldbook_entry.fields, null, 2)}`,
      macros: `【宏系统】聊天变量：${spec.macros.chat_variables.join(", ")} 全局变量：${spec.macros.global_variables.join(", ")} 作用域：${JSON.stringify(spec.macros.scopes)}`,
      regex: `【正则】字段：${JSON.stringify(spec.regex_entry.fields)} 安全：${spec.regex_entry.safety}`,
      preset: "【预设】Main Prompt 主控制，Post-History Instructions 输出约束。",
      variables: "【变量 API】tavo.get/set/unset，作用域 chat/global，提示词中 {{getvar::name}}。",
      all: "【核心规则】1. 常驻 token：description,personality,scenario,name。2. first_mes 决定风格。3. 世界书 content 独立成句。4. 宏做状态追踪。5. 正则 display 最安全。"
    };
    return { content: [{ type: "text", text: guide[field] || guide.all }] };
  });

  server.tool("generate_png_card", "生成角色卡 JSON 并嵌入默认 PNG，返回 Base64 数据。", {
    character_description: z.string().describe("角色的自然语言描述。")
  }, async ({ character_description }, extra) => {
    const env = extra.env;
    const spec = buildFullSpecPrompt();
    const genPrompt = `生成一个 chara_card_v2 角色卡 JSON，无额外文字。${spec} 描述：${character_description}`;
    let cardJson;
    try {
      const raw = await callAI(env, genPrompt, 4096, 0.8);
      const jsonStr = extractJSON(raw);
      const parsed = JSON.parse(jsonStr);
      parsed.spec = parsed.spec || "chara_card_v2";
      parsed.spec_version = parsed.spec_version || "2.0";
      parsed.data = parsed.data || {};
      parsed.data.extensions = parsed.data.extensions || {};
      if (!Array.isArray(parsed.data.alternate_greetings)) parsed.data.alternate_greetings = [];
      if (!Array.isArray(parsed.data.tags)) parsed.data.tags = [];
      cardJson = JSON.stringify(parsed);
    } catch (e) {
      return { content: [{ type: "text", text: `JSON 生成失败：${e.message}` }] };
    }
    try {
      const pngB64 = await embedJsonIntoDefaultPng(cardJson);
      return { content: [
        { type: "text", text: `✅ PNG 角色卡已生成。Base64 数据：\n\n${pngB64}` },
        { type: "text", text: `📋 内嵌 JSON：\n${cardJson}` }
      ]};
    } catch (e) {
      return { content: [{ type: "text", text: `PNG 嵌入失败：${e.message}。纯 JSON：\n${cardJson}` }] };
    }
  });
}

// ==================== Worker 入口 ====================
export default {
  async fetch(request, env) {
    const server = new McpServer({
      name: "Tavo Studio - Full Spec Card & Worldbook Generator",
      version: "2.1.0"
    }, { capabilities: { tools: {} } });

    // 劫持 tool 注册以注入 env 给处理函数
    const originalTool = server.tool.bind(server);
    server.tool = (name, description, schema, handler) => {
      originalTool(name, description, schema, async (args) => {
        return handler(args, { env });
      });
    };
    registerTools(server);

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    await server.connect(transport);
    return transport.handleRequest(request);
  }
};
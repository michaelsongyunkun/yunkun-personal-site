const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const introStorageKey = "yunkun-ai-education-core-v2";
const languageStorageKey = "yunkun-site-language";

const aiIntro = document.getElementById("aiIntro");
const aiIntroCanvas = document.getElementById("aiIntroCanvas");
const aiIntroCtx = aiIntroCanvas?.getContext("2d");
const aiIntroStatus = document.getElementById("aiIntroStatus");
const aiIntroSkip = document.getElementById("aiIntroSkip");
let aiIntroFrame = 0;
let aiIntroTimer = 0;
let aiIntroStart = 0;
let aiIntroParticles = [];
let aiIntroSignals = [];
let aiIntroRunning = false;

const readIntroPlayed = () => {
  try {
    return sessionStorage.getItem(introStorageKey) === "played";
  } catch (_error) {
    return false;
  }
};

const writeIntroPlayed = () => {
  try {
    sessionStorage.setItem(introStorageKey, "played");
  } catch (_error) {
    /* Session storage can be blocked in strict browser modes. */
  }
};

const introStatusFrames = [
  [0, "EDUCATION CORE OFFLINE"],
  [0.08, "STUDENT SIGNAL DETECTED"],
  [0.18, "PROFILE GRAPH BUILDING"],
  [0.3, "SCHOOL CONTEXT RETRIEVED"],
  [0.42, "STRATEGY ENGINE IGNITING"],
  [0.54, "AI ADVISING CORE ONLINE"],
  [0.66, "AGENTS ORCHESTRATED"],
  [0.78, "OPENING EDUCATION CONSOLE"],
  [0.92, "EVIDENCE HANDOFF"],
];

const setIntroStatus = (progress) => {
  if (!aiIntroStatus) return;
  const frame = introStatusFrames.reduce((active, item) => (progress >= item[0] ? item : active), introStatusFrames[0]);
  aiIntroStatus.textContent = frame[1];
};

const resizeAiIntroCanvas = () => {
  if (!aiIntroCanvas || !aiIntroCtx) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  aiIntroCanvas.width = Math.max(1, Math.floor(width * ratio));
  aiIntroCanvas.height = Math.max(1, Math.floor(height * ratio));
  aiIntroCanvas.style.width = `${width}px`;
  aiIntroCanvas.style.height = `${height}px`;
  aiIntroCtx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const particleCount = width < 760 ? 96 : 168;
  aiIntroParticles = Array.from({ length: particleCount }, (_, index) => {
    const angle = (index / particleCount) * Math.PI * 2;
    const ring = 62 + (index % 6) * 34;
    const edge = index % 4;
    const fromX = edge === 0 ? -80 : edge === 1 ? width + 80 : Math.random() * width;
    const fromY = edge === 2 ? -80 : edge === 3 ? height + 80 : Math.random() * height;
    return {
      fromX,
      fromY,
      x: fromX,
      y: fromY,
      targetX: width * 0.5 + Math.cos(angle) * ring * (0.7 + (index % 3) * 0.18),
      targetY: height * 0.5 + Math.sin(angle) * ring * (0.48 + (index % 4) * 0.12),
      phase: Math.random() * Math.PI * 2,
      size: index % 11 === 0 ? 2.8 : 1.45,
      group: index % 5,
    };
  });

  aiIntroSignals = Array.from({ length: width < 760 ? 14 : 26 }, (_, index) => ({
    angle: (index / 26) * Math.PI * 2,
    radius: 120 + (index % 7) * 38,
    speed: 0.65 + (index % 5) * 0.14,
    phase: Math.random() * Math.PI * 2,
  }));
};

const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
const clampIntro = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const segmentProgress = (progress, start, end) => clampIntro((progress - start) / (end - start));

const drawAiIntro = (now) => {
  if (!aiIntroCanvas || !aiIntroCtx || !aiIntroRunning) return;
  const width = aiIntroCanvas.clientWidth;
  const height = aiIntroCanvas.clientHeight;
  const elapsed = now - aiIntroStart;
  const progress = clampIntro(elapsed / 8000);
  const tokenProgress = easeOutCubic(segmentProgress(progress, 0.1, 0.32));
  const networkProgress = easeOutCubic(segmentProgress(progress, 0.24, 0.48));
  const ignitionProgress = easeOutCubic(segmentProgress(progress, 0.44, 0.58));
  const agentProgress = easeOutCubic(segmentProgress(progress, 0.62, 0.76));
  const portalProgress = easeOutCubic(segmentProgress(progress, 0.78, 0.98));
  const centerX = width * 0.5;
  const centerY = height * 0.5;

  setIntroStatus(progress);
  aiIntroCtx.clearRect(0, 0, width, height);
  aiIntroCtx.save();
  aiIntroCtx.globalCompositeOperation = "lighter";

  const scanY = height * (0.1 + ((elapsed * 0.00012) % 1) * 0.9);
  const scanGradient = aiIntroCtx.createLinearGradient(0, scanY - 36, 0, scanY + 36);
  scanGradient.addColorStop(0, "rgba(255,255,255,0)");
  scanGradient.addColorStop(0.5, "rgba(180,198,255,0.2)");
  scanGradient.addColorStop(1, "rgba(255,255,255,0)");
  aiIntroCtx.fillStyle = scanGradient;
  aiIntroCtx.globalAlpha = 0.55;
  aiIntroCtx.fillRect(0, scanY - 36, width, 72);

  aiIntroParticles.forEach((particle, index) => {
    const drift = Math.sin(elapsed * 0.0012 + particle.phase) * 18;
    const x = particle.fromX + (particle.targetX - particle.fromX) * tokenProgress + Math.cos(particle.phase) * drift * (1 - networkProgress);
    const y = particle.fromY + (particle.targetY - particle.fromY) * tokenProgress + Math.sin(particle.phase) * drift * (1 - networkProgress);
    particle.x = x + Math.cos(elapsed * 0.0004 + particle.phase) * 10 * agentProgress;
    particle.y = y + Math.sin(elapsed * 0.0005 + particle.phase) * 8 * agentProgress;

    const active = particle.group === index % 5;
    aiIntroCtx.fillStyle = active ? "rgba(220,228,255,0.88)" : "rgba(95,125,255,0.58)";
    aiIntroCtx.globalAlpha = 0.15 + tokenProgress * 0.7 - portalProgress * 0.42;
    aiIntroCtx.beginPath();
    aiIntroCtx.arc(particle.x, particle.y, particle.size + ignitionProgress * 0.9, 0, Math.PI * 2);
    aiIntroCtx.fill();

    if (index % 5 === 0 && tokenProgress > 0.08 && tokenProgress < 0.88) {
      aiIntroCtx.strokeStyle = "rgba(142,164,255,0.26)";
      aiIntroCtx.globalAlpha = (1 - Math.abs(tokenProgress - 0.45)) * 0.34;
      aiIntroCtx.lineWidth = 1;
      aiIntroCtx.beginPath();
      aiIntroCtx.moveTo(particle.fromX, particle.fromY);
      aiIntroCtx.lineTo(particle.x, particle.y);
      aiIntroCtx.stroke();
    }
  });

  if (networkProgress > 0.12) {
    for (let i = 0; i < aiIntroParticles.length; i += 1) {
      for (let j = i + 1; j < aiIntroParticles.length; j += 1) {
        if ((i + j) % 7 !== 0) continue;
        const a = aiIntroParticles[i];
        const b = aiIntroParticles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 118) continue;
        aiIntroCtx.strokeStyle = "rgba(120,148,255,0.34)";
        aiIntroCtx.globalAlpha = (1 - distance / 118) * networkProgress * (1 - portalProgress * 0.7);
        aiIntroCtx.lineWidth = 0.8;
        aiIntroCtx.beginPath();
        aiIntroCtx.moveTo(a.x, a.y);
        aiIntroCtx.lineTo(b.x, b.y);
        aiIntroCtx.stroke();
      }
    }
  }

  if (ignitionProgress > 0) {
    const shock = ignitionProgress * Math.max(width, height) * 0.58;
    const shockAlpha = Math.sin(ignitionProgress * Math.PI);
    aiIntroCtx.strokeStyle = "rgba(245,248,255,0.9)";
    aiIntroCtx.globalAlpha = shockAlpha * 0.55;
    aiIntroCtx.lineWidth = 2 + ignitionProgress * 5;
    aiIntroCtx.beginPath();
    aiIntroCtx.arc(centerX, centerY, shock, 0, Math.PI * 2);
    aiIntroCtx.stroke();
  }

  aiIntroSignals.forEach((signal, index) => {
    if (agentProgress <= 0) return;
    const angle = signal.angle + elapsed * 0.001 * signal.speed;
    const radius = signal.radius * (0.62 + agentProgress * 0.55);
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius * 0.58;
    aiIntroCtx.strokeStyle = "rgba(95,125,255,0.42)";
    aiIntroCtx.globalAlpha = agentProgress * (1 - portalProgress * 0.62);
    aiIntroCtx.lineWidth = 1;
    aiIntroCtx.beginPath();
    aiIntroCtx.moveTo(centerX, centerY);
    aiIntroCtx.lineTo(x, y);
    aiIntroCtx.stroke();
    aiIntroCtx.fillStyle = index % 3 === 0 ? "rgba(255,255,255,0.94)" : "rgba(138,160,255,0.9)";
    aiIntroCtx.beginPath();
    aiIntroCtx.arc(x, y, index % 3 === 0 ? 3 : 2, 0, Math.PI * 2);
    aiIntroCtx.fill();
  });

  if (portalProgress > 0) {
    const portalRadius = 80 + portalProgress * Math.max(width, height) * 0.68;
    const portalGradient = aiIntroCtx.createRadialGradient(centerX, centerY, portalRadius * 0.12, centerX, centerY, portalRadius);
    portalGradient.addColorStop(0, "rgba(255,255,255,0)");
    portalGradient.addColorStop(0.32, "rgba(255,255,255,0.24)");
    portalGradient.addColorStop(0.42, "rgba(95,125,255,0.38)");
    portalGradient.addColorStop(1, "rgba(255,255,255,0)");
    aiIntroCtx.fillStyle = portalGradient;
    aiIntroCtx.globalAlpha = 0.7 * (1 - segmentProgress(progress, 0.94, 1));
    aiIntroCtx.beginPath();
    aiIntroCtx.arc(centerX, centerY, portalRadius, 0, Math.PI * 2);
    aiIntroCtx.fill();
  }

  aiIntroCtx.restore();
  aiIntroFrame = requestAnimationFrame(drawAiIntro);
};

const finishAiIntro = () => {
  if (!aiIntro) return;
  aiIntroRunning = false;
  window.clearTimeout(aiIntroTimer);
  if (aiIntroFrame) cancelAnimationFrame(aiIntroFrame);
  window.removeEventListener("resize", resizeAiIntroCanvas);
  writeIntroPlayed();
  document.body.classList.remove("intro-lock");
  aiIntro.classList.add("is-hidden");
  aiIntro.setAttribute("aria-hidden", "true");
  window.setTimeout(() => {
    aiIntro.remove();
  }, 650);
};

if (aiIntro) {
  if (readIntroPlayed()) {
    aiIntro.classList.add("is-hidden");
    aiIntro.setAttribute("aria-hidden", "true");
    aiIntro.remove();
  } else {
    document.body.classList.add("intro-lock");
    aiIntroSkip?.addEventListener("click", finishAiIntro);

    if (reduceMotion) {
      setIntroStatus(1);
      aiIntroTimer = window.setTimeout(finishAiIntro, 850);
    } else {
      resizeAiIntroCanvas();
      aiIntroRunning = true;
      aiIntroStart = performance.now();
      aiIntroFrame = requestAnimationFrame(drawAiIntro);
      aiIntroTimer = window.setTimeout(finishAiIntro, 8200);
      window.addEventListener("resize", resizeAiIntroCanvas, { passive: true });
    }
  }
}

const copy = {
  zh: {
    pageTitle: "宋昀锟 Song Yunkun | AI Education Product Builder",
    metaDescription: "宋昀锟 Song Yunkun 的 AI Education Product Builder 个人网站，面向招生官与实习招聘方展示 AI 教育产品、申请规划系统、RAG、Agent 工作流和全栈原型交付。",
    skip: "跳到正文",
    navWork: "作品",
    navAudience: "受众",
    navSystem: "方法",
    navStack: "能力",
    navArchive: "档案",
    navContact: "联系",
    langButton: "EN",
    heroKicker: "AI Education Command Center / 申请规划系统 / 全栈原型",
    heroTitle: "宋昀锟",
    heroSubtitle: "我把学生信号、AI 工作流和工程交付组织成可运行、可测试、可验证的教育产品系统。",
    ctaWork: "查看作品",
    ctaResume: "下载简历",
    metricOne: "美本平台测试文件",
    metricTwo: "需求与反馈分类",
    metricThree: "澄清项",
    metricFour: "路线图候选",
    metricFive: "内容浏览",
    metricSix: "数模论文一作",
    metricDetailOne: "覆盖认证、RAG、规划、推荐、导出和页面布局的工程证据。",
    metricDetailTwo: "把课堂、会议、申请、知识管理反馈拆成可执行需求池。",
    metricDetailThree: "用于追问用户、定义边界和判断真实教育场景。",
    metricDetailFour: "沉淀为 AI 教育产品的版本计划和优先级材料。",
    metricDetailFive: "来自搜索曝光、内容结构和转化话术优化。",
    metricDetailSix: "用研究成果补足教育决策、建模和评估可信度。",
    audienceTitle: "Two Review Modes",
    audienceIntro: "这个网站不是普通简历页，而是一套面向招生官与实习招聘方的双模式证据控制台。",
    audienceOneLabel: "Admissions Mode",
    audienceOneTitle: "用 AI 赋能教育选择",
    audienceOneBody: "对招生官，我呈现的是数学教育背景、研究可信度、教育产品实践和对学生决策场景的长期投入。",
    audienceOnePointA: "Boston University 数学与数学教育方向",
    audienceOnePointB: "SCI JCR Q2 数模论文一作与软件著作权",
    audienceOnePointC: "把申请规划、学习反馈和资源推荐做成 AI 产品",
    audienceTwoLabel: "Recruiting Mode",
    audienceTwoTitle: "能把 AI 想法交付成系统",
    audienceTwoBody: "对招聘方，我强调 AI 产品经理能力、技术项目管理能力、全栈原型能力和把反馈转成路线图的执行力。",
    audienceTwoPointA: "RAG、Agent、Prompt、API 与文档导出工作流",
    audienceTwoPointB: "前后端、认证、SQLite 持久化和回归测试",
    audienceTwoPointC: "从 341 条反馈到澄清清单、优先级和版本节奏",
    workTitle: "Selected Work",
    workIntro: "三个案例按教育问题、AI 系统和交付证据展开，展示我如何把教育场景做成产品。",
    motionTitle: "Mission Console",
    motionIntro: "页面以 Cobalt Intelligence Palette、生成式网络和滚动状态机组织信息：每个动态都对应一个产品动作，而不是装饰。",
    motionOneLabel: "Student Signal",
    motionOneTitle: "学生画像信号场",
    motionOneBody: "细网格、节点和指针光场只用于表达学生目标、活动、成绩和家庭约束被系统捕捉。",
    motionTwoLabel: "Strategy Rhythm",
    motionTwoTitle: "申请策略推演节奏",
    motionTwoBody: "滚动时路径线、分层卡片和数字指标依次点亮，形成从画像到策略再到测试的节奏。",
    motionThreeLabel: "Evidence Console",
    motionThreeTitle: "可验证的交付反馈",
    motionThreeBody: "Cobalt 表示当前系统动作，绿色表示验证通过，琥珀表示增长证据，红色只保留给风险。",
    caseOneRole: "AI 产品经理 / 独立开发",
    caseOneTitle: "AI 美本规划工作台",
    caseOneBody: "面向国际生及家庭的申请规划平台，整合学生档案、DeepSeek 自动规划、资源库 RAG、院校百科、活动质量检查、导出和后台认证，让申请咨询从经验判断变成可追踪系统。",
    caseOnePointA: "DeepSeek 一键生成 10 项 Common App 活动规划并解析进表格",
    caseOnePointB: "RAG 问答连接学生备份、资源库、院校百科和申请档案",
    caseOnePointC: "72 个测试文件覆盖认证、规划、推荐、导出和页面体验",
    caseTwoRole: "内容增长产品 / AI 文案工作流",
    caseTwoTitle: "小红书文案写作大师",
    caseTwoBody: "把内容 brief、选题、标题、正文、标签和发布建议做成可运行的 AI 生成工作台，用来验证搜索意图、内容结构和私信转化表达。",
    caseTwoPointA: "Next.js MVP 覆盖标题、正文、标签、发布建议和历史记录",
    caseTwoPointB: "无 API Key 时提供 mock 兜底，便于完整演示",
    caseTwoPointC: "与 20,000+ 内容浏览、搜索曝光和私信转化方法衔接",
    caseThreeRole: "企业级 AI 工作流 / 招聘评估",
    caseThreeTitle: "AI Recruiting Assistant",
    caseThreeBody: "本地优先的招聘工作流应用，覆盖职位标准、简历解析、产品经理简历评分、面试指南、结果计算、审计与公平性支持。",
    caseThreePointA: "18 个测试文件覆盖解析、评分、面试、审计和模型连接",
    caseThreePointB: "用户自有模型密钥，无隐藏平台兜底",
    caseThreePointC: "明确保留人工最终决策，避免 AI 分数成为唯一依据",
    systemTitle: "AI Education Operating System",
    systemIntro: "我把 AI 教育产品拆成六个可复用阶段，每个阶段都必须有输入、判断和可验证产出。",
    stepOne: "收集学生目标、家庭约束、学习反馈、访谈材料和真实场景输入。",
    stepTwo: "把学生档案、院校信息、活动素材和资源库整理成可检索上下文。",
    stepThree: "形成选校匹配、活动建议、优先级依据、澄清清单和版本排期材料。",
    stepFour: "设计提示词、RAG、Agent Skills 和 API 调用流程，让策略生成有上下文。",
    stepFive: "落地前后端、认证、导出、数据持久化和回归测试。",
    stepSix: "把交付结果重新接回学生反馈、申请结果和下一轮产品节奏。",
    stackTitle: "Capability Matrix",
    stackIntro: "能力展示不只列工具名，而是说明这些工具如何服务教育产品、申请规划和可验证交付。",
    tabAI: "AI 教育",
    tabWeb: "产品交付",
    tabOps: "增长证据",
    tabDocs: "研究输出",
    tabDesign: "设计系统",
    stackEmptyKicker: "SELECT A CAPABILITY",
    stackEmptyBody: "点击上方任一能力按钮后，这里只显示对应能力层的内容和动态示意。",
    panelAITitle: "AI Education Layer",
    panelAIBody: "Prompt Engineering、RAG、Agent Skills、学生画像、申请策略、OpenAI Responses API、DeepSeek-compatible API。",
    panelWebTitle: "Product Delivery Layer",
    panelWebBody: "HTML、CSS、JavaScript、TypeScript、React、Next.js、Node.js、REST API、SQLite、better-sqlite3、认证与测试。",
    panelOpsTitle: "Growth Evidence Layer",
    panelOpsBody: "用户反馈整理、需求分类、优先级评估、关键词挖掘、搜索意图分析、小红书内容策划、私信转化和 2 万+ 浏览验证。",
    panelDocsTitle: "Research Output Layer",
    panelDocsBody: "Markdown、YAML、JSON、CSV / XLSX、python-docx、Word 可打开的 .doc HTML 文档导出、数模论文与 Scholar 档案。",
    panelDesignTitle: "Cobalt Intelligence Design System",
    panelDesignBody: "冷白、石墨黑和信号钴蓝构成成熟科技底色；绿色只表达验证通过，琥珀只表达增长证据，红色只表达风险。",
    archiveTitle: "Archive Wall",
    archiveIntro: "把私人办公文件夹里的真实项目做成可扫描的证据档案，每张卡都对应一个可运行原型、文档资产或产品方法。",
    archiveTypeOne: "旗舰教育系统",
    archiveOne: "美本申请规划 Agent",
    archiveFrontOne: "学生画像、院校知识、活动规划和质量检查被组织成一套可测试的申请策略控制台。",
    archiveTypeTwo: "增长内容工具",
    archiveTwo: "小红书文案写作大师",
    archiveFrontTwo: "把 brief、语气、字数、标题、正文、标签和发布建议合成一条完整内容生产流水线。",
    archiveTypeThree: "企业 AI",
    archiveThree: "AI Recruiting Assistant",
    archiveFrontThree: "把岗位标准、简历解析、评分、面试指南和人工复核串成审计友好的招聘流程。",
    archiveTypeFour: "上线原型",
    archiveFour: "AI Cooking Coach",
    archiveFrontFour: "以本地优先方式生成 7 日轻食计划，并把菜谱、采购、备餐和周复盘接成执行台。",
    archiveTypeFive: "本地陪伴 MVP",
    archiveFive: "栖声 AI Emotional Companion",
    archiveFrontFive: "用本地记忆、角色边界、风险拦截和反馈记录搭建安全可控的陪伴产品骨架。",
    archiveTypeSix: "娱乐测评产品",
    archiveSix: "爱豆匹配测试",
    archiveFrontSix: "15 题体验版和 40 题专业版结合候选库，让用户得到 Top 1 / Top 3 匹配与入坑路径。",
    archiveTypeSeven: "文档工作流",
    archiveSeven: "AI Resume Polisher",
    archiveFrontSeven: "把 TXT / DOCX 简历、目标 JD、Coze 文件上传和工作流调用做成可运行的本地工作台。",
    archiveTypeEight: "反思型 AI 工具",
    archiveEight: "塔罗圣殿",
    archiveFrontEight: "本地完成抽牌和牌阵结构，DeepSeek 负责生成带行动建议的中文反思报告。",
    archiveTypeNine: "规划原型",
    archiveNine: "AI Travel Planner",
    archiveFrontNine: "把目的地、天数、预算、偏好和同行方式变成可编辑、可复制、可导出的多日行程。",
    archiveTypeTen: "民生安全工具",
    archiveTen: "先问问 - 老人防骗助手",
    archiveFrontTen: "把短信、电话话术、投资群消息和截图上下文转成老人能读懂的风险判断。",
    archiveTypeEleven: "人格测试产品",
    archiveEleven: "青青草原型人格测试器",
    archiveFrontEleven: "用稳定计分和轻松表达把 30 题专业版、15 题体验版与 20 种人格结果串起来。",
    archiveTypeTwelve: "产品策划资产",
    archiveTwelve: "AI 产品创意策划与需求池",
    archiveFrontTwelve: "把生活场景、用户反馈、澄清问题和路线图候选沉淀为下一轮 AI demo 的输入系统。",
    archiveBackOne: "来自私人办公里的 `us-college-application-consultant`。它包含 14 个页面、72 个测试文件和 22 个文档文件，覆盖 DeepSeek 自动规划、RAG 问答、资源库、院校百科、活动质量检查、JSON / Word 导出、登录认证与规划存储。",
    archiveBackTwo: "来自 `xhs-copywriting-master`。项目已经实现文案 brief 表单、文案类型/语气/字数控制、标题正文标签生成、发布建议、快捷优化、复制反馈和 localStorage 历史记录，可用于验证搜索意图、内容结构和私信转化话术。",
    archiveBackThree: "来自 `ai-recruiting-assistant`。定位是本地优先的企业招聘工作流，包含岗位设置、候选人导入、DeepSeek 兼容简历解析、PM 简历评分 Agent、面试指南 Agent、HR 权重配置、审计和公平性支持，并强调 AI 只能辅助、人类保留最终判断。",
    archiveBackFour: "来自 `ai-cooking-coach`。README 记录了 DeepSeek 7 日轻食 meal-prep、食材营养 RAG、500 道餐厅风格菜谱 RAG、Kitchen Command Center、采购 2.0、周记忆循环、AI 应急替换和 Markdown 周复盘导出，项目同时有 12 个测试文件和生产 URL。",
    archiveBackFive: "来自 `ai-emotional-companion-local`。它从本地聊天原型升级为带年龄确认、虚构角色、关系阶段、今日事件、本地记忆、语音朗读、反馈入口、风险日志和危机文本识别的 MVP。README 还记录了 image2 角色视觉墙和角色生活场景图的使用方式。",
    archiveBackSix: "来自 `ai-idol-match-test-deploy` 和本地版本。项目用 Next.js、TypeScript 和 Tailwind 构建，启动时会从 `knowledge-base/年轻向全球idol资料清单_120plus.md` 等来源生成候选库，再由 DeepSeek 输出匹配理由、三步入坑路径、MATCH MAP 维度和可下载分享海报。",
    archiveBackSeven: "来自 `ai-resume-polisher-local`。用户导入 TXT / DOCX 简历并填写目标 JD，本地 Node 服务会上传简历文本到 Coze 文件接口，调用 `Internship_Jianlixiugai` 工作流并返回生成文件链接或调试信息。它展示的是文档解析、密钥边界和第三方 Agent 工作流整合能力。",
    archiveBackEight: "来自 `ai-tarot-sanctum`。产品支持关系、事业和财富问题，本地代码完成 78 张牌库、三牌位、正逆位和牌阵结构，DeepSeek 只负责把已抽好的结构生成“明确回答、为什么、怎么做、支持/阻力信号、改判条件”等报告。",
    archiveBackNine: "来自 `ai-travel-planner-assistant`。首版使用本地规则生成器，不依赖实时机票、酒店、地图或账号；后续加入可选 AI 助手层，有 API Key 时尝试结构化优化当前行程，无 Key 或失败时回到本地建议。",
    archiveBackTen: "来自 `elder-fraud-assistant`。它提供截图预览、可疑信息粘贴、本地风险判断、三档结论、可疑点标注、发给子女确认的消息和子女可直接回复的话术。当前用本地规则引擎，后续可封装成模型 API、OCR 或多模态截图识别。",
    archiveBackEleven: "来自 `qingqing-grassland-personality`。项目包含五维计分、按题组归一化、最近锚点匹配、结果页关键词/优势/盲点/相处建议、分享文案和 Vercel 生产地址，是一个娱乐型但计分稳定的自我理解产品。",
    archiveBackTwelve: "来自 `02-Docs` 和既有反馈整理。它不是单个页面，而是项目孵化层：AI 产品创意策划、普通生活版创意、需求分类、澄清项和路线图候选共同形成“先找场景、再定义边界、最后做可验证原型”的长期方法。",
    archiveDetailOneA: "资料层包含 admission-cases、AP 课程、竞赛、课外活动、国际期刊、专业、科研项目、院校与夏校等 Markdown 知识库。",
    archiveDetailOneB: "产品层覆盖 admin、ask-deepseek、resource-library、school-selection、my-activities、planning-tracker 等 14 个页面。",
    archiveDetailOneC: "工程层在 src/domain 中实现活动质量检查、录取案例匹配、AP/竞赛/科研推荐、Word 导出，并由 RAG、认证、导出和布局测试兜底。",
    archiveDetailTwoA: "核心界面在 Next.js app/page.tsx，生成接口在 app/api route，保留 Tailwind、lucide-react 和响应式工作台结构。",
    archiveDetailTwoB: "输入侧把主题、产品、目标人群、语气、字数和文案类型显式化，降低 prompt 负担。",
    archiveDetailTwoC: "未配置 OPENAI_API_KEY 时自动走 mock fallback，仍能完整演示生成、优化、复制和历史记录闭环。",
    archiveDetailThreeA: "`docs/product/mvp-scope.md` 明确要求组织先连接并验证自己的模型 API，禁用平台默认模型兜底。",
    archiveDetailThreeB: "MVP 流程包括岗位 rubric 审批、简历证据展示、带证据/缺失信息标记的筛选建议、面试指南和人工确认。",
    archiveDetailThreeC: "`docs/compliance/audit-pack.md` 定义 audit export，包含 job、candidates、screeningRuns、interviews、modelConfigs、fairnessSnapshot，并排除原始 API Key、受保护特征推断、照片和社媒数据。",
    archiveDetailFourA: "production handoff 列出 server.mjs、本地静态服务和 Vercel api/plan、api/adjust-meal、api/review-week 等函数。",
    archiveDetailFourB: "src/domain 拆出 prompt-builder、plan-schema、ingredient-governance；src/server 拆出 DeepSeek client、plan、meal replacement 和 weekly review orchestration。",
    archiveDetailFourC: "public 层包含 execution-state、weekly-memory、shopping-list 和 app 渲染逻辑，支持购物勾选、每日执行、周复盘和历史重开。",
    archiveDetailFiveA: "public/assets 中有 cool-doctor、decisive-boss、midnight-singer、sunny-junior、teasing-childhood、tender-senior 等角色场景图。",
    archiveDetailFiveB: "前端模块拆成 app.js、conversation-state.js、memory-store.js、beta-insights.js，分别处理聊天、状态、记忆和内测记录。",
    archiveDetailFiveC: "安全边界覆盖 18+ 确认、危机表达拦截、未成年人恋爱、真人/公众人物模拟、声音克隆、露骨色情和强迫控制类请求。",
    archiveDetailSixA: "知识库包含 `年轻向全球idol资料清单_120plus.md`，并生成 85KB 级别的 idol-profiles.generated.ts 候选数据。",
    archiveDetailSixB: "测评流程支持 15 题体验版和 40 题专业版，先形成用户偏好，再把候选短名单交给 DeepSeek。",
    archiveDetailSixC: "结果页包含 Top 1、Top 3、匹配标签、入坑理由、MATCH MAP、复制文案、下载分享海报和本地收藏/历史。",
    archiveDetailSevenA: "DOCX 解析通过读取 word/document.xml 抽取正文文本，避免把文档处理写成只支持纯文本的 demo。",
    archiveDetailSevenB: "Coze 侧默认绑定 Workflow ID `7647377427798605859`，开始节点入参包含 file 和 jd。",
    archiveDetailSevenC: "验证脚本会检查 server.mjs、docx.mjs、resume-core.js、app.js 语法，并运行 smoke / node tests。",
    archiveDetailEightA: "product-roadmap 把核心体验定义为“判断型三牌阅读”：先给能/不能倾向，再解释置信度、原因和下一步。",
    archiveDetailEightB: "ADR-001 明确主流程：浏览器收集问题，本地抽三张不重复牌，API route 请求 DeepSeek strict JSON，再归一化报告。",
    archiveDetailEightC: "路线图继续规划问题意图识别、可信度与反证、复盘与连续观察，QA 覆盖旧历史迁移、移动端和 reduced motion。",
    archiveDetailNineA: "输入侧包含目的地、天数、预算、偏好和同行方式，输出为多日行程而不是单段建议。",
    archiveDetailNineB: "核心交互支持编辑、保存、复制和导出，适合作为行前确认工作台的基础。",
    archiveDetailNineC: "docs 中保留 V0.2 confirmation workbench 和 V0.3 AI assist layer 计划，测试数量为 8 个。",
    archiveDetailTenA: "面向老人和子女，把“医保卡异常、快递理赔、投资群老师推荐”等场景翻译成大白话风险说明。",
    archiveDetailTenB: "风险点覆盖催转账、保密、公检法、投资高收益、远程软件、验证码等常见诈骗信号。",
    archiveDetailTenC: "src/fraudAnalyzer.mjs 是本地规则核心，README 明确后续可加入 OCR 或多模态截图识别。",
    archiveDetailElevenA: "测评维度包括 SE 社交能量、AC 行动方式、RB 关系策略、RV 风险偏好、EE 情绪表达。",
    archiveDetailElevenB: "产品支持 30 题专业版和 15 题体验版，归一化后匹配 20 种原创草原意象人格。",
    archiveDetailElevenC: "docs 记录 test modes、social growth、archive、result experience 等阶段，项目有 8 个测试并已链接 Vercel。",
    archiveDetailTwelveA: "`AI产品创意策划.md` 提出 12 个方向：工作流魔镜、证据型研究合伙人、模拟客户实验室、创作者 IP 宇宙导演、家庭生活运营系统等。",
    archiveDetailTwelveB: "文档把机会判断压到 2-6 周原型、10-30 个试用用户、领域上下文、数据闭环、信任机制和人工确认。",
    archiveDetailTwelveC: "普通生活版继续拆家庭事务、冰箱饭菜、防坑购物、老人防骗等日常场景，和 341 需求、103 澄清项、80 路线图候选形成输入池。",
    contactTitle: "Open the education console.",
    contactBody: "如果你是招生官、项目导师或实习招聘方，可以从作品、研究和交付证据判断我是否适合继续交流。",
    ctaPhone: "电话",
    ctaScholar: "Google Scholar",
    ctaGithub: "项目档案",
    ctaResumeFooter: "下载简历",
  },
  en: {
    pageTitle: "Song Yunkun | AI Education Product Builder",
    metaDescription: "Song Yunkun's AI Education Product Builder portfolio for admissions reviewers and internship recruiters, covering AI education products, application planning systems, RAG, agent workflows, and full-stack prototype delivery.",
    skip: "Skip to content",
    navWork: "Work",
    navAudience: "Audience",
    navSystem: "System",
    navStack: "Stack",
    navArchive: "Archive",
    navContact: "Contact",
    langButton: "中文",
    heroKicker: "AI Education Command Center / Application Planning Systems / Full-stack Prototype",
    heroTitle: "Song Yunkun",
    heroSubtitle: "I organize student signals, AI workflows, and engineering delivery into working, testable, verifiable education product systems.",
    ctaWork: "View Work",
    ctaResume: "Resume",
    metricOne: "US planning test files",
    metricTwo: "feedback items classified",
    metricThree: "clarification items",
    metricFour: "roadmap candidates",
    metricFive: "content views",
    metricSix: "first-author paper",
    metricDetailOne: "Engineering evidence across auth, RAG, planning, recommendation, export, and layout.",
    metricDetailTwo: "Classroom, meeting, application, and knowledge feedback turned into an actionable requirement pool.",
    metricDetailThree: "Used to ask better questions, define boundaries, and validate real education scenarios.",
    metricDetailFour: "Converted into AI education product roadmap and priority planning material.",
    metricDetailFive: "Built through search exposure, content structure, and conversion scripts.",
    metricDetailSix: "Adds credibility to education decisions, modeling, and evaluation.",
    audienceTitle: "Two Review Modes",
    audienceIntro: "This site is not a generic resume page. It is a dual-mode evidence console for admissions officers and internship recruiters.",
    audienceOneLabel: "Admissions Mode",
    audienceOneTitle: "Using AI to strengthen education choices",
    audienceOneBody: "For admissions reviewers, I show a mathematics education background, research credibility, education product practice, and long-term commitment to student decision scenarios.",
    audienceOnePointA: "Boston University, Mathematics and Math Education",
    audienceOnePointB: "First author, SCI JCR Q2 modeling paper and software copyright",
    audienceOnePointC: "Application planning, learning feedback, and resource recommendation turned into AI products",
    audienceTwoLabel: "Recruiting Mode",
    audienceTwoTitle: "Turning AI ideas into systems",
    audienceTwoBody: "For recruiters, I show AI product management, technical project management, full-stack prototyping, and the execution to convert feedback into roadmaps.",
    audienceTwoPointA: "RAG, Agent, Prompt, API, and document export workflows",
    audienceTwoPointB: "Frontend, backend, auth, SQLite persistence, and regression tests",
    audienceTwoPointC: "From 341 feedback items to clarification lists, priorities, and release rhythm",
    workTitle: "Selected Work",
    workIntro: "Three cases show how I turn education problems into AI systems and verifiable delivery.",
    motionTitle: "Mission Console",
    motionIntro: "The page uses a Cobalt Intelligence Palette, generative networks, and scroll-driven state changes. Every motion maps to a product action rather than decoration.",
    motionOneLabel: "Student Signal",
    motionOneTitle: "Student profile signal field",
    motionOneBody: "Fine grids, nodes, and pointer light fields express student goals, activities, scores, and family constraints being captured.",
    motionTwoLabel: "Strategy Rhythm",
    motionTwoTitle: "Application strategy simulation rhythm",
    motionTwoBody: "Flow lines, layered cards, and proof metrics light up with scroll to form a rhythm from profile to strategy to testing.",
    motionThreeLabel: "Evidence Console",
    motionThreeTitle: "Verifiable delivery feedback",
    motionThreeBody: "Cobalt marks the active system action, green marks verified delivery, amber marks growth evidence, and red is reserved for risk.",
    caseOneRole: "AI Product Manager / Independent Developer",
    caseOneTitle: "AI US Application Planning Workspace",
    caseOneBody: "A planning platform for international applicants and families, combining student profiles, DeepSeek planning, resource RAG, school encyclopedia, activity quality checks, exports, and backend auth so advising becomes a trackable system.",
    caseOnePointA: "DeepSeek generates 10 Common App activities and parses them into a table",
    caseOnePointB: "RAG connects student backups, resource libraries, school knowledge, and portfolios",
    caseOnePointC: "72 test files cover auth, planning, recommendation, export, and page experience",
    caseTwoRole: "Growth Product / AI Copywriting Workflow",
    caseTwoTitle: "Xiaohongshu Copywriting Master",
    caseTwoBody: "An AI generation workspace for briefs, topics, titles, body copy, tags, and publishing advice, used to test search intent, content structure, and DM conversion language.",
    caseTwoPointA: "Next.js MVP covers title, body, tags, publishing advice, and history",
    caseTwoPointB: "Mock fallback supports a complete demo when no API key is configured",
    caseTwoPointC: "Connected to 20,000+ views, search exposure, and DM conversion methods",
    caseThreeRole: "Enterprise AI Workflow / Recruiting Evaluation",
    caseThreeTitle: "AI Recruiting Assistant",
    caseThreeBody: "A local-first recruiting workflow app covering job criteria, resume parsing, product manager resume scoring, interview guides, result calculation, audit, and fairness support.",
    caseThreePointA: "18 test files cover parsing, scoring, interviews, audit, and model connections",
    caseThreePointB: "User-owned model credentials with no hidden platform fallback",
    caseThreePointC: "Human review remains the final decision layer, not the AI score alone",
    systemTitle: "AI Education Operating System",
    systemIntro: "I break AI education products into six repeatable phases. Each phase needs input, judgment, and verifiable output.",
    stepOne: "Collect student goals, family constraints, learning feedback, interview notes, and real scenario inputs.",
    stepTwo: "Turn profiles, school information, activity material, and resource libraries into searchable context.",
    stepThree: "Build school-fit reasoning, activity recommendations, priorities, clarification lists, and roadmap material.",
    stepFour: "Design prompts, RAG flows, Agent Skills, and API calls so strategy generation has context.",
    stepFive: "Ship frontend, backend, auth, exports, persistence, and regression tests.",
    stepSix: "Feed results back into student feedback, application outcomes, and the next product cycle.",
    stackTitle: "Capability Matrix",
    stackIntro: "The stack is framed by how it serves education products, application planning, and verifiable delivery.",
    tabAI: "AI Education",
    tabWeb: "Product Delivery",
    tabOps: "Growth Evidence",
    tabDocs: "Research Output",
    tabDesign: "Design System",
    stackEmptyKicker: "SELECT A CAPABILITY",
    stackEmptyBody: "Click a capability button above. This area will show only the matching layer and its motion diagram.",
    panelAITitle: "AI Education Layer",
    panelAIBody: "Prompt Engineering, RAG, Agent Skills, student profiles, application strategy, OpenAI Responses API, DeepSeek-compatible API.",
    panelWebTitle: "Product Delivery Layer",
    panelWebBody: "HTML, CSS, JavaScript, TypeScript, React, Next.js, Node.js, REST API, SQLite, better-sqlite3, auth, and tests.",
    panelOpsTitle: "Growth Evidence Layer",
    panelOpsBody: "User feedback structuring, requirement classification, priority evaluation, keyword research, search intent analysis, Xiaohongshu content planning, DM conversion, and 20,000+ views.",
    panelDocsTitle: "Research Output Layer",
    panelDocsBody: "Markdown, YAML, JSON, CSV / XLSX, python-docx, Word-compatible .doc HTML export, modeling paper, and Scholar profile.",
    panelDesignTitle: "Cobalt Intelligence Design System",
    panelDesignBody: "Porcelain, graphite, and signal cobalt set the mature technology baseline. Green only marks verified delivery, amber only marks growth evidence, and red only marks risk.",
    archiveTitle: "Archive Wall",
    archiveIntro: "Real projects from the private office folder are presented as a scannable evidence archive: working prototypes, document assets, and product methods.",
    archiveTypeOne: "Flagship System",
    archiveOne: "US Application Planning Agent",
    archiveFrontOne: "Student profiles, school knowledge, activity planning, and quality checks become a testable application strategy console.",
    archiveTypeTwo: "Growth Content Tool",
    archiveTwo: "Xiaohongshu Copywriting Master",
    archiveFrontTwo: "Briefs, tone, length, titles, body copy, tags, and publishing advice form a complete content production pipeline.",
    archiveTypeThree: "Enterprise AI",
    archiveThree: "AI Recruiting Assistant",
    archiveFrontThree: "Job criteria, resume parsing, scoring, interview guides, and human review become an audit-friendly hiring workflow.",
    archiveTypeFour: "Shipped Prototype",
    archiveFour: "AI Cooking Coach",
    archiveFrontFour: "A local-first 7-day light meal plan connects recipes, shopping, batch prep, and weekly review into an execution console.",
    archiveTypeFive: "Local Companion MVP",
    archiveFive: "Qisheng AI Emotional Companion",
    archiveFrontFive: "Local memory, character boundaries, risk interception, and feedback records form a controlled companion product skeleton.",
    archiveTypeSix: "Entertainment Assessment",
    archiveSix: "Idol Match Test",
    archiveFrontSix: "A 15-question quick version and 40-question pro version combine with candidate data to produce Top 1 / Top 3 matches and onboarding paths.",
    archiveTypeSeven: "Document Workflow",
    archiveSeven: "AI Resume Polisher",
    archiveFrontSeven: "TXT / DOCX resumes, target JDs, Coze file upload, and workflow calls are assembled into a working local desk.",
    archiveTypeEight: "Reflective AI Tool",
    archiveEight: "Tarot Sanctum",
    archiveFrontEight: "Local card drawing and spread structure feed DeepSeek-generated Chinese reflection reports with practical advice.",
    archiveTypeNine: "Planning Prototype",
    archiveNine: "AI Travel Planner",
    archiveFrontNine: "Destinations, days, budget, preferences, and travel companions become editable, copyable, exportable multi-day plans.",
    archiveTypeTen: "Public Safety Tool",
    archiveTen: "Ask First Fraud Assistant",
    archiveFrontTen: "SMS, phone scripts, investment group messages, and screenshot context become plain-language risk judgments for elders.",
    archiveTypeEleven: "Personality Product",
    archiveEleven: "Grassland Personality Test",
    archiveFrontEleven: "Stable scoring and light expression connect a 30-question pro mode, 15-question quick mode, and 20 result types.",
    archiveTypeTwelve: "Product Planning Asset",
    archiveTwelve: "AI Product Ideas and Backlog",
    archiveFrontTwelve: "Life scenarios, user feedback, clarification questions, and roadmap candidates become the input system for the next AI demos.",
    archiveBackOne: "From `us-college-application-consultant` in the private office folder. It contains 14 pages, 72 test files, and 22 documentation files covering DeepSeek planning, RAG Q&A, resource libraries, school encyclopedia, activity quality checks, JSON / Word exports, authentication, and planning storage.",
    archiveBackTwo: "From `xhs-copywriting-master`. The project implements a brief form, copy type, tone and length controls, title/body/tag generation, publishing advice, quick optimization, copy feedback, and localStorage history for validating search intent, content structure, and DM conversion language.",
    archiveBackThree: "From `ai-recruiting-assistant`. It is a local-first enterprise recruiting workflow with job setup, candidate import, DeepSeek-compatible resume parsing, PM resume scoring agents, interview guide agents, HR weight configuration, audit, fairness support, and a human final-decision layer.",
    archiveBackFour: "From `ai-cooking-coach`. The README documents DeepSeek 7-day light meal prep, ingredient nutrition RAG, 500 restaurant-style recipe RAG, Kitchen Command Center, shopping 2.0, weekly memory loop, AI emergency meal replacement, and Markdown weekly recap export, plus 12 tests and a production URL.",
    archiveBackFive: "From `ai-emotional-companion-local`. It evolved from a local chat prototype into an MVP with age confirmation, fictional roles, relationship stages, daily events, local memory, speech synthesis, feedback entry, risk logs, and crisis text detection. The README also documents image2 character visuals and lifestyle scenes.",
    archiveBackSix: "From `ai-idol-match-test-deploy` and the local version. Built with Next.js, TypeScript, and Tailwind, it generates candidate profiles from a 120-plus global idol profile Markdown source, then uses DeepSeek for match reasons, three-step onboarding paths, MATCH MAP dimensions, and downloadable posters.",
    archiveBackSeven: "From `ai-resume-polisher-local`. Users import TXT / DOCX resumes and a target JD; the local Node service uploads resume text to Coze, calls the `Internship_Jianlixiugai` workflow, and returns a generated file link or debug output. It demonstrates document parsing, key boundaries, and third-party agent workflow integration.",
    archiveBackEight: "From `ai-tarot-sanctum`. It supports relationship, career, and finance questions. Local code handles the 78-card deck, three-card positions, upright/reversed selection, and spread structure; DeepSeek only turns the drawn structure into a report covering answer, rationale, next steps, support/resistance, and change conditions.",
    archiveBackNine: "From `ai-travel-planner-assistant`. The first version uses a local rule generator and does not depend on real-time flights, hotels, maps, or accounts. A later optional AI layer tries structured itinerary optimization when an API key exists and falls back to local advice when it does not.",
    archiveBackTen: "From `elder-fraud-assistant`. It offers screenshot preview, suspicious text paste, local risk analysis, three result levels, suspicious-point marking, a message to ask family for confirmation, and replies children can send directly. It currently uses a local rule engine and can later become a model API, OCR, or multimodal scanner.",
    archiveBackEleven: "From `qingqing-grassland-personality`. It includes five-dimension scoring, per-question-set normalization, nearest-anchor matching, result keywords, strengths, blind spots, relationship advice, share copy, and a Vercel production URL. It is a light self-understanding product with stable scoring.",
    archiveBackTwelve: "From `02-Docs` and the existing feedback work. It is not a single page, but a project incubation layer: AI product idea planning, ordinary-life idea planning, requirement classification, clarification items, and roadmap candidates form a long-term method of finding scenarios, defining boundaries, and shipping verifiable prototypes.",
    archiveDetailOneA: "The data layer includes Markdown knowledge bases for admission cases, AP courses, competitions, extracurriculars, international journals, majors, research projects, schools, and summer programs.",
    archiveDetailOneB: "The product layer covers 14 pages including admin, ask-deepseek, resource-library, school-selection, my-activities, and planning-tracker.",
    archiveDetailOneC: "The engineering layer implements activity quality checks, admission case matching, AP / competition / research recommendations, and Word export in src/domain, backed by RAG, auth, export, and layout tests.",
    archiveDetailTwoA: "The core interface lives in Next.js app/page.tsx, with generation routes under app/api, plus Tailwind, lucide-react, and a responsive workspace layout.",
    archiveDetailTwoB: "The input side makes topic, product, audience, tone, length, and content type explicit, reducing prompt burden.",
    archiveDetailTwoC: "When OPENAI_API_KEY is not configured, mock fallback still demonstrates generation, optimization, copy feedback, and history end to end.",
    archiveDetailThreeA: "`docs/product/mvp-scope.md` requires the organization to connect and verify its own model API before AI workflows run; platform-default fallback is disabled.",
    archiveDetailThreeB: "The MVP includes job rubric approval, resume evidence display, recommendations with evidence or missing-information flags, interview guides, and human confirmation.",
    archiveDetailThreeC: "`docs/compliance/audit-pack.md` defines the audit export: job, candidates, screeningRuns, interviews, modelConfigs, and fairnessSnapshot, while excluding raw API keys, protected-trait inference, photos, and social-media data.",
    archiveDetailFourA: "The production handoff lists server.mjs, the local static server, and Vercel functions such as api/plan, api/adjust-meal, and api/review-week.",
    archiveDetailFourB: "src/domain separates prompt-builder, plan-schema, and ingredient-governance; src/server separates the DeepSeek client, plan, meal replacement, and weekly review orchestration.",
    archiveDetailFourC: "The public layer includes execution-state, weekly-memory, shopping-list, and app rendering logic for shopping checks, daily execution, weekly review, and plan history reopening.",
    archiveDetailFiveA: "public/assets includes role scene images such as cool-doctor, decisive-boss, midnight-singer, sunny-junior, teasing-childhood, and tender-senior.",
    archiveDetailFiveB: "Frontend modules are split into app.js, conversation-state.js, memory-store.js, and beta-insights.js for chat, state, memory, and beta records.",
    archiveDetailFiveC: "Safety boundaries cover 18+ confirmation, crisis interception, minor romance, real-person or public-figure simulation, voice cloning, explicit sexual content, and coercive-control requests.",
    archiveDetailSixA: "The knowledge base includes a 120-plus global idol profile Markdown source and generates an 85KB-level idol-profiles.generated.ts candidate dataset.",
    archiveDetailSixB: "The assessment supports 15-question quick mode and 40-question pro mode, forming user preferences before sending a candidate shortlist to DeepSeek.",
    archiveDetailSixC: "The result page includes Top 1, Top 3, match tags, reasons, MATCH MAP, copy text, downloadable poster, local favorites, and history.",
    archiveDetailSevenA: "DOCX parsing reads word/document.xml to extract body text, so document handling is not reduced to a plain-text-only demo.",
    archiveDetailSevenB: "The Coze side defaults to Workflow ID `7647377427798605859`, with start-node inputs for file and jd.",
    archiveDetailSevenC: "Verification checks syntax for server.mjs, docx.mjs, resume-core.js, and app.js, then runs smoke and Node tests.",
    archiveDetailEightA: "The product roadmap defines the core experience as judgment-oriented three-card reading: answer first, then confidence, rationale, and next steps.",
    archiveDetailEightB: "ADR-001 defines the main flow: browser collects the question, local code draws three unique cards, the API route asks DeepSeek for strict JSON, then the report is normalized.",
    archiveDetailEightC: "The roadmap continues with question intent recognition, credibility and counter-evidence, review loops, and QA for legacy history migration, mobile, and reduced motion.",
    archiveDetailNineA: "Inputs include destination, days, budget, preferences, and companion type; output is a multi-day itinerary rather than a single block of advice.",
    archiveDetailNineB: "Core interactions support editing, saving, copying, and exporting, making it a base for a pre-trip confirmation workbench.",
    archiveDetailNineC: "The docs retain V0.2 confirmation workbench and V0.3 AI assist layer plans, with 8 tests in the project.",
    archiveDetailTenA: "For elders and family members, scenarios like medical-card warnings, courier refunds, and investment-group pitches are translated into plain-language risk explanations.",
    archiveDetailTenB: "Risk signals cover urgent transfers, secrecy, police/court impersonation, high-return investments, remote-control software, and verification codes.",
    archiveDetailTenC: "src/fraudAnalyzer.mjs is the local rule core, and the README notes future OCR or multimodal screenshot recognition.",
    archiveDetailElevenA: "Assessment dimensions include SE social energy, AC action style, RB relationship strategy, RV risk preference, and EE emotional expression.",
    archiveDetailElevenB: "The product supports 30-question pro mode and 15-question quick mode, then normalizes scores to match 20 original grassland archetypes.",
    archiveDetailElevenC: "Docs cover test modes, social growth, archive, and result experience phases; the project has 8 tests and is linked to Vercel.",
    archiveDetailTwelveA: "The AI product idea planning document proposes 12 directions including workflow mirror, evidence research partner, simulated customer lab, creator IP universe director, and family life operating system.",
    archiveDetailTwelveB: "The opportunity filter is constrained to 2-6 week prototypes, 10-30 trial users, domain context, data loops, trust mechanisms, and human confirmation.",
    archiveDetailTwelveC: "The ordinary-life version breaks down family tasks, fridge meals, shopping advice, elder fraud prevention, and other daily scenarios, feeding the 341 needs, 103 clarification items, and 80 roadmap candidates.",
    contactTitle: "Open the education console.",
    contactBody: "If you are an admissions officer, project mentor, or internship recruiter, use the work, research, and delivery evidence to decide whether we should talk.",
    ctaPhone: "Phone",
    ctaScholar: "Google Scholar",
    ctaGithub: "Project Archive",
    ctaResumeFooter: "Resume",
  },
};

const readLanguagePreference = () => {
  try {
    return localStorage.getItem(languageStorageKey) === "en" ? "en" : "zh";
  } catch (_error) {
    return "zh";
  }
};

const writeLanguagePreference = (lang) => {
  try {
    localStorage.setItem(languageStorageKey, lang);
  } catch (_error) {
    // Language switching still works for the current page when storage is unavailable.
  }
};

let currentLang = readLanguagePreference();
let currentNetworkMode = "signal";
let currentLayer = "profile";
let currentEvidenceStep = "screenshot";
let userSelectedNetworkMode = false;
let userSelectedEvidenceStep = false;
let evidenceJourneyTimer = 0;

const networkModeOrder = ["signal", "rag", "agent", "tests", "export"];
const layerOrder = ["profile", "plan", "rag", "quality", "export", "tests"];
const evidenceStepOrder = ["screenshot", "github", "tests", "research", "resume"];
const evidencePanelByStep = {
  screenshot: "screenshot",
  github: "github",
  tests: "tests",
  research: "research",
  resume: "resume",
};
const finePointer = window.matchMedia("(pointer: fine)").matches;
let ambientPointer = { x: 0.5, y: 0.5, active: false };
const networkModeCopy = {
  signal: {
    label: "Student Signal",
    zh: "学生目标、活动记录、成绩和家庭约束作为移动节点进入系统。",
    en: "Student goals, activities, scores, and family constraints enter the system as moving nodes.",
  },
  rag: {
    label: "RAG",
    zh: "学生备份、资源库、院校百科和申请档案被拉近，形成可查询上下文。",
    en: "Student backups, resources, school encyclopedia, and portfolios pull closer to form searchable context.",
  },
  agent: {
    label: "DeepSeek Agent",
    zh: "活动规划、选校策略、活动质量检查和文档导出节点开始形成执行路径。",
    en: "Activity planning, school strategy, quality checks, and document exports form execution paths.",
  },
  tests: {
    label: "72 Tests",
    zh: "测试节点被点亮，用来表达认证、RAG、推荐、导出和页面体验的稳定性。",
    en: "Test nodes light up to show reliability across auth, RAG, recommendation, export, and page experience.",
  },
  export: {
    label: "Export",
    zh: "输出节点收束到申请规划、Word、JSON、SVG 和可交付文件。",
    en: "Output nodes converge into application plans, Word, JSON, SVG, and deliverables.",
  },
};

const layerDetails = {
  profile: {
    title: "Student Profile",
    zh: "学生目标、成绩、活动和家庭约束成为规划判断的稳定上下文。",
    en: "Student background data becomes the stable context for planning decisions.",
  },
  rag: {
    title: "RAG Knowledge",
    zh: "学生备份、资源库、院校百科和申请档案被组织成问答层。",
    en: "Student backups, resources, school knowledge, and portfolios become a Q&A layer.",
  },
  plan: {
    title: "DeepSeek Plan",
    zh: "DeepSeek 一键生成 10 项 Common App 活动方案，再解析进表格供继续编辑。",
    en: "DeepSeek generates 10 Common App activity plans, then parses them into editable tables.",
  },
  quality: {
    title: "Quality Check",
    zh: "活动质量检查会扫描完整度、数字证据、影响表达、领导力线索和专业连接。",
    en: "Activity quality checks scan completeness, numeric proof, impact language, leadership signals, and major fit.",
  },
  export: {
    title: "Export System",
    zh: "规划结果可以导出为 Word、JSON 和 SVG，形成可交付申请材料。",
    en: "Planning output exports to Word, JSON, and SVG as deliverable application material.",
  },
  tests: {
    title: "72 Tests",
    zh: "72 个测试文件覆盖认证、RAG、规划、推荐、导出和页面体验。",
    en: "72 test files cover auth, RAG, planning, recommendation, export, and page experience.",
  },
};

const evidenceStepDetails = {
  screenshot: {
    label: "Screenshot",
    zh: "从真实规划工作台开始，让读者先看到产品已经跑起来。",
    en: "Start with the real planning workspace so readers see that the product is already running.",
  },
  github: {
    label: "GitHub",
    zh: "把核心项目和个人网站源码放到可访问仓库，方便招生官和招聘方进一步检查。",
    en: "Route readers to accessible source repositories for deeper admissions and recruiting review.",
  },
  tests: {
    label: "Tests",
    zh: "用 verify、RAG eval、安全扫描和性能 smoke 表达工程交付不是静态展示。",
    en: "Use verify, RAG eval, security scans, and performance smoke checks to show working delivery.",
  },
  research: {
    label: "Research",
    zh: "把论文、RAG 评估和需求整理放进同一条证据链，支撑 AI 教育产品判断。",
    en: "Connect papers, RAG evaluation, and requirement analysis into one AI education proof chain.",
  },
  resume: {
    label: "Resume",
    zh: "最终导向清晰行动：看作品、打开仓库、下载简历并继续沟通。",
    en: "End with clear actions: view work, inspect repositories, download the resume, and continue the conversation.",
  },
};

const originalTextByElement = new WeakMap();
const pageLanguageText = {
  "index.html": [
    ["#hero-title", "Song Yunkun"],
    [".hero-kicker", "AI Education Product Builder / Application Planning System / GitHub Evidence"],
    [".hero-subtitle", "I build AI education products that turn student context, planning logic, and engineering proof into working systems."],
    [".hero-actions .button:nth-child(1)", "View Core Work"],
    [".hero-actions .button:nth-child(2)", "Download Resume"],
    [".proof-band article:nth-child(1) span", "GitHub repositories"],
    ["#metric-detail-zero", "The personal site and US College Compass both have accessible repository evidence."],
    [".proof-band article:nth-child(2) span", "test files"],
    ["#metric-detail-one", "Engineering evidence across auth, RAG, planning, recommendations, export, and layout."],
    [".proof-band article:nth-child(3) span", "RAG eval passed"],
    ["#metric-detail-two", "The local golden-set evaluation proves the Q&A chain is more than demo copy."],
    [".proof-band article:nth-child(4) span", "requirements classified"],
    ["#metric-detail-three", "Classroom, meeting, application, and knowledge feedback turned into an actionable requirement pool."],
    [".proof-band article:nth-child(5) span", "content views"],
    ["#metric-detail-four", "Evidence from search exposure, content structure, and conversion-language optimization."],
    [".proof-band article:nth-child(6) span", "performance p95"],
    ["#metric-detail-five", "Local performance smoke stayed under the threshold for portfolio-grade product proof."],
    ["#evidence-title", "Evidence chain"],
    [".evidence-console-section .section-intro p", "Screenshots, repositories, tests, and research prove that the AI education work is shipped, inspectable, and verifiable."],
    [".evidence-shot-copy span", "Real product screenshot"],
    [".evidence-shot-copy h3", "US College Compass"],
    [".evidence-shot-copy p", "The live workspace shows student profiles, planning flow, DeepSeek optimization, and versioned application planning."],
    [".repo-grid .repo-card:nth-child(1) > span", "GitHub / Flagship"],
    [".repo-grid .repo-card:nth-child(1) p", "DeepSeek, RAG, auth, exports, resource libraries, school selection, and tests form an AI admissions planning system."],
    [".repo-grid .repo-card:nth-child(1) b", "verify + audit + perf smoke"],
    [".repo-grid .repo-card:nth-child(2) > span", "GitHub / Portfolio"],
    [".repo-grid .repo-card:nth-child(2) p", "A static bilingual AI education portfolio with an AI opening, ambient canvas, case studies, research pages, and reduced-motion support."],
    [".repo-grid .repo-card:nth-child(2) b", "static site + motion system"],
    [".evidence-step[data-evidence-step='screenshot'] strong", "Real product UI"],
    [".evidence-step[data-evidence-step='github'] strong", "Inspectable repos"],
    [".evidence-step[data-evidence-step='tests'] strong", "Verification chain"],
    [".evidence-step[data-evidence-step='research'] strong", "Research backing"],
    [".evidence-step[data-evidence-step='resume'] strong", "Resume route"],
    ["#site-map-title", "Start from the right page"],
    [".route-section .section-intro p", "The homepage helps readers judge identity and proof fast. Background, work, research, archive, and contact each have their own page."],
    [".route-section .route-card:nth-child(1) h3", "Background and method"],
    [".route-section .route-card:nth-child(1) p", "For admissions officers, mentors, and recruiters: background, decision style, capability matrix, and education-product method."],
    [".route-section .route-card:nth-child(2) h3", "Core work"],
    [".route-section .route-card:nth-child(2) p", "Three representative case studies across AI education, content growth, and recruiting-evaluation workflows."],
    [".route-section .route-card:nth-child(3) h3", "Research"],
    [".route-section .route-card:nth-child(3) p", "Turn Google Scholar papers, DOI records, modeling methods, and education research into an interactive evidence chain."],
    [".route-section .route-card:nth-child(4) h3", "AI long-form novel"],
    [".route-section .route-card:nth-child(4) p", "A long-form AI-assisted fiction project showing worldbuilding, character systems, and chapter-structure design."],
    [".route-section .route-card:nth-child(5) h3", "Project archive"],
    [".route-section .route-card:nth-child(5) p", "A scannable wall of AI demos, research assets, tool prototypes, and long-term requirement pools."],
    [".route-section .route-card:nth-child(6) h3", "Contact entry"],
    [".route-section .route-card:nth-child(6) p", "Email, phone, Google Scholar, resume, and the right context for continuing the conversation."],
    ["#featured-title", "Featured work"],
    [".work-section .section-intro p", "The homepage keeps the highlights concise. Full case studies live on the Work page."],
    [".summary-card:nth-child(1) h3", "AI US Application Planning Workspace"],
    [".summary-card:nth-child(1) p", "Student profiles, DeepSeek planning, RAG Q&A, school encyclopedia, quality checks, and Word / JSON export."],
    [".summary-card:nth-child(2) h3", "Xiaohongshu Copywriting Assistant"],
    [".summary-card:nth-child(2) p", "A content-generation workflow from brief to title, body copy, tags, publishing advice, and history."],
    [".summary-card:nth-child(3) p", "A local-first workspace for job criteria, resume parsing, scoring, interview guides, audit support, and final human decisions."],
    [".section-actions .button:nth-child(1)", "Open Work"],
    [".section-actions .button:nth-child(2)", "View Archive"],
  ],
  "about.html": [
    ["#about-title", "Turning education judgment into verifiable systems"],
    [".page-masthead > p:not(.hero-kicker)", "My work connects math education, AI workflows, product planning, and engineering delivery into one evidence chain: understand real student contexts, define the judgment boundaries, ship runnable prototypes, and verify them through tests and feedback."],
    ["#audience-title", "Two review modes"],
    [".audience-section .section-intro p", "The same experience has to work for two audiences: admissions readers look for long-term commitment and credibility; recruiters look for product judgment and engineering delivery."],
    [".audience-card:nth-child(1) h3", "Using AI to strengthen education decisions"],
    [".audience-card:nth-child(1) p", "For admissions readers, this page foregrounds my math education background, research credibility, education-product work, and sustained interest in student decision-making."],
    [".audience-card:nth-child(1) li:nth-child(1)", "Boston University direction: mathematics and mathematics education"],
    [".audience-card:nth-child(1) li:nth-child(2)", "First-author SCI JCR Q2 modeling paper and software copyright"],
    [".audience-card:nth-child(1) li:nth-child(3)", "Turn application planning, learning feedback, and resource recommendations into AI products"],
    [".audience-card:nth-child(2) h3", "Shipping AI ideas as working systems"],
    [".audience-card:nth-child(2) p", "For recruiters, it emphasizes AI product management, technical project management, full-stack prototyping, and the discipline to turn feedback into roadmaps."],
    [".audience-card:nth-child(2) li:nth-child(1)", "RAG, agents, prompts, APIs, and document-export workflows"],
    [".audience-card:nth-child(2) li:nth-child(2)", "Frontend, backend, auth, SQLite persistence, and regression tests"],
    [".audience-card:nth-child(2) li:nth-child(3)", "From 341 feedback items to clarified tasks, priorities, and release rhythm"],
    ["#system-title", "AI Education Operating System"],
    [".system-section .section-intro p", "I split AI education products into six reusable stages. Each stage must have inputs, judgment rules, and verifiable outputs."],
    [".path-step:nth-child(1) p", "Collect student goals, family constraints, learning feedback, interview material, and real scenario inputs."],
    [".path-step:nth-child(2) p", "Organize student files, school information, activity material, and resource libraries into searchable context."],
    [".path-step:nth-child(3) p", "Produce school fit, activity suggestions, priority evidence, clarification lists, and version plans."],
    [".path-step:nth-child(4) p", "Design prompts, RAG, agent skills, and API workflows so strategy generation has context."],
    [".path-step:nth-child(5) p", "Ship frontend, backend, auth, export, persistence, and regression tests."],
    [".path-step:nth-child(6) p", "Connect delivery results back into student feedback, application outcomes, and the next product cycle."],
    ["#stack-title", "Capability Matrix"],
    [".stack-section .section-intro p", "The capability section does not just list tools. It explains how each tool supports education products, application planning, and verifiable delivery."],
    [".stack-empty p", "Choose any capability above to see the relevant layer and motion example."],
  ],
  "work.html": [
    [".page-masthead .hero-kicker", "Work / Evidence-Led Case Studies"],
    ["#work-page-title", "Core projects and evidence chain"],
    [".page-masthead > p:not(.hero-kicker)", "This page leads with real screenshots, GitHub repositories, tests, and product judgment so readers can verify that the AI education work is shipped."],
    ["#work-title", "Flagship proof"],
    [".work-section .section-intro p", "The main case starts with visible proof, then explains the problem, system, repository, and verification results."],
    [".case-card:nth-child(1) .case-role", "AI Product Manager / Independent Developer"],
    [".case-card:nth-child(1) h3", "AI US Application Planning Workspace"],
    [".case-card:nth-child(1) .case-copy > p:nth-of-type(2)", "A planning platform for international students and families, combining student profiles, DeepSeek plans, resource-library RAG, school data, activity checks, export, and backend auth."],
    [".case-card:nth-child(1) li:nth-child(1)", "DeepSeek generates 10 Common App activity plans and parses them into tables."],
    [".case-card:nth-child(1) li:nth-child(2)", "RAG connects student backups, resources, school encyclopedia, and application portfolios."],
    [".case-card:nth-child(1) li:nth-child(3)", "72 test files, a RAG golden set, security scan, and performance smoke form engineering proof."],
    [".case-proof-strip span:nth-child(1)", "GitHub repo"],
    [".case-proof-strip span:nth-child(2)", "Real screenshot"],
    [".case-proof-strip span:nth-child(3)", "CI gate"],
    [".case-proof-strip span:nth-child(4)", "p95 38ms"],
    [".visual-repo-link", "Open GitHub"],
    [".case-card:nth-child(2) .case-role", "Content Growth Product / AI Copy Workflow"],
    [".case-card:nth-child(2) h3", "Xiaohongshu Copywriting Assistant"],
    [".case-card:nth-child(2) .case-copy > p:nth-of-type(2)", "A working AI content workspace for briefs, topics, titles, body copy, tags, and publishing advice, built to test search intent, content structure, and conversion language."],
    [".case-card:nth-child(2) li:nth-child(1)", "Next.js MVP covers titles, body copy, tags, publishing advice, and history."],
    [".case-card:nth-child(2) li:nth-child(2)", "Mock fallback supports full demos when no API key is configured."],
    [".case-card:nth-child(2) li:nth-child(3)", "Connects to 20,000+ content views, search exposure, and conversion methods."],
    [".case-card:nth-child(3) .case-role", "Enterprise AI Workflow / Recruiting Evaluation"],
    [".case-card:nth-child(3) p:nth-of-type(2)", "A local-first recruiting workflow covering job criteria, resume parsing, PM resume scoring, interview guides, result calculation, audit, and fairness support."],
    [".case-card:nth-child(3) li:nth-child(1)", "18 test files cover parsing, scoring, interviews, audit, and model connections."],
    [".case-card:nth-child(3) li:nth-child(2)", "Users bring their own model keys; the platform does not hide fallback behavior."],
    [".case-card:nth-child(3) li:nth-child(3)", "Human final decisions are explicitly preserved so AI scores are never the only basis."],
    ["#repo-evidence-title", "Repository evidence"],
    [".repo-evidence-section .section-intro p", "GitHub cards combine project summary, technical scope, and verification proof in one scannable surface."],
    [".repo-grid-wide .repo-card:nth-child(1) > span", "Flagship AI education repo"],
    [".repo-grid-wide .repo-card:nth-child(1) h3", "US College Compass"],
    [".repo-grid-wide .repo-card:nth-child(1) p", "DeepSeek planning, RAG Q&A, student files, resources, school selection, exports, auth, backup, and operations checks form complete product proof."],
    [".repo-grid-wide .repo-card:nth-child(1) b", "npm run verify, audit, RAG eval, security scan"],
    [".repo-grid-wide .repo-card:nth-child(2) > span", "Portfolio source repo"],
    [".repo-grid-wide .repo-card:nth-child(2) h3", "AI Education Console"],
    [".repo-grid-wide .repo-card:nth-child(2) p", "A bilingual static site with AI opening, ambient canvas, Work sticky case, research page, archive wall, and reduced-motion support."],
    [".repo-grid-wide .repo-card:nth-child(2) b", "static HTML, CSS, vanilla JS, canvas motion"],
    [".work-section .section-actions .button:nth-child(1)", "View more archives"],
    [".work-section .section-actions .button:nth-child(2)", "Download Resume"],
  ],
  "research.html": [
    ["#research-title", "Research as an interactive evidence chain"],
    [".research-masthead-copy > p:not(.hero-kicker)", "This page is not a static publication list. It gives readers a path from credible sources, to modeling methods, to how the research informs AI education products."],
    [".research-masthead .hero-actions .button:nth-child(2)", "View publications"],
    [".research-proof article:nth-child(1) span", "public paper records"],
    ["#research-metric-one", "DOI and author records verifiable through Semantic Scholar and Crossref."],
    [".research-proof article:nth-child(2) span", "first-author paper"],
    ["#research-metric-two", "A Frontiers in Sports and Active Living paper on Olympic sport selection modeling."],
    [".research-proof article:nth-child(3) span", "student survey samples"],
    ["#research-metric-three", "Questionnaire scale from the study on international high school students using online learning resources."],
    [".research-proof article:nth-child(4) span", "publication year"],
    ["#research-metric-four", "The public research record aligns with the current AI education product direction."],
    ["#featured-research-title", "Featured paper"],
    [".research-feature .section-intro p", "The first-author paper is first because it best demonstrates the ability to move from complex rules to explainable models."],
    [".featured-paper > p", "This paper turns Olympic sport selection from subjective judgment into a multi-criteria decision problem, using AHP, PCA, and KNN to evaluate candidate sports. It shows that I can decompose open-ended questions into indicators, weights, features, and interpretable outputs."],
    ["#publications-title", "Publications"],
    [".publications-section .section-intro p", "The paper cards are organized by title, source, method, and relationship to the site's main product narrative."],
    [".publication-card:nth-child(1) p", "A data-driven framework using AHP, PCA, and KNN to evaluate future Olympic sport selection."],
    [".publication-card:nth-child(2) p", "A 6-dimension, 22-indicator matrix for evaluating the fit between sports and Olympic core values."],
    [".publication-card:nth-child(3) p", "A 536-student survey analyzing how international high school students use online learning resources."],
    ["#translation-title", "From paper to product"],
    [".research-translation .section-intro p", "The focus is how research enters product judgment, so papers become evidence for my AI education method rather than just a reading list."],
    [".translation-board article:nth-child(1) h3", "Multi-criteria evaluation"],
    [".translation-board article:nth-child(1) p", "AHP, entropy weighting, TOPSIS, PCA, and KNN can transfer into school-fit matching, activity-quality evaluation, and priority ranking."],
    [".translation-board article:nth-child(2) h3", "Real student scenarios"],
    [".translation-board article:nth-child(2) p", "International high school students' online-learning behavior can inform resource recommendation, information-literacy training, and AI learning-assistant hypotheses."],
    [".translation-board article:nth-child(3) h3", "Credible output"],
    [".translation-board article:nth-child(3) p", "DOI records, author order, and source records give admissions readers, mentors, and recruiters a verifiable research entry point."],
  ],
  "novel.html": [
    ["#novel-title", "Inverse Fate Furnace"],
    [".novel-masthead > p:not(.hero-kicker)", "A long-form AI-assisted xianxia novel: Lin Ye rises from the ash of an alchemy furnace and uses an old-law system built from furnace, ash, fire, name, lamp, proof, and debt to push back against sects, old clans, the Su family, and Qingya's old debts."],
    [".novel-masthead .hero-actions .button:nth-child(1)", "View structure"],
    [".novel-masthead .hero-actions .button:nth-child(2)", "View creative system"],
    [".novel-proof article:nth-child(1) span", "completed chapters"],
    ["#novel-metric-one", "A continuous long-form arc from the fate inside furnace ash to the living-dead question of the cold order."],
    [".novel-proof article:nth-child(2) span", "body characters"],
    ["#novel-metric-two", "Used to verify long-form pacing, world consistency, and sustained output."],
    [".novel-proof article:nth-child(3) span", "average chapter length"],
    ["#novel-metric-three", "Short, high-momentum chapters designed for mobile reading and continued updates."],
    [".novel-proof article:nth-child(4) span", "main phases"],
    ["#novel-metric-four", "Outer-court reversal, alchemy-hall trial, southern academy departure, main-hall furnace opening, Su-family old debts, and the old medicine market arc."],
    ["#position-title", "What it shows"],
    [".novel-position-section .section-intro p", "This project is not just 'I wrote a novel.' It shows how I use AI collaboration to complete long-form narrative-system design."],
    [".novel-signal-grid .route-card:nth-child(1) h3", "Rules are not background. They drive the plot."],
    [".novel-signal-grid .route-card:nth-child(1) p", "Furnace, ash, fire, name, lamp, proof, and debt are not decorative terms. They are operating rules for judgment, cultivation, identity, and old debts."],
    [".novel-signal-grid .route-card:nth-child(2) h3", "Characters have clear system functions"],
    [".novel-signal-grid .route-card:nth-child(2) p", "Lin Ye handles evidence and counter-killing; Su Wanqing carries the snow line and Su-family old contracts; Jiang Nianxue carries medicine, living veins, and life-death judgment."],
    [".novel-signal-grid .route-card:nth-child(3) h3", "Use AI for output, preserve consistency through structure"],
    [".novel-signal-grid .route-card:nth-child(3) p", "The hard part is not generating sentences. It is maintaining foreshadowing, terminology, character choices, and chapter hooks over time."],
    [".novel-signal-grid .route-card:nth-child(4) h3", "Treat reader experience as system design"],
    [".novel-signal-grid .route-card:nth-child(4) p", "Short chapters, strong suspense, staged trials, and map shifts make the long-form story feel like an iterative narrative product."],
    ["#story-map-title", "Story map"],
    [".novel-map-section .section-intro p", "I split 133 chapters into six reading phases so visitors can quickly understand the novel's progression."],
    ["#excerpt-title", "Selected lines"],
    [".novel-excerpt-section .section-intro p", "Only short excerpts are shown here, enough to communicate tone without dumping the full text into the personal site."],
    ["#creative-system-title", "Creative system"],
    [".novel-system-section .section-intro p", "The point is method: AI does not replace the author. It is integrated into a long-form production and review workflow."],
  ],
  "archive.html": [
    ["#archive-page-title", "A project archive for the long tail of experiments"],
    [".page-masthead > p:not(.hero-kicker)", "The Archive keeps the homepage focused while preserving a dense scan of AI demos, document workflows, entertainment tests, daily-life tools, and product-planning assets."],
    ["#archive-title", "Archive Wall"],
    [".archive-section .section-intro p", "Research, education, growth, and delivery outcomes are organized as scannable evidence cards."],
    [".archive-item:nth-child(1) .archive-front-copy span", "Flagship education system"],
    [".archive-item:nth-child(1) h3", "US Application Planning Agent"],
    [".archive-item:nth-child(1) .archive-front-copy p", "Student profiles, school knowledge, activity planning, and quality checks are organized into a testable application-strategy console."],
    [".archive-item:nth-child(2) .archive-front-copy span", "Growth content tool"],
    [".archive-item:nth-child(2) h3", "Xiaohongshu Copywriting Assistant"],
    [".archive-item:nth-child(2) .archive-front-copy p", "Briefs, tone, length, titles, body copy, tags, and publishing advice become one content-production pipeline."],
    [".archive-item:nth-child(3) .archive-front-copy span", "Enterprise workflow"],
    [".archive-item:nth-child(3) .archive-front-copy p", "Job criteria, candidate import, screening suggestions, interview guides, audit, and human confirmation in a local-first workflow."],
    [".archive-item:nth-child(4) .archive-front-copy span", "Online prototype"],
    [".archive-item:nth-child(4) .archive-front-copy p", "A local-first 7-day light-meal planner connecting recipes, shopping, meal prep, and weekly review."],
    [".archive-item:nth-child(5) .archive-front-copy span", "Local companion MVP"],
    [".archive-item:nth-child(5) h3", "Perch Voice AI Emotional Companion"],
    [".archive-item:nth-child(5) .archive-front-copy p", "A safer companion-product skeleton using local memory, character boundaries, risk blocking, and feedback logs."],
    [".archive-item:nth-child(6) .archive-front-copy span", "Entertainment evaluation product"],
    [".archive-item:nth-child(6) h3", "Idol Match Test"],
    [".archive-item:nth-child(6) .archive-front-copy p", "A 15-question experience version and 40-question professional version connect to a candidate library for Top 1 / Top 3 matching."],
    [".archive-item:nth-child(7) .archive-front-copy span", "Document workflow"],
    [".archive-item:nth-child(7) .archive-front-copy p", "TXT / DOCX resumes, target JD, Coze file upload, and workflow calls become a runnable local workspace."],
    [".archive-item:nth-child(8) .archive-front-copy span", "Reflective AI tool"],
    [".archive-item:nth-child(8) h3", "Tarot Sanctum"],
    [".archive-item:nth-child(8) .archive-front-copy p", "Local card drawing and spread structure are paired with DeepSeek-generated Chinese reflection reports."],
    [".archive-item:nth-child(9) .archive-front-copy span", "Planning prototype"],
    [".archive-item:nth-child(9) .archive-front-copy p", "Destination, days, budget, preference, and travel style become editable, copyable, exportable multi-day itineraries."],
    [".archive-item:nth-child(10) .archive-front-copy span", "Public-safety tool"],
    [".archive-item:nth-child(10) h3", "Ask First - Elder Fraud Assistant"],
    [".archive-item:nth-child(10) .archive-front-copy p", "SMS, phone scripts, investment group messages, and screenshot context become elder-readable risk judgments."],
    [".archive-item:nth-child(11) .archive-front-copy span", "Personality test product"],
    [".archive-item:nth-child(11) h3", "Qingqing Grassland Personality Tester"],
    [".archive-item:nth-child(11) .archive-front-copy p", "Stable scoring and light expression connect a 30-question professional version and 15-question experience version to 20 personality outcomes."],
    [".archive-item:nth-child(12) .archive-front-copy span", "Product planning asset"],
    [".archive-item:nth-child(12) h3", "AI Product Ideation and Requirement Pool"],
    [".archive-item:nth-child(12) .archive-front-copy p", "Life scenarios, user feedback, clarification questions, and roadmap candidates become the input system for the next AI demo."],
  ],
  "contact.html": [
    ["#contact-page-title", "Contact and next steps"],
    [".page-masthead > p:not(.hero-kicker)", "If you are an admissions officer, project mentor, or internship recruiter, use the work, research, and delivery evidence to decide whether we should talk."],
    ["#contact-title", "Open the education console."],
    [".contact-copy p", "Good reasons to reach out include AI education products, application-planning systems, RAG or agent prototypes, growth-content tools, AI product-management internships, and education-technology collaborations."],
    [".contact-actions .button:nth-child(2)", "Phone"],
    [".contact-actions .button:nth-child(4)", "Resume"],
    ["#contact-routes-title", "Before reaching out"],
    [".route-section .section-intro p", "Different readers can start from different pages, so nobody has to scroll through one overloaded long page."],
    [".route-card:nth-child(1) h3", "Start with About"],
    [".route-card:nth-child(1) p", "Understand the education background, research credibility, product method, and capability matrix."],
    [".route-card:nth-child(2) h3", "Start with Work"],
    [".route-card:nth-child(2) p", "Quickly evaluate core projects, engineering delivery, and AI product-management ability."],
    [".route-card:nth-child(3) h3", "Then read Research"],
    [".route-card:nth-child(3) p", "Verify Scholar papers, DOI records, modeling methods, and education-research evidence."],
    [".route-card:nth-child(4) h3", "Also read Novel"],
    [".route-card:nth-child(4) p", "Understand AI-assisted long-form creation, worldbuilding systems, and sustained content production."],
    [".route-card:nth-child(5) h3", "Then scan Archive"],
    [".route-card:nth-child(5) p", "See more demos, document workflows, daily-life prototypes, and requirement assets."],
  ],
};

const pageLanguageGroups = {
  "index.html": [
    [
      ".top-nav a",
      ["Home", "About", "Work", "Research", "Novel", "Contact"],
    ],
    [
      ".route-card span",
      ["01 / About", "02 / Work", "03 / Research", "04 / Novel", "05 / Archive", "06 / Contact"],
    ],
    [
      ".summary-card span",
      ["AI Product / Education", "Growth Product", "AI Workflow / Recruiting"],
    ],
  ],
  "about.html": [
    [
      ".top-nav a",
      ["Home", "About", "Work", "Research", "Novel", "Contact"],
    ],
    [
      ".tab",
      ["AI Education", "Product Delivery", "Growth Evidence", "Research Output", "Design System"],
    ],
    [
      ".stack-panel h3",
      ["AI Education Layer", "Product Delivery Layer", "Growth Evidence Layer", "Research Output Layer", "Cobalt Intelligence Design System"],
    ],
    [
      ".stack-panel p",
      [
        "Prompt engineering, RAG, agent skills, student profiles, application strategy, OpenAI Responses API, and DeepSeek-compatible APIs.",
        "HTML, CSS, JavaScript, TypeScript, React, Next.js, Node.js, REST APIs, SQLite, better-sqlite3, auth, and testing.",
        "User-feedback triage, requirement classification, prioritization, keyword mining, search-intent analysis, Xiaohongshu content planning, DM conversion, and 20,000+ view validation.",
        "Markdown, YAML, JSON, CSV / XLSX, python-docx, Word-readable .doc HTML exports, modeling papers, and Scholar evidence.",
        "A restrained technology palette: cold white, graphite black, and signal blue. Green is reserved for verified states, amber for growth evidence, and red only for risk.",
      ],
    ],
  ],
  "work.html": [
    [
      ".top-nav a",
      ["Home", "About", "Work", "Research", "Novel", "Contact"],
    ],
  ],
  "research.html": [
    [
      ".top-nav a",
      ["Home", "About", "Work", "Research", "Novel", "Contact"],
    ],
    [
      ".paper-tags li",
      ["AHP", "PCA", "KNN", "Decision modeling", "Entropy weight", "TOPSIS", "Evaluation matrix", "536 survey samples", "Digital learning", "Information literacy"],
    ],
    [
      ".translation-board span",
      ["Decision models", "Education survey", "Publication record"],
    ],
  ],
  "novel.html": [
    [
      ".top-nav a",
      ["Home", "About", "Work", "Research", "Novel", "Contact"],
    ],
    [
      ".novel-arc h3",
      [
        "Outer-court reversal and Black Pine secret realm",
        "The third furnace and the alchemy-hall trial",
        "Snow blood, the southern academy, and the three-person departure",
        "Living proof opens its register; the main hall opens the furnace",
        "The Su-family line and the nameless fire debt",
        "Old medicine market and the lamp-ruin arc",
      ],
    ],
    [
      ".novel-arc p",
      [
        "Lin Ye wakes as a low-status alchemy servant, breaks the waste-label system, enters the Black Pine secret realm, and pulls out old-well evidence, a blue-fire command, and the third furnace.",
        "The conflict shifts from personal counterattack to institutional backlash. The alchemy hall, ash archive, fire-questioning platform, and furnace ash form the first major trial.",
        "Lin Ye, Su Wanqing, and Jiang Nianxue become a stable trio. Snow lines, blood contracts, the second fire, and the third fire push the conflict toward larger old debts.",
        "Living proof, old names, furnace eyes, seven lamps, and half a bowl of ash become keywords as the protagonist forces the system to acknowledge evidence.",
        "The cleansing pool, old protector token, disaster room, burning name, red-gold lamp, and empty-seat lamp-return turn the central question toward Lin Ye's name and origin.",
        "The story moves from sects and sword conflicts into the old medicine market, the lamp-less shop, and the lamp ruins, pausing at the entrance to a new mystery: first find the severed palm.",
      ],
    ],
    [
      ".excerpt-card p",
      [
        "Furnace ash will eventually scatter in the wind, but furnace fire will not.",
        "From this moment on, even the ground outside the well became a battlefield.",
        "The living eat. Only then does the lamp have somewhere to return.",
      ],
    ],
    [
      ".excerpt-card cite",
      [
        "Chapter 3, The Hunter of Black Pine Forest",
        "Chapter 11, A Shadow Left Outside the Well",
        "Chapter 123, Well Water Illuminates the Thread",
      ],
    ],
    [
      ".novel-system-path .path-step p",
      [
        "Define the central difference: evidence-chain xianxia, where the thrill comes from using evidence to counter-kill rules.",
        "Build a lexicon around furnace, ash, fire, name, lamp, proof, and debt so every term carries plot function.",
        "Manage maps, enemies, mysteries, staged victories, and next hooks by arc.",
        "Use AI to expand chapter output, then review for character motivation, voice continuity, and ending hooks.",
        "Check terminology fatigue, pacing pressure, staged payoff, and repeated character functions.",
        "The personal site shows the project layer. The full text can later be split into sample chapters, setting notes, or a chapter index.",
      ],
    ],
  ],
  "archive.html": [
    [
      ".top-nav a",
      ["Home", "About", "Work", "Research", "Novel", "Contact"],
    ],
    [
      ".archive-back > p",
      [
        "Includes DeepSeek planning, RAG Q&A, resource libraries, school encyclopedia, activity-quality checks, JSON / Word export, login auth, and planning storage.",
        "Used to validate search intent, content structure, and DM conversion language. The demo still works when no API key is configured.",
        "Positioned as recruiting assistance, not automated hiring. AI output must include evidence and missing-information flags.",
        "Covers DeepSeek 7-day meal prep, ingredient-nutrition RAG, recipe RAG, shopping 2.0, weekly memory loops, and Markdown review export.",
        "Upgraded from a local chat prototype into an MVP with age confirmation, fictional roles, relationship stages, daily events, voice reading, feedback, and risk logs.",
        "Built with Next.js, TypeScript, and Tailwind. The candidate library comes from a global young-idol knowledge base, then DeepSeek explains match reasons.",
        "A local Node service uploads resume text to the Coze file API, calls a workflow, and returns a generated document link or debug information.",
        "The product supports relationship, career, and wealth questions. Local code handles the deck, three-card positions, upright / reversed states, and spread structure.",
        "The first version uses a local rule generator, with an optional AI assistant layer. Without a key or on failure, it falls back to local suggestions.",
        "Provides screenshot preview, suspicious-message paste, local risk judgment, three-level conclusions, suspicious-point markup, and messages children can verify.",
        "An entertainment-style but stable self-understanding product with five-dimension scoring, keywords, strengths, blind spots, and relationship advice.",
        "Not a single page, but an incubation layer: ideation, requirement classification, clarification items, and roadmap candidates form a long-term method.",
      ],
    ],
    [
      ".archive-detail-list li",
      [
        "Knowledge base covers AP, competitions, extracurriculars, majors, research projects, schools, and summer programs.",
        "Product layer includes admin, resource-library, school-selection, my-activities, and planning-tracker pages.",
        "Engineering layer is backed by RAG, auth, export, and layout tests.",
        "Input fields make topic, product, audience, tone, and type explicit.",
        "Output covers generation, optimization, copy feedback, and history loops.",
        "Useful for validating growth content and AI copywriting tools.",
        "Organizations connect and verify their own model APIs first.",
        "Keeps HR weighting, audit export, and fairness support visible.",
        "Final judgment remains explicitly human.",
        "Server layer separates DeepSeek client, planning, replacement, and weekly review.",
        "Public layer supports shopping checks, daily execution, and history replay.",
        "Production handoff keeps both Vercel functions and local service paths.",
        "Frontend modules separate chat, state, memory, and beta notes.",
        "Safety boundaries cover crisis language, minors, real-person simulation, and explicit content.",
        "Keeps character visual walls and life-scene images as design assets.",
        "The knowledge base generates an 85KB-scale candidate dataset.",
        "User preferences are formed first, then a candidate shortlist is passed to the model.",
        "Results include MATCH MAP, share copy, and downloadable posters.",
        "DOCX parsing reads word/document.xml to extract body text.",
        "Keys and third-party agent workflows are explicitly isolated.",
        "Verification scripts cover syntax, smoke checks, and node tests.",
        "The core experience is judgment-oriented three-card reading.",
        "API routes request strict JSON and normalize the report.",
        "The roadmap adds review, continuity, and follow-up observation.",
        "Output is a multi-day itinerary rather than a single paragraph of advice.",
        "Core interactions support editing, saving, copying, and export.",
        "The roadmap keeps a confirmation workbench and AI assist layer.",
        "Fraud scenarios are translated into plain-language risk explanations.",
        "Risk points cover transfers, secrecy, police claims, high-yield investment, and verification codes.",
        "Future versions can add OCR or multimodal screenshot recognition.",
        "Dimensions include social energy, action style, relationship strategy, risk preference, and emotional expression.",
        "Normalized scoring maps users to 20 original grassland-inspired personality types.",
        "The roadmap keeps test modes, sharing, and result-experience improvements.",
        "Opportunity judgment is compressed into 2-6 week prototypes and 10-30 test users.",
        "The method emphasizes domain context, data loops, trust mechanisms, and human confirmation.",
        "Continues to break down household tasks, fridge meals, safer shopping, and elder fraud-prevention scenarios.",
      ],
    ],
  ],
  "contact.html": [
    [
      ".top-nav a",
      ["Home", "About", "Work", "Research", "Novel", "Contact"],
    ],
  ],
};

const pageKey = (() => {
  const file = window.location.pathname.split("/").pop();
  return file || "index.html";
})();

const rememberOriginalText = (element) => {
  if (!originalTextByElement.has(element)) originalTextByElement.set(element, element.textContent);
};

const setElementLanguageText = (element, lang, englishText) => {
  rememberOriginalText(element);
  element.textContent = lang === "en" ? englishText : originalTextByElement.get(element);
};

const applyPageLanguageText = (lang) => {
  (pageLanguageText[pageKey] || []).forEach(([selector, englishText]) => {
    const element = document.querySelector(selector);
    if (!element) return;
    setElementLanguageText(element, lang, englishText);
  });
  (pageLanguageGroups[pageKey] || []).forEach(([selector, englishTexts]) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      const englishText = englishTexts[index];
      if (!englishText) return;
      setElementLanguageText(element, lang, englishText);
    });
  });
};

const updateLanguageToggles = (lang) => {
  document.querySelectorAll("[data-lang-toggle]").forEach((button) => {
    button.textContent = lang === "zh" ? "EN" : "中文";
    button.setAttribute("aria-label", lang === "zh" ? "Switch to English" : "Switch to Chinese");
    button.setAttribute("aria-pressed", lang === "en" ? "true" : "false");
    button.title = lang === "zh" ? "Switch to English" : "Switch to Chinese";
  });
};

const ensureLanguageToggle = () => {
  document.querySelectorAll(".site-header").forEach((header) => {
    if (header.querySelector("[data-lang-toggle]")) return;
    const button = document.createElement("button");
    button.className = "language-toggle";
    button.type = "button";
    button.dataset.langToggle = "";
    const resume = header.querySelector(".header-resume");
    header.insertBefore(button, resume || null);
  });
  updateLanguageToggles(currentLang);
};

const updateNetworkInspector = () => {
  const mode = networkModeCopy[currentNetworkMode];
  const label = document.getElementById("network-mode-label");
  const body = document.getElementById("network-mode-copy");
  if (!mode || !label || !body) return;
  label.textContent = mode.label;
  body.textContent = mode[currentLang];
};

const updateLayerDetail = () => {
  const detail = layerDetails[currentLayer];
  const title = document.getElementById("layer-detail-title");
  const body = document.getElementById("layer-detail-copy");
  if (!detail || !title || !body) return;
  title.textContent = detail.title;
  body.textContent = detail[currentLang];
};

const updateEvidenceStepDetail = () => {
  const detail = evidenceStepDetails[currentEvidenceStep];
  const label = document.getElementById("evidence-step-label");
  const body = document.getElementById("evidence-step-copy");
  if (!detail || !label || !body) return;
  label.textContent = detail.label;
  body.textContent = detail[currentLang];
};

const activateEvidenceStep = (step, userIntent = false) => {
  if (!evidenceStepOrder.includes(step) || !evidenceStepDetails[step]) return;
  currentEvidenceStep = step;
  if (userIntent) userSelectedEvidenceStep = true;

  document.body.dataset.evidenceStep = step;

  document.querySelectorAll("[data-evidence-step]").forEach((item) => {
    const active = item.dataset.evidenceStep === step;
    item.classList.toggle("is-current", active);
    item.setAttribute("aria-pressed", String(active));
  });

  const panel = evidencePanelByStep[step];
  document.querySelectorAll("[data-evidence-panel]").forEach((item) => {
    item.classList.toggle("is-current", item.dataset.evidencePanel === panel);
  });

  updateEvidenceStepDetail();
};

const stopEvidenceJourneyTimer = () => {
  window.clearInterval(evidenceJourneyTimer);
  evidenceJourneyTimer = 0;
};

const startEvidenceJourneyTimer = () => {
  if (reduceMotion || userSelectedEvidenceStep || evidenceJourneyTimer) return;
  evidenceJourneyTimer = window.setInterval(() => {
    if (userSelectedEvidenceStep || document.hidden) return;
    const nextIndex = (evidenceStepOrder.indexOf(currentEvidenceStep) + 1) % evidenceStepOrder.length;
    activateEvidenceStep(evidenceStepOrder[nextIndex]);
  }, 4200);
};

const activateLayer = (layer) => {
  if (!layerOrder.includes(layer) || !layerDetails[layer]) return;
  currentLayer = layer;

  document.querySelectorAll("[data-layer]").forEach((item) => {
    const active = item.dataset.layer === layer;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-pressed", String(active));
  });

  document.querySelectorAll("[data-sequence-layer]").forEach((item) => {
    const active = item.dataset.sequenceLayer === layer;
    item.classList.toggle("is-current", active);
    item.setAttribute("aria-pressed", String(active));
  });

  document.querySelectorAll("[data-proof-hotspot]").forEach((item) => {
    const active = item.dataset.proofHotspot === layer;
    item.classList.toggle("is-current", active);
    item.setAttribute("aria-pressed", String(active));
  });

  document.querySelectorAll(".layered-visual").forEach((visual) => {
    visual.dataset.activeLayer = layer;
  });

  document.querySelectorAll("[data-layer-sequence]").forEach((sequence) => {
    sequence.dataset.activeLayer = layer;
  });

  updateLayerDetail();
};

const setLocalPointerVars = (element, event, tilt = false) => {
  const rect = element.getBoundingClientRect();
  const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
  element.style.setProperty("--local-x", `${x * 100}%`);
  element.style.setProperty("--local-y", `${y * 100}%`);

  if (tilt) {
    element.style.setProperty("--rotate-x", `${(0.5 - y) * 5}deg`);
    element.style.setProperty("--rotate-y", `${(x - 0.5) * 7}deg`);
  }
};

if (!reduceMotion && finePointer) {
  window.addEventListener(
    "pointermove",
    (event) => {
      document.body.classList.add("has-cursor");
      document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
      ambientPointer = {
        x: event.clientX / Math.max(window.innerWidth, 1),
        y: event.clientY / Math.max(window.innerHeight, 1),
        active: true,
      };
    },
    { passive: true },
  );

  document.querySelectorAll(".hero-art, .audience-card, .case-card, .stack-panel, .path-step, .evidence-shot-card, .repo-card").forEach((surface) => {
    surface.addEventListener("pointermove", (event) => setLocalPointerVars(surface, event), {
      passive: true,
    });
    surface.addEventListener("pointerleave", () => {
      surface.style.removeProperty("--local-x");
      surface.style.removeProperty("--local-y");
    });
  });

  document.querySelectorAll("[data-tilt-card]").forEach((card) => {
    card.addEventListener("pointermove", (event) => setLocalPointerVars(card, event, true), {
      passive: true,
    });
    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--local-x");
      card.style.removeProperty("--local-y");
      card.style.removeProperty("--rotate-x");
      card.style.removeProperty("--rotate-y");
    });
  });
}

const scrambleText = (element, finalText) => {
  if (reduceMotion || finalText.length > 34) {
    element.textContent = finalText;
    return;
  }

  const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const steps = 12;
  let frame = 0;

  const tick = () => {
    const progress = frame / steps;
    element.textContent = finalText
      .split("")
      .map((char, index) => {
        if (char.trim() === "" || index / finalText.length < progress) return char;
        return glyphs[Math.floor(Math.random() * glyphs.length)];
      })
      .join("");

    frame += 1;
    if (frame <= steps) requestAnimationFrame(tick);
    else element.textContent = finalText;
  };

  tick();
};

const applyLanguage = (lang, options = {}) => {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.title = copy[lang].pageTitle;
  document.querySelector('meta[name="description"]')?.setAttribute("content", copy[lang].metaDescription);
  document.body.classList.toggle("lang-en", lang === "en");
  document.body.classList.add("is-switching");
  updateLanguageToggles(lang);

  window.setTimeout(() => {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      const next = copy[lang][key];
      if (!next) return;
      if (element.id === "hero-title" && !options.instant) scrambleText(element, next);
      else element.textContent = next;
    });
    applyPageLanguageText(lang);
    updateNetworkInspector();
    updateLayerDetail();
    updateEvidenceStepDetail();
    document.body.classList.remove("is-switching");
  }, reduceMotion || options.instant ? 0 : 120);
};

ensureLanguageToggle();
document.querySelectorAll("[data-lang-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    currentLang = currentLang === "zh" ? "en" : "zh";
    writeLanguagePreference(currentLang);
    applyLanguage(currentLang);
  });
});
applyLanguage(currentLang, { instant: true });

const activateNetworkMode = (mode, userIntent = false) => {
  if (!networkModeOrder.includes(mode)) return;
  currentNetworkMode = mode;
  if (userIntent) userSelectedNetworkMode = true;
  document.querySelectorAll("[data-network-mode]").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.networkMode === mode);
  });
  updateNetworkInspector();
};

document.querySelectorAll("[data-network-mode]").forEach((button) => {
  button.addEventListener("click", () => activateNetworkMode(button.dataset.networkMode, true));
});

document.querySelectorAll("[data-evidence-step]").forEach((button) => {
  const step = button.dataset.evidenceStep;
  button.addEventListener("click", () => activateEvidenceStep(step, true));
  button.addEventListener("focus", () => activateEvidenceStep(step, true));
  if (finePointer) {
    button.addEventListener("pointerenter", () => activateEvidenceStep(step));
  }
});

if (!reduceMotion) {
  window.setInterval(() => {
    if (userSelectedNetworkMode || document.hidden) return;
    const nextIndex = (networkModeOrder.indexOf(currentNetworkMode) + 1) % networkModeOrder.length;
    activateNetworkMode(networkModeOrder[nextIndex]);
  }, 5200);
}

document.querySelectorAll("[data-layer]").forEach((button) => {
  const layer = button.dataset.layer;
  button.addEventListener("click", () => activateLayer(layer));
  button.addEventListener("focus", () => activateLayer(layer));
  if (finePointer) {
    button.addEventListener("pointerenter", () => activateLayer(layer));
  }
});

document.querySelectorAll("[data-sequence-layer]").forEach((button) => {
  const layer = button.dataset.sequenceLayer;
  button.addEventListener("click", () => activateLayer(layer));
  button.addEventListener("focus", () => activateLayer(layer));
  if (finePointer) {
    button.addEventListener("pointerenter", () => activateLayer(layer));
  }
});

document.querySelectorAll("[data-proof-hotspot]").forEach((button) => {
  const layer = button.dataset.proofHotspot;
  button.addEventListener("click", () => activateLayer(layer));
  button.addEventListener("focus", () => activateLayer(layer));
  if (finePointer) {
    button.addEventListener("pointerenter", () => activateLayer(layer));
  }
});

activateEvidenceStep(currentEvidenceStep);
activateLayer(currentLayer);

const animateMetric = (metric) => {
  const number = metric.querySelector("[data-count]");
  if (!number || metric.dataset.counted === "true") return;
  metric.dataset.counted = "true";
  const target = Number(number.dataset.count);
  const suffix = number.dataset.suffix || "";
  if (!Number.isFinite(target) || reduceMotion) {
    number.textContent = target.toLocaleString("en-US") + suffix;
    return;
  }

  const start = performance.now();
  const duration = 1150;
  const step = (now) => {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    number.textContent = value.toLocaleString("en-US") + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

const navLinks = Array.from(document.querySelectorAll(".top-nav a"));
const resolveSamePageHash = (href) => {
  if (!href) return "";
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return "";
    return url.hash;
  } catch (_error) {
    return href.startsWith("#") ? href : "";
  }
};
const sections = navLinks
  .map((link) => resolveSamePageHash(link.getAttribute("href")))
  .filter(Boolean)
  .map((hash) => document.querySelector(hash))
  .filter(Boolean);

const setActiveLink = (id) => {
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", resolveSamePageHash(link.getAttribute("href")) === `#${id}`);
  });
};

const setActivePageLink = () => {
  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  navLinks.forEach((link) => {
    try {
      const url = new URL(link.getAttribute("href"), window.location.href);
      const targetFile = url.pathname.split("/").pop() || "index.html";
      link.classList.toggle("is-active", targetFile === currentFile && !url.hash);
    } catch (_error) {
      link.classList.remove("is-active");
    }
  });
};

document.body.dataset.bgMode = "hero";

if (!sections.length) setActivePageLink();

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) setActiveLink(visible.target.id);
    },
    {
      rootMargin: "-30% 0px -55% 0px",
      threshold: [0.18, 0.38, 0.62],
    },
  );

  sections.forEach((section) => sectionObserver.observe(section));

  const backgroundModes = new Map([
    ["top", "hero"],
    ["audience", "audience"],
    ["motion", "motion"],
    ["work", "work"],
    ["publications", "research"],
    ["system", "system"],
    ["stack", "stack"],
    ["archive", "archive"],
    ["contact", "contact"],
  ]);

  const backgroundObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      document.body.dataset.bgMode = backgroundModes.get(visible.target.id) || "hero";
    },
    {
      rootMargin: "-22% 0px -46% 0px",
      threshold: [0.12, 0.28, 0.48],
    },
  );

  backgroundModes.forEach((_mode, id) => {
    const section = document.getElementById(id);
    if (section) backgroundObserver.observe(section);
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          if (entry.target.matches("[data-metric]")) animateMetric(entry.target);
          entry.target.querySelectorAll?.("[data-metric]").forEach(animateMetric);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 },
  );

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

  const path = document.querySelector(".system-path");
  const pathSteps = Array.from(document.querySelectorAll("[data-path-step]"));
  const pathObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || !path) return;
        const index = Number(entry.target.dataset.pathStep);
        const progress = pathSteps.length <= 1 ? 1 : index / (pathSteps.length - 1);
        path.style.setProperty("--path-progress", String(progress));
        pathSteps.forEach((step, stepIndex) => {
          step.classList.toggle("is-current", stepIndex <= index);
        });
      });
    },
    {
      rootMargin: "-35% 0px -45% 0px",
      threshold: 0.35,
    },
  );
  pathSteps.forEach((step) => pathObserver.observe(step));

  const evidenceJourney = document.querySelector(".evidence-journey");
  if (evidenceJourney) {
    const evidenceObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        if (visible) {
          activateEvidenceStep(currentEvidenceStep);
          startEvidenceJourneyTimer();
        } else {
          stopEvidenceJourneyTimer();
        }
      },
      {
        rootMargin: "-20% 0px -30% 0px",
        threshold: 0.24,
      },
    );
    evidenceObserver.observe(evidenceJourney);
  }

  const sequenceSteps = Array.from(document.querySelectorAll("[data-sequence-layer]"));
  if (!reduceMotion && sequenceSteps.length) {
    const sequenceObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) activateLayer(visible.target.dataset.sequenceLayer);
      },
      {
        rootMargin: "-34% 0px -46% 0px",
        threshold: [0.22, 0.42, 0.66],
      },
    );
    sequenceSteps.forEach((step) => sequenceObserver.observe(step));
  }
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
}

const stackTabs = Array.from(document.querySelectorAll(".tab"));
const stackPanels = Array.from(document.querySelectorAll(".stack-panel"));
const stackEmpty = document.querySelector("[data-stack-empty]");

const selectStackPanel = (tab) => {
  const target = tab.dataset.tab;
  if (!target) return;

  stackEmpty?.setAttribute("hidden", "");
  stackTabs.forEach((item) => {
    const active = item === tab;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-selected", String(active));
  });
  stackPanels.forEach((panel) => {
    const active = panel.dataset.panel === target;
    panel.classList.toggle("is-active", active);
    panel.hidden = !active;
  });
};

stackTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectStackPanel(tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const lastIndex = stackTabs.length - 1;
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? lastIndex
          : event.key === "ArrowLeft"
            ? (index + lastIndex) % stackTabs.length
            : (index + 1) % stackTabs.length;
    stackTabs[nextIndex].focus();
    selectStackPanel(stackTabs[nextIndex]);
  });
});

document.querySelectorAll("[data-metric]").forEach((metric) => {
  const toggleMetric = () => {
    const expanded = metric.classList.toggle("is-expanded");
    metric.setAttribute("aria-expanded", String(expanded));
  };

  metric.addEventListener("click", toggleMetric);
  metric.addEventListener("keydown", (event) => {
    if (!["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    toggleMetric();
  });
});

const researchFlow = document.querySelector(".research-flow");
const researchSteps = Array.from(document.querySelectorAll("[data-research-step]"));
let researchStepIndex = 0;
let researchFlowTimer = 0;

const selectResearchStep = (targetStep) => {
  if (!researchFlow || !researchSteps.length) return;
  const nextIndex = Number(targetStep.dataset.researchStep || 0);
  researchStepIndex = Number.isFinite(nextIndex) ? nextIndex : 0;
  const progress = researchSteps.length <= 1 ? 1 : researchStepIndex / (researchSteps.length - 1);
  researchFlow.style.setProperty("--research-flow-progress", String(progress));
  researchSteps.forEach((step, index) => {
    const active = index === researchStepIndex;
    step.classList.toggle("is-active", active);
    step.classList.toggle("is-past", index < researchStepIndex);
    step.setAttribute("aria-pressed", String(active));
  });
};

researchSteps.forEach((step, index) => {
  step.addEventListener("click", () => {
    window.clearInterval(researchFlowTimer);
    selectResearchStep(step);
  });
  step.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const lastIndex = researchSteps.length - 1;
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? lastIndex
          : event.key === "ArrowLeft"
            ? Math.max(0, index - 1)
            : Math.min(lastIndex, index + 1);
    window.clearInterval(researchFlowTimer);
    researchSteps[nextIndex].focus();
    selectResearchStep(researchSteps[nextIndex]);
  });
});

if (researchSteps.length) {
  selectResearchStep(researchSteps[0]);
  if (!reduceMotion) {
    researchFlowTimer = window.setInterval(() => {
      researchStepIndex = (researchStepIndex + 1) % researchSteps.length;
      selectResearchStep(researchSteps[researchStepIndex]);
    }, 1900);
  }
}

document.querySelectorAll("[data-paper-card]").forEach((card) => {
  if (reduceMotion) return;
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty("--paper-x", String(x));
    card.style.setProperty("--paper-y", String(y));
  });
  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--paper-x", "0");
    card.style.setProperty("--paper-y", "0");
  });
});

if (!reduceMotion) {
  const flowSteps = Array.from(document.querySelectorAll("[data-flow-step]"));
  let flowIndex = 0;
  const setFlowStep = () => {
    flowSteps.forEach((step, index) => {
      step.classList.toggle("is-active", index === flowIndex);
      step.classList.toggle("is-past", index < flowIndex);
    });
    const visual = document.querySelector(".workflow-visual");
    if (visual && flowSteps.length > 1) {
      visual.style.setProperty("--flow-progress", String(flowIndex / (flowSteps.length - 1)));
    }
    flowIndex = (flowIndex + 1) % flowSteps.length;
  };
  if (flowSteps.length) {
    setFlowStep();
    window.setInterval(setFlowStep, 1600);
  }

  const layeredVisual = document.querySelector(".layered-visual");
  layeredVisual?.addEventListener("pointermove", (event) => {
    const rect = layeredVisual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    layeredVisual.style.setProperty("--tilt-x", String(x));
    layeredVisual.style.setProperty("--tilt-y", String(y));
  });
  layeredVisual?.addEventListener("pointerleave", () => {
    layeredVisual.style.setProperty("--tilt-x", "0");
    layeredVisual.style.setProperty("--tilt-y", "0");
  });

  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.18;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.18;
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });

    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });
}

const ambientCanvas = document.getElementById("ambientCanvas");
const ambientCtx = ambientCanvas?.getContext("2d");
let ambientNodes = [];
let ambientPackets = [];

const getAmbientModeTarget = (node, index, width, height, now, mode) => {
  const t = now / 1000 + node.phase;
  const slot = index % 16;
  const band = Math.floor(index / 16) % 5;

  if (mode === "motion") {
    return {
      x: width * (0.1 + slot * 0.055),
      y: height * (0.48 + Math.sin(t * 1.3 + slot * 0.52) * (0.16 + band * 0.018)),
    };
  }

  if (mode === "audience") {
    const side = index % 2;
    const centerX = [0.28, 0.72][side] * width;
    const centerY = [0.42, 0.5][side] * height;
    const angle = (slot / 16) * Math.PI * 2 + t * 0.2;
    return {
      x: centerX + Math.cos(angle) * (58 + band * 18),
      y: centerY + Math.sin(angle) * (44 + band * 12),
    };
  }

  if (mode === "work") {
    const cluster = index % 3;
    const centerX = [0.22, 0.56, 0.82][cluster] * width;
    const centerY = [0.32, 0.56, 0.42][cluster] * height;
    const angle = (slot / 16) * Math.PI * 2 + t * 0.18;
    return {
      x: centerX + Math.cos(angle) * (42 + band * 15),
      y: centerY + Math.sin(angle) * (38 + band * 13),
    };
  }

  if (mode === "system") {
    return {
      x: width * (0.12 + (slot % 8) * 0.105),
      y: height * (0.24 + (band % 5) * 0.13 + Math.sin(t + slot) * 0.018),
    };
  }

  if (mode === "stack") {
    return {
      x: width * (0.16 + (slot % 6) * 0.13),
      y: height * (0.2 + (Math.floor(slot / 3) + band) * 0.085),
    };
  }

  if (mode === "archive") {
    return {
      x: width * (0.12 + (slot % 4) * 0.2 + Math.sin(t * 0.35) * 0.012),
      y: height * (0.24 + (band % 4) * 0.14),
    };
  }

  if (mode === "research") {
    const lane = index % 5;
    const phase = t * (0.24 + lane * 0.03);
    return {
      x: width * (0.14 + lane * 0.18 + Math.sin(phase) * 0.018),
      y: height * (0.18 + (band % 5) * 0.145 + Math.cos(phase + slot) * 0.028),
    };
  }

  if (mode === "contact") {
    const angle = (slot / 16) * Math.PI * 2 + t * 0.14;
    return {
      x: width * 0.5 + Math.cos(angle) * (70 + band * 18),
      y: height * 0.78 + Math.sin(angle) * (34 + band * 8),
    };
  }

  const radius = 0.12 + (band % 4) * 0.06;
  const angle = (slot / 16) * Math.PI * 2 + t * 0.12;
  return {
    x: width * (0.55 + Math.cos(angle) * radius),
    y: height * (0.42 + Math.sin(angle) * radius),
  };
};

const resizeAmbientCanvas = () => {
  if (!ambientCanvas || !ambientCtx) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  ambientCanvas.width = Math.max(1, Math.floor(width * ratio));
  ambientCanvas.height = Math.max(1, Math.floor(height * ratio));
  ambientCanvas.style.width = `${width}px`;
  ambientCanvas.style.height = `${height}px`;
  ambientCtx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = width < 760 ? 48 : Math.max(76, Math.min(136, Math.floor(width / 11)));
  ambientNodes = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    r: index % 13 === 0 ? 2.8 : 1.6,
    phase: Math.random() * Math.PI * 2,
    group: networkModeOrder[index % networkModeOrder.length],
  }));

  ambientPackets = Array.from({ length: width < 760 ? 8 : 18 }, (_, index) => ({
    lane: index % 6,
    speed: 0.00009 + (index % 5) * 0.000018,
    offset: Math.random(),
    phase: Math.random() * Math.PI * 2,
  }));
};

const drawAmbientBackground = () => {
  if (!ambientCanvas || !ambientCtx) return;
  const width = ambientCanvas.clientWidth;
  const height = ambientCanvas.clientHeight;
  const now = performance.now();
  const mode = document.body.dataset.bgMode || "hero";
  const styles = getComputedStyle(document.documentElement);
  const accent = styles.getPropertyValue("--accent").trim();
  const muted = styles.getPropertyValue("--muted").trim();
  const ink = styles.getPropertyValue("--ink").trim();

  ambientCtx.clearRect(0, 0, width, height);

  const waveCount = width < 760 ? 4 : 7;
  for (let lane = 0; lane < waveCount; lane += 1) {
    const y = height * (0.16 + lane * 0.12);
    ambientCtx.beginPath();
    for (let x = -40; x <= width + 40; x += 28) {
      const wave = Math.sin(x * 0.008 + now * 0.00045 + lane) * (10 + lane * 2);
      const yy = y + wave;
      if (x === -40) ambientCtx.moveTo(x, yy);
      else ambientCtx.lineTo(x, yy);
    }
    ambientCtx.strokeStyle = lane % 2 === 0 ? accent : muted;
    ambientCtx.globalAlpha = lane % 2 === 0 ? 0.08 : 0.045;
    ambientCtx.lineWidth = 1;
    ambientCtx.stroke();
  }

  ambientNodes.forEach((node, index) => {
    const target = getAmbientModeTarget(node, index, width, height, now, mode);
    const activeGroup = mode === "hero" ? node.group === currentNetworkMode : true;
    node.x += (target.x - node.x) * (activeGroup ? 0.006 : 0.0025);
    node.y += (target.y - node.y) * (activeGroup ? 0.006 : 0.0025);
    node.x += node.vx;
    node.y += node.vy;

    if (ambientPointer.active && finePointer) {
      const px = ambientPointer.x * width;
      const py = ambientPointer.y * height;
      const dx = node.x - px;
      const dy = node.y - py;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 220) {
        node.x += dx * 0.0015;
        node.y += dy * 0.0015;
      }
    }

    if (node.x < -20) node.x = width + 20;
    if (node.x > width + 20) node.x = -20;
    if (node.y < -20) node.y = height + 20;
    if (node.y > height + 20) node.y = -20;
  });

  for (let i = 0; i < ambientNodes.length; i += 1) {
    for (let j = i + 1; j < ambientNodes.length; j += 1) {
      const a = ambientNodes[i];
      const b = ambientNodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 96) continue;
      ambientCtx.strokeStyle = a.group === b.group ? accent : ink;
      ambientCtx.globalAlpha = (1 - distance / 96) * (a.group === b.group ? 0.13 : 0.045);
      ambientCtx.lineWidth = a.group === b.group ? 0.9 : 0.6;
      ambientCtx.beginPath();
      ambientCtx.moveTo(a.x, a.y);
      ambientCtx.lineTo(b.x, b.y);
      ambientCtx.stroke();
    }
  }

  ambientPackets.forEach((packet) => {
    packet.offset = (packet.offset + packet.speed * (reduceMotion ? 0 : 16)) % 1;
    const x = width * packet.offset;
    const baseY = height * (0.18 + packet.lane * 0.12);
    const y = baseY + Math.sin(packet.offset * Math.PI * 2 + packet.phase + now * 0.001) * 18;
    ambientCtx.strokeStyle = accent;
    ambientCtx.globalAlpha = 0.26;
    ambientCtx.lineWidth = 1.2;
    ambientCtx.beginPath();
    ambientCtx.moveTo(x - 34, y);
    ambientCtx.lineTo(x + 34, y);
    ambientCtx.stroke();
    ambientCtx.fillStyle = accent;
    ambientCtx.globalAlpha = 0.4;
    ambientCtx.beginPath();
    ambientCtx.arc(x + 38, y, 2.2, 0, Math.PI * 2);
    ambientCtx.fill();
  });

  ambientNodes.forEach((node) => {
    const active = node.group === currentNetworkMode || mode !== "hero";
    ambientCtx.fillStyle = active ? accent : ink;
    ambientCtx.globalAlpha = active ? 0.34 : 0.16;
    ambientCtx.beginPath();
    ambientCtx.arc(node.x, node.y, active ? node.r + 0.5 : node.r, 0, Math.PI * 2);
    ambientCtx.fill();
  });

  ambientCtx.globalAlpha = 1;
  if (!reduceMotion) requestAnimationFrame(drawAmbientBackground);
};

if (ambientCanvas && ambientCtx) {
  resizeAmbientCanvas();
  drawAmbientBackground();
  window.addEventListener("resize", resizeAmbientCanvas, { passive: true });
  window.addEventListener("pointerleave", () => {
    ambientPointer.active = false;
  });
}

const canvas = document.getElementById("networkCanvas");
const ctx = canvas?.getContext("2d");
let points = [];
let sparks = [];
let pointer = { x: 0.5, y: 0.5, active: false };

const getModeTarget = (point, index, width, height, now) => {
  const t = now / 1000 + point.phase;
  const slot = index % 12;
  const ring = 0.16 + (index % 3) * 0.1;

  if (currentNetworkMode === "rag") {
    const angle = (slot / 12) * Math.PI * 2 + t * 0.18;
    return {
      x: width * (0.52 + Math.cos(angle) * ring),
      y: height * (0.48 + Math.sin(angle) * ring),
    };
  }

  if (currentNetworkMode === "agent") {
    const lane = index % 4;
    return {
      x: width * (0.22 + lane * 0.18),
      y: height * (0.22 + ((index + Math.floor(t)) % 6) * 0.1),
    };
  }

  if (currentNetworkMode === "tests") {
    return {
      x: width * (0.18 + (index % 5) * 0.16),
      y: height * (0.5 + Math.sin(t * 1.8 + index) * 0.22),
    };
  }

  if (currentNetworkMode === "export") {
    const row = Math.floor((index % 15) / 5);
    return {
      x: width * (0.28 + (index % 5) * 0.12),
      y: height * (0.3 + row * 0.18),
    };
  }

  return {
    x: width * (0.16 + (index % 6) * 0.14),
    y: height * (0.24 + Math.abs(Math.sin(t + index * 0.7)) * 0.48),
  };
};

const resizeCanvas = () => {
  if (!canvas || !ctx) return;
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.max(38, Math.min(76, Math.floor(rect.width / 10)));
  points = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * rect.width,
    y: Math.random() * rect.height,
    vx: (Math.random() - 0.5) * 0.32,
    vy: (Math.random() - 0.5) * 0.32,
    r: index % 9 === 0 ? 3.4 : 2.1,
    group: networkModeOrder[index % networkModeOrder.length],
    phase: Math.random() * Math.PI * 2,
  }));
};

const drawNetwork = () => {
  if (!canvas || !ctx) return;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const now = performance.now();
  ctx.clearRect(0, 0, width, height);

  const textColor = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim();
  const muted = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim();
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();

  const scanY = (now / 18) % Math.max(height, 1);
  const scanGradient = ctx.createLinearGradient(0, scanY - 36, 0, scanY + 36);
  scanGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
  scanGradient.addColorStop(0.5, accent);
  scanGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = scanGradient;
  ctx.fillRect(0, scanY - 36, width, 72);
  ctx.restore();

  points.forEach((point, index) => {
    const activePoint = point.group === currentNetworkMode;
    if (activePoint) {
      const target = getModeTarget(point, index, width, height, now);
      point.x += (target.x - point.x) * 0.012;
      point.y += (target.y - point.y) * 0.012;
    }

    point.x += point.vx;
    point.y += point.vy;
    if (point.x < 0 || point.x > width) point.vx *= -1;
    if (point.y < 0 || point.y > height) point.vy *= -1;

    if (pointer.active) {
      const dx = point.x - pointer.x * width;
      const dy = point.y - pointer.y * height;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 150) {
        point.x += dx * 0.002;
        point.y += dy * 0.002;
      }
    }
  });

  if (!reduceMotion && sparks.length < 42 && Math.random() < 0.08) {
    const source = points.find((point) => point.group === currentNetworkMode) || points[0];
    if (source) {
      sparks.push({
        x: source.x,
        y: source.y,
        vx: (Math.random() - 0.5) * 1.4,
        vy: (Math.random() - 0.5) * 1.4,
        life: 1,
      });
    }
  }

  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const a = points[i];
      const b = points[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const activeLine = a.group === currentNetworkMode || b.group === currentNetworkMode;
      if (distance < 118) {
        ctx.strokeStyle = activeLine ? accent : muted;
        ctx.globalAlpha = (1 - distance / 118) * (activeLine ? 0.38 : 0.14);
        ctx.lineWidth = activeLine ? 1.2 : 0.8;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  ctx.globalAlpha = 1;
  points.forEach((point) => {
    const activePoint = point.group === currentNetworkMode;
    if (activePoint) {
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.16;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.r + 8 + Math.sin(now / 240 + point.phase) * 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = activePoint ? accent : textColor;
    ctx.globalAlpha = activePoint ? 0.92 : 0.32;
    ctx.beginPath();
    ctx.arc(point.x, point.y, activePoint ? point.r + 1.2 : point.r, 0, Math.PI * 2);
    ctx.fill();
  });

  sparks = sparks.filter((spark) => spark.life > 0.02);
  sparks.forEach((spark) => {
    spark.x += spark.vx;
    spark.y += spark.vy;
    spark.life *= 0.94;
    ctx.fillStyle = accent;
    ctx.globalAlpha = spark.life * 0.72;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, 1.8 + spark.life * 2, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  if (!reduceMotion) requestAnimationFrame(drawNetwork);
};

if (canvas && ctx) {
  resizeCanvas();
  drawNetwork();
  window.addEventListener("resize", resizeCanvas, { passive: true });
  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer = {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
      active: true,
    };
  });
  canvas.addEventListener("pointerleave", () => {
    pointer.active = false;
  });
}

updateNetworkInspector();
updateLayerDetail();

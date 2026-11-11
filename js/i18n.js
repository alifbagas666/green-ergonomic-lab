/* English / Traditional Chinese (zh-Hant) switch.
   Static page text is translated by matching each element's HTML against the PAGE table below.
   Text built by JavaScript uses LabI18n.t(). Paper titles, authors and venues stay in the original language. */
(function () {
  "use strict";
  var KEY = "gel-lang";
  var SKIP = { SCRIPT: 1, STYLE: 1, SVG: 1, NOSCRIPT: 1, CODE: 1 };
  var INLINE = { A: 1, STRONG: 1, EM: 1, B: 1, I: 1, BR: 1, SPAN: 1, CODE: 1 };

  /* ---- research categories and sub-categories ---- */
  var CAT = {
    "Green Ergonomic Lab": "綠色人因工程實驗室",
    "Consumer behavior and technology adoption": "消費者行為與科技接受",
    "Disaster risk and preparedness": "災害風險與整備",
    "Occupational safety and ergonomics": "職業安全與人因工程",
    "Quality and operations management": "品質與作業管理",
    "Kansei and product design": "感性工學與產品設計",
    "Driving and transport safety": "駕駛與運輸安全",
    "Portfolio and financial analytics": "投資組合與財務分析",
    "Applied machine learning and deep learning": "機器學習與深度學習應用",
    "Innovation, business and education technology": "創新、商業與教育科技",
    "MCDM and decision analysis": "多準則決策與決策分析",
    "Macroergonomics and job design": "鉅觀人因工程與工作設計",
    "Sustainability and green ergonomics": "永續發展與綠色人因工程",
    "Eye tracking and cognition": "眼動追蹤與認知",
    "Technology acceptance (TAM, UTAUT)": "科技接受模型（TAM、UTAUT）",
    "Customer experience and loyalty": "顧客體驗與忠誠度",
    "Planned behavior and intention": "計畫行為與行為意願",
    "General": "綜合主題",
    "Pandemic response": "疫情因應",
    "Natural hazards": "自然災害",
    "Preparedness and evacuation": "整備與避難",
    "Musculoskeletal and posture": "肅骨骼與姿勢",
    "Accident analysis": "事故分析",
    "Exoskeletons and wearables": "外骨骼與穿戴裝置",
    "Six Sigma and FMEA": "六標準差與 FMEA",
    "Scheduling and inventory": "排程與庫存",
    "Reliability and maintenance": "可靠度與維護",
    "Conjoint and preference": "聯合分析與偏好",
    "Color and camouflage design": "色彩與迷彩設計",
    "Public transport and aviation": "大眾運輸與航空",
    "Driver behavior": "駕駛行為",
    "Pedestrians and roads": "行人與道路",
    "Portfolio selection": "投資組合選擇",
    "Markets and assets": "市場與資產",
    "Deep learning": "深度學習",
    "Classical ML and clustering": "傳統機器學習與分群",
    "Innovation and business models": "創新與商業模式",
    "IoT, marketing and learning": "物聯網、行銷與學習",
    "Other decision methods": "其他決策方法",
    "DEMATEL, ANP and VIKOR": "DEMATEL、ANP 與 VIKOR",
    "Employee well-being": "員工福祉",
    "Job design and work systems": "工作設計與工作系統",
    "Green and circular practices": "綠色與循環實踐",
    "Energy and environment": "能源與環境",
    "Eye tracking": "眼動追蹤"
  };

  /* ---- text built by JavaScript ---- */
  var UI = {
    papers: function (n) { return { en: n + " papers", zh: n + " 篇論文" }; },
    count: function (a, b) { return { en: a + " of " + b + " publications", zh: "共 " + b + " 篇，顯示 " + a + " 篇" }; },
    doi: { en: "DOI: ", zh: "DOI：" },
    link: { en: "Link", zh: "連結" },
    noDoi: { en: "No DOI available", zh: "無 DOI" },
    noDoiPaper: { en: "No DOI available for this paper.", zh: "這篇論文沒有 DOI。" },
    venueNone: { en: "Venue not listed", zh: "未列出發表場域" },
    nd: { en: "n.d.", zh: "年份不詳" },
    etal: { en: " et al.", zh: " 等" },
    loading: { en: "Loading...", zh: "載入中…" },
    loadingPubs: { en: "Loading publications...", zh: "正在載入論文…" },
    loadingHl: { en: "Loading research highlights...", zh: "正在載入研究重點…" },
    noMatch: { en: "No publications match these filters.", zh: "沒有符合條件的論文。" },
    paper: { en: "Paper: ", zh: "論文：" },
    expanded: { en: "expanded", zh: "已展開" },
    collapsed: { en: "collapsed", zh: "已收合" },
    openDoi: { en: "Open DOI", zh: "開啟 DOI" },
    openLink: { en: "Open link", zh: "開啟連結" },
    hlMissing: {
      en: "Research highlights will appear here once the publication data is generated (run build_publications.py and serve the site over http).",
      zh: "論文資料產生後，研究重點會顯示在這裡（請執行 build_publications.py，並透過 http 開啟網站）。"
    },
    pubMissing: {
      en: "<strong>Publication data not found.</strong><br>Run <code>python build_publications.py</code> to create <code>data/publications.json</code>, and open the site through a local server (<code>python -m http.server</code>) so the browser can read it.",
      zh: "<strong>找不到論文資料。</strong><br>請執行 <code>python build_publications.py</code> 產生 <code>data/publications.json</code>，並透過本機伺服器（<code>python -m http.server</code>）開啟網站。"
    },
    treeMissing: {
      en: "<strong>Research tree data not found.</strong><br>Run <code>python build_publications.py</code> to create <code>data/categories.json</code> and <code>data/publications.json</code>, then open this site through a local server (<code>python -m http.server</code>).",
      zh: "<strong>找不到研究樹資料。</strong><br>請執行 <code>python build_publications.py</code> 產生 <code>data/categories.json</code> 與 <code>data/publications.json</code>，再透過本機伺服器（<code>python -m http.server</code>）開啟本網站。"
    },
    langBtn: { en: "繁體中文", zh: "English" },
    langAria: { en: "Switch language to Traditional Chinese", zh: "Switch language to English" }
  };

  /* ---- static page text: exact (whitespace-normalised) element HTML -> Traditional Chinese ---- */
  var PAGE = {
    "Skip to content": "\u8df3\u81f3\u4e3b\u8981\u5167\u5bb9",
    "Department of Industrial Engineering and Management": "\u5de5\u696d\u5de5\u7a0b\u8207\u7ba1\u7406\u5b78\u7cfb",
    "Green Ergonomic Lab": "\u7da0\u8272\u4eba\u56e0\u5de5\u7a0b\u5be6\u9a57\u5ba4",
    "Home": "\u9996\u9801",
    "Research": "\u7814\u7a76",
    "Publications": "\u8ad6\u6587\u767c\u8868",
    "Members": "\u6210\u54e1",
    "News": "\u6700\u65b0\u6d88\u606f",
    "Contact": "\u806f\u7d61\u6211\u5011",
    "Yuan Ze University \u00b7 Industrial Engineering and Management": "\u5143\u667a\u5927\u5b78 \u00b7 \u5de5\u696d\u5de5\u7a0b\u8207\u7ba1\u7406\u5b78\u7cfb",
    "We study how people interact with products, work systems and risky environments, and design safer, more sustainable and more human-centered solutions.": "\u6211\u5011\u7814\u7a76\u4eba\u8207\u7522\u54c1\u3001\u5de5\u4f5c\u7cfb\u7d71\u53ca\u9ad8\u98a8\u96aa\u74b0\u5883\u4e4b\u9593\u7684\u4e92\u52d5\uff0c\u4e26\u8a2d\u8a08\u66f4\u5b89\u5168\u3001\u66f4\u6c38\u7e8c\u3001\u4ee5\u4eba\u70ba\u672c\u7684\u89e3\u6c7a\u65b9\u6848\u3002",
    "Explore our research tree": "\u63a2\u7d22\u7814\u7a76\u6a39",
    "Browse publications": "\u700f\u89bd\u8ad6\u6587",
    "The lab in numbers": "\u5be6\u9a57\u5ba4\u6578\u5b57\u4e00\u89bd",
    "Counts are read from the generated publication data.": "\u6578\u5b57\u53d6\u81ea\u81ea\u52d5\u7522\u751f\u7684\u8ad6\u6587\u8cc7\u6599\u3002",
    "Papers": "\u8ad6\u6587",
    "Years of publishing": "\u767c\u8868\u5e74\u6578",
    "Research categories": "\u7814\u7a76\u985e\u5225",
    "About the lab": "\u95dc\u65bc\u5be6\u9a57\u5ba4",
    "Ergonomics for people and the planet": "\u70ba\u4eba\u8207\u5730\u7403\u800c\u8a2d\u8a08\u7684\u4eba\u56e0\u5de5\u7a0b",
    "The Green Ergonomic Lab is led by Dr. Yogi Tri Prasetyo. Our work connects green ergonomics and sustainable manufacturing with macroergonomics and job design, consumer behavior, human-computer interaction, Kansei engineering and strategic product design, human behavior in disaster risk reduction, and accident analysis and prevention.": "\u7da0\u8272\u4eba\u56e0\u5de5\u7a0b\u5be6\u9a57\u5ba4\u7531 Dr. Yogi Tri Prasetyo \u4e3b\u6301\u3002\u6211\u5011\u7684\u7814\u7a76\u7d50\u5408\u7da0\u8272\u4eba\u56e0\u5de5\u7a0b\u8207\u6c38\u7e8c\u88fd\u9020\u3001\u9245\u89c0\u4eba\u56e0\u5de5\u7a0b\u8207\u5de5\u4f5c\u8a2d\u8a08\u3001\u6d88\u8cbb\u8005\u884c\u70ba\u3001\u4eba\u6a5f\u4e92\u52d5\u3001\u611f\u6027\u5de5\u5b78\u8207\u7b56\u7565\u6027\u7522\u54c1\u8a2d\u8a08\u3001\u707d\u5bb3\u98a8\u96aa\u964d\u4f4e\u4e2d\u7684\u4eba\u985e\u884c\u70ba\uff0c\u4ee5\u53ca\u4e8b\u6545\u5206\u6790\u8207\u9810\u9632\u3002",
    "Meet the team": "\u8a8d\u8b58\u5718\u968a",
    "Green ergonomics and sustainable manufacturing": "\u7da0\u8272\u4eba\u56e0\u5de5\u7a0b\u8207\u6c38\u7e8c\u88fd\u9020",
    "Macroergonomics and job design": "\u9245\u89c0\u4eba\u56e0\u5de5\u7a0b\u8207\u5de5\u4f5c\u8a2d\u8a08",
    "Consumer behavior": "\u6d88\u8cbb\u8005\u884c\u70ba",
    "Human-computer interaction": "\u4eba\u6a5f\u4e92\u52d5",
    "Kansei engineering and strategic product design": "\u611f\u6027\u5de5\u5b78\u8207\u7b56\u7565\u6027\u7522\u54c1\u8a2d\u8a08",
    "Human behavior in disaster risk reduction": "\u707d\u5bb3\u98a8\u96aa\u964d\u4f4e\u4e2d\u7684\u4eba\u985e\u884c\u70ba",
    "Accident analysis and prevention": "\u4e8b\u6545\u5206\u6790\u8207\u9810\u9632",
    "Research highlights": "\u7814\u7a76\u91cd\u9ede",
    "Where our papers focus": "\u6211\u5011\u7684\u8ad6\u6587\u805a\u7126\u9818\u57df",
    "See the full research tree": "\u67e5\u770b\u5b8c\u6574\u7814\u7a76\u6a39",
    "Latest news": "\u6700\u65b0\u6d88\u606f",
    "Placeholder": "\u5f85\u88dc\u5145",
    "Lab news to be announced": "\u5be6\u9a57\u5ba4\u6d88\u606f\u5f85\u516c\u5e03",
    "Recruitment, awards and events will be posted here. Dates and text to be confirmed by the lab.": "\u62db\u751f\u3001\u734e\u9805\u8207\u6d3b\u52d5\u6d88\u606f\u5c07\u516c\u5e03\u65bc\u6b64\u3002\u65e5\u671f\u8207\u5167\u5bb9\u5f85\u5be6\u9a57\u5ba4\u78ba\u8a8d\u3002",
    "Aug 2025": "2025 \u5e74 8 \u6708",
    "Promotion to Associate Professor": "\u6649\u5347\u70ba\u526f\u6559\u6388",
    "Dr. Yogi Tri Prasetyo became Associate Professor at Yuan Ze University.": "Dr. Yogi Tri Prasetyo \u5347\u4efb\u5143\u667a\u5927\u5b78\u526f\u6559\u6388\u3002",
    "Best Presentation, ICCMB2024": "ICCMB2024 \u6700\u4f73\u8ad6\u6587\u767c\u8868\u734e",
    "The lab received a Best Presentation award at ICCMB2024.": "\u5be6\u9a57\u5ba4\u65bc ICCMB2024 \u7372\u9812\u6700\u4f73\u8ad6\u6587\u767c\u8868\u734e\u3002",
    "All news": "\u6240\u6709\u6d88\u606f",
    "<strong>Green Ergonomic Lab</strong><br>Department of Industrial Engineering and Management<br>Yuan Ze University, Taiwan": "<strong>\u7da0\u8272\u4eba\u56e0\u5de5\u7a0b\u5be6\u9a57\u5ba4</strong><br>\u5de5\u696d\u5de5\u7a0b\u8207\u7ba1\u7406\u5b78\u7cfb<br>\u5143\u667a\u5927\u5b78\uff0c\u81fa\u7063",
    "Dr. Yogi Tri Prasetyo<br><a href=\"mailto:yogi.tri.prasetyo@saturn.yzu.edu.tw\">yogi.tri.prasetyo@saturn.yzu.edu.tw</a><br>Office 2715R, Ext. 2422": "Dr. Yogi Tri Prasetyo<br><a href=\"mailto:yogi.tri.prasetyo@saturn.yzu.edu.tw\">yogi.tri.prasetyo@saturn.yzu.edu.tw</a><br>\u7814\u7a76\u5ba4 2715R\uff0c\u5206\u6a5f 2422",
    "\u00a9 <span id=\"year-now\">2026</span> Green Ergonomic Lab<br><a href=\"https://www.iem.yzu.edu.tw/english/faculty_info.aspx?id=yogi\" target=\"_blank\" rel=\"noopener\">YZU faculty page</a>": "\u00a9 <span id=\"year-now\">2026</span> \u7da0\u8272\u4eba\u56e0\u5de5\u7a0b\u5be6\u9a57\u5ba4<br><a href=\"https://www.iem.yzu.edu.tw/english/faculty_info.aspx?id=yogi\" target=\"_blank\" rel=\"noopener\">\u5143\u667a\u5927\u5b78\u6559\u5e2b\u9801\u9762</a>",
    "Research tree": "\u7814\u7a76\u6a39",
    "The lab sits at the root. Each branch is a research focus area, each sub-branch a theme, and each leaf a paper. Click a node to expand it, hover for a preview, and click a paper for details and its DOI link.": "\u5be6\u9a57\u5ba4\u662f\u6a39\u6839\uff0c\u6bcf\u689d\u4e3b\u679d\u662f\u4e00\u500b\u7814\u7a76\u91cd\u9ede\u9818\u57df\uff0c\u6bcf\u689d\u5206\u679d\u662f\u4e00\u500b\u4e3b\u984c\uff0c\u6bcf\u7247\u8449\u5b50\u662f\u4e00\u7bc7\u8ad6\u6587\u3002\u9ede\u9078\u7bc0\u9ede\u53ef\u5c55\u958b\uff0c\u6ed1\u9f20\u79fb\u4e0a\u53bb\u53ef\u9810\u89bd\uff0c\u9ede\u9078\u8ad6\u6587\u53ef\u67e5\u770b\u8a73\u60c5\u8207 DOI \u9023\u7d50\u3002",
    "Drag to pan. Scroll or pinch to zoom.": "\u62d6\u66f3\u53ef\u5e73\u79fb\uff0c\u6efe\u52d5\u6216\u96d9\u6307\u7e2e\u653e\u53ef\u653e\u5927\u7e2e\u5c0f\u3002",
    "Search, filter and sort the lab's papers. Entries link to their DOI where one exists.": "\u641c\u5c0b\u3001\u7be9\u9078\u4e26\u6392\u5e8f\u5be6\u9a57\u5ba4\u7684\u8ad6\u6587\u3002\u6709 DOI \u7684\u8ad6\u6587\u9644\u6709 DOI \u9023\u7d50\u3002",
    "Search": "\u641c\u5c0b",
    "Category": "\u985e\u5225",
    "All categories": "\u6240\u6709\u985e\u5225",
    "Year": "\u5e74\u4efd",
    "All years": "\u6240\u6709\u5e74\u4efd",
    "Sort by": "\u6392\u5e8f\u65b9\u5f0f",
    "Newest first": "\u7531\u65b0\u5230\u820a",
    "Oldest first": "\u7531\u820a\u5230\u65b0",
    "Title A to Z": "\u6a19\u984c A \u81f3 Z",
    "Show more": "\u986f\u793a\u66f4\u591a",
    "People": "\u4eba\u54e1",
    "Meet the lab head and the students who make the work possible.": "\u8a8d\u8b58\u5be6\u9a57\u5ba4\u4e3b\u6301\u4eba\uff0c\u4ee5\u53ca\u8b93\u7814\u7a76\u5f97\u4ee5\u9032\u884c\u7684\u540c\u5b78\u5011\u3002",
    "Lab head": "\u5be6\u9a57\u5ba4\u4e3b\u6301\u4eba",
    "<strong>Associate Professor</strong> (since Aug 2025; Assistant Professor 2023 to 2025), Department of Industrial Engineering and Management, Yuan Ze University": "<strong>\u526f\u6559\u6388</strong>\uff082025 \u5e74 8 \u6708\u8d77\uff1b2023 \u81f3 2025 \u5e74\u70ba\u52a9\u7406\u6559\u6388\uff09\uff0c\u5143\u667a\u5927\u5b78\u5de5\u696d\u5de5\u7a0b\u8207\u7ba1\u7406\u5b78\u7cfb",
    "<a href=\"mailto:yogi.tri.prasetyo@saturn.yzu.edu.tw\">yogi.tri.prasetyo@saturn.yzu.edu.tw</a> \u00b7 Office 2715R \u00b7 Ext. 2422": "<a href=\"mailto:yogi.tri.prasetyo@saturn.yzu.edu.tw\">yogi.tri.prasetyo@saturn.yzu.edu.tw</a> \u00b7 \u7814\u7a76\u5ba4 2715R \u00b7 \u5206\u6a5f 2422",
    "Research interests": "\u7814\u7a76\u8208\u8da3",
    "Education": "\u5b78\u6b77",
    "Ph.D. in Industrial Management, NTUST (2019)": "\u570b\u7acb\u81fa\u7063\u79d1\u6280\u5927\u5b78 \u5de5\u696d\u7ba1\u7406\u535a\u58eb\uff082019\uff09",
    "MBA in Industrial Management, NTUST (2015)": "\u570b\u7acb\u81fa\u7063\u79d1\u6280\u5927\u5b78 \u5de5\u696d\u7ba1\u7406\u4f01\u7ba1\u78a9\u58eb MBA\uff082015\uff09",
    "B.Eng. in Industrial Engineering, Universitas Indonesia (2013)": "\u5370\u5c3c\u5927\u5b78 \u5de5\u696d\u5de5\u7a0b\u5b78\u58eb\uff082013\uff09",
    "Exchange student, Waseda University (2013)": "\u65e9\u7a3b\u7530\u5927\u5b78\u4ea4\u63db\u5b78\u751f\uff082013\uff09",
    "Awards": "\u734e\u9805",
    "Best Presentation, ICEMT 2023": "ICEMT 2023 \u6700\u4f73\u8ad6\u6587\u767c\u8868\u734e",
    "Best Paper 1st Runner-Up, 2023": "2023 \u5e74\u6700\u4f73\u8ad6\u6587\u7b2c\u4e00\u4e9e\u8ecd",
    "Stanford World's Top 2% Scientists (Oct 2023)": "\u53f2\u4e39\u4f5b\u5927\u5b78\u300c\u5168\u7403\u524d 2% \u9802\u5c16\u79d1\u5b78\u5bb6\u300d\uff082023 \u5e74 10 \u6708\uff09",
    "<a href=\"https://www.iem.yzu.edu.tw/english/faculty_info.aspx?id=yogi\" target=\"_blank\" rel=\"noopener\">YZU faculty page</a> \u00b7 <a href=\"https://scholar.google.com/citations?user=EiRJD2oAAAAJ\" target=\"_blank\" rel=\"noopener\">Google Scholar</a>": "<a href=\"https://www.iem.yzu.edu.tw/english/faculty_info.aspx?id=yogi\" target=\"_blank\" rel=\"noopener\">\u5143\u667a\u5927\u5b78\u6559\u5e2b\u9801\u9762</a> \u00b7 <a href=\"https://scholar.google.com/citations?user=EiRJD2oAAAAJ\" target=\"_blank\" rel=\"noopener\">Google \u5b78\u8853\u641c\u5c0b</a>",
    "Ph.D. students": "\u535a\u58eb\u73ed\u5b78\u751f",
    "Placeholder cards. Names, photos and topics to be provided by the lab.": "\u9810\u7559\u5361\u7247\u3002\u59d3\u540d\u3001\u7167\u7247\u8207\u7814\u7a76\u4e3b\u984c\u5c07\u7531\u5be6\u9a57\u5ba4\u63d0\u4f9b\u3002",
    "Name to be added": "\u59d3\u540d\u5f85\u88dc",
    "Ph.D. student. Research topic and short bio to be confirmed.": "\u535a\u58eb\u73ed\u5b78\u751f\u3002\u7814\u7a76\u4e3b\u984c\u8207\u7c21\u4ecb\u5f85\u78ba\u8a8d\u3002",
    "Master's students": "\u78a9\u58eb\u73ed\u5b78\u751f",
    "Master's student. Research topic and short bio to be confirmed.": "\u78a9\u58eb\u73ed\u5b78\u751f\u3002\u7814\u7a76\u4e3b\u984c\u8207\u7c21\u4ecb\u5f85\u78ba\u8a8d\u3002",
    "Alumni": "\u6821\u53cb",
    "Placeholder cards. Graduation year and current position to be provided by the lab.": "\u9810\u7559\u5361\u7247\u3002\u7562\u696d\u5e74\u4efd\u8207\u73fe\u8077\u5c07\u7531\u5be6\u9a57\u5ba4\u63d0\u4f9b\u3002",
    "Alumnus or alumna. Research topic and short bio to be confirmed.": "\u6821\u53cb\u3002\u7814\u7a76\u4e3b\u984c\u8207\u7c21\u4ecb\u5f85\u78ba\u8a8d\u3002",
    "Awards, publications and lab announcements. Entries marked placeholder need dates and text from the lab.": "\u734e\u9805\u3001\u8ad6\u6587\u8207\u5be6\u9a57\u5ba4\u516c\u544a\u3002\u6a19\u793a\u70ba\u300c\u5f85\u88dc\u5145\u300d\u7684\u9805\u76ee\uff0c\u9700\u8981\u5be6\u9a57\u5ba4\u63d0\u4f9b\u65e5\u671f\u8207\u5167\u5bb9\u3002",
    "Dr. Yogi Tri Prasetyo promoted to Associate Professor": "Dr. Yogi Tri Prasetyo \u6649\u5347\u70ba\u526f\u6559\u6388",
    "Yuan Ze University, Department of Industrial Engineering and Management.": "\u5143\u667a\u5927\u5b78\u5de5\u696d\u5de5\u7a0b\u8207\u7ba1\u7406\u5b78\u7cfb\u3002",
    "Best Presentation Award, ICCMB2024": "ICCMB2024 \u6700\u4f73\u8ad6\u6587\u767c\u8868\u734e",
    "Exact month and paper title to be confirmed.": "\u78ba\u5207\u6708\u4efd\u8207\u8ad6\u6587\u984c\u76ee\u5f85\u78ba\u8a8d\u3002",
    "Oct 2023": "2023 \u5e74 10 \u6708",
    "Listed among Stanford's World's Top 2% Scientists": "\u5165\u9078\u53f2\u4e39\u4f5b\u5927\u5b78\u5168\u7403\u524d 2% \u9802\u5c16\u79d1\u5b78\u5bb6",
    "Recognition for Dr. Yogi Tri Prasetyo.": "\u8868\u5f70 Dr. Yogi Tri Prasetyo\u3002",
    "Aug 2023": "2023 \u5e74 8 \u6708",
    "Best Presentation Award, ICEMT 2023": "ICEMT 2023 \u6700\u4f73\u8ad6\u6587\u767c\u8868\u734e",
    "7th International Conference on Education and Multimedia Technology.": "\u7b2c\u4e03\u5c46\u6559\u80b2\u8207\u591a\u5a92\u9ad4\u79d1\u6280\u570b\u969b\u7814\u8a0e\u6703\uff08ICEMT\uff09\u3002",
    "Best Paper 1st Runner-Up Award": "\u6700\u4f73\u8ad6\u6587\u7b2c\u4e00\u4e9e\u8ecd\u734e",
    "Paper title and venue to be confirmed.": "\u8ad6\u6587\u984c\u76ee\u8207\u767c\u8868\u5834\u5408\u5f85\u78ba\u8a8d\u3002",
    "Date TBC": "\u65e5\u671f\u5f85\u5b9a",
    "New student openings": "\u65b0\u751f\u62db\u6536",
    "Recruitment announcement to be written by the lab.": "\u62db\u751f\u516c\u544a\u5c07\u7531\u5be6\u9a57\u5ba4\u64b0\u5beb\u3002",
    "Upcoming conference or workshop": "\u8fd1\u671f\u7814\u8a0e\u6703\u6216\u5de5\u4f5c\u574a",
    "Event details to be added.": "\u6d3b\u52d5\u8a73\u60c5\u5f85\u88dc\u5145\u3002",
    "Prospective students and collaborators are welcome to get in touch.": "\u6b61\u8fce\u6709\u610f\u52a0\u5165\u7684\u540c\u5b78\u8207\u5408\u4f5c\u5925\u4f34\u8207\u6211\u5011\u806f\u7d61\u3002",
    "Email": "\u96fb\u5b50\u90f5\u4ef6",
    "<strong>Office</strong><br>2715R, Ext. 2422": "<strong>\u7814\u7a76\u5ba4</strong><br>2715R\uff0c\u5206\u6a5f 2422",
    "<strong>Department</strong><br>Industrial Engineering and Management, Yuan Ze University": "<strong>\u7cfb\u6240</strong><br>\u5143\u667a\u5927\u5b78\u5de5\u696d\u5de5\u7a0b\u8207\u7ba1\u7406\u5b78\u7cfb",
    "Lab address": "\u5be6\u9a57\u5ba4\u5730\u5740",
    "<strong>Green Ergonomic Lab, Room R2519</strong><br>Yuan Ze Building 2 (\u5143\u667a\u4e8c\u9928)<br>No. 135, Yuandong Rd., Zhongli District<br>Taoyuan City 320315, Taiwan": "<strong>\u7da0\u8272\u4eba\u56e0\u5de5\u7a0b\u5be6\u9a57\u5ba4\uff0cR2519 \u5ba4</strong><br>\u5143\u667a\u4e8c\u9928<br>\u6843\u5712\u5e02 320315 \u4e2d\u58e2\u5340\u9060\u6771\u8def 135 \u865f<br>\u81fa\u7063",
    "Lab phone, opening hours and visitor directions: placeholder, to be added.": "\u5be6\u9a57\u5ba4\u96fb\u8a71\u3001\u958b\u653e\u6642\u9593\u8207\u4ea4\u901a\u6307\u5f15\uff1a\u5f85\u88dc\u5145\u3002",
    "Projects": "\u8a08\u756b",
    "Research projects": "\u7814\u7a76\u8a08\u756b",
    "Funded project": "\u88dc\u52a9\u8a08\u756b",
    "Principal investigator": "\u8a08\u756b\u4e3b\u6301\u4eba",
    "Funder": "\u88dc\u52a9\u55ae\u4f4d",
    "National Science and Technology Council (\u570b\u5bb6\u79d1\u5b78\u53ca\u6280\u8853\u59d4\u54e1\u6703)": "\u570b\u5bb6\u79d1\u5b78\u53ca\u6280\u8853\u59d4\u54e1\u6703",
    "Funder project number": "\u88dc\u52a9\u55ae\u4f4d\u8a08\u756b\u7de8\u865f",
    "Executing unit": "\u57f7\u884c\u55ae\u4f4d",
    "College of Engineering, English-taught bachelor's program (\u5de5\u7a0b\u5b78\u9662\u82f1\u8a9e\u5b78\u58eb\u73ed)": "\u5de5\u7a0b\u5b78\u9662\u82f1\u8a9e\u5b78\u58eb\u73ed",
    "Project period": "\u8a08\u756b\u671f\u9593",
    "2024-07-01 to 2025-02-28": "2024-07-01 \u81f3 2025-02-28",
    "Academic year (ROC)": "\u5b78\u5e74\u5ea6\uff08\u6c11\u570b\uff09",
    "Master's theses": "\u78a9\u58eb\u8ad6\u6587",
    "Theses completed in the lab, listed with the academic year in the ROC calendar. Student names are shown as in the university record.": "\u5be6\u9a57\u5ba4\u5b8c\u6210\u7684\u78a9\u58eb\u8ad6\u6587\uff0c\u5b78\u5e74\u5ea6\u63a1\u6c11\u570b\u7d00\u5e74\u3002\u5b78\u751f\u59d3\u540d\u4f9d\u5b78\u6821\u7d00\u9304\u986f\u793a\u3002",
    "List of master's theses": "\u78a9\u58eb\u8ad6\u6587\u5217\u8868",
    "Student": "\u7814\u7a76\u751f",
    "Thesis title": "\u8ad6\u6587\u540d\u7a31",
    "Published": "\u51fa\u7248\u5e74",
    "In the lab": "\u5be6\u9a57\u5ba4\u73fe\u5834",
    "Eye tracking experiments": "\u773c\u52d5\u8ffd\u8e64\u5be6\u9a57",
    "Participants view stimuli on a screen while an eye tracker records where they look. These experiments support our work on eye tracking, cognition and human-computer interaction.": "\u53d7\u8a66\u8005\u5728\u87a2\u5e55\u524d\u89c0\u770b\u523a\u6fc0\u6750\u6599\uff0c\u773c\u52d5\u5100\u540c\u6642\u8a18\u9304\u5176\u6ce8\u8996\u4f4d\u7f6e\u3002\u9019\u4e9b\u5be6\u9a57\u652f\u6301\u6211\u5011\u5728\u773c\u52d5\u8ffd\u8e64\u3001\u8a8d\u77e5\u8207\u4eba\u6a5f\u4e92\u52d5\u65b9\u9762\u7684\u7814\u7a76\u3002",
    "An eye tracking experiment in the Green Ergonomic Lab.": "\u7da0\u8272\u4eba\u56e0\u5de5\u7a0b\u5be6\u9a57\u5ba4\u7684\u773c\u52d5\u8ffd\u8e64\u5be6\u9a57\u3002"
  };
  /* ---- attribute values (alt, placeholder, aria-label, meta description) ---- */
  var ATTR = {
    "Green Ergonomic Lab at Yuan Ze University: green ergonomics, human factors, disaster risk reduction and consumer behavior research.": "\u5143\u667a\u5927\u5b78\u7da0\u8272\u4eba\u56e0\u5de5\u7a0b\u5be6\u9a57\u5ba4\uff1a\u7da0\u8272\u4eba\u56e0\u5de5\u7a0b\u3001\u4eba\u56e0\u7814\u7a76\u3001\u707d\u5bb3\u98a8\u96aa\u964d\u4f4e\u8207\u6d88\u8cbb\u8005\u884c\u70ba\u7814\u7a76\u3002",
    "Yuan Ze University": "\u5143\u667a\u5927\u5b78",
    "Green Ergonomic Lab home": "\u7da0\u8272\u4eba\u56e0\u5de5\u7a0b\u5be6\u9a57\u5ba4\u9996\u9801",
    "Main": "\u4e3b\u9078\u55ae",
    "Menu": "\u9078\u55ae",
    "Research interests": "\u7814\u7a76\u8208\u8da3",
    "Interactive research tree of the Green Ergonomic Lab.": "\u7da0\u8272\u4eba\u56e0\u5de5\u7a0b\u5be6\u9a57\u5ba4\u7684\u4e92\u52d5\u5f0f\u7814\u7a76\u6a39\u3002",
    "Interactive research tree of the Green Ergonomic Lab": "\u7da0\u8272\u4eba\u56e0\u5de5\u7a0b\u5be6\u9a57\u5ba4\u7684\u4e92\u52d5\u5f0f\u7814\u7a76\u6a39",
    "Tree controls": "\u6a39\u72c0\u5716\u63a7\u5236",
    "Zoom in": "\u653e\u5927",
    "Zoom out": "\u7e2e\u5c0f",
    "Reset tree": "\u91cd\u8a2d\u6a39\u72c0\u5716",
    "Searchable publication list of the Green Ergonomic Lab.": "\u7da0\u8272\u4eba\u56e0\u5de5\u7a0b\u5be6\u9a57\u5ba4\u7684\u53ef\u641c\u5c0b\u8ad6\u6587\u6e05\u55ae\u3002",
    "Title, author, venue or keyword": "\u6a19\u984c\u3001\u4f5c\u8005\u3001\u767c\u8868\u5834\u5408\u6216\u95dc\u9375\u5b57",
    "Lab head Dr. Yogi Tri Prasetyo and lab members.": "\u5be6\u9a57\u5ba4\u4e3b\u6301\u4eba Dr. Yogi Tri Prasetyo \u8207\u5be6\u9a57\u5ba4\u6210\u54e1\u3002",
    "Portrait of Dr. Yogi Tri Prasetyo": "Dr. Yogi Tri Prasetyo \u7684\u8096\u50cf\u7167",
    "News and awards from the Green Ergonomic Lab.": "\u7da0\u8272\u4eba\u56e0\u5de5\u7a0b\u5be6\u9a57\u5ba4\u7684\u6700\u65b0\u6d88\u606f\u8207\u734e\u9805\u3002",
    "Contact the Green Ergonomic Lab.": "\u806f\u7d61\u7da0\u8272\u4eba\u56e0\u5de5\u7a0b\u5be6\u9a57\u5ba4\u3002",
    "A participant seated at a desk looking at a computer screen while an eye tracker records their gaze": "\u53d7\u8a66\u8005\u5750\u5728\u684c\u524d\u6ce8\u8996\u96fb\u8166\u87a2\u5e55\uff0c\u773c\u52d5\u5100\u6b63\u5728\u8a18\u9304\u5176\u8996\u7dda",
    "Academic year (ROC)": "\u5b78\u5e74\u5ea6\uff08\u6c11\u570b\uff09",
    "Student": "\u7814\u7a76\u751f",
    "Thesis title": "\u8ad6\u6587\u540d\u7a31",
    "Published": "\u51fa\u7248\u5e74"
  };
  /* ---- document titles by page ---- */
  var TITLE = {
    "home": "\u9996\u9801 | \u7da0\u8272\u4eba\u56e0\u5de5\u7a0b\u5be6\u9a57\u5ba4\uff0c\u5143\u667a\u5927\u5b78",
    "research": "\u7814\u7a76 | \u7da0\u8272\u4eba\u56e0\u5de5\u7a0b\u5be6\u9a57\u5ba4\uff0c\u5143\u667a\u5927\u5b78",
    "publications": "\u8ad6\u6587\u767c\u8868 | \u7da0\u8272\u4eba\u56e0\u5de5\u7a0b\u5be6\u9a57\u5ba4\uff0c\u5143\u667a\u5927\u5b78",
    "members": "\u6210\u54e1 | \u7da0\u8272\u4eba\u56e0\u5de5\u7a0b\u5be6\u9a57\u5ba4\uff0c\u5143\u667a\u5927\u5b78",
    "news": "\u6700\u65b0\u6d88\u606f | \u7da0\u8272\u4eba\u56e0\u5de5\u7a0b\u5be6\u9a57\u5ba4\uff0c\u5143\u667a\u5927\u5b78",
    "contact": "\u806f\u7d61\u6211\u5011 | \u7da0\u8272\u4eba\u56e0\u5de5\u7a0b\u5be6\u9a57\u5ba4\uff0c\u5143\u667a\u5927\u5b78"
  };

  var lang = "en";
  try {
    var saved = localStorage.getItem(KEY);
    if (saved === "zh" || saved === "en") lang = saved;
    else if (/^zh/i.test(navigator.language || "")) lang = "zh";
  } catch (e) { /* ignore */ }

  function norm(s) { return s.replace(/\s+/g, " ").trim(); }
  var ATTRS = ["alt", "placeholder", "aria-label", "title", "content", "data-label"];

  function translateAttrs(el) {
    ATTRS.forEach(function (a) {
      if (!el.hasAttribute(a)) return;
      var orig = el.hasAttribute("data-en-" + a) ? el.getAttribute("data-en-" + a) : el.getAttribute(a);
      if (a === "content" && !(el.tagName === "META" && el.getAttribute("name") === "description")) return;
      if (lang === "zh" && ATTR[orig]) {
        el.setAttribute("data-en-" + a, orig); el.setAttribute(a, ATTR[orig]);
      } else if (el.hasAttribute("data-en-" + a)) {
        el.setAttribute(a, orig); el.removeAttribute("data-en-" + a);
      }
    });
  }

  function walk(el) {
    if (SKIP[el.tagName.toUpperCase()] || el.hasAttribute("data-dyn")) return;
    translateAttrs(el);
    if (!el.textContent.trim()) return;
    if (lang === "zh") {
      var key = norm(el.innerHTML);
      if (PAGE[key] != null) { el.__en = el.innerHTML; el.innerHTML = PAGE[key]; return; }
    }
    for (var i = 0; i < el.children.length; i++) walk(el.children[i]);
  }

  function restore() {
    document.querySelectorAll("*").forEach(function (el) {
      if (el.__en != null && el.isConnected) { el.innerHTML = el.__en; delete el.__en; }
    });
  }

  function apply() {
    document.documentElement.setAttribute("lang", lang === "zh" ? "zh-Hant" : "en");
    if (lang === "en") restore();
    walk(document.body);
    translateAttrs(document.head.querySelector('meta[name="description"]') || document.body);
    var page = document.body.getAttribute("data-page");
    if (!document.__enTitle) document.__enTitle = document.title;
    document.title = lang === "zh" && TITLE[page] ? TITLE[page] : document.__enTitle;
    var b = document.getElementById("lang-toggle");
    if (b) {
      b.textContent = UI.langBtn[lang];
      b.setAttribute("lang", lang === "zh" ? "en" : "zh-Hant");
      b.setAttribute("aria-label", UI.langAria[lang]);
    }
  }

  window.LabI18n = {
    get lang() { return lang; },
    t: function (key) {
      var v = UI[key];
      if (typeof v === "function") v = v.apply(null, Array.prototype.slice.call(arguments, 1));
      return v ? v[lang] : key;
    },
    cat: function (name) { return lang === "zh" && CAT[name] ? CAT[name] : name; },
    apply: apply,
    /* developer helper: strings a translator still needs to cover on the current page */
    missing: function () {
      var out = [];
      (function scan(el) {
        if (SKIP[el.tagName.toUpperCase()] || el.hasAttribute("data-dyn")) return;
        if (!el.textContent.trim()) return;
        var inlineOnly = Array.prototype.every.call(el.children, function (c) { return INLINE[c.tagName.toUpperCase()]; });
        var directText = Array.prototype.some.call(el.childNodes, function (n) { return n.nodeType === 3 && n.nodeValue.trim(); });
        if (inlineOnly && (directText || !el.children.length)) { var k = norm(el.innerHTML); if (/[A-Za-z]{2}/.test(el.textContent) && PAGE[k] == null) out.push(k); return; }
        for (var i = 0; i < el.children.length; i++) scan(el.children[i]);
      })(document.body);
      return out;
    },
    PAGE: PAGE, ATTR: ATTR, TITLE: TITLE
  };

  document.addEventListener("DOMContentLoaded", function () {
    apply();
    var btn = document.getElementById("lang-toggle");
    if (btn) btn.addEventListener("click", function () {
      lang = lang === "zh" ? "en" : "zh";
      try { localStorage.setItem(KEY, lang); } catch (e) { /* ignore */ }
      apply();
      document.dispatchEvent(new CustomEvent("langchange"));
    });
  });
})();

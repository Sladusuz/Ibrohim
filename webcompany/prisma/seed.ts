import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_SETTINGS } from "../src/lib/settings";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@webcompany.uz";
  const adminPassword = process.env.ADMIN_PASSWORD || "WebCompany2026!";

  const hashed = await bcrypt.hash(adminPassword, 10);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Ibrohim Abdulboqiyev",
      email: adminEmail,
      password: hashed,
    },
  });

  const services = [
    {
      title: "Veb-sayt yaratish",
      slug: "veb-sayt-yaratish",
      summary: "Korporativ saytlardan tortib murakkab veb-ilovalargacha — zamonaviy stek asosida.",
      description:
        "Next.js, React va TypeScript asosida tezkor, SEO-optimallashtirilgan va har qanday qurilmada mukammal ishlaydigan veb-saytlar va veb-ilovalar yaratamiz. Har bir loyiha performance, xavfsizlik va skalabillik hisobga olingan holda quriladi.",
      titleRu: "Разработка сайтов",
      summaryRu: "От корпоративных сайтов до сложных веб-приложений — на современном стеке.",
      descriptionRu:
        "Создаём быстрые, SEO-оптимизированные веб-сайты и приложения на Next.js, React и TypeScript, безупречно работающие на любом устройстве. Каждый проект строится с учётом производительности, безопасности и масштабируемости.",
      titleEn: "Website development",
      summaryEn: "From corporate sites to complex web apps — built on a modern stack.",
      descriptionEn:
        "We build fast, SEO-optimized websites and web apps with Next.js, React and TypeScript that work flawlessly on any device. Every project is built with performance, security and scalability in mind.",
      icon: "code-2",
      order: 1,
    },
    {
      title: "Mobil ilovalar",
      slug: "mobil-ilovalar",
      summary: "iOS va Android uchun native va cross-platform mobil ilovalar.",
      description:
        "React Native va Flutter texnologiyalari yordamida bir kod bazasidan ikkala platforma uchun ham tez va sifatli mobil ilovalar ishlab chiqamiz.",
      titleRu: "Мобильные приложения",
      summaryRu: "Нативные и кроссплатформенные приложения для iOS и Android.",
      descriptionRu:
        "Разрабатываем быстрые и качественные мобильные приложения для обеих платформ из единой кодовой базы с помощью React Native и Flutter.",
      titleEn: "Mobile apps",
      summaryEn: "Native and cross-platform mobile apps for iOS and Android.",
      descriptionEn:
        "We build fast, high-quality mobile apps for both platforms from a single codebase using React Native and Flutter.",
      icon: "smartphone",
      order: 2,
    },
    {
      title: "UI/UX Dizayn",
      slug: "ui-ux-dizayn",
      summary: "Foydalanuvchi tajribasini birinchi o'ringa qo'yuvchi zamonaviy interfeys dizayni.",
      description:
        "Figma asosida wireframe'dan tortib to yakuniy interaktiv prototipgacha, brendingizga mos, konversiyani oshiruvchi dizayn tizimlarini yaratamiz.",
      titleRu: "UI/UX дизайн",
      summaryRu: "Современный дизайн интерфейсов, ставящий пользовательский опыт на первое место.",
      descriptionRu:
        "От вайрфреймов до финального интерактивного прототипа в Figma — создаём дизайн-системы, соответствующие вашему бренду и повышающие конверсию.",
      titleEn: "UI/UX design",
      summaryEn: "Modern interface design that puts user experience first.",
      descriptionEn:
        "From wireframes to the final interactive prototype in Figma, we build on-brand design systems that boost conversion.",
      icon: "palette",
      order: 3,
    },
    {
      title: "E-commerce yechimlar",
      slug: "e-commerce-yechimlar",
      summary: "To'lov tizimlari integratsiyasi bilan to'liq onlayn-do'kon yechimlari.",
      description:
        "Click, Payme, Uzcard kabi mahalliy to'lov tizimlari, ombor boshqaruvi va CRM integratsiyasi bilan onlayn savdo platformalarini quramiz.",
      titleRu: "E-commerce решения",
      summaryRu: "Полноценные онлайн-магазины с интеграцией платёжных систем.",
      descriptionRu:
        "Создаём платформы онлайн-торговли с интеграцией локальных платёжных систем (Click, Payme, Uzcard), управлением складом и CRM.",
      titleEn: "E-commerce solutions",
      summaryEn: "Full online store solutions with payment gateway integration.",
      descriptionEn:
        "We build online commerce platforms with local payment gateway integration (Click, Payme, Uzcard), inventory management and CRM.",
      icon: "shopping-cart",
      order: 4,
    },
    {
      title: "Backend va Bulut infratuzilma",
      slug: "backend-va-bulut",
      summary: "Mikroservislar, API'lar va bulutga asoslangan qulay boshqariladigan infratuzilma.",
      description:
        "Node.js, PostgreSQL, Docker va AWS/GCP asosida yuqori yuklamaga bardoshli, xavfsiz backend tizimlarini loyihalashtiramiz va joylashtiramiz.",
      titleRu: "Backend и облачная инфраструктура",
      summaryRu: "Микросервисы, API и удобная в управлении облачная инфраструктура.",
      descriptionRu:
        "Проектируем и разворачиваем надёжные, отказоустойчивые backend-системы на Node.js, PostgreSQL, Docker и AWS/GCP.",
      titleEn: "Backend & cloud infrastructure",
      summaryEn: "Microservices, APIs and easy-to-manage cloud infrastructure.",
      descriptionEn:
        "We design and deploy secure, high-load backend systems using Node.js, PostgreSQL, Docker and AWS/GCP.",
      icon: "server",
      order: 5,
    },
    {
      title: "Sun'iy intellekt integratsiyasi",
      slug: "sun-iy-intellekt",
      summary: "Biznes jarayonlaringizga AI-chatbotlar va avtomatlashtirish yechimlari.",
      description:
        "LLM'lar asosida mijozlar bilan ishlash, ichki jarayonlarni avtomatlashtirish va ma'lumotlarni tahlil qilish uchun AI yechimlarini joriy qilamiz.",
      titleRu: "Интеграция искусственного интеллекта",
      summaryRu: "AI-чат-боты и автоматизация для ваших бизнес-процессов.",
      descriptionRu:
        "Внедряем AI-решения на базе LLM для работы с клиентами, автоматизации внутренних процессов и анализа данных.",
      titleEn: "AI integration",
      summaryEn: "AI chatbots and automation for your business processes.",
      descriptionEn:
        "We implement LLM-based AI solutions for customer engagement, internal process automation and data analysis.",
      icon: "sparkles",
      order: 6,
    },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }

  const projects = [
    {
      slug: "paytaxt-bank-fintech",
      title: "PaytaxtBank — Fintech platforma",
      category: "Fintech",
      summary: "Onlayn bank xizmatlari uchun to'liq raqamli platforma.",
      description:
        "PaytaxtBank uchun mijozlarga kartalarni boshqarish, pul o'tkazmalari, kreditlarga ariza berish imkonini beruvchi xavfsiz veb va mobil platforma ishlab chiqdik. Tizim real vaqt rejimida 50,000+ faol foydalanuvchini xizmat qiladi.",
      titleRu: "PaytaxtBank — Финтех-платформа",
      categoryRu: "Финтех",
      summaryRu: "Полноценная цифровая платформа для онлайн-банковских услуг.",
      descriptionRu:
        "Разработали безопасную веб- и мобильную платформу для PaytaxtBank с управлением картами, переводами и подачей заявок на кредит. Система обслуживает 50,000+ активных пользователей в реальном времени.",
      titleEn: "PaytaxtBank — Fintech platform",
      categoryEn: "Fintech",
      summaryEn: "A complete digital platform for online banking services.",
      descriptionEn:
        "We built a secure web and mobile platform for PaytaxtBank with card management, money transfers and loan applications. The system serves 50,000+ active users in real time.",
      client: "PaytaxtBank AJ",
      year: "2025",
      duration: "6 oy",
      link: "https://example.com",
      cover: "/uploads/projects/fintech.svg",
      gallery: JSON.stringify(["/uploads/projects/fintech.svg"]),
      stack: JSON.stringify(["Next.js", "PostgreSQL", "Node.js", "AWS"]),
      featured: true,
      order: 1,
    },
    {
      slug: "medconnect-telemedicina",
      title: "MedConnect — Telemeditsina xizmati",
      category: "Sog'liqni saqlash",
      summary: "Shifokor va bemorlarni onlayn bog'laydigan telemeditsina platformasi.",
      description:
        "Video konsultatsiya, elektron retsept va bemor tarixi boshqaruvi funksiyalariga ega platforma. HIPAA standartlariga mos xavfsizlik darajasi bilan qurilgan.",
      titleRu: "MedConnect — Служба телемедицины",
      categoryRu: "Здравоохранение",
      summaryRu: "Платформа телемедицины, соединяющая врачей и пациентов онлайн.",
      descriptionRu:
        "Платформа с видеоконсультациями, электронными рецептами и управлением историей болезни. Построена с уровнем безопасности, соответствующим стандартам HIPAA.",
      titleEn: "MedConnect — Telemedicine service",
      categoryEn: "Healthcare",
      summaryEn: "A telemedicine platform connecting doctors and patients online.",
      descriptionEn:
        "A platform with video consultations, e-prescriptions and patient history management, built with HIPAA-grade security.",
      client: "MedConnect LLC",
      year: "2025",
      duration: "4 oy",
      link: "https://example.com",
      cover: "/uploads/projects/medconnect.svg",
      gallery: JSON.stringify(["/uploads/projects/medconnect.svg"]),
      stack: JSON.stringify(["React", "WebRTC", "Node.js", "MongoDB"]),
      featured: true,
      order: 2,
    },
    {
      slug: "uysavdo-marketplace",
      title: "UySavdo — Ko'chmas mulk marketpleysi",
      category: "E-commerce",
      summary: "Ko'chmas mulk sotish va ijaraga berish uchun onlayn platforma.",
      description:
        "Interaktiv xarita, filtrlash tizimi va onlayn to'lov integratsiyasiga ega bo'lgan ko'chmas mulk marketpleysi. Loyiha 3 oy ichida 10,000+ e'londan oshdi.",
      titleRu: "UySavdo — Маркетплейс недвижимости",
      categoryRu: "E-commerce",
      summaryRu: "Онлайн-платформа для продажи и аренды недвижимости.",
      descriptionRu:
        "Маркетплейс недвижимости с интерактивной картой, системой фильтров и интеграцией онлайн-оплаты. За 3 месяца на платформе появилось более 10,000 объявлений.",
      titleEn: "UySavdo — Real estate marketplace",
      categoryEn: "E-commerce",
      summaryEn: "An online platform for buying, selling and renting real estate.",
      descriptionEn:
        "A real estate marketplace with an interactive map, filtering system and online payment integration. The platform passed 10,000+ listings within 3 months.",
      client: "UySavdo MCHJ",
      year: "2024",
      duration: "5 oy",
      link: "https://example.com",
      cover: "/uploads/projects/marketplace.svg",
      gallery: JSON.stringify(["/uploads/projects/marketplace.svg"]),
      stack: JSON.stringify(["Next.js", "Tailwind", "PostgreSQL", "Redis"]),
      featured: true,
      order: 3,
    },
    {
      slug: "logipro-lojistika",
      title: "LogiPro — Lojistika boshqaruv tizimi",
      category: "SaaS",
      summary: "Yuk tashish va omborlarni real vaqtda kuzatuvchi SaaS platforma.",
      description:
        "GPS kuzatuv, marshrut optimallashtirish va hisobot generatsiyasi funksiyalariga ega bo'lgan korporativ SaaS mahsulot.",
      titleRu: "LogiPro — Система управления логистикой",
      categoryRu: "SaaS",
      summaryRu: "SaaS-платформа для отслеживания грузоперевозок и складов в реальном времени.",
      descriptionRu:
        "Корпоративный SaaS-продукт с GPS-отслеживанием, оптимизацией маршрутов и генерацией отчётов.",
      titleEn: "LogiPro — Logistics management system",
      categoryEn: "SaaS",
      summaryEn: "A SaaS platform for real-time freight and warehouse tracking.",
      descriptionEn:
        "An enterprise SaaS product with GPS tracking, route optimization and report generation.",
      client: "LogiPro Group",
      year: "2024",
      duration: "7 oy",
      link: "https://example.com",
      cover: "/uploads/projects/logipro.svg",
      gallery: JSON.stringify(["/uploads/projects/logipro.svg"]),
      stack: JSON.stringify(["React", "Node.js", "MySQL", "Docker"]),
      featured: false,
      order: 4,
    },
    {
      slug: "eduverse-lms",
      title: "EduVerse — Onlayn ta'lim platformasi",
      category: "EdTech",
      summary: "Video kurslar, testlar va sertifikatlash tizimiga ega LMS platforma.",
      description:
        "50,000 dan ortiq talaba foydalanadigan, video striming, avtomatik testlash va progress kuzatuv imkoniyatlariga ega ta'lim platformasi.",
      titleRu: "EduVerse — Платформа онлайн-обучения",
      categoryRu: "EdTech",
      summaryRu: "LMS-платформа с видеокурсами, тестами и системой сертификации.",
      descriptionRu:
        "Образовательная платформа с видеостримингом, автоматическим тестированием и отслеживанием прогресса, которой пользуются более 50,000 студентов.",
      titleEn: "EduVerse — Online learning platform",
      categoryEn: "EdTech",
      summaryEn: "An LMS platform with video courses, tests and a certification system.",
      descriptionEn:
        "An education platform with video streaming, automated testing and progress tracking, used by 50,000+ students.",
      client: "EduVerse",
      year: "2023",
      duration: "8 oy",
      link: "https://example.com",
      cover: "/uploads/projects/eduverse.svg",
      gallery: JSON.stringify(["/uploads/projects/eduverse.svg"]),
      stack: JSON.stringify(["Next.js", "PostgreSQL", "AWS S3", "Stripe"]),
      featured: false,
      order: 5,
    },
    {
      slug: "foodly-delivery",
      title: "Foodly — Oziq-ovqat yetkazib berish",
      category: "Mobil ilova",
      summary: "Restoranlar va kuryerlarni bog'lovchi tezkor yetkazib berish ilovasi.",
      description:
        "Real vaqtda buyurtma kuzatuvi, xarita integratsiyasi va ko'p tilli interfeysga ega mobil ilova. Ishga tushirilgandan so'ng 100,000+ yuklab olishga erishdi.",
      titleRu: "Foodly — Доставка еды",
      categoryRu: "Мобильное приложение",
      summaryRu: "Приложение быстрой доставки, соединяющее рестораны и курьеров.",
      descriptionRu:
        "Мобильное приложение с отслеживанием заказов в реальном времени, интеграцией карт и многоязычным интерфейсом. После запуска набрало более 100,000 загрузок.",
      titleEn: "Foodly — Food delivery",
      categoryEn: "Mobile app",
      summaryEn: "A fast delivery app connecting restaurants and couriers.",
      descriptionEn:
        "A mobile app with real-time order tracking, map integration and a multilingual interface. It reached 100,000+ downloads after launch.",
      client: "Foodly Uzbekistan",
      year: "2023",
      duration: "5 oy",
      link: "https://example.com",
      cover: "/uploads/projects/foodly.svg",
      gallery: JSON.stringify(["/uploads/projects/foodly.svg"]),
      stack: JSON.stringify(["React Native", "Firebase", "Node.js"]),
      featured: false,
      order: 6,
    },
  ];

  for (const p of projects) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  const testimonials = [
    {
      name: "Sardor Alimov",
      role: "Bosh direktor",
      company: "PaytaxtBank",
      quote:
        "WebCompany.uz jamoasi bizning eng murakkab talablarimizni ham professional va o'z vaqtida amalga oshirdi. Ular bilan ishlash haqiqiy hamkorlik edi.",
      roleRu: "Генеральный директор",
      quoteRu:
        "Команда WebCompany.uz профессионально и в срок реализовала даже наши самые сложные требования. Работа с ними была настоящим партнёрством.",
      roleEn: "CEO",
      quoteEn:
        "The WebCompany.uz team delivered even our most complex requirements professionally and on time. Working with them felt like a true partnership.",
      rating: 5,
      order: 1,
    },
    {
      name: "Nilufar Qosimova",
      role: "Mahsulot menejeri",
      company: "MedConnect",
      quote:
        "Sifat, tezlik va muloqot — uchalasi ham a'lo darajada. Loyihamiz belgilangan muddatdan oldin yakunlandi.",
      roleRu: "Менеджер по продукту",
      quoteRu:
        "Качество, скорость и коммуникация — всё на высшем уровне. Наш проект был завершён раньше установленного срока.",
      roleEn: "Product Manager",
      quoteEn:
        "Quality, speed and communication — all top-notch. Our project was completed ahead of the agreed deadline.",
      rating: 5,
      order: 2,
    },
    {
      name: "Jasur Rashidov",
      role: "Asoschisi",
      company: "UySavdo",
      quote:
        "Platformamiz ishga tushgandan so'ng foydalanuvchilar soni tez o'sdi. Bunga WebCompany.uz jamoasining texnik yechimlari sabab bo'ldi.",
      roleRu: "Основатель",
      quoteRu:
        "После запуска нашей платформы число пользователей быстро выросло. Заслуга в этом — технических решений команды WebCompany.uz.",
      roleEn: "Founder",
      quoteEn:
        "After our platform launched, our user base grew rapidly — thanks to WebCompany.uz's technical solutions.",
      rating: 5,
      order: 3,
    },
  ];

  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { name: t.name, company: t.company } });
    if (!existing) {
      await prisma.testimonial.create({ data: t });
    }
  }

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  console.log("Seed ma'lumotlari muvaffaqiyatli qo'shildi.");
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

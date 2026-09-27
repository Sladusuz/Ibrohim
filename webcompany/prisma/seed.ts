import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
      icon: "code-2",
      order: 1,
    },
    {
      title: "Mobil ilovalar",
      slug: "mobil-ilovalar",
      summary: "iOS va Android uchun native va cross-platform mobil ilovalar.",
      description:
        "React Native va Flutter texnologiyalari yordamida bir kod bazasidan ikkala platforma uchun ham tez va sifatli mobil ilovalar ishlab chiqamiz.",
      icon: "smartphone",
      order: 2,
    },
    {
      title: "UI/UX Dizayn",
      slug: "ui-ux-dizayn",
      summary: "Foydalanuvchi tajribasini birinchi o'ringa qo'yuvchi zamonaviy interfeys dizayni.",
      description:
        "Figma asosida wireframe'dan tortib to yakuniy interaktiv prototipgacha, brendingizga mos, konversiyani oshiruvchi dizayn tizimlarini yaratamiz.",
      icon: "palette",
      order: 3,
    },
    {
      title: "E-commerce yechimlar",
      slug: "e-commerce-yechimlar",
      summary: "To'lov tizimlari integratsiyasi bilan to'liq onlayn-do'kon yechimlari.",
      description:
        "Click, Payme, Uzcard kabi mahalliy to'lov tizimlari, ombor boshqaruvi va CRM integratsiyasi bilan onlayn savdo platformalarini quramiz.",
      icon: "shopping-cart",
      order: 4,
    },
    {
      title: "Backend va Bulut infratuzilma",
      slug: "backend-va-bulut",
      summary: "Mikroservislar, API'lar va bulutga asoslangan qulay boshqariladigan infratuzilma.",
      description:
        "Node.js, PostgreSQL, Docker va AWS/GCP asosida yuqori yuklamaga bardoshli, xavfsiz backend tizimlarini loyihalashtiramiz va joylashtiramiz.",
      icon: "server",
      order: 5,
    },
    {
      title: "Sun'iy intellekt integratsiyasi",
      slug: "sun-iy-intellekt",
      summary: "Biznes jarayonlaringizga AI-chatbotlar va avtomatlashtirish yechimlari.",
      description:
        "LLM'lar asosida mijozlar bilan ishlash, ichki jarayonlarni avtomatlashtirish va ma'lumotlarni tahlil qilish uchun AI yechimlarini joriy qilamiz.",
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
      rating: 5,
      order: 1,
    },
    {
      name: "Nilufar Qosimova",
      role: "Mahsulot menejeri",
      company: "MedConnect",
      quote:
        "Sifat, tezlik va muloqot — uchalasi ham a'lo darajada. Loyihamiz belgilangan muddatdan oldin yakunlandi.",
      rating: 5,
      order: 2,
    },
    {
      name: "Jasur Rashidov",
      role: "Asoschisi",
      company: "UySavdo",
      quote:
        "Platformamiz ishga tushgandan so'ng foydalanuvchilar soni tez o'sdi. Bunga WebCompany.uz jamoasining texnik yechimlari sabab bo'ldi.",
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

  const settings: Record<string, string> = {
    site_name: "WebCompany.uz",
    site_tagline: "Kelajakni bugun quramiz",
    site_description:
      "O'zbekistondagi yetakchi IT-kompaniya. Veb-saytlar, mobil ilovalar va raqamli mahsulotlarni loyihalash, ishlab chiqish va rivojlantirish bo'yicha professional yechimlar.",
    contact_email: "info@webcompany.uz",
    contact_phone: "+998 33 623 33 13",
    contact_address: "Toshkent sh., Amir Temur ko'chasi, 108-uy",
    social_telegram: "https://t.me/webcompany_uz",
    social_instagram: "https://instagram.com/webcompany.uz",
    social_linkedin: "https://linkedin.com/company/webcompany-uz",
    social_github: "https://github.com/webcompany-uz",
    stat_projects: "180",
    stat_clients: "95",
    stat_experts: "42",
    stat_years: "8",
  };

  for (const [key, value] of Object.entries(settings)) {
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

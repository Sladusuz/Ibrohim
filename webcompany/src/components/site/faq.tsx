"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

const FAQS = [
  {
    q: "Loyiha odatda qancha vaqt oladi?",
    a: "Loyiha murakkabligiga qarab farq qiladi. Oddiy korporativ sayt 2-4 hafta, murakkab veb-ilova yoki marketpleys 3-6 oy davom etishi mumkin. Aniq muddatni tahlil bosqichida belgilaymiz.",
  },
  {
    q: "Narxlash qanday amalga oshiriladi?",
    a: "Har bir loyiha uchun individual narx taklifi tayyorlaymiz — funksionallik, dizayn murakkabligi va integratsiyalarga qarab. Bepul konsultatsiyada aniq smeta va muddat bilan taniqtiramiz.",
  },
  {
    q: "Loyihadan keyin texnik yordam bormi?",
    a: "Ha. Barcha loyihalarga kamida 3 oylik bepul texnik xizmat ko'rsatish kiritilgan, undan keyin esa moslashuvchan qo'llab-quvvatlash paketlarini taklif qilamiz.",
  },
  {
    q: "Mavjud saytimni yangilashingiz mumkinmi?",
    a: "Albatta. Mavjud kodni tahlil qilib, uni qayta qurish yoki yangi zamonaviy texnologiyalarga ko'chirish bo'yicha tavsiyalar beramiz.",
  },
  {
    q: "Qaysi to'lov tizimlarini integratsiya qila olasiz?",
    a: "Click, Payme, Uzcard, Humo kabi mahalliy tizimlar, shuningdek Stripe va PayPal kabi xalqaro to'lov tizimlari bilan ishlaymiz.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Savol-javob"
          title="Ko'p beriladigan savollar"
          description="Agar javobini topolmagan savolingiz bo'lsa, biz bilan bemalol bog'laning."
        />

        <div className="mx-auto mt-14 max-w-3xl divide-y divide-slate-200 border-y border-slate-200">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={faq.q} delay={i * 0.05}>
                <div>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-6 text-left"
                    data-cursor-hover
                  >
                    <span className="font-display text-base font-bold text-ink-900 sm:text-lg">
                      {faq.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-ink-900"
                    >
                      <Plus className="h-4 w-4" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 pr-12 text-sm leading-relaxed text-slate-500">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

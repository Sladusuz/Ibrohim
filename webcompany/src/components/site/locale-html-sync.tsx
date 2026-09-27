"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";

/**
 * The root <html> lives outside the [locale] segment (it also serves the
 * non-localized /admin routes), so its `lang` attribute can't read the
 * locale param directly. This keeps it in sync on the client.
 */
export function LocaleHtmlSync() {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}

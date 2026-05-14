/**
 * Inline JSON-LD render bileşeni — schema.org structured data'yı
 * `<script type="application/ld+json">` etiketinde yayar.
 *
 * Dilim 7/29.κ — polish.
 *
 * Niçin component:
 *  • Tek satırlık ama tekrar eden bir desen — entity sayfalarında 4×.
 *  • `JSON.stringify` artık `dangerouslySetInnerHTML` ile mounted; eğer
 *    object'i directly bir child olarak verirsek React string'leştirmez,
 *    bizim manual `JSON.stringify` çağırmamız gerekir. Bunu component'a
 *    sıkıştırmak çağrı yerlerindeki gürültüyü azaltır.
 *
 * CSP notu:
 *  • Bu script `<script type="application/ld+json">` — type "ld+json",
 *    "application/javascript" değil. Tarayıcılar bunu execute etmez
 *    (yalnızca crawler parse'ı için meta veri). Ama CSP'nin
 *    `script-src` direktifi yine de uygulanır.
 *  • Mevcut CSP `'unsafe-inline'` izniyle çalışır (zaten theme bootstrap
 *    için açık). CSP-strict regime'e geçilecekse bu bileşenin nonce
 *    veya hash mekanizmasıyla beslenmesi gerekir.
 *
 * Niçin `dangerouslySetInnerHTML`:
 *  • Standart React text-child rendering JSON'u escape eder
 *    (`&quot;`, `\u003c`); script content olarak parse edilemez.
 *  • `dangerouslySetInnerHTML` ile ham içerik DOM'a geçer; ld+json
 *    parser raw content bekler.
 *  • XSS riski: JSON.stringify'ın çıktısı script-injectable değil
 *    çünkü `</script>` substring'i jsonString içinde bulunamaz (JSON
 *    string'lerinde `<` ham görünebilir ama `</script>` parser-attack'i
 *    için escape edilmeli). Aşağıdaki `safeSerialize` bunu kapatır:
 *    `<` karakterini `\u003c` ile değiştirir.
 */

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

function safeSerialize(value: unknown): string {
  // Schema.org bütün özel karakterleri JSON-escape'le tolere eder; biz
  // ek olarak `<` karakterini `\u003c` ile değiştiriyoruz ki ham
  // `</script>` substring'i ortaya çıkamasın (script-injection guard).
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: safeSerialize(data) }}
    />
  );
}

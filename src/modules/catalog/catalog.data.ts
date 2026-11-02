import type { Product } from './catalog.types.ts'

// Stable IDs and prices preserve saved-cart compatibility through the redesign.
export const products: Product[] = [
  {
    "id": "acoustic-pro",
    "name": "مونستيرا",
    "category": "indoor",
    "price": 199.99,
    "originalPrice": 249.99,
    "image": new URL('../../assets/plants/monstera.jpg', import.meta.url).href,
    "alt": "مونستيرا — من مجموعة نبتة",
    "badge": "الأكثر محبة",
    "description": "أوراق واسعة وتفاصيل مميّزة، لركن يستحق بعض الحياة.",
    "features": [
      "ضوء ساطع غير مباشر",
      "اترك سطح التربة يجف بين الريّات",
      "مساحة مريحة للنمو"
    ]
  },
  {
    "id": "apex-pro",
    "name": "زاميا",
    "category": "indoor",
    "price": 129.5,
    "originalPrice": null,
    "image": new URL('../../assets/plants/zz-plant.jpg', import.meta.url).href,
    "alt": "زاميا — من مجموعة نبتة",
    "badge": "وصلت حديثًا",
    "description": "رفيقة خضراء بأوراق لامعة، جميلة للمساحات الهادئة.",
    "features": [
      "ضوء غير مباشر",
      "ريّ معتدل بعد جفاف التربة",
      "مناسبة للمبتدئين"
    ]
  },
  {
    "id": "chronos-pulse",
    "name": "لسان الحماة",
    "category": "indoor",
    "price": 159,
    "originalPrice": 189,
    "image": new URL('../../assets/plants/snake-plant.jpg', import.meta.url).href,
    "alt": "لسان الحماة — من مجموعة نبتة",
    "badge": null,
    "description": "أوراق مستقيمة وخطوط بسيطة، تضيف حضورًا أنيقًا إلى ركنك.",
    "features": [
      "تتحمل الضوء الخافت",
      "ريّ قليل بعد جفاف التربة",
      "أصيص بتصريف جيد"
    ]
  },
  {
    "id": "magflow-station",
    "name": "أصيص خزفي",
    "category": "accessories",
    "price": 69.99,
    "originalPrice": null,
    "image": new URL('../../assets/plants/ceramic-pot.jpg', import.meta.url).href,
    "alt": "أصيص خزفي — من مجموعة نبتة",
    "badge": null,
    "description": "تفاصيل خزفية دافئة، تمنح نبتتك بيتًا يليق بها.",
    "features": [
      "خزف بلون طبيعي",
      "قاعدة ثابتة",
      "للنباتات الصغيرة والمتوسطة"
    ]
  },
  {
    "id": "aero-buds",
    "name": "بوتس ذهبي",
    "category": "indoor",
    "price": 89.99,
    "originalPrice": null,
    "image": new URL('../../assets/plants/pothos.jpg', import.meta.url).href,
    "alt": "بوتس ذهبي — من مجموعة نبتة",
    "badge": "وصلت حديثًا",
    "description": "أغصان متدلّية وأوراق خضراء، تترك أثرًا جميلًا على الرفوف.",
    "features": [
      "ضوء متوسط غير مباشر",
      "ريّ عند جفاف سطح التربة",
      "جميلة في الأصص المعلّقة"
    ]
  },
  {
    "id": "echo-mini",
    "name": "زنبق السلام",
    "category": "flowering",
    "price": 59.99,
    "originalPrice": 79.99,
    "image": new URL('../../assets/plants/peace-lily.jpg', import.meta.url).href,
    "alt": "زنبق السلام — من مجموعة نبتة",
    "badge": "اختيار الموسم",
    "description": "خضرة ناعمة وأزهار رقيقة، لهدوء تشعر به كل يوم.",
    "features": [
      "ضوء غير مباشر",
      "حافظ على رطوبة معتدلة",
      "تجنّب أشعة الشمس المباشرة"
    ]
  },
  {
    "id": "glide-wireless",
    "name": "إكليل الجبل",
    "category": "outdoor",
    "price": 49.99,
    "originalPrice": null,
    "image": new URL('../../assets/plants/rosemary.jpg', import.meta.url).href,
    "alt": "إكليل الجبل — من مجموعة نبتة",
    "badge": null,
    "description": "عطر أخضر مألوف، ينمو في ركن مشمس من شرفتك.",
    "features": [
      "مكان مشمس",
      "تربة جيدة التصريف",
      "ريّ بعد جفاف سطح التربة"
    ]
  },
  {
    "id": "focus-webcam",
    "name": "لافندر",
    "category": "outdoor",
    "price": 79.99,
    "originalPrice": null,
    "image": new URL('../../assets/plants/lavender.jpg', import.meta.url).href,
    "alt": "لافندر — من مجموعة نبتة",
    "badge": "وصلت حديثًا",
    "description": "لمسة من اللون والعطر، لأيام أقرب إلى الطبيعة.",
    "features": [
      "ضوء شمس وفير",
      "تجنّب الإفراط في الريّ",
      "مكان جيد التهوية"
    ]
  },
  {
    "id": "stride-band",
    "name": "ألوفيرا",
    "category": "succulents",
    "price": 49.99,
    "originalPrice": 64.99,
    "image": new URL('../../assets/plants/aloe-vera.jpg', import.meta.url).href,
    "alt": "ألوفيرا — من مجموعة نبتة",
    "badge": "اختيار الموسم",
    "description": "جمال بسيط بأوراق ممتلئة، لرفيق ينمو على مهل.",
    "features": [
      "ضوء ساطع",
      "ريّ قليل",
      "تربة مخصّصة للعصاريات"
    ]
  },
  {
    "id": "orbit-sport",
    "name": "صبار الأجاص",
    "category": "succulents",
    "price": 179.99,
    "originalPrice": null,
    "image": new URL('../../assets/plants/prickly-pear.jpg', import.meta.url).href,
    "alt": "صبار الأجاص — من مجموعة نبتة",
    "badge": "وصل حديثًا",
    "description": "شكل مميّز وشخصية محبّة للشمس، يضيفان البهجة لمساحتك.",
    "features": [
      "مكان مشمس",
      "اترك التربة تجف تمامًا",
      "تعامل معه بحذر لوجود الأشواك"
    ]
  },
  {
    "id": "volt-power",
    "name": "أدوات العناية",
    "category": "accessories",
    "price": 39.99,
    "originalPrice": null,
    "image": new URL('../../assets/plants/garden-tools.jpg', import.meta.url).href,
    "alt": "أدوات العناية — من مجموعة نبتة",
    "badge": null,
    "description": "رفقاء صغار لكل خطوة، من أول أصيص إلى حديقتك الصغيرة.",
    "features": [
      "أدوات للزراعة المنزلية",
      "سهلة الاستخدام",
      "نظّفها وجفّفها بعد الاستخدام"
    ]
  },
  {
    "id": "link-usb-hub",
    "name": "تربة عضوية",
    "category": "accessories",
    "price": 54.99,
    "originalPrice": null,
    "image": new URL('../../assets/plants/potting-soil.jpg', import.meta.url).href,
    "alt": "تربة عضوية — من مجموعة نبتة",
    "badge": null,
    "description": "بداية من الجذور، لخضرة تنمو في بيتها الجديد.",
    "features": [
      "للنباتات المنزلية",
      "احفظها في مكان جاف",
      "اختر خليطًا يناسب احتياج نبتتك"
    ]
  }
]

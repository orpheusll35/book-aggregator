
/**
 * Configuration for the scraper's target categories.
 * Add new D&R category URLs here to include them in the automated crawl.
 * These use "Clean URLs" for better readability and stability.
 */
export const SCRAPE_TARGETS = [
    // --- D&R Targets ---
    {
        name: "Edebiyat",
        store: "D&R",
        url: "https://www.dr.com.tr/kategori/kitap/edebiyat/grupno=00055",
        maxPages: 99999
    },
    {
        name: "Çocuk ve Gençlik",
        store: "D&R",
        url: "https://www.dr.com.tr/kategori/kitap/cocuk-ve-genclik/grupno=00884",
        maxPages: 99999
    },
    {
        name: "Foreign Languages",
        store: "D&R",
        url: "https://www.dr.com.tr/kategori/kitap/foreign-languages/grupno=00812",
        maxPages: 99999
    },
    {
        name: "Eğitim ve Sınav Kitapları",
        store: "D&R",
        url: "https://www.dr.com.tr/kategori/egitim-ve-sinav-kitaplari",
        maxPages: 99999
    },
    {
        name: "Araştırma - Tarih",
        store: "D&R",
        url: "https://www.dr.com.tr/kategori/kitap/arastirma-tarih/grupno=00051",
        maxPages: 99999
    },
    {
        name: "Bilim",
        store: "D&R",
        url: "https://www.dr.com.tr/kategori/kitap/bilim/grupno=00052",
        maxPages: 99999
    },
    {
        name: "Felsefe",
        store: "D&R",
        url: "https://www.dr.com.tr/kategori/kitap/felsefe/grupno=00058",
        maxPages: 99999
    },
    {
        name: "Eğitim - Başvuru",
        store: "D&R",
        url: "https://www.dr.com.tr/kategori/kitap/egitim-basvuru/grupno=00056",
        maxPages: 99999
    },
    {
        name: "Din - Tasavvuf",
        store: "D&R",
        url: "https://www.dr.com.tr/kategori/kitap/din-tasavvuf/grupno=00054",
        maxPages: 99999
    },
    {
        name: "Sanat - Tasarım",
        store: "D&R",
        url: "https://www.dr.com.tr/kategori/kitap/sanat-tasarim/grupno=00063",
        maxPages: 99999
    },
    {
        name: "Hobi",
        store: "D&R",
        url: "https://www.dr.com.tr/kategori/kitap/hobi/grupno=00060",
        maxPages: 99999
    },
    {
        name: "Çizgi Roman",
        store: "D&R",
        url: "https://www.dr.com.tr/kategori/kitap/cizgi-roman/grupno=00053",
        maxPages: 99999
    },
    {
        name: "Manga",
        store: "D&R",
        url: "https://www.dr.com.tr/kategori/manga",
        maxPages: 99999
    },
    {
        name: "Mizah",
        store: "D&R",
        url: "https://www.dr.com.tr/kategori/kitap/mizah/grupno=00061",
        maxPages: 99999
    },
    {
        name: "Prestij Kitapları",
        store: "D&R",
        url: "https://www.dr.com.tr/kategori/kitap/prestij-kitaplari/grupno=00062",
        maxPages: 99999
    },

    // --- Kırmızı Kedi Targets ---
    { name: "Akademik", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/akademik-c-15", maxPages: 99999 },
    { name: "Araştırma - İnceleme", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/arastirma-inceleme-c-17", maxPages: 99999 },
    { name: "Araştırma", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/arastirma-c-22", maxPages: 99999 },
    { name: "Araştırma - Tarih", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/arastirma-tarih-c-24", maxPages: 99999 },
    { name: "Başvuru", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/basvuru-c-45", maxPages: 99999 },
    { name: "Bilim - Mühendislik", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/bilim-muhendislik-c-59", maxPages: 99999 },
    { name: "Bilim", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/bilim-c-63", maxPages: 99999 },
    { name: "Çin Kitaplığı", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/cin-kitapligi-c-71", maxPages: 99999 },
    { name: "Çocuk Kitapları", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/cocuk-kitaplari-c-72", maxPages: 99999 },
    { name: "Çocuk", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/cocuk-c-86", maxPages: 99999 },
    { name: "Dil Öğrenimi", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/dil-ogrenimi-c-108", maxPages: 99999 },
    { name: "Din", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/din-c-110", maxPages: 99999 },
    { name: "Edebiyat", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/edebiyat-c-115", maxPages: 99999 },
    { name: "Eğitim", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/egitim-c-192", maxPages: 99999 },
    { name: "Ekonomi", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/ekonomi-c-200", maxPages: 99999 },
    { name: "Felsefe", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/felsefe-c-202", maxPages: 99999 },
    { name: "Foreign Books", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/foreign-books-c-212", maxPages: 99999 },
    { name: "Gençlik", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/genclik-c-221", maxPages: 99999 },
    { name: "Genel Konular", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/genel-konular-c-227", maxPages: 99999 },
    { name: "Gezi ve Rehber Kitapları", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/gezi-ve-rehber-kitaplari-c-235", maxPages: 99999 },
    { name: "Kent Rehberleri", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/kent-rehberleri-c-238", maxPages: 99999 },
    { name: "Hobi", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/hobi-c-240", maxPages: 99999 },
    { name: "İnanç Kitapları - Mitolojiler", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/inanc-kitaplari-mitolojiler-c-251", maxPages: 99999 },
    { name: "İnsan ve Toplum", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/insan-ve-toplum-c-253", maxPages: 99999 },
    { name: "İslam", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/islam-c-256", maxPages: 99999 },
    { name: "Mizah", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/mizah-c-258", maxPages: 99999 },
    { name: "Müzik", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/muzik-c-265", maxPages: 99999 },
    { name: "Periyodik Yayınlar", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/periyodik-yayinlar-c-267", maxPages: 99999 },
    { name: "Politika - Siyaset", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/politika-siyaset-c-272", maxPages: 99999 },
    { name: "Prestij Kitabı", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/prestij-kitabi-c-284", maxPages: 99999 },
    { name: "Sağlık", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/saglik-c-289", maxPages: 99999 },
    { name: "Sanat", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/sanat-c-291", maxPages: 99999 },
    { name: "Sanat - Tasarım", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/sanat-tasarim-c-296", maxPages: 99999 },
    { name: "Sosyoloji", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/sosyoloji-c-311", maxPages: 99999 },
    { name: "Tarih", store: "Kırmızı Kedi", url: "https://www.kirmizikedi.com/tarih-c-315", maxPages: 99999 },

    // --- BKM Kitap Targets ---
    { name: "Çok Satanlar", store: "BKM Kitap", url: "https://www.bkmkitap.com/cok-satan-kitaplar", maxPages: 99999 },
    { name: "Edebiyat", store: "BKM Kitap", url: "https://www.bkmkitap.com/edebiyat-kitaplari", maxPages: 99999 },
    { name: "Çocuk Kitapları", store: "BKM Kitap", url: "https://www.bkmkitap.com/kitap/cocuk-kitaplari", maxPages: 99999 },
    { name: "Psikoloji", store: "BKM Kitap", url: "https://www.bkmkitap.com/psikoloji-kitaplari", maxPages: 99999 },
    { name: "Tarih", store: "BKM Kitap", url: "https://www.bkmkitap.com/kitap/tarih-kitaplari", maxPages: 99999 },
    { name: "Sağlık", store: "BKM Kitap", url: "https://www.bkmkitap.com/saglik-kitaplari", maxPages: 99999 },
    { name: "Gezi ve Rehber", store: "BKM Kitap", url: "https://www.bkmkitap.com/gezi-ve-rehber-kitaplari", maxPages: 99999 },
    { name: "Eğitim", store: "BKM Kitap", url: "https://www.bkmkitap.com/okula-yardimci-ve-sinavlara-hazirlik-kitaplari-kampanyasi", maxPages: 99999 },

    // --- Kitapyurdu Targets ---
    { name: "Tüm Kitaplar", store: "Kitapyurdu", url: "https://www.kitapyurdu.com/kategori/kitap/1.html", maxPages: 99999 }
];

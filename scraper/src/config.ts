
/**
 * Configuration for the scraper's target categories.
 * Add new D&R category URLs here to include them in the automated crawl.
 * These use "Clean URLs" for better readability and stability.
 */
export const SCRAPE_TARGETS = [
    {
        name: "Edebiyat",
        url: "https://www.dr.com.tr/kategori/kitap/edebiyat/grupno=00055",
        maxPages: 10
    },
    {
        name: "Çocuk ve Gençlik",
        url: "https://www.dr.com.tr/kategori/kitap/cocuk-ve-genclik/grupno=00884",
        maxPages: 10
    },
    {
        name: "Foreign Languages",
        url: "https://www.dr.com.tr/kategori/kitap/foreign-languages/grupno=00812",
        maxPages: 10
    },
    {
        name: "Eğitim ve Sınav Kitapları",
        url: "https://www.dr.com.tr/kategori/egitim-ve-sinav-kitaplari",
        maxPages: 10
    },
    {
        name: "Başvuru Kitapları",
        url: "https://www.dr.com.tr/kategori/kitap/egitim-basvuru/grupno=00056",
        maxPages: 10
    },
    {
        name: "Araştırma - Tarih",
        url: "https://www.dr.com.tr/kategori/kitap/arastirma-tarih/grupno=00051",
        maxPages: 10
    },
    {
        name: "Din Tasavvuf",
        url: "https://www.dr.com.tr/kategori/kitap/din-tasavvuf/grupno=00054",
        maxPages: 10
    },
    {
        name: "Sanat - Tasarım",
        url: "https://www.dr.com.tr/kategori/kitap/sanat-tasarim/grupno=00063",
        maxPages: 10
    },
    {
        name: "Felsefe",
        url: "https://www.dr.com.tr/kategori/kitap/felsefe/grupno=00058",
        maxPages: 10
    },
    {
        name: "Hobi",
        url: "https://www.dr.com.tr/kategori/kitap/hobi/grupno=00060",
        maxPages: 10
    },
    {
        name: "Bilim",
        url: "https://www.dr.com.tr/kategori/kitap/bilim/grupno=00052",
        maxPages: 10
    },
    {
        name: "Çizgi Roman",
        url: "https://www.dr.com.tr/kategori/kitap/cizgi-roman/grupno=00053",
        maxPages: 10
    },
    {
        name: "Manga",
        url: "https://www.dr.com.tr/kategori/manga",
        maxPages: 10
    },
    {
        name: "Mizah",
        url: "https://www.dr.com.tr/kategori/kitap/mizah/grupno=00061",
        maxPages: 10
    },
    {
        name: "Prestij Kitapları",
        url: "https://www.dr.com.tr/kategori/kitap/prestij-kitaplari/grupno=00062",
        maxPages: 10
    }
];

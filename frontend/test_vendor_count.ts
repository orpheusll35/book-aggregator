import { fetchBookById } from './src/lib/fetchBooks';

async function main() {
    const book = await fetchBookById('7c7e75f0-bb55-42f0-bd79-b5e69007d99f');
    console.log(JSON.stringify(book?.vendors, null, 2));
}

main();

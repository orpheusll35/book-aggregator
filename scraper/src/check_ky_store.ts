import { supabase } from './supabase';

async function checkStores() {
    console.log('--- Current Stores ---');
    const { data, error } = await supabase.from('stores').select('*');
    if (error) {
        console.error('Error fetching stores:', error.message);
        return;
    }
    console.table(data);

    const exists = (data as any[])?.find(s => s.name === 'Kitapyurdu');
    if (!exists) {
        console.log('\nKitapyurdu not found. Adding it...');
        const { error: insertError } = await supabase.from('stores').insert({ name: 'Kitapyurdu' });
        if (insertError) {
            console.error('Error adding Kitapyurdu:', insertError.message);
        } else {
            console.log('Kitapyurdu added successfully!');
        }
    } else {
        console.log('\nKitapyurdu already exists.');
    }
}

checkStores().catch(console.error);

// Debug different ways of creating dates
console.log('--- Date Constructor Comparison ---');

const stringDate1 = new Date('1990-06-11');
const constructorDate1 = new Date(1990, 5, 11); // month is 0-indexed

console.log(`new Date('1990-06-11'):`, stringDate1.toISOString());
console.log(`new Date(1990, 5, 11):`, constructorDate1.toISOString());
console.log(`String date local:`, stringDate1.toLocaleDateString('pt-BR'));
console.log(`Constructor date local:`, constructorDate1.toLocaleDateString('pt-BR'));

console.log('\n--- Birthday calculation test ---');

// Simulate what the service does
const hoje = new Date('2024-06-10T10:00:00.000Z');
hoje.setHours(0, 0, 0, 0);

// Test with string date
const birthDateString = new Date('1990-06-12');
const aniversarioString = new Date(
    hoje.getFullYear(),
    birthDateString.getMonth(),
    birthDateString.getDate()
);

const diasString = Math.ceil(
    (aniversarioString.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
);

console.log(`Birth date string '1990-06-12':`, birthDateString.toISOString());
console.log(`Anniversary this year:`, aniversarioString.toISOString());
console.log(`Days until:`, diasString);

// Test with constructor date
const birthDateConstructor = new Date(1990, 5, 12); // June 12
const aniversarioConstructor = new Date(
    hoje.getFullYear(),
    birthDateConstructor.getMonth(),
    birthDateConstructor.getDate()
);

const diasConstructor = Math.ceil(
    (aniversarioConstructor.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
);

console.log(`\nBirth date constructor (1990, 5, 12):`, birthDateConstructor.toISOString());
console.log(`Anniversary this year:`, aniversarioConstructor.toISOString());
console.log(`Days until:`, diasConstructor);
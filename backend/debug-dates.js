// Debug script to understand date calculations - using exact same date as test
const hoje = new Date('2024-06-10T10:00:00.000Z'); // Exact same as test
console.log('Data original:', hoje.toISOString());

hoje.setHours(0, 0, 0, 0); // This is what service does
console.log('Data após setHours(0,0,0,0):', hoje.toISOString());
console.log('Data local:', hoje.toLocaleDateString());

const testDates = [
    '1990-06-10', // hoje
    '1990-06-11', // amanhã  
    '1990-06-12', // 2 dias
    '1990-06-13', // 3 dias
];

testDates.forEach(dateStr => {
    const birthDate = new Date(dateStr); // Same way as used in test
    console.log(`\nTesting birth date: ${dateStr}`);
    console.log(`Birth date object: ${birthDate.toISOString()}`);
    
    const aniversarioEsteAno = new Date(
        hoje.getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate()
    );

    // Se o aniversário já passou este ano, considerar o próximo ano
    if (aniversarioEsteAno < hoje) {
        aniversarioEsteAno.setFullYear(hoje.getFullYear() + 1);
    }

    const diasAteAniversario = Math.ceil(
        (aniversarioEsteAno.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    );

    console.log(`Aniversário este ano: ${aniversarioEsteAno.toISOString()}`);
    console.log(`Dias até aniversário: ${diasAteAniversario}`);
    
    let titulo = '';
    if (diasAteAniversario === 0) {
        titulo = '🎉 Aniversário hoje!';
    } else if (diasAteAniversario === 1) {
        titulo = '🎂 Aniversário amanhã';
    } else {
        titulo = `📅 Aniversário em ${diasAteAniversario} dias`;
    }
    console.log(`Título esperado: ${titulo}`);
    console.log('---');
});
// Test countBusinessDaysBetween from 30/12/2024 to 03/01/2025
// Pula 01/01 (feriado) e fins de semana

// December 30, 2024 (Monday) - business day [1]
// December 31, 2024 (Tuesday) - business day [2]
// January 1, 2025 (Wednesday) - HOLIDAY (skip)
// January 2, 2025 (Thursday) - business day [3]
// January 3, 2025 (Friday) - business day [4]

// So the count should be 4, not 3
// The test expectation is INCORRECT

console.log('Test analysis:');
console.log('From December 30, 2024 to January 3, 2025:');
console.log('30/12 (Mon) = 1');
console.log('31/12 (Tue) = 2');
console.log('01/01 (Wed) = HOLIDAY (skip)');
console.log('02/01 (Thu) = 3');
console.log('03/01 (Fri) = 4');
console.log('Result should be: 4 business days');
console.log('Test expects: 3 business days');
console.log('The test expectation is INCORRECT');

function levDist(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0),
  );
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) matrix[i][j] = matrix[i - 1][j - 1];
      else
        matrix[i][j] =
          Math.min(matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j]) +
          1;
    }
  }
  return matrix[a.length][b.length];
}

console.log(levDist('khoangoaitonghop', 'khoangoaitonghop'));
console.log(levDist('khoangoaitonghop', 'khoaxatri'));

let bestMatch = { name: 'Khoa Xạ trị' };
let bestDist = Infinity;

const db = [
  { name: 'Khoa Xạ trị', norm: 'khoaxatri' },
  { name: 'Khoa Ngoại tổng hợp', norm: 'khoangoaitonghop' },
];

const normSpec = 'khoangoaitonghop';

for (const dbSpec of db) {
  let dist = levDist(normSpec, dbSpec.norm);
  if (dbSpec.norm.includes(normSpec) || normSpec.includes(dbSpec.norm))
    dist = dist / 2;
  console.log(`Checking ${dbSpec.name}: dist = ${dist}`);
  if (dist < bestDist) {
    bestDist = dist;
    bestMatch = dbSpec;
  }
}

console.log(`Matched to ${bestMatch.name} with dist ${bestDist}`);

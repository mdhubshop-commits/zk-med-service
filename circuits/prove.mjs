import { readFileSync, writeFileSync } from 'fs';

const id = process.argv[2] || 'amina';
const tree = JSON.parse(readFileSync('tree.json', 'utf8'));
const c = tree.credentials.find(x => x.id === id);
if (!c) { console.error('No credential:', id); process.exit(1); }

const toml = `file_hash = "${c.fileHash}"
doc_type = "${c.docType}"
path = [${c.path.map(p => `"${p}"`).join(', ')}]
index_bits = [${c.bits.join(', ')}]
root = "${tree.root}"
nullifier = "${c.nullifier}"
`;

writeFileSync('Prover.toml', toml);
console.log('Prover.toml written for', id);
console.log('  doc_type:', c.docType, '| nullifier:', c.nullifier.slice(0, 14) + '…');

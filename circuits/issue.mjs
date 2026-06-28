import { Barretenberg, Fr } from '@aztec/bb.js';
import { writeFileSync, readFileSync } from 'fs';
import pkg from 'js-sha3';
const { keccak256 } = pkg;

const DEPTH = 8;

// Read the authority's issued documents
const lines = readFileSync('credentials.csv', 'utf8').trim().split('\n');
const rows = lines[0].toLowerCase().includes('id') ? lines.slice(1) : lines;

const creds = rows.map(l => {
  const [id, docType, document] = l.split(',').map(s => s.trim());
  // file_hash = keccak(document) reduced into the field (top byte zeroed to stay < field modulus)
  const h = keccak256.array(Buffer.from(document));
  h[0] = 0;
  const fileHash = BigInt('0x' + Buffer.from(h).toString('hex'));
  return { id, docType: BigInt(docType), fileHash, document };
});

const fr = (x) => new Fr(Buffer.from(BigInt(x).toString(16).padStart(64, '0'), 'hex'));
const bb = await Barretenberg.new();
const ped = async (a, b) => bb.pedersenHash([fr(a), fr(b)], 0);
const ped1 = async (a) => bb.pedersenHash([fr(a)], 0);

// leaf = pedersen(file_hash, doc_type)
let leaves = [];
for (const c of creds) leaves.push(await ped(c.fileHash, c.docType));
while (leaves.length < 2 ** DEPTH) leaves.push(fr(0));

const layers = [leaves]; let cur = leaves;
while (cur.length > 1) {
  const nx = []; for (let i = 0; i < cur.length; i += 2) nx.push(await ped(cur[i], cur[i + 1]));
  layers.push(nx); cur = nx;
}
const root = cur[0].toString();

const out = [];
for (let k = 0; k < creds.length; k++) {
  let idx = k; const path = [], bits = [];
  for (let d = 0; d < DEPTH; d++) { path.push(layers[d][idx ^ 1].toString()); bits.push((idx & 1) === 1); idx >>= 1; }
  out.push({
    id: creds[k].id,
    fileHash: '0x' + creds[k].fileHash.toString(16),
    docType: creds[k].docType.toString(),
    nullifier: (await ped1(creds[k].fileHash)).toString(),
    path, bits,
  });
}

writeFileSync('tree.json', JSON.stringify({ root, credentials: out }, null, 2));
// tickets = the private file hashes handed to each holder
writeFileSync('tickets.json', JSON.stringify(out.map(c => ({ id: c.id, fileHash: c.fileHash, docType: c.docType })), null, 2));
console.log('ROOT:', root);
console.log('Issued', out.length, 'credentials -> tree.json, tickets.json');
await bb.destroy();

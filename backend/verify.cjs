const { execSync } = require('child_process');

const VERIFIER_ID = process.env.ZKMED_VERIFIER_ID || 'CCBRMTCZ7QZDK3UWCIK2QXN3OSIKMA64TIAP74KM2PVCWE2MPAXSVGYL';
const SOURCE = process.env.ZKMED_SOURCE || 'zkmed';
const NETWORK = process.env.ZKMED_NETWORK || 'testnet';

// Verifies an UltraHonk proof on the ZK-Med Soroban verifier.
// publicInputsHex / proofHex: hex strings (0x prefix optional).
// Returns { verified: boolean, error?: string }.
function verifyProof(publicInputsHex, proofHex) {
  const pi = String(publicInputsHex).replace(/^0x/, '');
  const pf = String(proofHex).replace(/^0x/, '');

  const cmd = [
    'stellar contract invoke',
    `--id ${VERIFIER_ID}`,
    `--source ${SOURCE}`,
    `--network ${NETWORK}`,
    '-- verify_proof',
    `--public_inputs ${pi}`,
    `--proof_bytes ${pf}`,
  ].join(' ');

  try {
    execSync(cmd + ' 2>&1', { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 });
    return { verified: true };
  } catch (e) {
    const out = (e.stdout || '') + (e.stderr || '');
    if (out.includes('Error(Contract, #4)')) {
      return { verified: false, error: 'Invalid proof — verification failed on-chain' };
    }
    return { verified: false, error: 'Verification error: ' + out.slice(0, 200) };
  }
}

module.exports = { verifyProof, VERIFIER_ID };

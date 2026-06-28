const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { verifyProof, VERIFIER_ID } = require('./verify.cjs');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// ZK Medical Proof Verification — verifies a real UltraHonk proof on Stellar.
// Body: { documentType, publicInputs, proof }  (publicInputs + proof are hex)
app.post('/api/verify-medical', (req, res) => {
    const { documentType, publicInputs, proof } = req.body;
    console.log(`Verifying ${documentType || 'document'} proof on-chain...`);

    if (!publicInputs || !proof) {
        return res.status(400).json({
            success: false,
            status: 'Error',
            message: 'Missing publicInputs or proof in request body.',
        });
    }

    const result = verifyProof(publicInputs, proof);

    res.json({
        success: result.verified,
        status: result.verified ? 'Verified' : 'Rejected',
        message: result.verified
            ? 'ZK proof verified on-chain. Document is valid and authentic — no underlying data revealed.'
            : (result.error || 'Proof rejected.'),
        verifierContract: VERIFIER_ID,
        network: 'Stellar testnet',
        timestamp: new Date().toISOString(),
    });
});

// Health check
app.get('/health', (req, res) => res.json({ ok: true, verifier: VERIFIER_ID }));

const PORT = Number(process.env.PORT || 5000);
const MAX_PORT_ATTEMPTS = 10;

function startServer(port, attempt = 1) {
    const server = app.listen(port, () => {
        console.log(`🚀 ZK-Med Backend active on port ${port} — verifier ${VERIFIER_ID.slice(0, 8)}…`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && attempt < MAX_PORT_ATTEMPTS) {
            console.warn(`Port ${port} is already in use. Trying ${port + 1}...`);
            server.close(() => startServer(port + 1, attempt + 1));
            return;
        }

        if (err.code === 'EADDRINUSE') {
            console.error(`Could not find an available port after ${MAX_PORT_ATTEMPTS} attempts.`);
            process.exit(1);
        }

        throw err;
    });
}

startServer(PORT);

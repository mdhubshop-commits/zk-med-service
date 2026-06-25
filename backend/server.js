const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Mock endpoint for ZK Medical Proof Verification
app.post('/api/verify-medical', (req, res) => {
    const { documentType, fileHash } = req.body;
    
    console.log(`Received request to verify: ${documentType}`);
    
    // Simulating off-chain ZK verification delay
    setTimeout(() => {
        res.json({
            success: true,
            message: "ZK Proof successfully generated and verified.",
            proofString: "0x3a9f8b...cd71e2", // Placeholder for when your partner hooks up Noir
            status: "Verified",
            timestamp: new Date().toISOString()
        });
    }, 1500);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 ZK-Med Backend active on port ${PORT}`));
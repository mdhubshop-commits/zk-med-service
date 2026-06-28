use std::hash::pedersen_hash;

global DEPTH: u32 = 8;

// ZK-Med: prove possession of a valid medical document of a specific type,
// without revealing the document or the holder's identity.
//
//  - file_hash   : hash of the holder's actual document (PRIVATE witness)
//  - doc_type    : the kind of document, e.g. "vaccination" (PUBLIC, checked)
//  - root        : the authority's published Merkle root of valid documents (PUBLIC)
//  - nullifier   : one-time fingerprint, prevents the same doc proving twice (PUBLIC)
fn main(
    file_hash: Field,
    path: [Field; DEPTH],
    index_bits: [bool; DEPTH],
    root: pub Field,
    nullifier: pub Field,
    doc_type: pub Field,
) {
    // 1. Rebuild the credential leaf from (file_hash, doc_type) and prove
    //    it sits in the authority's committed Merkle tree of valid documents.
    let leaf = pedersen_hash([file_hash, doc_type]);
    let mut node = leaf;
    for i in 0..DEPTH {
        let sibling = path[i];
        let (left, right) = if index_bits[i] { (sibling, node) } else { (node, sibling) };
        node = pedersen_hash([left, right]);
    }
    assert(node == root);

    // 2. Bind a one-time nullifier to the document hash (prevents reuse of the
    //    same credential to verify twice).
    let computed_nullifier = pedersen_hash([file_hash]);
    assert(computed_nullifier == nullifier);

    // 3. The document type is a public input AND is baked into the leaf above,
    //    so a valid proof necessarily attests to THIS doc_type -- a holder
    //    cannot prove a vaccination cert when an allergy record was issued.
    //    (The binding is enforced by step 1; this assert documents intent.)
    assert(doc_type != 0);
}

#[test]
fn test_valid_medical_proof() {
    let file_hash: Field = 0xDEADBEEF;
    let doc_type: Field = 1; // e.g. 1 = vaccination
    let leaf = pedersen_hash([file_hash, doc_type]);
    let nullifier = pedersen_hash([file_hash]);
    let mut node = leaf;
    let path: [Field; DEPTH] = [0; DEPTH];
    let index_bits: [bool; DEPTH] = [false; DEPTH];
    for i in 0..DEPTH { node = pedersen_hash([node, path[i]]); }
    let root = node;
    main(file_hash, path, index_bits, root, nullifier, doc_type);
}

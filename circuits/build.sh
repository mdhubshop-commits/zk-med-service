#!/usr/bin/env bash
set -euo pipefail

# ZK-Med circuit build — mirrors AidOS verifier-v26 toolchain.
# Uses the SAME pinned binaries AidOS uses (read-only). Touches nothing in ~/AidOS.

NARGO="$HOME/.nargo/bin/nargo"
BB="$HOME/.bb/bin/bb"          # bb v0.87.0 — the Soroban-compatible one
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "• nargo: $($NARGO --version | head -1)"
echo "• bb:    $($BB --version)"

echo "=== compile ==="
"$NARGO" compile

echo "=== execute (generate witness) ==="
"$NARGO" execute

JSON="target/zkmed_verify.json"
GZ="target/zkmed_verify.gz"
[ -f "$JSON" ] || { echo "missing $JSON"; exit 1; }
[ -f "$GZ" ]   || { echo "missing $GZ"; exit 1; }

echo "=== prove ==="
"$BB" prove \
  --scheme ultra_honk \
  --oracle_hash keccak \
  --bytecode_path "$JSON" \
  --witness_path "$GZ" \
  --output_path target \
  --output_format bytes_and_fields

echo "=== write_vk ==="
"$BB" write_vk \
  --scheme ultra_honk \
  --oracle_hash keccak \
  --bytecode_path "$JSON" \
  --output_path target \
  --output_format bytes_and_fields

# normalize vk path like build_all.sh does
if [[ -d target/vk && -f target/vk/vk ]]; then
  mv target/vk/vk target/vk.tmp; rmdir target/vk; mv target/vk.tmp target/vk
fi

echo "=== artifacts ==="
ls -la target/
echo "DONE"

#!/usr/bin/env bash
# Local-only regression runner. No credentials, network, installs or repo writes.
set -euo pipefail
repo="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
node_bin="${BOLD_TEST_NODE_BIN:-$(command -v node)}"
node_root="$(cd -- "$(dirname -- "$node_bin")/.." && pwd)"
# Limit aggregate disk with a bounded tmpfs; CPU/files/process/address space below.
exec timeout --kill-after=5s 180s /usr/sbin/bwrap \
  --unshare-all --die-with-parent --new-session --clearenv \
  --ro-bind /usr /usr --ro-bind /lib /lib --ro-bind /lib64 /lib64 \
  --symlink usr/bin /bin --proc /proc --dev /dev \
  --dir /repo --ro-bind "$repo/src" /repo/src \
  --ro-bind "$repo/db" /repo/db --dir /repo/scripts \
  --ro-bind "$repo/scripts/test-bold-security.ts" /repo/scripts/test-bold-security.ts \
  --ro-bind "$repo/node_modules" /repo/node_modules \
  --ro-bind "$node_root" /toolchain \
  --size 134217728 --tmpfs /scratch \
  --setenv PATH /toolchain/bin:/usr/bin:/bin \
  --setenv HOME /scratch/home --setenv TMPDIR /scratch/tmp \
  --setenv XDG_CACHE_HOME /scratch/cache --setenv TSX_DISABLE_CACHE 1 \
  --chdir /repo -- /bin/bash --noprofile --norc -c '
    ulimit -t 120 -v 8388608 -u 128 -f 65536 -n 128
    mkdir -p "$HOME" "$TMPDIR" "$XDG_CACHE_HOME"
    exec node --max-old-space-size=384 --disable-wasm-trap-handler --experimental-strip-types --test /repo/scripts/test-bold-security.ts
  '

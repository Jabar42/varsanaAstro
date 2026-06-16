#!/usr/bin/env bash
# Tailwind v4 shorthand linter
# Checks for Tailwind classes that have modern v4 equivalents.

DIR="${1:-src}"
EXIT=0

# Patterns that have v4 shorthands
declare -A CHECKS=(
  ["flex-shrink-0"]="shrink-0"
  ["flex-shrink"]="shrink (cuando el valor no es 0)"
  ["flex-grow-0"]="grow-0"
  ["flex-grow"]="grow"
  ["decoration-slice"]="box-decoration-slice"
  ["decoration-clone"]="box-decoration-clone"
)

echo "🔍 Tailwind v4 shorthand check..."

for OLD in "${!CHECKS[@]}"; do
  NEW="${CHECKS[$OLD]}"
  MATCHES=$(grep -rn "$OLD" "$DIR" --include="*.astro" --include="*.tsx" --include="*.jsx" --include="*.html" 2>/dev/null)
  if [ -n "$MATCHES" ]; then
    EXIT=1
    echo ""
    echo "⚠️  '$OLD' → '$NEW' encontrado en:"
    echo "$MATCHES" | while read -r line; do
      echo "   $line"
    done
  fi
done

# Check arbitrary values that could be simplified (aspect-ratio, min-w, min-h in px)
echo ""
echo "📐 Arbitrary values que podrían simplificarse:"

# aspect-[X/Y] where X/Y is a simple ratio like 16/10
ASPECTS=$(grep -rnoP 'aspect-\[[\d]+/[\d]+\]' "$DIR" --include="*.astro" --include="*.tsx" --include="*.jsx" --include="*.html" 2>/dev/null)
if [ -n "$ASPECTS" ]; then
  EXIT=1
  echo "$ASPECTS" | while read -r line; do
    echo "   $line → usa aspect-X/Y sin corchetes"
  done
fi

# min-w-[NNpx] and min-h-[NNpx] where NN is divisible by 4
PX_VALS=$(grep -rnoP '(min-w|min-h|w|h)\-\[[\d]+px\]' "$DIR" --include="*.astro" --include="*.tsx" --include="*.jsx" --include="*.html" 2>/dev/null)
if [ -n "$PX_VALS" ]; then
  EXIT=1
  echo "$PX_VALS" | while read -r line; do
    echo "   $line → ¿posible simplificar con escala de Tailwind?"
  done
fi

if [ $EXIT -eq 0 ]; then
  echo "   ✅ Todo limpio"
fi

exit $EXIT

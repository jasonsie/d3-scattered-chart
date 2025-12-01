# Contract: TypeScript Configuration

**Feature**: 001-upgrade-dependencies  
**Date**: 2025-12-01  
**Type**: JSON Schema  
**Status**: Complete

## Overview

This contract defines the expected TypeScript configuration after the dependency upgrade to TypeScript 5.9.3 with React 19 type definitions.

---

## JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TypeScript Configuration for D3 Scattered Chart",
  "description": "Validated tsconfig.json structure after TypeScript 5.9.3 upgrade",
  "type": "object",
  "required": ["compilerOptions", "include", "exclude"],
  "properties": {
    "compilerOptions": {
      "type": "object",
      "required": [
        "target",
        "lib",
        "allowJs",
        "skipLibCheck",
        "strict",
        "noEmit",
        "esModuleInterop",
        "module",
        "moduleResolution",
        "resolveJsonModule",
        "isolatedModules",
        "jsx",
        "incremental",
        "plugins"
      ],
      "properties": {
        "target": {
          "type": "string",
          "enum": ["ES2017", "ES2018", "ES2019", "ES2020", "ES2021", "ES2022", "ESNext"],
          "description": "JavaScript compilation target (ES2017+ required)"
        },
        "lib": {
          "type": "array",
          "contains": {
            "enum": ["dom", "dom.iterable", "esnext"]
          },
          "minItems": 3,
          "description": "Must include dom, dom.iterable, and esnext"
        },
        "allowJs": {
          "type": "boolean",
          "const": true,
          "description": "Allow JavaScript files in project"
        },
        "skipLibCheck": {
          "type": "boolean",
          "const": true,
          "description": "Skip type checking of declaration files"
        },
        "strict": {
          "type": "boolean",
          "const": true,
          "description": "Enable all strict type-checking options (Constitutional requirement)"
        },
        "noEmit": {
          "type": "boolean",
          "const": true,
          "description": "Do not emit compiler output (Next.js handles bundling)"
        },
        "esModuleInterop": {
          "type": "boolean",
          "const": true,
          "description": "Enable ES module interoperability"
        },
        "module": {
          "type": "string",
          "enum": ["esnext"],
          "description": "Module code generation"
        },
        "moduleResolution": {
          "type": "string",
          "enum": ["bundler"],
          "description": "Module resolution strategy (bundler for Next.js 16)"
        },
        "resolveJsonModule": {
          "type": "boolean",
          "const": true,
          "description": "Allow importing JSON files"
        },
        "isolatedModules": {
          "type": "boolean",
          "const": true,
          "description": "Ensure each file can be safely transpiled without type information"
        },
        "jsx": {
          "type": "string",
          "enum": ["preserve"],
          "description": "JSX preservation mode for Next.js"
        },
        "incremental": {
          "type": "boolean",
          "const": true,
          "description": "Enable incremental compilation"
        },
        "plugins": {
          "type": "array",
          "minItems": 1,
          "contains": {
            "type": "object",
            "properties": {
              "name": {
                "const": "next"
              }
            }
          },
          "description": "Must include Next.js TypeScript plugin"
        },
        "paths": {
          "type": "object",
          "description": "Path mappings for module resolution (optional but recommended)"
        },
        "noUncheckedSideEffectImports": {
          "type": "boolean",
          "const": true,
          "description": "Recommended for React 19 (TypeScript 5.9+ feature)"
        }
      }
    },
    "include": {
      "type": "array",
      "contains": {
        "enum": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]
      },
      "description": "Files to include in compilation"
    },
    "exclude": {
      "type": "array",
      "contains": {
        "const": "node_modules"
      },
      "description": "Must exclude node_modules"
    }
  }
}
```

---

## Validation Test Cases

### Test 1: Strict Mode Enabled (Constitutional Requirement)
```json
{
  "compilerOptions": {
    "strict": true
  }
}
```
**Expected**: ✅ PASS - Strict mode required by Constitution Principle IV

### Test 2: Module Resolution for Next.js 16
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "module": "esnext"
  }
}
```
**Expected**: ✅ PASS - Correct bundler resolution for Next.js 16

### Test 3: Next.js Plugin Included
```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "next"
      }
    ]
  }
}
```
**Expected**: ✅ PASS - Next.js TypeScript plugin required

### Test 4: React 19 Recommended Option (Optional)
```json
{
  "compilerOptions": {
    "noUncheckedSideEffectImports": true
  }
}
```
**Expected**: ✅ PASS - Recommended for React 19 compatibility

### Test 5: Invalid Strict Mode (Negative Test)
```json
{
  "compilerOptions": {
    "strict": false
  }
}
```
**Expected**: ❌ FAIL - Violates Constitution Principle IV (Type Safety)

### Test 6: Invalid Module Resolution (Negative Test)
```json
{
  "compilerOptions": {
    "moduleResolution": "node"
  }
}
```
**Expected**: ❌ FAIL - Must use "bundler" for Next.js 16

---

## TypeScript Compilation Contract

### Pre-Upgrade State
```bash
$ tsc --version
Version 5.x.x (pre-5.9.3)

$ tsc --noEmit
# May have errors due to outdated React type definitions
```

### Post-Upgrade State
```bash
$ tsc --version
Version 5.9.3

$ tsc --noEmit
# Zero errors - all React 19 types recognized
```

---

## Type Definition Compatibility Matrix

| Package | Type Definition | Required Version | Validation |
|---------|----------------|------------------|------------|
| react | @types/react | ^19 | React 19 API types |
| react-dom | @types/react-dom | ^19 | ReactDOM 19 API types |
| d3 | @types/d3 | ^7.4.3 | D3.js 7.9.0 types |
| node | @types/node | ^22 | Node.js 20 LTS types |

---

## Automated Validation Script

```bash
#!/bin/bash
# validate-tsconfig.sh

TSCONFIG="tsconfig.json"

echo "Validating tsconfig.json against contract..."

# Check strict mode
STRICT=$(jq -r '.compilerOptions.strict' "$TSCONFIG")
if [[ "$STRICT" != "true" ]]; then
  echo "❌ FAIL: compilerOptions.strict must be true (Constitutional requirement)"
  exit 1
fi
echo "✅ PASS: Strict mode enabled"

# Check module resolution
MODULE_RES=$(jq -r '.compilerOptions.moduleResolution' "$TSCONFIG")
if [[ "$MODULE_RES" != "bundler" ]]; then
  echo "❌ FAIL: compilerOptions.moduleResolution must be 'bundler', got '$MODULE_RES'"
  exit 1
fi
echo "✅ PASS: Module resolution set to bundler"

# Check JSX preservation
JSX=$(jq -r '.compilerOptions.jsx' "$TSCONFIG")
if [[ "$JSX" != "preserve" ]]; then
  echo "❌ FAIL: compilerOptions.jsx must be 'preserve', got '$JSX'"
  exit 1
fi
echo "✅ PASS: JSX preservation enabled"

# Check Next.js plugin
NEXT_PLUGIN=$(jq -r '.compilerOptions.plugins[] | select(.name == "next") | .name' "$TSCONFIG")
if [[ "$NEXT_PLUGIN" != "next" ]]; then
  echo "❌ FAIL: Next.js plugin not found in compilerOptions.plugins"
  exit 1
fi
echo "✅ PASS: Next.js plugin configured"

# Check lib array
LIB_DOM=$(jq -r '.compilerOptions.lib[] | select(. == "dom")' "$TSCONFIG")
LIB_ESNEXT=$(jq -r '.compilerOptions.lib[] | select(. == "esnext")' "$TSCONFIG")
if [[ -z "$LIB_DOM" || -z "$LIB_ESNEXT" ]]; then
  echo "❌ FAIL: compilerOptions.lib must include 'dom' and 'esnext'"
  exit 1
fi
echo "✅ PASS: Required libraries included"

# Check node_modules exclusion
NODE_MODULES_EXCLUDED=$(jq -r '.exclude[] | select(. == "node_modules")' "$TSCONFIG")
if [[ "$NODE_MODULES_EXCLUDED" != "node_modules" ]]; then
  echo "❌ FAIL: exclude array must include 'node_modules'"
  exit 1
fi
echo "✅ PASS: node_modules excluded"

# Run TypeScript compiler check
echo ""
echo "Running TypeScript compiler check..."
if ! npx tsc --noEmit; then
  echo "❌ FAIL: TypeScript compilation has errors"
  exit 1
fi
echo "✅ PASS: TypeScript compilation successful"

echo ""
echo "✅ ALL TYPESCRIPT CONTRACT TESTS PASSED"
exit 0
```

**Usage**:
```bash
chmod +x validate-tsconfig.sh
./validate-tsconfig.sh
```

---

## Contract Compliance Checklist

- [ ] `compilerOptions.strict` is `true`
- [ ] `compilerOptions.target` is ES2017 or higher
- [ ] `compilerOptions.lib` includes `["dom", "dom.iterable", "esnext"]`
- [ ] `compilerOptions.moduleResolution` is `"bundler"`
- [ ] `compilerOptions.jsx` is `"preserve"`
- [ ] `compilerOptions.plugins` includes Next.js plugin
- [ ] `exclude` array includes `"node_modules"`
- [ ] `tsc --noEmit` runs without errors
- [ ] React 19 types recognized (`@types/react@19`)
- [ ] D3 types recognized (`@types/d3@7.4.3`)
- [ ] Optional: `noUncheckedSideEffectImports` set to `true`

---

## Type Safety Validation Examples

### Example 1: React 19 Component Types
```typescript
// Should compile without errors after upgrade
import { FC, useState } from 'react';

interface Props {
  title: string;
}

const Component: FC<Props> = ({ title }) => {
  const [count, setCount] = useState<number>(0);
  return <div>{title}: {count}</div>;
};
```
**Expected**: ✅ Compiles successfully with React 19 types

### Example 2: D3 Scale Types
```typescript
// Should compile without errors after upgrade
import * as d3 from 'd3';

const xScale = d3.scaleLinear()
  .domain([0, 100])
  .range([0, 800]);

const value: number = xScale(50);
```
**Expected**: ✅ Compiles successfully with D3 types

### Example 3: Next.js App Router Types
```typescript
// Should compile without errors after upgrade
export default async function Page() {
  return <div>Page content</div>;
}
```
**Expected**: ✅ Compiles successfully with Next.js 16 types

---

**Contract Status**: ✅ Complete  
**Last Updated**: 2025-12-01  
**Next**: Verify compilation after upgrade

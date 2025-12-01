# Contract: package.json Schema

**Feature**: 001-upgrade-dependencies  
**Date**: 2025-12-01  
**Type**: JSON Schema  
**Status**: Complete

## Overview

This contract defines the expected structure and validation rules for `package.json` after the dependency upgrade. It serves as a contract test specification to verify the upgrade was successful.

---

## JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "D3 Scattered Chart Package Manifest",
  "description": "Validated package.json structure after dependency upgrade to React 19, Next.js 16, MUI 7, TypeScript 5.9",
  "type": "object",
  "required": ["name", "version", "private", "engines", "scripts", "dependencies", "devDependencies"],
  "properties": {
    "name": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "description": "Package name in lowercase with hyphens"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "Semantic version (MAJOR.MINOR.PATCH)"
    },
    "private": {
      "type": "boolean",
      "const": true,
      "description": "Must be true to prevent accidental publishing"
    },
    "engines": {
      "type": "object",
      "required": ["node"],
      "properties": {
        "node": {
          "type": "string",
          "pattern": "^>=20\\.9\\.0$",
          "description": "Node.js runtime constraint (minimum 20.9.0 LTS)"
        }
      }
    },
    "scripts": {
      "type": "object",
      "required": ["dev", "build", "start", "lint"],
      "properties": {
        "dev": {
          "type": "string",
          "pattern": "next dev",
          "description": "Development server command"
        },
        "build": {
          "type": "string",
          "pattern": "next build",
          "description": "Production build command"
        },
        "start": {
          "type": "string",
          "pattern": "next start",
          "description": "Production server command"
        },
        "lint": {
          "type": "string",
          "pattern": "next lint|eslint",
          "description": "Linting command"
        }
      }
    },
    "dependencies": {
      "type": "object",
      "required": [
        "next",
        "react",
        "react-dom",
        "@mui/material",
        "@mui/icons-material",
        "@emotion/react",
        "@emotion/styled",
        "d3"
      ],
      "properties": {
        "next": {
          "type": "string",
          "pattern": "^\\^16\\.0\\.0$",
          "description": "Next.js framework version 16.0.0"
        },
        "react": {
          "type": "string",
          "pattern": "^\\^19\\.2\\.0$",
          "description": "React library version 19.2.0"
        },
        "react-dom": {
          "type": "string",
          "pattern": "^\\^19\\.2\\.0$",
          "description": "React DOM library version 19.2.0"
        },
        "@mui/material": {
          "type": "string",
          "pattern": "^\\^7\\.3\\.5$",
          "description": "Material-UI components version 7.3.5"
        },
        "@mui/icons-material": {
          "type": "string",
          "pattern": "^\\^7\\.3\\.5$",
          "description": "Material-UI icons version 7.3.5"
        },
        "@emotion/react": {
          "type": "string",
          "pattern": "^\\^11\\.14\\.0$",
          "description": "Emotion CSS-in-JS library"
        },
        "@emotion/styled": {
          "type": "string",
          "pattern": "^\\^11\\.14\\.0$",
          "description": "Emotion styled components"
        },
        "d3": {
          "type": "string",
          "pattern": "^\\^7\\.9\\.0$",
          "description": "D3.js data visualization library"
        }
      },
      "additionalProperties": {
        "type": "string",
        "pattern": "^[\\^~]?\\d+\\.\\d+\\.\\d+",
        "description": "Additional dependencies must use valid semver"
      }
    },
    "devDependencies": {
      "type": "object",
      "required": [
        "typescript",
        "@types/react",
        "@types/react-dom",
        "@types/d3",
        "@types/node",
        "eslint",
        "eslint-config-next"
      ],
      "properties": {
        "typescript": {
          "type": "string",
          "pattern": "^\\^5\\.9\\.3$",
          "description": "TypeScript compiler version 5.9.3"
        },
        "@types/react": {
          "type": "string",
          "pattern": "^\\^19",
          "description": "React type definitions for version 19"
        },
        "@types/react-dom": {
          "type": "string",
          "pattern": "^\\^19",
          "description": "React DOM type definitions for version 19"
        },
        "@types/d3": {
          "type": "string",
          "pattern": "^\\^7\\.4\\.3$",
          "description": "D3.js type definitions"
        },
        "@types/node": {
          "type": "string",
          "pattern": "^\\^22",
          "description": "Node.js type definitions for version 22 (Node 20 LTS compatible)"
        },
        "eslint": {
          "type": "string",
          "pattern": "^\\^9",
          "description": "ESLint code linter"
        },
        "eslint-config-next": {
          "type": "string",
          "pattern": "^\\^16\\.0\\.0$",
          "description": "Next.js ESLint configuration (must match Next.js version)"
        }
      },
      "additionalProperties": {
        "type": "string",
        "pattern": "^[\\^~]?\\d+\\.\\d+\\.\\d+",
        "description": "Additional dev dependencies must use valid semver"
      }
    }
  },
  "additionalProperties": true
}
```

---

## Validation Test Cases

### Test 1: Engines Field Validation
```json
{
  "engines": {
    "node": ">=20.9.0"
  }
}
```
**Expected**: ✅ PASS - Correct Node.js version constraint

### Test 2: Production Dependencies Validation
```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "@mui/material": "^7.3.5",
    "@mui/icons-material": "^7.3.5",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.0",
    "d3": "^7.9.0"
  }
}
```
**Expected**: ✅ PASS - All required dependencies at target versions

### Test 3: Development Dependencies Validation
```json
{
  "devDependencies": {
    "typescript": "^5.9.3",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/d3": "^7.4.3",
    "@types/node": "^22",
    "eslint": "^9",
    "eslint-config-next": "^16.0.0"
  }
}
```
**Expected**: ✅ PASS - All required dev dependencies at target versions

### Test 4: Scripts Validation
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```
**Expected**: ✅ PASS - All required scripts present

### Test 5: Invalid Node Version (Negative Test)
```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```
**Expected**: ❌ FAIL - Node.js version too low (must be >=20.9.0)

### Test 6: Missing Required Dependency (Negative Test)
```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.2.0"
    // react-dom missing
  }
}
```
**Expected**: ❌ FAIL - Missing required dependency react-dom

---

## Peer Dependency Constraints

These constraints are enforced by the package managers and validated during `yarn install`:

### Constraint 1: MUI Requires React 19
```
@mui/material@7.3.5 requires:
  - react: ^19.0.0
  - react-dom: ^19.0.0
  - @emotion/react: ^11.14.0
```
**Validation**: `yarn install` will error if React version is incompatible

### Constraint 2: Emotion Requires React 19
```
@emotion/react@11.14.0 requires:
  - react: ^19.0.0
```
**Validation**: `yarn install` will error if React version is incompatible

### Constraint 3: ESLint Config Requires Next.js 16
```
eslint-config-next@16.0.0 requires:
  - next: 16.0.0
```
**Validation**: ESLint will error if Next.js version mismatched

---

## Automated Validation Script

This script can be used to validate package.json against the contract:

```bash
#!/bin/bash
# validate-package-json.sh

PACKAGE_JSON="package.json"

echo "Validating package.json against contract..."

# Check Node.js engine
NODE_ENGINE=$(jq -r '.engines.node' "$PACKAGE_JSON")
if [[ ! "$NODE_ENGINE" =~ ^\>\=20\.9\.0$ ]]; then
  echo "❌ FAIL: engines.node must be '>=20.9.0', got '$NODE_ENGINE'"
  exit 1
fi
echo "✅ PASS: Node.js engine constraint valid"

# Check Next.js version
NEXT_VERSION=$(jq -r '.dependencies.next' "$PACKAGE_JSON")
if [[ ! "$NEXT_VERSION" =~ ^\^16\.0\.0$ ]]; then
  echo "❌ FAIL: next version must be '^16.0.0', got '$NEXT_VERSION'"
  exit 1
fi
echo "✅ PASS: Next.js version valid"

# Check React version
REACT_VERSION=$(jq -r '.dependencies.react' "$PACKAGE_JSON")
if [[ ! "$REACT_VERSION" =~ ^\^19\.2\.0$ ]]; then
  echo "❌ FAIL: react version must be '^19.2.0', got '$REACT_VERSION'"
  exit 1
fi
echo "✅ PASS: React version valid"

# Check React DOM version
REACT_DOM_VERSION=$(jq -r '.dependencies["react-dom"]' "$PACKAGE_JSON")
if [[ ! "$REACT_DOM_VERSION" =~ ^\^19\.2\.0$ ]]; then
  echo "❌ FAIL: react-dom version must be '^19.2.0', got '$REACT_DOM_VERSION'"
  exit 1
fi
echo "✅ PASS: React DOM version valid"

# Check MUI version
MUI_VERSION=$(jq -r '.dependencies["@mui/material"]' "$PACKAGE_JSON")
if [[ ! "$MUI_VERSION" =~ ^\^7\.3\.5$ ]]; then
  echo "❌ FAIL: @mui/material version must be '^7.3.5', got '$MUI_VERSION'"
  exit 1
fi
echo "✅ PASS: MUI version valid"

# Check TypeScript version
TS_VERSION=$(jq -r '.devDependencies.typescript' "$PACKAGE_JSON")
if [[ ! "$TS_VERSION" =~ ^\^5\.9\.3$ ]]; then
  echo "❌ FAIL: typescript version must be '^5.9.3', got '$TS_VERSION'"
  exit 1
fi
echo "✅ PASS: TypeScript version valid"

# Check required scripts
SCRIPTS=("dev" "build" "start" "lint")
for script in "${SCRIPTS[@]}"; do
  if ! jq -e ".scripts.$script" "$PACKAGE_JSON" > /dev/null; then
    echo "❌ FAIL: Required script '$script' missing"
    exit 1
  fi
done
echo "✅ PASS: All required scripts present"

echo ""
echo "✅ ALL CONTRACT TESTS PASSED"
exit 0
```

**Usage**:
```bash
chmod +x validate-package-json.sh
./validate-package-json.sh
```

---

## Contract Compliance Checklist

Use this checklist during implementation to verify contract compliance:

- [ ] `engines.node` is set to `">=20.9.0"`
- [ ] `next` is set to `"^16.0.0"`
- [ ] `react` is set to `"^19.2.0"`
- [ ] `react-dom` is set to `"^19.2.0"`
- [ ] `@mui/material` is set to `"^7.3.5"`
- [ ] `@mui/icons-material` is set to `"^7.3.5"`
- [ ] `@emotion/react` is set to `"^11.14.0"`
- [ ] `@emotion/styled` is set to `"^11.14.0"`
- [ ] `d3` is set to `"^7.9.0"` (no change)
- [ ] `typescript` is set to `"^5.9.3"`
- [ ] `@types/react` is set to `"^19"`
- [ ] `@types/react-dom` is set to `"^19"`
- [ ] `@types/d3` is set to `"^7.4.3"`
- [ ] `@types/node` is set to `"^22"`
- [ ] `eslint` is set to `"^9"`
- [ ] `eslint-config-next` is set to `"^16.0.0"`
- [ ] All required scripts (`dev`, `build`, `start`, `lint`) are defined
- [ ] `yarn install` completes without errors
- [ ] `yarn audit` shows zero high/critical vulnerabilities

---

**Contract Status**: ✅ Complete  
**Last Updated**: 2025-12-01  
**Next**: Implement upgrade following quickstart.md

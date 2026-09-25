# Test Evidence

## Test command

```
npm test
```

Which runs:

```
node tests/private-note.test.mjs
```

## Result

**PASS — 4/4 tests passed.**

```
Test A — Initial public ledger state
  ✓ publicNote is empty string after construction

Test B — setPrivateNote() discloses the witness value
  ✓ setPrivateNote() updates publicNote via disclose()

Test C — getNote() returns the disclosed value
  ✓ getNote() returns the value that was set via setPrivateNote()

Test D — A different private witness replaces publicNote
  ✓ setPrivateNote() with "Privacy First" updates publicNote correctly

────────────────────────────────────────
Results: 4 passed, 0 failed
All tests passed ✓
```

## Test approach

Tests use `@midnight-ntwrk/compact-runtime` to simulate the contract execution locally.  
No node, wallet, proof-server, or network connection is required.

The tests dynamically import the **actual compiled contract**:
```
contracts/managed/private-note/contract/index.js
```

## What each test verifies

| Test | Behaviour verified |
|------|--------------------|
| A — Initial ledger state | `publicNote` starts as `""` after `contract.initialState()` |
| B — Private witness → disclosure | `setPrivateNote()` applies `disclose(note)` and updates `publicNote` |
| C — Read circuit | `getNote()` returns the exact disclosed value |
| D — Different private input | A second witness `"Privacy First"` correctly replaces the prior value |

## Screenshot

TODO — capture terminal screenshot manually for Level 1 submission.

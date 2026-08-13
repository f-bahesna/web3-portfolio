# gnhf run: read-claude-memory-g-291bd4

Objective: see .gnhf/runs/read-claude-memory-g-291bd4/prompt.md

## Iteration Log

### Iteration 2

**Summary:** Fixed a critical smart-contract bug in SimpleDEX.swapDogeToArbi (it multiplied by `rate` instead of dividing, wildly overpaying users and draining the DEX's arbiFake reserves) and added a full SimpleDEX.t.sol test suite (7 tests) covering both swap directions, insufficient-liquidity reverts, and owner-only functions.

**Changes:**
- Fixed smart_contracts/src/SimpleDEX.sol swapDogeToArbi: changed `arbiAmount = dogeAmount * rate` to `arbiAmount = dogeAmount / rate` so it correctly inverts swapArbiToDoge's `dogeAmount = arbiAmount * rate` (rate means '1 arbiFake = rate dogeFake'); previously every doge->arbi swap paid out rate^2 times too much arbiFake.
- Added smart_contracts/test/SimpleDEX.t.sol with 7 tests: swapArbiToDoge, swapDogeToArbi, a round-trip inverse-consistency test that would have failed against the old buggy code, insufficient-liquidity reverts for both swap directions, and onlyOwner checks for setRate/withdraw.
- Verified full test suite (13 tests across 3 files) passes and `forge build` succeeds.

**Learnings:**
- smart_contracts/ has no lib/ dependencies committed and no working .gitmodules at the repo root, even though CI (test.yml) does `checkout --recursive` expecting submodules; foundry.lock is a soldeer lock file but foundry.toml has no [dependencies] section so `forge soldeer install` fails with 'not connected'. Workaround: `forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts@v5.4.0` from smart_contracts/ works (clones via git) but stages lib/ as git submodules and creates a stray .gitmodules one directory ABOVE simple-dex (at .../web3/.gitmodules) since simple-dex itself isn't the git repo root - must `rm -rf smart_contracts/lib` and remove that outer .gitmodules after testing, or it pollutes the diff.
- The frontend (client/src/App.jsx) never calls swapDogeToArbi at all currently - selecting the DFAKE pair shows 'The pair still in maintenance' - so this bug was invisible in the UI but present in the deployed/deployable contract surface.
- `forge fmt --check` already fails repo-wide on pre-existing files (comment indentation, missing trailing newlines) unrelated to this change - worth a dedicated readability/formatting cleanup iteration later, but out of scope for this bug-fix iteration.
- No SimpleDEX test coverage existed before this iteration; only faucet tests existed for the two ERC20 tokens.

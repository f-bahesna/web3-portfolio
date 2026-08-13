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

### Iteration 3

**Summary:** Enabled the previously-blocked DogeFake->ArbiFake swap direction in the DEX frontend and fixed the buying-amount preview to use the correct rate math for each swap direction.

**Changes:**
- Removed the 'The pair still in maintenance' block in client/src/App.jsx that hard-blocked selling DFAKE (dogeFake); replaced the AFAKE-only swapArbiToDoge handler with a direction-aware handleSwap that approves the correct sell token (arbiFake or dogeFake) and calls the matching contract method (swapArbiToDoge or swapDogeToArbi) based on the selected token
- Fixed the 'Buying' amount preview which always computed amount * rate regardless of swap direction (correct only for AFAKE->DFAKE); added a buyAmount value that multiplies by rate when selling AFAKE and divides by rate when selling DFAKE, matching the on-chain swap math fixed in iteration 2

**Learnings:**
- The frontend's DFAKE->AFAKE swap path was fully blocked by a hardcoded alert('The pair still in maintenance') in App.jsx, independent of the smart-contract rate bug fixed in iteration 2 -- the contract-level fix alone did not surface in the UI until this iteration wired up the second swap direction.
- client/ has no node_modules committed; `npm install` pulls 323 packages (node_modules and dist are gitignored so this doesn't pollute git status). `npm run lint` and `npm run build` both work after install. Pre-existing eslint errors (unused 'status'/'error' vars in App.jsx, conditional hooks in ModalAddToken.jsx/ModalFaucet.jsx, unused imports in Navbar.jsx/ModalSelectToken.jsx/web3config.js/vite.config.js) exist independent of this change -- verified via git stash comparison -- and are candidates for a future dedicated lint-cleanup iteration.
- Vite build succeeds with a single JS chunk warning (664 kB / 203 kB gzip) -- not addressed here since it's a pre-existing bundling characteristic unrelated to this feature.

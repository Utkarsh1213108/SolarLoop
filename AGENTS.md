# SolarLoop Development Rules

## IMMUTABLE ANALYTICAL SOURCE

The /canonical/ directory is the analytical source of truth.

Never modify, rewrite, format, regenerate, rename, or delete any file
under /canonical/.

Never create a competing forecasting model.

Never create a competing economics model.

Never create a competing material-recovery model.

All analytical values must originate from the canonical data/API.

## ARCHITECTURE

/canonical/solarloop_canonical_data.json
        ↓
GET /api/canonical
        ↓
ScenarioContext
        ↓
SolarLoop UI

Do not bypass this architecture.

## CANONICAL SCENARIOS

Exactly six:

conservative_regular
conservative_early_loss
base_regular
base_early_loss
high_regular
high_early_loss

Default:
base_regular

## DEVELOPMENT PROCESS

Before modifying code:

1. Inspect the existing implementation.
2. Identify the canonical source.
3. Make the smallest necessary change.
4. Do not alter unrelated functionality.
5. Run tests.
6. Run TypeScript typecheck.
7. Run production build.
8. Report exactly what changed.

## GIT SAFETY

Do not commit, push, sync, or publish unless explicitly instructed.

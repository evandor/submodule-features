# General

This (git) submodule is meant to be used in a quasar application like
tabsets.net.

## Installation

In tabsets.net, for example, this submodule is added like this:

```
git submodule add -b main https://github.com/evandor/submodule-features.git src/features
```

## Branches

currently, there is only 'main'

## Symbolic Links

In the hosting app, you need to create a symbolic link in the "src/stores" folder:

ln -s ../../src/features/stores/featuresStore.ts linkedFeaturesStore.

Every reference in other files should always point to the linkedFeaturesStore, e.g. you should not have imports
pointing to "src/features/stores".

See: https://github.com/quasarframework/quasar/discussions/17209

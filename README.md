# `teamfight-simulator`

The goal of this project is to simulate fights from [Teamfight Tactics](https://teamfighttactics.leagueoflegends.com/en-us/) (TFT). This has the potential to help players improve their board strength intuition via a "puzzle mode", and theorycraft better team compositions, unit positioning, and item builds through statistical analysis.

https://tftsim.netlify.app

## Current Set support

See the **[6.5 milestone](https://github.com/tacticians-academy/teamfight-simulator/milestone/1)**!

## Capabilities

### Data gathering
- Automatically generates champion/trait/item stats and assets from the current patch, thanks to [Community Dragon](https://communitydragon.org) (see [`academy-library`](https://github.com/tacticians-academy/academy-library)).

### Units setup
- Place/move any units onto 2 teams
- Equip/move any valid items, and adjust star levels
- Applies basic trait/item effects (AD/MR/attack range/etc) to relevant units

### Play a fight
- Assassins jump to backline
- Units pathfind (naively) into attack range (see [game/pathfind](src/game/pathfind.ts))
- Units auto-attack and generate mana
- Supported units cast their abilities
- Runs until one team is left standing

## Unimplemented

- Abilities: Each Set adds new champions whose abilities must be implemented before the unit can be fully supported. See [Current Set support](#current-set-support) for progress.
- Traits: Non-basic effects are not implemented
- Items: Non-basic effects are not implemented
- Augments: Not implemented
- A bunch of smaller features (specifying socialite hex(es)/30 second overtime limit/etc)
- Engine refinements (pathfinding improvements/exact cast times/etc) so that gameplay resembles TFT enough to reproduce fights accurately

## Out of scope

### End-to-end gameplay
In theory, this project could eventually be fleshed out into a full gameplay mode (carousel/economy/augment selection/alternating opponents/health tracking/etc). It could then be used to train an AI to play TFT (unlike standard TFT, it can run faster than realtime).

### Visual effects
In a game like TFT, you can think of 3 layers running on top of the raw numbers that specify stats/abilities/etc used to play out a fight:
1. Uses those numbers to run out a simulation of the game (a series of _game ticks_, what the "server" says happened over the course of the fight). As far as the server is concerned, this can happen as fast as its processor will go (within milliseconds).
2. Interprets those numbers into a human-legible representation of each game tick to the player at a pace they can follow what's happening.
3. Interpolates the changes between game ticks, adding animations and effects so that the fight plays out like a video game.

`teamfight-simulator` runs at layer 1, with the option of layer 2 to better allow the user to assess how the fight went, and does not attempt to recreate layer 3.

## Contributing

### Dev setup

`tacticians-academy` is built on a series of Node apps written in Typescript. The frontend is a Vue 3 app using Vite as the build tool. To run in development, install dependencies and run the `dev` script to launch localhost in your default browser:

```sh
npm install
npm run dev
```

### What you can do

The largest outstanding project is to script the abilities of each unit. Fortunately, since graphical representations are not required, there is significant overlap and reuse between many units and sets.

Check out [`set6/champions`](src/data/set6/champions.ts). Pick an unimplemented champion from the [current Set milestone](#current-set-support), refer to its spell data in [academy-library/champions](https://github.com/tacticians-academy/academy-library/blob/main/dist/set6/champions.ts?ts=2), and using existing implementations as a template, give it a try!

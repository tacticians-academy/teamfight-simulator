# `teamfight-simulator`

Simulate fights from [Teamfight Tactics](https://teamfighttactics.leagueoflegends.com/en-us/) (TFT). The goal is to assist in theorycrafting better team compositions, unit positioning, and item builds through statistical analysis, and perhaps create a "puzzle mode" to improve players' board strength intuition.

https://tftsim.netlify.app

## Current Set support

See the **[6.5 milestone](https://github.com/tacticians-academy/teamfight-simulator/milestone/1?closed=1)**!

A feature marked as closed doesn't mean it's working exactly like should in the original game. Some values must be experimentally determined by manually timing or measuring values from the original game. Others may require too complex of an implementation, so they use a placeholder that makes a good-enough approximation. A best effort is made to document every instance of these shortcomings with `TODO`s in the code. Clone the project on your machine and "Find All" `TODO` entries to review these work items.

_Unplanned features are listed in the [Nice-To-Have's project](https://github.com/orgs/tacticians-academy/projects/2)._

## Capabilities

### Data gathering
- Generates champion/trait/augment/item stats and assets from the current patch, thanks to [Community Dragon](https://communitydragon.org) (see [`academy-library`](https://github.com/tacticians-academy/academy-library?ts=2)).

### Units setup
- Place/move any units onto 2 teams
- Equip/move any valid items, and adjust star levels
- Set augment(s) for each team

### Play a fight
- Assassins jump to backline
- Units pathfind into attack range of their target
- Units auto-attack and generate mana
- Supported units cast their abilities
- Runs until one team is left standing

## Future ideas

### API
Create a headless version that runs on the server and exposes an API that lets you programmatically run fights and get back the results.

### Past Sets
All past sets are available thanks to the historical patch data provided by CommunityDragon. It would be a fun exercise to implement past sets, but it's too big a project for now. If you're interested in contributing to any past set, get in touch!

### Comp-designer AI
It would be fantastic to train a ML model to select a team composition, allocate a limited number of star upgrades and items, and position those units on the board, given its opponents' boards.

## Unimplemented

Each Set adds new Champion abilities, traits, and augments to be implemented. See [Current Set support](#current-set-support) to track this progress.

- Engine refinements (i.e. 30 second overtime limit/pathfinding improvements/experimentally determining undocumented values) so that gameplay resembles the original closely enough to accurately reproduce fights.
- Some features are too niche or can be accomplished by other means, and thus are not prioritized for implementation (PR's are welcome though!). See the [Nice-To-Have's project](https://github.com/orgs/tacticians-academy/projects/2) for a current list.

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

_Note `tacticians-academy` uses [`pnpm`](https://pnpm.io) rather than `npm` for its lockfile._

### What you can do
To get started, find an unimplemented issue from the [current Set milestone](#current-set-support) (or alternatively from a past set). Champion abilities are a good place to start – you can refer to spell data in [`academy-library/champions`](https://github.com/tacticians-academy/academy-library/blob/main/dist/set6/champions.ts?ts=2). Then, using existing implementations in [`set6/champions`](src/sim/data/set6/champions.ts?ts=2) as a template, give it a try!

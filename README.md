# Private PvP Training Bot

This project is for a local world or a server you own and have explicitly configured for automation. It intentionally refuses `MC_PUBLIC_SERVER=true` and contains no anti-cheat evasion, aim spoofing, packet manipulation, or public-server instructions.

## Run

```sh
npm install
MC_HOST=127.0.0.1 MC_PORT=25565 MC_USERNAME=PvPTrainingBot npm start
```

The status page is available at `http://localhost:3000`. Set `PORT` to the port provided by your hosting platform. It shows only whether the bot is running or stopped; `/health` is available for deployment health checks.

The bot supports `/pvp_sword`, `/pvp_axe`, `/pvp_bow`, `/pvp_crystal`, `/pvp_hybrid`, `/pvp_sumo`, `/pvp_nethpot`, `/pvp_stop`, `/pvp_mode [aggressive|defensive|training]`, `/pvp_stats`, `/pvp_reset`, and `/pvp_food`.

`prismarine-physics` is Mineflayer's physics dependency surface; `mineflayer-pathfinder` supplies navigation. Crystal placement and potion use are deliberately left to a private-server rules/plugin integration rather than hidden automation.

## Tests

```sh
npm test
```

Do not connect this bot to Hypixel, PvPLegacy, Minemen Club, or another public service. Automated combat can violate their rules and harm fair play; anti-cheat bypass guidance is not provided.

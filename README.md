# MTG Enhancements Extension
Add functionality to different popular MTG websites.

# Scryfall.com
Add additional legalities to the Scryfall single card view page.
Currently Premodern and Heritage are included.

## Premodern
Permodern legality is determined using Scryfall's own Premodern data.

## Heritage
Heritage legality is determined using the following query and Legacy legality.
```
oracleid:<oracleId> AND (st:core OR st:expansion) AND -atag:external-ip
```
A hard coded list of overrides accounts for where Heritage has deviated from Legacy.

# MTGTop8.com
Add Threat Level to the Most Played cards page.

## Threat Level
Pioneered by Eternal Durdles, threat level is a simple calculation to assess
the power level of a card in a given format based on its ubiquity.

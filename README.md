# Scryfall Enhancements
This extension adds additional legalities to the Scryfall single card view page.
Currently Premodern and Heritage are included.

## Premodern
Permodern legality is determined using Scryfall's own Premodern data.

## Heritage
Heritage legality is determined using the following query and Legacy legality.
```
oracleid:<oracleId> AND (st:core OR st:expansion) AND -atag:external-ip
```
A hard coded list of overrides accounts for where Heritage has deviated from Legacy.

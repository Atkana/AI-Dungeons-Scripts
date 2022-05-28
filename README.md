This is a collection of my scripts for AI Dungeon, ranging from full Scenario scripts, to small code snippets. Anyone is free to use them as they please, though do take in mind if you're intending to learn from them that they might not be the best examples - these are literally my first ever javascript scripts :P.

Most of the more fleshed out scripts include a `tuning` object which you can edit to configure how they work.

## commandProcessor
A basic add-in to help with running and adding commands. You define functions to be run when a given command is input, and the script handles detecting when a player inputs them and running them. There's some suggestions about how to handle returning values, though you'll have to change things up to suit your needs.

## enforceWorldInfo
A custom re-implementation of the regular memory context, allowing you to configure how the memory is handled more. Features include:
- The ability to change what proportion of the context given to the AI is made up of memory vs game text. Normally, the game will limit memory to ~1500 characters.
- Selectively allowing World Info to be triggered by keys contained within game text / pinned text / other World Info entries. Normally, the game only checks game text for World Info keys.
- Toggle whether World Info or pinned text takes priority when the memory context has to be trimmed down to fit. Normally, World Info is the section that's cut short by the game.

Notes:
- Don't go overboard with mentions of World Info within the Pinned Info / other World Info entries! Each instance can chain into more and more being added, to the point where there's too much info that it's entirely useless because it gets cut out.
- Handling of front memory / author's notes not yet implemented. Might not work properly if front memory is being used...

## extractFields
Code snippet for extracting information from a character's World Info entry for use in scripts, provided the entry was created using the classic NPC generation method (where fields are formatted as, for example `APPEARANCE: the character's appearance;`).

## infoManual
Provides Scenario Scripts for creating an instruction manual Scenario for players in cases where a 2,000 character limit prompt isn't enough to explain everything (though seriously - how complicated are you making this stuff that you need so much text!? o_o).
Instructions are included in the comments on how to set up + use it.

## promptInputExtractor
Adds the ability to use the what the player writes for custom input prompts (the things contained inside `${}`s) inside your starting World Info. A guide on how to use it is included in the comments at the top of the code.

## pronoun
Code snippet to help script-generated text use the correct gendered terms based on the character. In addition to a simple translation function that turns neutral words into the gendered form based on the provided gender, it also provides a method of extracting the character's pronoun from their World Info entry, provided they have an appropriately-formatted `PRONOUN` entry.

## similarCharacterGenerator
An attempt at re-implementing the NPC generator option to generate characters similar to a group of provided characters via use of a scripted Scenario. Because this is a script for a Scenario, you can use Griffin to generate characters instead of just Dragon (though the results aren't that great...). You may have to cut down the generated character - the AI doesn't know there's a 600 character limit for World Info entries!
For best results:
- Ideally all of the characters you include as examples should all be formatted the same way, and have the same fields, entered in the same order.
- Make sure to use the edit options to guide the AI when it's working.
- Try to only generate a single character per adventure.
- Edit the starting prompt to end with the start of the first field you want to include.

## variedRandomSelector
Provides a method of randomly rolling results on a table while prioritising options that haven't already been picked. This variety both improves the player experience, and more importantly helps out the AI - usually if the same exactly-worded results end up in the context together, it can make the AI start to get repetitive.
It's designed to be flexible enough to support adding or removing results to a scenario's existing options tables without breaking existing adventures.

I think it goes without saying that you should store the `previousSelections` results in `state`.

See the code for comments and a couple of examples of how to use it.

## zaltysFormatter
A tool I made for building + formatting characters into Zaltys format. It uses user-entered commands to build up a character, then outputs the character's world info in 3 different formats: standard, Zaltys, and Snek. It can also be provided with an existing standard format character for direct translation into Zaltys.

For a scenario using this script, see: https://play.aidungeon.io/main/scenarioView?publicId=524ba8b0-9c57-11eb-aaa3-81c9ae780d5a
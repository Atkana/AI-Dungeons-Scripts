This is a collection of my scripts for AI Dungeon, ranging from full Scenario scripts, to small code snippets. Anyone is free to use them as they please, though do take in mind if you're intending to learn from them that they might not be the best examples - these are literally my first ever javascript scripts :P.

Most of the more fleshed out scripts include a `tuning` object which you can edit to configure how they work.

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

## pronoun
Code snippet to help script-generated text use the correct gendered terms based on the character. In addition to a simple translation function that turns neutral words into the gendered form based on the provided gender, it also provides a method of extracting the character's pronoun from their World Info entry, provided they have an appropriately-formatted `PRONOUN` entry.

## similarCharacterGenerator
An attempt at re-implementing the NPC generator option to generate characters similar to a group of provided characters via use of a scripted Scenario. Because this is a script for a Scenario, you can use Griffin to generate characters instead of just Dragon (though the results aren't that great...). You may have to cut down the generated character - the AI doesn't know there's a 600 character limit for World Info entries!
For best results:
- Ideally all of the characters you include as examples should all be formatted the same way, and have the same fields, entered in the same order.
- Make sure to use the edit options to guide the AI when it's working.
- Try to only generate a single character per adventure.
- Edit the starting prompt to end with the start of the first field you want to include.

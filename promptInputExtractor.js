// Utility for extracting the custom inputs from prompts (i.e the ones in ${}s). Also provides a method of inserting what those inputs into World Info entries / keys automatically.

/* HOW TO USE
- Install the script -
First things first is obviously to install this script. Open your Scenario Scripts and place each section where it says to in the comments.

- Write the Prompt + Pinned Info -
Write out your prompt and memory section as normal, including any custom input prompts (the ones with ${}) as you'd like.

You might have to come back to this stage to modify this text slightly to work with the script, so bear that in mind!

- Add patterns -
Inside this script you'll see a section called `my_patterns`. For each unique custom input prompt whose input you want to save into your World Info, add in a new entry into `my_patterns`. There are a couple of examples already in there to give you an idea of how it works.
- Set `start` to be the text in your prompt/memory that leads up to the custom input prompt you want to grab the input of.
- Set `end` to likewise be an identifiable end to it, appearing in the text of your prompt/memory just after the custom input prompt section.
- Set `id` to be a unique identifier for the player's input. You'll use that ID later to insert what the player enters into your World Info.

The combination of the exact start and end text should be UNIQUE within the prompt + memory! If there's overlap, the script will capture the player's inputs under the wrong IDs.

Here is an example:
Prompt:
	You absolutely detest ${Name a really gross creature (plural)}, because they're gross and icky.
The addition to my_patterns:
	{
		start: "You absolutely detest ",
		end: ", because they're gross and icky.",
		id: "#gross_creature",
	},

- Edit World Info -
With your patterns set up, write out your World Info as your normally would. In any spot that you'd like the player's custom input to be inserted (either in the World Info's keys or entries), write out the ID you gave its patterns.

Example:
World Info:
	The pit protecting the treasure is swarming with #gross_creature!
If you used the prompt + pattern from the previous example, the player's input in response to "Name a really gross creature (plural)" would be inserted there. For example, if the word they inputted was "rats", the World Info entry would become:
	The pit protecting the treasure is swarming with rats!

Notes:
- World Info entries are limited to 600 characters, and there isn't any limit to the amount of text a player can enter into ${}es* (* there probably IS actually a limit, but let's just assume they can go very long). This means that after the player's custom input is added, it might be noticeably longer. Leave plenty of room!
- This will only apply once when the adventure is started. If the player later edits the prompt / pinned info, the World Info won't automatically be updated to reflect the new changes.
*/

// ---------------------------------------------------------------------
// SHARED LIBRARY (or just place in Input Modifier if you want everything contained in one place)

const my_patterns = [
	{
		start: "Your name is ",
		end: ".",
		id: "#player_name",
	},
	{
		start: "You absolutely detest ",
		end: ", because they're gross and icky.",
		id: "#gross_creature",
	},
]


// Takes a text input and searches for occurrences of the patterns outlined in `my_patterns`.
// Returns an array of objects with the properties `text` (the text the player inputted, trimmed), and `id` (the id for that input as defined in `my_patterns`)
function get_custom_inputs(text){
	let custom_inputs = []

	for (let pattern of my_patterns) {
		let matches = text.match(new RegExp("(?:" + escapeRegExp(pattern.start) + ")(.*?)(?:" + escapeRegExp(pattern.end) + ")"))

		if (matches) {
			custom_inputs.push({id: pattern.id, text: matches[1].trim()})
		}
	}

	return custom_inputs
}

// Used to reformat input values containing special characters for use in RegExp
// (Copied off the net)
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// Replaces instances of ID within the given text with the replacement text provided in the object.
// Returns a new string, with each of the replacements made
function replace_ids(text_to_change, input_objects){
	let new_text = text_to_change

	for (let current_replacer of input_objects) {
		new_text = new_text.replace(new RegExp(escapeRegExp(current_replacer.id), "gi"), current_replacer.text)
	}

	return new_text
}

// Takes the array returned from `get_custom_inputs` and updates the World Info. Any occurrences of an ID in either a World Info's keys list or entry will be replaced with the `text` value
function apply_inputs_to_world_info(input_objects){
	for (index = 0; index < worldInfo.length; index++) {
		// Update the keys
		let new_keys = replace_ids(worldInfo[index].keys, input_objects)

		// Update the entry
		let new_entry = replace_ids(worldInfo[index].entry, input_objects)

		updateWorldEntry(index, new_keys, new_entry, worldInfo[index].hidden)
	}
}

// ---------------------------------------------------------------------
// INPUT MODIFIER

// If you're using this alongside other scripts, the only bit of this that you have to include is the state additions during initialization
const modifier = (text) => {
	if (!state.initialized) {
		state.initialized = true

		const game_info = info.memoryLength ? text.slice(info.memoryLength) : text
		const pinned_info = memory

		const inputs_from_prompt = get_custom_inputs(game_info)
		const inputs_from_pinned = get_custom_inputs(pinned_info)

		apply_inputs_to_world_info(inputs_from_prompt)
		apply_inputs_to_world_info(inputs_from_pinned)
	}


	return {text}
}

modifier(text)
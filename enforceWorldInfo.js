// Provides a custom memory context solution that allows World Info entries to be triggered via text in the pin section / other World Info, as well as configuring how much of the context can be memory vs actual gameplay

/* WHAT THIS DOES:
- More World Info is added: Key matches in pinned info and world info will also trigger world info being included, unlike in regular play where only occurrences in the game info.
- Configurable priority: Usually, World Info takes the backseat in memory-related stuff, being the first to be cut off.
- Configurable memory size: Allow extra info to take up more / less of the whole context than normal. The game's defaults are 3,000 characters for the context, with a ~1470 character portion of that being reserved for extra info.
*/

/* USAGE
- Don't go overboard with mentions of World Info within the Pinned Info / other World Info entries! Each instance can chain into more and more being added, to the point where there's too much info that it's entirely useless because it gets cut out.
- Handling of front memory / author's notes not yet implemented. Might not work properly if front memory is being used...
*/

/* TODO
- Implement front memory + author's notes
*/

// ---------------------------------------------------------------------
// CONTEXT MODIFIER

const tuning = {
	extra_info_length : 1500,
	search_pinned: true, // Search through the text entered in pin for world info keys?
	search_game: true, // Search through the full game context for world info keys?
	search_world_info: true, // Search through world info for other world info keys?
	max_context_length: 2900, // Maximum context length to include. Hardcoded max for the game is 3,000 but I was noticing even then it was cutting off 63 characters from the start when the context was exactly 3,000 long...
	pinned_priority: false, // Whether pinned info has priority over world info when it comes to what gets cut short (true is default game behaviour)
}

// Searches through given text to see if any World Info keys occur in it. Returns an array containing the indexes of each triggered World Info entry as they appear in worldInfo
function find_keys_in_text(text) {
	const lower_text = text.toLowerCase() // Make all lowercase for ease of searching keys
	let world_info_indexes = []
	
	for (let index = 0; index < worldInfo.length; index++) {
		const current_world_info = worldInfo[index]
		let current_keys = current_world_info.keys.split(",").map((key) => key.trim().toLowerCase())
		
		for (let key of current_keys) {
			// If any of the keys for this world info is found within the pinned text, add them to the array
			
			if (lower_text.includes(key)) {
				world_info_indexes.push(index) // Add the worldInfo index to the output list
				break
			}
		}
	}
	
	return world_info_indexes
}

const modifier = (text) => {
	const pinned_info = memory
	const game_info = info.memoryLength ? text.slice(info.memoryLength) : text

	// Create a tracker to record the indexes of every World Info entry we should add to the context
	let loaded_world_info = {}

	if (tuning.search_pinned) {
		let detected_world_info = find_keys_in_text(pinned_info)
		
		// Add detected world info entries to the list of ones to load
		for (let info_index of detected_world_info) {
			loaded_world_info[info_index] = true
		}
	}

	// As above, but using game info instead
	if (tuning.search_game) {
		let detected_world_info = find_keys_in_text(game_info) // (technically this variable is already declared earlier because js doesn't scope if statements but shhh :p)
		
		for (let info_index of detected_world_info) {
			loaded_world_info[info_index] = true
		}
	}

	if (tuning.search_world_info) {
		// For this section, we'll go through the current world info text searching for triggered world infos.
		// Any new world infos will be added, and then we'll keep repeating this until no new world infos are triggered.
		// This is an inefficient way to handle this, but it works and doesn't require much thinking :p
		
		let added_new = false
		do {
			added_new = false
			
			// Build a string of text to test made up of all the currently loaded world info entries
			let loaded_world_info_text = ""
			for (let info_index in loaded_world_info) {
				loaded_world_info_text += worldInfo[info_index].entry + "\n"
			}
			
			// Search for world info keys contained within the text
			let detected_world_info = find_keys_in_text(loaded_world_info_text)
			
			// Search through the triggered world infos to see if there are any new ones to add
			for (let info_index of detected_world_info) {
				if (!loaded_world_info[info_index]) {
					loaded_world_info[info_index] = true
					added_new = true // This'll cause this loop to start over again to check the newly-added world info
				}
			}
		} while (added_new == true);
	}

	// Build all the collected world info together into a single string
	let world_info = ""
	for (let info_index in loaded_world_info) {
		world_info += worldInfo[info_index].entry + "\n"
	}

	// Build the new extra info and context

	let custom_context = ""

	// If all our extra info + game info doesn't exceed the maximum character limit, just use it as-is!
	// Technically this can mean that more than the configured proportion of memory can take up the context, but oh well
	if ((world_info.length + pinned_info.length + game_info.length) <= tuning.max_context_length) {
		custom_context = world_info + pinned_info + "\n" + game_info
	} else {
		// Otherwise, we've got to figure out how to combine this and what to cut down...
		let custom_extra_info
		
		if ((world_info.length + pinned_info.length) <= tuning.extra_info_length) { // no need to cut anything, because everything's within its bounds!
			custom_extra_info = world_info + pinned_info
		} else {
			// Combine both sections together, then cut down based on which should have priority
			let uncut_text = world_info + pinned_info
		
			if (tuning.pinned_priority) {
				custom_extra_info = uncut_text.slice(-tuning.extra_info_length)
			} else {
				custom_extra_info = uncut_text.slice(0, tuning.extra_info_length)
			}
		}
		
		// Put it together:
		if ((game_info.length + custom_extra_info.length) <= tuning.max_context_length) { // no need to overwrite game info with context stuff
			custom_context = custom_extra_info + "\n" + game_info
		} else {
			custom_context = custom_extra_info + "\n" + game_info.slice(-(tuning.max_context_length - custom_extra_info.length -1)) // Minus one because we just added in a \n
		}
	}

	return {text: custom_context}
}

modifier(text)
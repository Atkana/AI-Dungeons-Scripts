// Attempt to re-implement the NPC generator option to generate characters similar to another group of provided characters. This time, you can also use Griffin to generate them!

// ---------------------------------------------------------------------
// SHARED LIBRARY
const tuning = {
	max_characters: 4, // Sets the maximum number of example characters that the game will pull in from the World Info. Each World Info can be up to 600 characters(?) long, so consider that.
	start_prompt: "Note: The AI doesn't know that there's a 600 character limit for character entries, so you may have to cut it down yourself.\n", // Include the newline at the end! Not actually used in the Scenario I made :p
	prepare_message: `Add up to 4 characters to this adventure's world info, then enter "#ready" to begin.`,
	working_message: `Character generation has begun! Press continue.`,
}

// ---------------------------------------------------------------------
// INPUT MODIFIER

const modifier = (text) => {
	let modified_text = ""
	
	if (!state.initialized) {
		state.initialized = true
		state.do_progress = false
		state.message = tuning.prepare_message
		
		modified_text = text // Let the first input (from the prompt itself) go through
	}
	
	if (!state.do_progress && text.toLowerCase().includes("#ready")) {
		// Progress to start stage!
		// First, wipe the keys from all world info entries, so the AI doesn't add them to the context
		for (i = 0; i < worldInfo.length; i++) {
			updateWorldEntry(i, "the_script_has_cleaned_this_so_it_doesnt_trigger", worldInfo[i].entry, false)
		}

		state.do_progress = true
		state.message = tuning.working_message
	}
	
	return {text: modified_text}
}

modifier(text)

// ---------------------------------------------------------------------
// CONTEXT MODIFIER

const modifier = (text) => {
	let modified_text = text
	let stop = true
	
	if (state.do_progress) { // The generator has been set up and is running
		stop = false
		
		// Prepare the context...
		// STEP 1 - Build fake world info section
		// (really we should save this to state so we don't have to rebuild it every time, but whatever...)
		let custom_world_info = ""
		// Get up to tuning.max_characters of example characters from World Info, starting from the first.
		for (index = 0; index < worldInfo.length; index++) {
			// Stop if we've exceeded the limit!
			if (index >= tuning.max_characters) {
				break
			}
			
			custom_world_info += worldInfo[index].entry + "\n\n"
		}
		
		// STEP 2 - Build custom game info section
		// Because we've "disabled" world info, and the player shouldn't be using Pin, all the normal context should consist of is the game info
		let custom_game_info = text
		
		// Trim the starting prompt from the first line, if it's present
		if (text.substring(0, text.indexOf("\n")+1) == tuning.start_prompt) {
			custom_game_info = text.substring(text.indexOf("\n") + 1)
		}
		
		// STEP 3 - Combine to make the context
		modified_text = custom_world_info + custom_game_info
	}

	return {text: modified_text, stop}
}

modifier(text)
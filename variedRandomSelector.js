// A setup for attempting to keep the random results of rolling on a table unique
// This does so by recording how often each option from a pool has been selected, and only selecting options that have been picked the least (effectively eliminating any already picked options until everything's been picked the same amount of times)

// In the interest of making this easier to adapt, numbers are used for tracking. It could otherwise be tracked by just recording the keys / booleans

/* (Non-AI Dungeon specific) Example:

let greeting_options = {
	greeting_one: "Hello",
	greeting_two: "Yo",
	greeting_three: "Greetings",
}
let previous_selections = {}

let times_to_execute = 10
do {
	console.log(getVariedRandomSelection(greeting_options, previous_selections))
	
	times_to_execute -= 1
} while ( times_to_execute > 0 )
console.log(`Previous selections: ${JSON.stringify(previous_selections)}`)

*/

/* AI Dungeon example
// In INPUT MODIFIER
// Add to your initializer
if(!state.initialized) {
	state.initialized = true
	
	// Set up a record for all the random tables
	state.previous_selections = {
		my_first_random_table: {}, // There's no need to first write out and set every option to 0 - that'll be done automatically
		another_random_table: {}.
	}
	
	// Note: Remember that if you want to add in new random tables in an update in your scenarios, you'll need to have some code to patch in entries to `state.previous_selections` for each one. Otherwise, all the previous adventures will break! I mean, this applies to anything for any script, but it's still worth noting here.
	// If you're only adding / removing options to an already established table, you don't have to worry about making any patches. The functions will adapt accordingly.
}

// Define the random table's contents somewhere!
let my_first_random_table = { // The name doesn't actually have to match what you put in `state.previous_selections`, but that does help keep things organised.
	// The keys should all be unique - they're what's used to track what options have been chosen previously
	// The values stored under the keys are what gets returned when an option is randomly selected. They can be anything (strings, functions, numbers, etc.), rather than just strings in this example.
	greeting_one: "Hello",
	greeting_two: "Yo",
	greeting_three: "Greetings",
}

// Example of it in use:
function get_random_greeting() {
	return getVariedRandomSelection(my_first_random_table, state.previous_selections.my_first_random_table)
}

console.log(get_random_greeting())
*/

// optionsTable is a keyed list of options to select from.
// previousSelections is an object recording previous selections. You'll need to record this somewhere for each random table you want varied
// abortIfAllUsedOnce is for instances where you only ever want to have chosen a selection once, and would rather do something else otherwise. If enabled, will return false if there's no more options left
// cleanMissingPrevious ensures that records of "old" entries are cleaned from previousSelections (old entries could exist because changes between versions). If you're using the same previousSelections record for multiple different optionsTables with some overlapping entries, you'll want this set to false.
// Returns the
function getVariedRandomSelection(optionsTable, previousSelections, abortIfAllUsedOnce = false, cleanMissingPrevious = true) {
	validatePreviousSelections(optionsTable, previousSelections, cleanMissingPrevious)
	
	// First, work out how often the least chosen selection has been chosen
	let leastChosenTimes
	
	for (let [optionID, timesChosen] of Object.entries(previousSelections)) {
		// Because we're going through previous selections that might not have had old entries cleaned, we want to first check that each option still exists in the main table before considering it
		if (optionID in optionsTable) {
			if (leastChosenTimes === undefined || timesChosen < leastChosenTimes) {
				leastChosenTimes = timesChosen
			}
		}
	}
	
	// If even the least chosen option has been chosen once and we're configured to not chose anything that hasn't been chosen before, abort here
	if (abortIfAllUsedOnce && leastChosenTimes > 0) {
		return false
	}
	
	// Now, find every option that's the least chosen
	let leastChosenOptions = []
	
	for (let [optionID, timesChosen] of Object.entries(previousSelections)) {
		if (optionID in optionsTable) {
			if (timesChosen == leastChosenTimes) {
				leastChosenOptions.push(optionID)
			}
		}
	}
	
	// Now choose a random option from those remaining
	let randomOptionID = leastChosenOptions[getRandom(0, leastChosenOptions.length)]
	
	// Update record of selected options
	previousSelections[randomOptionID] += 1
	
	// Finally, return the result
	return optionsTable[randomOptionID]
}


// Validates the previous selections object for the given table
// Ensures that there's an entry for each possible option at this stage, and no non-existent entries
// (Have to do this for AI Dungeon because the number of options can change whenever the script is updated)
function validatePreviousSelections(optionsTable, previousSelections, cleanMissing = true) {
	// Ensure that there's a record for each possible option
	for (let optionID in optionsTable) {
		if (!(optionID in previousSelections)) {
			previousSelections[optionID] = 0
		}
	}
	
	// Remove records of previous results that no longer exist
	if (cleanMissing) {
		let thingsToDelete = [] // Make a record here to go through later so we're not deleting while looping through things
		for (let optionID in previousSelections) {
			if (!(optionID in optionsTable)) { // No longer exists!
				thingsToDelete.push(optionID)
			}
		}
		
		for (let optionID of thingsToDelete) {
			delete previousSelections[optionID]
		}
	}
}

function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}